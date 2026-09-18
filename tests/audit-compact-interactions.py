"""Compact reading regressions. Optional HTTPS mode never creates a private vault."""
import functools,http.server,json,os,socketserver,threading,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
LIVE=os.environ.get('FCC_COMPACT_LIVE')=='1';BUILD=json.loads((ROOT/'asset-manifest.json').read_text())['build']
report={'commit':os.environ.get('GITHUB_SHA','local'),'build':BUILD,'live':LIVE,'checks':[]}
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=None
if not LIVE:
 srv=Server(('127.0.0.1',4179),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE='https://fabioneto50.github.io/fabio-command-center/' if LIVE else 'http://127.0.0.1:4179/'
def check(name,ok,detail=None):
 report['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
 if not ok:raise AssertionError(name+': '+str(detail))
def ready(p):p.wait_for_function("window.FCCAppReady===true&&[...document.querySelectorAll('nav.side .nav')].every(x=>!x.disabled)",timeout=60000)
def nav(p,sub='',page='clinical'):p.evaluate('([page,sub])=>fccNavigate(page,{sub,focus:true})',[page,sub])
def shot(p,name):
 p.evaluate("window.scrollTo({top:0,behavior:'instant'})");p.screenshot(path=str(OUT/(name+'.png')),animations='disabled')
def overhead(p,selector):return p.locator(selector).evaluate("e=>e.getBoundingClientRect().top-e.closest('.page').getBoundingClientRect().top")
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch(headless=True)
   for w,h in [(390,844),(1440,1000)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=w<600,has_touch=w<600)
    p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));tag=f'{engine}-{w}-compact'+('-live' if LIVE else '')
    try:
     p.goto(BASE,wait_until='domcontentloaded');ready(p);check(tag+' exact build',BUILD in p.evaluate('FCC_ASSET_BASE'))
     for theme in ['light','dark']:
      nav(p,page='settings');p.locator(f'#fccThemeSettings [data-fcc-theme-choice={theme}]').click();p.wait_for_function('(t)=>document.documentElement.dataset.fccTheme===t',arg=theme)
      nav(p);check(tag+theme+' original library remains',p.locator('#page-clinical>.pagehead h2').is_visible() and p.locator('#fccArea-clinical .fcc-area-card').count()==24 and not p.evaluate('!!FCCUI.active()'))
      p.locator('#fccArea-clinical [data-area-target=clin-perf]').click();p.wait_for_selector('#fccPerfInfo')
      check(tag+theme+' duplicate header removed',not p.locator('#page-clinical>.pagehead').is_visible())
      check(tag+theme+' accessible module heading',p.locator('.page.active>.fcc-area-context [role=heading][aria-level="2"]').is_visible())
      info=p.locator('#fccPerfInfo');check(tag+theme+' source metadata initially closed',not info.evaluate('e=>e.open'))
      measure=overhead(p,'#perfDilutionSearch');check(tag+theme+' search much closer to top',measure<(600 if w<600 else 380),measure)
      check(tag+theme+' live result count stays visible',p.locator('#ccdCount').is_visible())
      check(tag+theme+' specific preparation warning visible',p.locator('.perf-safety').is_visible() and 'concentração standard não é automaticamente' in p.locator('.perf-safety').inner_text())
      shot(p,tag+'-'+theme+'-perfusion')
      original=info.locator('.ccd-banner').text_content();summary=info.locator(':scope>summary');summary.focus();summary.press('Space');p.wait_for_function('document.getElementById("fccPerfInfo").open')
      check(tag+theme+' source disclosure accessible without mouse',info.locator('.ccd-banner').is_visible() and 'INF.2213.00' in original and 'INF.1030.11' in original)
      p.locator('#perfDilutionSearch').fill('amiodarona');p.wait_for_timeout(250)
      check(tag+theme+' typing preserves open source info',info.evaluate('e=>e.open') and info.locator('.ccd-banner').text_content()==original)
      summary.click();p.locator('#perfDilutionSearch').fill('');p.wait_for_timeout(250)
      warning=p.locator('#page-clinical>.fcc-usage-notice');warnSummary=warning.locator('summary');check(tag+theme+' general boundary visible',warning.locator('strong').is_visible() and 'não prescrição' in warning.locator('strong').inner_text())
      warnSummary.focus();warnSummary.press('Enter');p.wait_for_function('document.querySelector(".fcc-usage-notice details").open')
      check(tag+theme+' full warning still available',warning.locator('details>p').is_visible())
      p.locator('#perfDoseToggle').click();p.wait_for_selector('#infWt');p.locator('#infWt').fill('73');p.locator('#perfDoseToggle').click()
      nav(p,'clin-drugs');check(tag+theme+' new module warning starts compact',not warning.locator('details').evaluate('e=>e.open'))
      p.locator('#med4Search').fill('noradrenalina');p.wait_for_function("/noradrenalina/i.test(document.querySelector('#med4Results [data-med4] strong')?.textContent||'')")
      p.locator('#med4Results [data-med4]').first.click();p.wait_for_selector('#med4Results h3')
      check(tag+theme+' only medicine content above reading',not p.locator('#med4Search').is_visible() and not p.locator('#fccMedCount').is_visible())
      measure=overhead(p,'#med4Results h3');check(tag+theme+' medication heading nearer top',measure<(320 if w<600 else 240),measure)
      check(tag+theme+' risk and clinical fields intact',p.locator('.fcc-detail-warning').is_visible() and p.locator('#med4Results [data-clinical-field]').count()>=8)
      shot(p,tag+'-'+theme+'-medication')
      p.reload(wait_until='domcontentloaded');ready(p);p.wait_for_selector('#med4Results h3');check(tag+theme+' deep link retains reading view',not p.locator('#med4Search').is_visible() and 'noradrenalina' in p.locator('#med4Results h3').inner_text().lower())
      p.locator('#fccMedBack').click();check(tag+theme+' list and search restored',p.locator('#med4Search').is_visible() and p.locator('#med4Search').input_value()=='noradrenalina' and p.locator('#fccMedCount').is_visible())
      nav(p);check(tag+theme+' overview not compact or selected',p.locator('#page-clinical>.pagehead h2').is_visible() and p.locator('#page-clinical>.sub.active').count()==0 and p.locator('#page-clinical').get_attribute('data-fcc-compact') is None)
     for size in [320,430,768]:
      p.set_viewport_size({'width':size,'height':844})
      for sub in ['clin-perf','clin-drugs','clin-vent','clin-ivcompat','clin-cases']:
       nav(p,sub)
       geometry=p.evaluate('''()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,wide:[...document.querySelectorAll('.page.active *')].filter(x=>{const r=x.getBoundingClientRect();return r.width&&r.right>innerWidth+1}).slice(0,12).map(x=>({tag:x.tagName,id:x.id,class:x.className,right:x.getBoundingClientRect().right,width:x.getBoundingClientRect().width}))})''')
       check(tag+str(size)+sub+' reading layout reflows',geometry['scrollWidth']<=geometry['width']+1 and not p.locator('#page-clinical>.pagehead').is_visible(),geometry)
       check(tag+str(size)+sub+' no tiny input text',p.locator('.page.active input:not([type=checkbox]):not([type=hidden])').evaluate_all('es=>es.filter(x=>x.getClientRects().length).every(x=>parseFloat(getComputedStyle(x).fontSize)>=16)'))
     p.set_viewport_size({'width':w,'height':h})
     nav(p,'clin-drugs');p.locator('#med4Search').fill('');p.wait_for_function("document.querySelectorAll('#med4Results [data-med4]').length===36")
     last=p.locator('#med4Results [data-med4]').last;name=last.get_attribute('data-med4');last.scroll_into_view_if_needed()
     check(tag+' long catalogue scroll exercised',p.evaluate('scrollY')>300)
     last.click();p.wait_for_selector('#med4Results h3');p.wait_for_function('scrollY<5')
     check(tag+' selecting from far down opens readable heading',p.locator('#med4Results h3').inner_text()==name and p.evaluate('scrollY')<5)
     p.locator('#fccMedBack').click();check(tag+' long list restored after reading',p.locator('#med4Search').is_visible())
     nav(p,page='personal');check(tag+' locked personal overview unchanged',not p.evaluate('FCCAccess.isUnlocked()') and p.locator('#fccArea-personal').is_visible() and not p.evaluate('!!FCCUI.active()'))
     p.locator('#fccArea-personal [data-area-target=notes]').click();p.locator('#fccVaultDialog').wait_for(state='visible');check(tag+' private note guard intact',not p.locator('#em-notes').is_visible());p.keyboard.press('Escape')
     if not LIVE:
      p.evaluate("async()=>{await FCCStore.create('synthetic compact layout test passphrase 2026');FCCAccess.refreshState();}")
      nav(p,'em-notes','emergency');check(tag+' private module compact',p.locator('#page-emergency').get_attribute('data-fcc-compact')=='1' and p.locator('#em-notes').is_visible())
      check(tag+' private lock accessible',p.locator('#page-emergency>.fcc-lock-area').is_visible())
      nav(p,page='personal');check(tag+' personal overview restores heading',p.locator('#page-personal>.pagehead h2').is_visible())
     else:check(tag+' no private vault created',not p.evaluate('FCCStore.status().configured'))
     check(tag+' no unhandled errors',not errors,errors)
    except Exception as e:
     report['checks'].append({'name':tag+' failed','pass':False,'error':str(e),'trace':traceback.format_exc(),'pageErrors':errors})
     try:shot(p,tag+'-FAILED')
     except Exception:pass
    finally:ctx.close()
   browser.close()
finally:
 if srv:srv.shutdown()
 (OUT/('compact-live.json' if LIVE else 'compact-interactions.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not x['pass'] for x in report['checks']):raise SystemExit(1)
