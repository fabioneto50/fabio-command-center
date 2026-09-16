"""Read-only release smoke audit of public Pages, in fresh synthetic browser contexts.
No login, profile, private data import, forms sent, content edits or cache clearing.
"""
import concurrent.futures, hashlib, json, os, time, traceback
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlsplit
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
BASE=os.environ.get('FCC_LIVE_URL','https://fabioneto50.github.io/fabio-command-center/')
u=urlsplit(BASE)
assert u.scheme=='https' and u.netloc=='fabioneto50.github.io' and u.path=='/fabio-command-center/' and not u.query and not u.fragment
expected=json.loads((ROOT/'asset-manifest.json').read_text())
report={'commit':os.environ.get('GITHUB_SHA','local'),'url':BASE,'expectedBuild':expected['build'],'checks':[],'contexts':[],'method':'Live public HTTPS; GET requests and isolated browser storage only; not a clinical review'}
def check(name,ok,detail=None):
    report['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
    if not ok:raise AssertionError(name+': '+str(detail))
def get(path):
    req=Request(urljoin(BASE,path),headers={'User-Agent':'FCC-release-audit/1.4','Cache-Control':'no-cache'})
    with urlopen(req,timeout=20) as response:
        assert response.status==200
        return response.read()
def verify_file(entry):
    path,meta=entry
    for attempt in range(3):
        try:
            data=get(path+'?fcc-live='+expected['build'])
            if len(data)==meta['bytes'] and hashlib.sha256(data).hexdigest()==meta['sha256']:return path,True
        except Exception:pass
        time.sleep(2)
    return path,False
try:
    # Pages/CDN may still serve the previous release while the deployment completes.
    seen=None
    for attempt in range(40):
        try:
            seen=json.loads(get('build-info.json?audit='+str(time.time_ns())))
            if seen.get('assetBuild')==expected['build']:break
        except Exception as e:seen={'error':str(e)}
        time.sleep(10)
    check('published build matches verified release',seen.get('assetBuild')==expected['build'],seen)
    manifest=json.loads(get('asset-manifest.json?audit='+str(time.time_ns())))
    check('published manifest matches verified release',manifest['build']==expected['build'] and manifest['assets']==expected['assets'])
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for path,ok in pool.map(verify_file,expected['assets'].items()):check('public asset integrity '+path,ok)
    check('independent recovery entry point available',b'Recupera' in get('recovery.html'))
    check('live worker belongs to same build',expected['build'].encode() in get('service-worker.js?audit='+str(time.time_ns())))
    with sync_playwright() as pw:
        for engine in ['chromium','webkit']:
            browser=getattr(pw,engine).launch(headless=True)
            for width,height in [(390,844),(1440,1000)]:
                ctx=browser.new_context(viewport={'width':width,'height':height},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=width<600,has_touch=width<600)
                page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));prefix=f'{engine}-{width}'
                try:
                    page.goto(BASE,wait_until='domcontentloaded')
                    page.wait_for_function("window.FCCAppReady===true&&[...document.querySelectorAll('.nav')].every(x=>!x.disabled)",timeout=60000)
                    check(prefix+' live runtime and assets',page.evaluate("FCC_RUNTIME_VERSION==='1.4.0'") and expected['build'] in page.evaluate('FCC_ASSET_BASE'))
                    check(prefix+' global search visible',page.locator('#globalSearch').is_visible())
                    check(prefix+' five SVG site navigation items',page.locator('nav.side .nav .ni svg').count()==5)
                    page.locator('nav.side [data-page=clinical]').click();page.wait_for_selector('#fccArea-clinical')
                    check(prefix+' live library overview without subgroup',page.locator('#page-clinical > .sub.active').count()==0 and not page.evaluate('!!FCCUI.active()'))
                    check(prefix+' live 24 horizontal module choices',page.locator('#fccArea-clinical .fcc-area-card').count()==24 and page.locator('#fccArea-clinical .fcc-library-star').count()==24)
                    page.locator('[data-area-filter=calculators]').click();check(prefix+' live calculator filter',page.locator('#fccArea-clinical .fcc-area-card').count()==9)
                    page.locator('[data-area-filter=all]').click();page.screenshot(path=str(OUT/(prefix+'-live-library.png')))
                    page.locator('nav.side [data-page=favorites]').click();page.wait_for_selector('#page-favorites.page.active')
                    check(prefix+' live favorites destination exists',page.locator('#page-favorites .fcc-empty').is_visible())
                    page.locator('nav.side [data-page=home]').click()

                    check(prefix+' no horizontal document overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                    page.screenshot(path=str(OUT/(prefix+'-live-home.png')))
                    for sub in ['clin-perf','clin-drugs','clin-cases','clin-dressings','clin-ivcompat','clin-ecg','clin-lasa']:
                        check(prefix+' live module '+sub,page.evaluate('(sub)=>fccNavigate("clinical",{sub})',sub) is True)
                        check(prefix+' live visible '+sub,page.locator('#'+sub).is_visible())
                    check(prefix+' full medication catalogue',page.evaluate('FCCMedicationV7Health.count===923'))
                    check(prefix+' preserved case bank',page.evaluate('FCC_CASE_BANK.length===200'))
                    page.locator('#globalSearch').fill('noradrenalina');page.wait_for_selector('#globalResults [role=option]',timeout=30000)
                    page.locator('#globalSearch').press('ArrowDown');page.locator('#globalSearch').press('Enter')
                    page.wait_for_function("/noradrenalina/i.test(document.querySelector('#med4Results h3')?.textContent||'')",timeout=30000)
                    check(prefix+' direct search opens medication',page.locator('#med4Results [data-clinical-field]').count()>=8)
                    page.reload(wait_until='domcontentloaded');page.wait_for_function("window.FCCAppReady===true&&/noradrenalina/i.test(document.querySelector('#med4Results h3')?.textContent||'')",timeout=60000)
                    check(prefix+' live deep link reload',page.locator('#med4Results h3').is_visible())
                    page.evaluate("fccNavigate('settings')");check(prefix+' offline controls visible',page.locator('#fccOfflineCard').is_visible())
                    check(prefix+' no private vault created during public use',page.evaluate('!FCCStore.status().configured&&!FCCAccess.isUnlocked()'))
                    check(prefix+' no unhandled live app error',not errors,errors)
                    page.screenshot(path=str(OUT/(prefix+'-live-settings.png')))
                    report['contexts'].append({'browser':engine,'viewport':[width,height],'errors':errors})
                finally:ctx.close()
            browser.close()
except Exception as e:report['checks'].append({'name':'live audit exception','pass':False,'error':str(e),'trace':traceback.format_exc()})
finally:
    (OUT/'live-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not x['pass'] for x in report['checks']):raise SystemExit(1)
