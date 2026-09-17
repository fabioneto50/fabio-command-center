"""Measure module overhead and preserve screenshots, using synthetic browser contexts only."""
import functools,http.server,json,os,socketserver,threading,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
compact='data-fcc-compact' in (ROOT/'fcc-design.css').read_text()
report={'commit':os.environ.get('GITHUB_SHA','local'),'compactExpected':compact,'checks':[],'measurements':[]}
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=Server(('127.0.0.1',4178),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
def check(name,value,detail=None):
 report['checks'].append({'name':name,'pass':bool(value),'detail':detail})
 if not value:raise AssertionError(name+': '+str(detail))
def ready(p):p.wait_for_function("window.FCCAppReady===true&&[...document.querySelectorAll('nav.side .nav')].every(x=>!x.disabled)",timeout=60000)
def nav(p,sub='',page='clinical'):
 p.evaluate('([page,sub])=>fccNavigate(page,{sub,focus:true})',[page,sub])
 p.wait_for_function('([page,sub])=>FCCNavigation.current()===page&&FCCNavigation.route().sub===sub',arg=[page,sub])
def capture(p,tag,selector):
 p.evaluate("window.scrollTo({top:0,behavior:'instant'})")
 m=p.locator(selector).evaluate("e=>{const r=e.getBoundingClientRect(),page=e.closest('.page').getBoundingClientRect();return {contentTop:r.top,pageTop:page.top,overhead:r.top-page.top,viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1}}")
 report['measurements'].append({'name':tag,**m});p.screenshot(path=str(OUT/(tag+'.png')),animations='disabled');return m
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch(headless=True)
   for width,height in [(390,844),(1440,1000)]:
    ctx=browser.new_context(viewport={'width':width,'height':height},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=width<600,has_touch=width<600)
    p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));tag=f'{engine}-{width}'
    try:
     p.goto('http://127.0.0.1:4178/',wait_until='domcontentloaded');ready(p)
     for theme in ['light','dark']:
      nav(p,page='settings');p.locator(f'#fccThemeSettings [data-theme-value="{theme}"]').click() if p.locator(f'#fccThemeSettings [data-theme-value="{theme}"]').count() else p.evaluate('(t)=>fccSetTheme(t,true)',theme)
      p.wait_for_function('(t)=>document.documentElement.dataset.theme===t',arg=theme)
      nav(p);check(tag+' '+theme+' overview not auto-selected',p.locator('#page-clinical>.sub.active').count()==0 and not p.evaluate('!!FCCUI.active()'))
      capture(p,tag+'-'+theme+'-hub','#fccArea-clinical input')
      nav(p,'clin-perf');p.wait_for_selector('#perfDilutionSearch');p.wait_for_timeout(300)
      capture(p,tag+'-'+theme+'-perfusion','#perfDilutionSearch')
      check(tag+' '+theme+' clinical safety remains visible',p.locator('#page-clinical>.fcc-usage-notice').is_visible() and p.locator('#clin-perf .perf-safety').is_visible())
      nav(p,'clin-drugs');p.locator('#med4Search').fill('noradrenalina');p.wait_for_selector('#med4Results [data-med4]')
      capture(p,tag+'-'+theme+'-medication-list','#med4Search')
      p.locator('#med4Results [data-med4]').first.click();p.wait_for_selector('#med4Results h3')
      capture(p,tag+'-'+theme+'-medication-detail','#med4Results h3')
      check(tag+' '+theme+' medication precautions visible',p.locator('#med4Results .fcc-detail-warning').is_visible())
      p.locator('#fccMedBack').click();check(tag+' '+theme+' back preserves search',p.locator('#med4Search').is_visible() and p.locator('#med4Search').input_value()=='noradrenalina')
      nav(p);check(tag+' '+theme+' return to overview has heading',p.locator('#page-clinical>.pagehead h2').is_visible())
     check(tag+' no unhandled error',not errors,errors)
    except Exception as e:
     report['checks'].append({'name':tag+' failure','pass':False,'error':str(e),'trace':traceback.format_exc()})
     try:p.screenshot(path=str(OUT/(tag+'-FAILED.png')))
     except Exception:pass
    finally:ctx.close()
   browser.close()
finally:
 srv.shutdown();(OUT/'compact-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not x['pass'] for x in report['checks']):raise SystemExit(1)
