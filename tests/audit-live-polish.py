"""Read-only visual/interaction check of the deployed GitHub Pages release.
Fresh isolated browser contexts. No personal vault creation, data writes or clinical edits.
"""
import json, os, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
BASE='https://fabioneto50.github.io/fabio-command-center/'
BUILD=json.loads((ROOT/'asset-manifest.json').read_text())['build']
report={'commit':os.environ.get('GITHUB_SHA','local'),'url':BASE,'expectedBuild':BUILD,'method':'Published HTTPS website, fresh Chromium and WebKit contexts; no owner profile or personal data','checks':[]}
def check(name,ok,detail=None):
 report['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
 if not ok:raise AssertionError(name+': '+str(detail))
def ready(p):p.wait_for_function("window.FCCAppReady===true&&[...document.querySelectorAll('nav.side .nav')].every(x=>!x.disabled)",timeout=60000)
def area(p,name):
 p.locator('nav.side [data-page='+name+']').click();p.wait_for_function('(a)=>FCCNavigation.current()===a&&!FCCNavigation.route().sub',arg=name)
 if name in ['clinical','personal']:p.locator('#fccArea-'+name).wait_for(state='visible')
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch(headless=True)
   for w,h in [(390,844),(1440,1000)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=w<600,has_touch=w<600)
    p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));tag=f'{engine}-{w}-published'
    try:
     p.goto(BASE,wait_until='domcontentloaded');ready(p)
     check(tag+' exact asset build',BUILD in p.evaluate('FCC_ASSET_BASE'))
     check(tag+' five site destinations',p.locator('nav.side .nav').evaluate_all('es=>es.map(x=>x.dataset.page)')==['home','clinical','personal','favorites','settings'])
     for theme in ['light','dark']:
      p.evaluate('(t)=>fccSetTheme(t,false)',theme)
      area(p,'home');p.wait_for_function('window.FCCNews&&!FCCNews.status().loading',timeout=20000)
      pages=p.locator('.home-news-dot')
      check(tag+' '+theme+' current news has numbered navigation',pages.count()>0)
      check(tag+' '+theme+' no number overlay',pages.evaluate_all("es=>es.every(x=>['none','normal'].includes(getComputedStyle(x,'::before').content)&&['none','normal'].includes(getComputedStyle(x,'::after').content)&&/^\\d+$/.test(x.textContent.trim()))"))
      pager=p.locator('#homeHealthNewsList .home-news-dots');pager.screenshot(path=str(OUT/(tag+'-pagination-'+theme+'.png')))
      last=pager.locator('button').last;number=last.text_content().strip();last.click()
      p.wait_for_function("(n)=>document.querySelector('#homeHealthNewsList [aria-current=page]')?.textContent.trim()===n",arg=number)
      check(tag+' '+theme+' numbered page responds',pager.locator('[aria-current=page]').text_content().strip()==number)
      area(p,'clinical')
      check(tag+' '+theme+' clinical overview no subgroup',not p.evaluate('!!FCCUI.active()') and p.locator('#page-clinical>.sub.active').count()==0)
      check(tag+' '+theme+' clinical header and cards',p.locator('#page-clinical>.pagehead .fcc-area-head-actions button').count()==2 and p.locator('#fccArea-clinical .fcc-area-card').count()==24)
      p.screenshot(path=str(OUT/(tag+'-clinical-'+theme+'.png')),animations='disabled')
      area(p,'personal')
      check(tag+' '+theme+' public locked overview without modal',not p.evaluate('!!FCCUI.active()') and not p.evaluate('FCCAccess.isUnlocked()') and p.locator('#fccArea-personal .fcc-area-card').count()==6)
      check(tag+' '+theme+' personal search filters and stars',p.locator('#fccArea-personal input').is_visible() and p.locator('#fccArea-personal [data-area-filter]').count()==4 and p.locator('#fccArea-personal .fcc-library-star').count()==6)
      check(tag+' '+theme+' private state remains inaccessible',p.evaluate("FCCStore.getItem('fcc-personal-favorites-v1')===null&&FCCStore.getItem('fcc-master-user-data-v1')===null"))
      p.screenshot(path=str(OUT/(tag+'-personal-'+theme+'.png')),animations='disabled')
      p.locator('#fccArea-personal [data-area-target=notes]').click();p.locator('#fccVaultDialog').wait_for(state='visible')
      check(tag+' '+theme+' private notes still require explicit unlock',not p.locator('#em-notes').is_visible() and not p.evaluate('FCCAccess.isUnlocked()'))
      p.keyboard.press('Escape')
      p.evaluate("fccNavigate('clinical',{sub:'clin-perf'})");p.wait_for_selector('#perfDilutionSearch');p.locator('#perfDilutionSearch').fill('amoxicilina');p.wait_for_timeout(400)
      card=p.locator('#perfDilutionGrid>.ccd-doc-card:has(.cuf2213-route):visible').first;card.locator(':scope>.ccd-doc-top').click();route=card.locator('.cuf2213-route').first;route.wait_for(state='visible')
      m=route.evaluate("e=>{const o=e.querySelector('.ccd-doc-grid-wide .ccd-doc-field');return {heading:parseFloat(getComputedStyle(e.querySelector('.cuf-route-title')).fontSize),labels:[...e.querySelectorAll('.ccd-doc-section')].map(x=>parseFloat(getComputedStyle(x).fontSize)),ratio:o.getBoundingClientRect().width/o.parentElement.getBoundingClientRect().width,empty:e.querySelectorAll('.ccd-doc-grid>div:empty').length}}")
      check(tag+' '+theme+' antibiotic card readable and full width',m['heading']>=16 and min(m['labels'])>=14 and m['ratio']>.98 and m['empty']==0,m)
      route.screenshot(path=str(OUT/(tag+'-antibiotics-'+theme+'.png')),animations='disabled');card.locator(':scope>.ccd-doc-top').click()
      check(tag+' '+theme+' no document overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
     check(tag+' no private vault or data created',p.evaluate('!FCCStore.status().configured&&!FCCAccess.isUnlocked()'))
     check(tag+' no unhandled page errors',not errors,errors)
    except Exception as e:
     report['checks'].append({'name':tag+' failed','pass':False,'error':str(e),'trace':traceback.format_exc(),'pageErrors':errors})
     try:p.screenshot(path=str(OUT/(tag+'-FAILED.png')))
     except Exception:pass
    finally:ctx.close()
   browser.close()
finally:
 (OUT/'live-polish-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not x['pass'] for x in report['checks']):raise SystemExit(1)
