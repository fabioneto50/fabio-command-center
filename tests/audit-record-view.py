"""Dedicated medication record tests: actual controls, no owner profile or clinical edits."""
import functools,http.server,json,os,socketserver,threading,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
LIVE=os.environ.get('FCC_RECORD_LIVE')=='1';BASE='https://fabioneto50.github.io/fabio-command-center/' if LIVE else 'http://127.0.0.1:4180/'
BUILD=json.loads((ROOT/'asset-manifest.json').read_text())['build']
report={'commit':os.environ.get('GITHUB_SHA','local'),'build':BUILD,'live':LIVE,'checks':[],'measurements':[],'method':'Chromium/WebKit isolated contexts; actual clicks and browser history; clinical text unchanged'}
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=None
if not LIVE:
 srv=Server(('127.0.0.1',4180),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start()
def check(name,ok,detail=None):
 report['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
 if not ok:raise AssertionError(name+': '+str(detail))
def ready(p):p.wait_for_function("window.FCCAppReady===true&&[...document.querySelectorAll('nav.side .nav')].every(x=>!x.disabled)",timeout=60000)
def nav(p,sub='',page='clinical'):
 p.evaluate('([page,sub])=>fccNavigate(page,{sub,focus:true})',[page,sub]);p.wait_for_function('([page,sub])=>FCCNavigation.current()===page&&FCCNavigation.route().sub===sub',arg=[page,sub])
def shot(p,name):p.screenshot(path=str(OUT/(name+'.png')),animations='disabled')
def reader(p,tag,sub,selector):
 for node in ['.top','#page-clinical>.pagehead','#page-clinical>.fcc-area-context','#page-clinical>.fcc-usage-notice']:
  check(tag+' hidden '+node,not p.locator(node).is_visible())
 check(tag+' not a modal',not p.evaluate('!!FCCUI.active()'))
 check(tag+' main navigation retained',p.locator('nav.side').is_visible())
 check(tag+' no viewport overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
 check(tag+' heading focused',p.locator(selector).evaluate('x=>x===document.activeElement'))
 m=p.locator(selector).evaluate('e=>({y:e.getBoundingClientRect().top,font:parseFloat(getComputedStyle(e).fontSize),width:innerWidth})')
 report['measurements'].append({'name':tag,**m});check(tag+' record begins at top',0<=m['y']<=160,m)
 if m['width']<921:check(tag+' bottom navigation does not cover reader',p.locator('nav.side').evaluate('e=>e.getBoundingClientRect().height<130'))
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch()
   for w,h in [(390,844),(1440,1000)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=w<600,has_touch=w<600);p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));tag=f'{engine}-{w}-record'
    try:
     p.goto(BASE,wait_until='domcontentloaded');ready(p);check(tag+' correct build',BUILD in p.evaluate('FCC_ASSET_BASE'))
     for theme in ['light','dark']:
      nav(p,page='settings');p.locator('#fccThemeSettings [data-fcc-theme-choice='+theme+']').click();p.wait_for_function('(t)=>document.documentElement.dataset.fccTheme===t',arg=theme)
      nav(p,'clin-perf');p.wait_for_selector('#perfDilutionSearch')
      p.wait_for_function("document.querySelectorAll('#perfDilutionGrid>[data-fcc-record-id]:not([data-cuf-superseded=\"1\"])').length>50")
      p.wait_for_timeout(100)
      ids=p.locator('#perfDilutionGrid>[data-fcc-record-id]:not([data-cuf-superseded="1"])').evaluate_all('es=>es.map(x=>x.dataset.fccRecordId)')
      check(tag+theme+' unique public record identities',len(ids)>50 and len(ids)==len(set(ids)),{'count':len(ids),'unique':len(set(ids)),'duplicates':[x for x in set(ids) if ids.count(x)>1]})
      p.wait_for_timeout(150)
      check(tag+theme+' institutional enhancement is stable',p.locator('#perfDilutionGrid>[data-fcc-record-id]:not([data-cuf-superseded=\"1\"])').count()==len(ids))
      for q in ['Amiodarona','amoxicilina']:
       p.locator('#perfDilutionSearch').fill(q);p.wait_for_timeout(350)
       card=p.locator('#perfDilutionGrid>.ccd-doc-card:not([data-cuf-superseded="1"]):visible').first
       title=card.locator('.ccd-doc-top h3').text_content();details=card.locator('.ccd-doc-details').text_content()
       card.locator('.ccd-doc-top').focus();y=p.evaluate('scrollY');card.locator('.ccd-doc-top').press('Enter')
       selected=p.locator('#perfDilutionGrid>.fcc-record-selected');selected.wait_for(state='visible')
       t=tag+'-'+theme+'-'+q;reader(p,t,'clin-perf','#perfDilutionGrid>.fcc-record-selected h3')
       check(t+' only selected record',p.locator('#perfDilutionGrid>.ccd-doc-card:visible').count()==1)
       check(t+' entire original instructions preserved',selected.locator('.ccd-doc-details').text_content()==details)
       check(t+' source and instructions accessible',selected.locator('.ccd-doc-details').evaluate('x=>x.open') and selected.locator('.ccd-doc-source').is_visible())
       for hidden in ['#perfDilutionSearch','#ccdGroup','#ccdOnlyVerified','#fccPerfInfo','#ccdCount','#perfDoseToggle','#clin-perf>.perf-safety']:
        check(t+' no catalogue '+hidden,not p.locator(hidden).is_visible())
       check(t+' bookmark identifies record',p.evaluate('FCCNavigation.route().ref').startswith('d-'))
       selected.locator('h3').click();check(t+' reading title is not an accidental close control',selected.is_visible() and p.locator('#fccDilutionBack').is_visible() and selected.locator('.ccd-doc-top').get_attribute('role') is None)
       shot(p,t)
       p.go_back();p.wait_for_selector('#perfDilutionSearch');check(t+' browser back restores query',p.locator('#perfDilutionSearch').input_value()==q and p.locator('.top').is_visible())
       p.go_forward();selected.wait_for(state='visible');check(t+' forward restores same record',selected.locator('h3').text_content()==title)
       p.reload(wait_until='domcontentloaded');ready(p);selected.wait_for(state='visible');check(t+' reload restores record only',selected.locator('h3').text_content()==title and not p.locator('.top').is_visible())
       p.locator('#fccDilutionBack').click();p.wait_for_selector('#perfDilutionSearch');check(t+' return button restores query and source control',p.locator('#perfDilutionSearch').input_value()==q and p.locator('#fccPerfInfo').is_visible())
       p.locator('#perfDilutionGrid>.ccd-doc-card:visible').first.locator('.ccd-doc-top').click();selected.wait_for(state='visible')
       p.locator('nav.side [data-page=clinical]').click();p.wait_for_selector('#fccArea-clinical');check(t+' library restores header without automatic subgroup',p.locator('.top').is_visible() and p.locator('#page-clinical>.sub.active').count()==0)
       nav(p,'clin-perf')
      nav(p,'clin-drugs');p.locator('#med4Search').fill('noradrenalina');p.wait_for_function("/noradrenalina/i.test(document.querySelector('#med4Results [data-med4] strong')?.textContent||'')")
      p.locator('#med4Results [data-med4]').first.click();p.wait_for_selector('#med4Results h3');reader(p,tag+theme+'-catalogue','clin-drugs','#med4Results h3')
      check(tag+theme+' clinical precautions stay inside record',p.locator('#med4Results .fcc-detail-warning').is_visible() and p.locator('#med4Results [data-clinical-field]').count()>=8)
      check(tag+theme+' catalogue fields hidden',not p.locator('#med4Search').is_visible() and not p.locator('#fccMedCount').is_visible());shot(p,tag+'-'+theme+'-medication')
      p.locator('#fccMedDilutions').click();p.wait_for_selector('#perfDilutionSearch');check(tag+theme+' related module leaves reader',p.locator('.top').is_visible())
      nav(p,'clin-drugs');p.locator('#med4Search').fill('');p.wait_for_function("document.querySelectorAll('#med4Results [data-med4]').length===36")
      last=p.locator('#med4Results [data-med4]').last;last.scroll_into_view_if_needed();y=p.evaluate('scrollY');name=last.get_attribute('data-med4');last.click();p.wait_for_selector('#med4Results h3')
      check(tag+theme+' long list opens at beginning',p.evaluate('scrollY')<5);p.locator('#fccMedBack').click();check(tag+theme+' long list return position restored',abs(p.evaluate('scrollY')-y)<3)
      check(tag+theme+' return focus restored',p.evaluate('document.activeElement.dataset.med4')==name)
      nav(p,'clin-perf');p.locator('#perfDilutionSearch').fill('Amiodarona');p.wait_for_timeout(300);p.locator('#perfDilutionGrid>.ccd-doc-card:visible').first.locator('.ccd-doc-top').click()
      for width in [320,430,768]:
       p.set_viewport_size({'width':width,'height':844});check(tag+theme+str(width)+' reader reflows',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not p.locator('.top').is_visible())
      p.set_viewport_size({'width':w,'height':h});p.locator('#fccDilutionBack').click()
      p.evaluate("FCCNavigation.navigate('clinical',{sub:'clin-perf',ref:'d-missing'})");p.wait_for_function("!FCCNavigation.route().ref");check(tag+theme+' unknown reference has a usable list',p.locator('#perfDilutionSearch').is_visible())
     nav(p,page='personal');check(tag+' locked personal overview preserved',not p.evaluate('FCCAccess.isUnlocked()') and p.locator('#fccArea-personal').is_visible());p.locator('[data-area-target=notes]').click();p.locator('#fccVaultDialog').wait_for(state='visible');check(tag+' private notes still denied',not p.locator('#em-notes').is_visible());p.keyboard.press('Escape')
     check(tag+' no owner data or vault created',not p.evaluate('FCCStore.status().configured'))
     check(tag+' no unhandled errors',not errors,errors)
    except Exception as e:
     report['checks'].append({'name':tag+' failure','pass':False,'error':str(e),'trace':traceback.format_exc(),'pageErrors':errors})
     try:shot(p,tag+'-FAILED')
     except Exception:pass
    finally:ctx.close()
   browser.close()
finally:
 if srv:srv.shutdown()
 (OUT/('record-live.json' if LIVE else 'record-audit.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not c['pass'] for c in report['checks']):raise SystemExit(1)
