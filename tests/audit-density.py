"""Readable compact records. Synthetic profiles; no clinical edits or owner data.
Measures all preparation records and catalogue fichas at desktop sizes, and tests
real interactions, text preservation and responsive layout in both engines/themes.
"""
import functools,http.server,json,os,socketserver,threading,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
LIVE=os.environ.get('FCC_DENSITY_LIVE')=='1'
BASE='https://fabioneto50.github.io/fabio-command-center/' if LIVE else 'http://127.0.0.1:4183/'
BUILD=json.loads((ROOT/'asset-manifest.json').read_text())['build']
report={'commit':os.environ.get('GITHUB_SHA','local'),'build':BUILD,'live':LIVE,'checks':[],'measurements':[],'coverage':[], 'limits':'CSS pixels in software engines, not physical iPhone. Single screen includes all clinical fields but not an expanded reference disclosure. Long records can still scroll.'}
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=None
if not LIVE:
 srv=Server(('127.0.0.1',4183),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start()
def check(name,ok,detail=None):
 report['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
 if not ok:raise AssertionError(name+': '+str(detail))
def ready(p):p.wait_for_function("window.FCCAppReady===true&&[...document.querySelectorAll('nav.side .nav')].every(x=>!x.disabled)",timeout=60000)
def nav(p,sub='',page='clinical'):
 p.evaluate('([page,sub])=>fccNavigate(page,{sub,focus:true})',[page,sub]);p.wait_for_function('([page,sub])=>FCCNavigation.current()===page&&FCCNavigation.route().sub===sub',arg=[page,sub])
def measure(p,selector):
 return p.locator(selector).evaluate("e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,screen:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth+1,allVisible:[...e.querySelectorAll('.ccd-doc-field,.fcc-fact')].every(x=>x.getClientRects().length&&getComputedStyle(x).overflowY!=='hidden'&&(!getComputedStyle(x).webkitLineClamp||getComputedStyle(x).webkitLineClamp==='none'))}}")
def search(p,q):
 p.locator('#perfDilutionSearch').click();p.locator('#perfDilutionSearch').fill(q)
 # Wait for the actual requested record, not a timer or a stale card from the previous search.
 p.wait_for_function("q=>{const f=s=>String(s).normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();const c=[...document.querySelectorAll('#perfDilutionGrid>.ccd-doc-card')].find(x=>x.dataset.cufSuperseded!=='1'&&x.getClientRects().length);return document.getElementById('perfDilutionSearch').value===q&&c&&f(c.querySelector('h3').textContent).includes(f(q));}",arg=q,timeout=15000)
 p.wait_for_timeout(150)
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch()
   for width,height in [(390,844),(1366,768),(1440,900)]:
    ctx=browser.new_context(viewport={'width':width,'height':height},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=width<600,has_touch=width<600);p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));tag=f'{engine}-{width}-density'
    try:
     p.goto(BASE,wait_until='domcontentloaded');ready(p);check(tag+' correct build',BUILD in p.evaluate('FCC_ASSET_BASE'))
     for theme in ['light','dark']:
      nav(p,page='settings');p.locator('#fccThemeSettings [data-fcc-theme-choice='+theme+']').click();p.wait_for_function('(t)=>document.documentElement.dataset.fccTheme===t',arg=theme)
      nav(p,'clin-perf');p.wait_for_selector('#perfDilutionSearch');p.wait_for_timeout(400)
      for q in ['Amiodarona','amoxicilina','ceftriaxona','noradrenalina']:
       search(p,q)
       card=p.locator('#perfDilutionGrid>.ccd-doc-card:not([data-cuf-superseded="1"]):visible').first
       original=card.locator('.ccd-doc-details').text_content();routes=card.locator('.ccd-doc-route').count();card.locator('.ccd-doc-top').click()
       card=p.locator('#perfDilutionGrid>.fcc-record-selected');card.wait_for(state='visible');t=tag+'-'+theme+'-'+q
       m=measure(p,'#perfDilutionGrid>.fcc-record-selected');report['measurements'].append({'name':t,'routes':routes,**m})
       check(t+' full clinical text retained',card.locator('.ccd-doc-details').text_content()==original)
       check(t+' all versions simultaneously present',card.locator('.ccd-doc-route:visible').count()==routes)
       check(t+' no hidden/truncated fields or horizontal overflow',m['allVisible'] and not m['overflow'],m)
       check(t+' legible dose and body values',card.locator('.ccd-doc-field>div').evaluate_all('es=>es.every(e=>parseFloat(getComputedStyle(e).fontSize)>=14)'))
       check(t+' compact heading not overridden',card.locator('h3').evaluate('e=>parseFloat(getComputedStyle(e).fontSize)<=20'))
       if width>=1000 and routes>1:
        positions=card.locator('.ccd-doc-route').evaluate_all('es=>es.slice(0,2).map(e=>e.getBoundingClientRect().top)');check(t+' first two presentations side by side',abs(positions[0]-positions[1])<2,positions)
       if q=='Amiodarona':
        p.screenshot(path=str(OUT/(t+'.png')),animations='disabled')
        if width>=1000:check(t+' complete Amiodarona fits screen',m['bottom']<=height-5,m)
       p.locator('#fccDilutionBack').click()
       p.wait_for_function("q=>document.getElementById('clin-perf').dataset.fccRecordView==='list'&&document.getElementById('perfDilutionSearch').value===q&&!FCCNavigation.route().ref",arg=q)
       check(t+' return preserves search',p.locator('#perfDilutionSearch').input_value()==q)
      nav(p,'clin-drugs');p.wait_for_selector('#med4Search');p.locator('#med4Search').fill('amiodarona');p.wait_for_function("/amiodarona/i.test(document.querySelector('#med4Results [data-med4]')?.textContent||'')")
      p.locator('#med4Results [data-med4]').first.click();p.wait_for_selector('#med4Results h3')
      m=measure(p,'#med4Results article');report['measurements'].append({'name':tag+'-'+theme+'-catalogue',**m});check(tag+theme+' catalogue fields visible and unclipped',m['allVisible'] and not m['overflow'],m)
      check(tag+theme+' precautions still visible',p.locator('.fcc-detail-warning').is_visible())
      if width>=1000:check(tag+theme+' catalogue uses available columns',p.locator('.fcc-facts-grid').evaluate("e=>parseFloat(getComputedStyle(e).columnWidth)>=260&&e.clientWidth>850"))
      p.screenshot(path=str(OUT/(tag+'-'+theme+'-catalogue.png')),animations='disabled')
      for w in [320,430,768]:
       p.set_viewport_size({'width':w,'height':844});check(tag+theme+str(w)+' text reflows without clipping',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
      p.set_viewport_size({'width':width,'height':height});p.locator('#fccMedBack').click();check(tag+theme+' catalogue back',p.locator('#med4Search').input_value()=='amiodarona')
     if width>=1000 and not LIVE:
      nav(p,'clin-perf');p.locator('#perfDilutionSearch').fill('');p.wait_for_timeout(500)
      survey=p.evaluate("""()=>{const cards=[...document.querySelectorAll('#perfDilutionGrid>.ccd-doc-card')].filter(x=>x.dataset.cufSuperseded!=='1');return cards.map(c=>{FCCDilutionView.open(c,{route:false,focus:false});const b=c.getBoundingClientRect().bottom+scrollY;return {name:c.querySelector('h3').textContent,bottom:b,routes:c.querySelectorAll('.ccd-doc-route').length,fits:b<=innerHeight};});}""")
      report['coverage'].append({'browser':engine,'kind':'preparation','width':width,'height':height,'total':len(survey),'fits':sum(x['fits'] for x in survey),'longest':sorted(survey,key=lambda x:x['bottom'],reverse=True)[:5]})
      nav(p,'clin-drugs');p.wait_for_selector('#med4Search')
      survey=p.evaluate("""()=>FCCMedications.get().map(r=>{FCCMedications.show(r.n,{route:false,focus:false});const e=document.querySelector('#med4Results article'),b=e.getBoundingClientRect().bottom+scrollY;return {name:r.n,bottom:b,fits:b<=innerHeight};})""")
      report['coverage'].append({'browser':engine,'kind':'catalogue','width':width,'height':height,'total':len(survey),'fits':sum(x['fits'] for x in survey),'longest':sorted(survey,key=lambda x:x['bottom'],reverse=True)[:5]})
     check(tag+' no unhandled error',not errors,errors)
     check(tag+' no private vault created',not p.evaluate('FCCStore.status().configured'))
    except Exception as e:
     try:diagnostic=p.evaluate("({query:document.getElementById('perfDilutionSearch')?.value,route:FCCNavigation.route(),selected:document.querySelector('.fcc-record-selected h3')?.textContent,active:document.activeElement?.id})")
     except Exception:diagnostic={}
     report['checks'].append({'name':tag+' failure','pass':False,'error':str(e),'trace':traceback.format_exc(),'pageErrors':errors,'diagnostic':diagnostic})
     try:p.screenshot(path=str(OUT/(tag+'-FAILED.png')))
     except Exception:pass
    finally:ctx.close()
   browser.close()
finally:
 if srv:srv.shutdown()
 (OUT/('density-live.json' if LIVE else 'density-audit.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not c['pass'] for c in report['checks']):raise SystemExit(1)
