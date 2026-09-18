"""Typography census: fresh synthetic contexts, not the owner's browser or records.
Baseline records defects; candidate/live enforce readable DOM text and reflow.
"""
import functools,http.server,json,os,socketserver,threading,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
STAGE=os.environ.get('FCC_TYPO_STAGE','candidate');LIVE=STAGE=='live';STRICT=STAGE!='baseline'
BASE='https://fabioneto50.github.io/fabio-command-center/' if LIVE else 'http://127.0.0.1:4187/'
BUILD=json.loads((ROOT/'asset-manifest.json').read_text())['build']
report={'commit':os.environ.get('GITHUB_SHA','local'),'build':BUILD,'stage':STAGE,'checks':[],'views':[],'compatibilityMeasurements':[],'limits':'Local module DOM text, both themes and software engines. Excludes image/canvas text, native dropdown popups, third-party stock iframe, every possible user record and physical iPhone/VoiceOver. Readability floor is a design choice, not WCAG certification. The pre-existing source decorator can replace its DOM nodes; measurements query and read connected nodes in one browser task instead of retaining detached handles.'}
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=None
if not LIVE:
 srv=Server(('127.0.0.1',4187),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start()
SCAN=r"""() => {
 const rows=[],walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 for(let n; n=walk.nextNode();){
  const e=n.parentElement,t=n.textContent.trim();if(!e||!t||e.closest('script,style,svg,canvas,option,datalist,[hidden],.fcc-skip'))continue;
  const s=getComputedStyle(e);if(s.visibility!=='visible'||s.display==='none')continue;
  const r=document.createRange();r.selectNodeContents(n);if(![...r.getClientRects()].some(b=>b.width>0&&b.height>0))continue;
  const px=parseFloat(s.fontSize),selector=e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+[...e.classList].map(c=>'.'+c).join('');
  rows.push({selector,text:t.slice(0,170),size:px,line:s.lineHeight,heading:!!e.closest('h1,h2,h3,h4,h5,h6')});
 }
 const tiny=rows.filter(x=>x.size<12.99&&!/^(sub|sup)\b/.test(x.selector));
 return {count:rows.length,min:Math.min(...rows.map(r=>r.size)),max:Math.max(...rows.map(r=>r.size)),distribution:rows.reduce((a,r)=>(a[r.size]=(a[r.size]||0)+1,a),{}),tiny,overflow:document.documentElement.scrollWidth>innerWidth+1,large:rows.filter(x=>x.size>22&&!x.heading)};
}"""
MEASURE_SOURCES="""()=>{
 const read=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {text:e.textContent,size:parseFloat(s.fontSize),width:r.width,height:r.height,connected:e.isConnected}};
 return {conditions:[...document.querySelectorAll('.ivc-evidence-lite .limits')].map(read),names:[...document.querySelectorAll('.ivsrc-name b')].map(read),links:[...document.querySelectorAll('.ivsrc-link')].map(read),states:[...document.querySelectorAll('.ivsrc-state')].map(read)};
}"""
def check(name,ok,detail=None):report['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
def nav(p,page='clinical',sub=''):
 p.evaluate('([page,sub])=>fccNavigate(page,{sub,focus:true})',[page,sub]);p.wait_for_function('([a,b])=>FCCNavigation.current()===a&&FCCNavigation.route().sub===b',arg=[page,sub]);p.wait_for_timeout(160)
def capture(p,label,tag,shot=False):
 state=p.evaluate(SCAN);report['views'].append({'name':tag+'-'+label,**state});check(tag+' '+label+' has text',state['count']>0);check(tag+' '+label+' document reflow',not state['overflow'])
 if STRICT:check(tag+' '+label+' no tiny interface text',not state['tiny'],state['tiny'][:16])
 if shot:p.screenshot(path=str(OUT/(tag+'-'+label+'.png')),animations='disabled')
 return state
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch()
   for width,height in [(390,844),(1440,900)]:
    ctx=browser.new_context(viewport={'width':width,'height':height},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=width<600,has_touch=width<600);p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    try:
     p.goto(BASE,wait_until='domcontentloaded');p.wait_for_function("window.FCCAppReady===true&&[...document.querySelectorAll('nav.side .nav')].every(x=>!x.disabled)",timeout=60000)
     check(engine+str(width)+' correct build',BUILD in p.evaluate('FCC_ASSET_BASE'))
     for theme in ['light','dark']:
      tag=f'{engine}-{width}-type-{theme}';p.evaluate('(t)=>fccSetTheme(t,false)',theme)
      nav(p,'home');capture(p,'home',tag,True)
      nav(p,'clinical');capture(p,'clinical-hub',tag)
      nav(p,'personal');capture(p,'personal-locked',tag)
      for sub in p.evaluate("FCCNavigation.items('clinical').map(x=>x.id)"):
       nav(p,'clinical',sub);capture(p,sub,tag,sub in ['clin-lasa','clin-ecg','clin-scales'])
      nav(p,'clinical','clin-ivcompat')
      for label,name in [('Fármaco A','Amiodarona'),('Fármaco B','Furosemida')]:
       field=p.get_by_role('textbox',name=label,exact=True);field.fill(name);field.press('Enter')
      p.wait_for_selector('.ivsrc-panel');p.wait_for_timeout(250);p.evaluate('window.scrollTo(0,0)');capture(p,'compatibility-conditions',tag,True)
      measured=p.evaluate(MEASURE_SOURCES);report['compatibilityMeasurements'].append({'view':tag,**measured})
      if STRICT:
       check(tag+' clinical conditions at least 14px',len(measured['conditions'])==1 and all(e['connected'] and e['size']>=14 for e in measured['conditions']),measured['conditions'])
       check(tag+' source names readable',len(measured['names'])>=3 and all(e['connected'] and e['size']>=14 for e in measured['names']),measured['names'])
       check(tag+' source links at least 44px',len(measured['links'])>=3 and all(e['connected'] and e['width']>=43 and e['height']>=43 for e in measured['links']),measured['links'])
      p.locator('#ivcResult').screenshot(path=str(OUT/(tag+'-complete-evidence-panel.png')),animations='disabled')
      for w in [320,768]:
       p.set_viewport_size({'width':w,'height':844});capture(p,'compatibility-'+str(w),tag)
      p.set_viewport_size({'width':width,'height':height});p.get_by_role('textbox',name='Fármaco A',exact=True).fill('amio');capture(p,'suggestions',tag);p.keyboard.press('Escape')
      nav(p,'clinical','clin-perf');p.locator('#perfDilutionSearch').fill('Amiodarona');p.wait_for_timeout(450)
      p.locator('#perfDilutionGrid>.ccd-doc-card:not([data-cuf-superseded="1"]):visible .ccd-doc-top').first.click();p.wait_for_timeout(150);capture(p,'amiodarona-preparation',tag,True)
      if STRICT and width>=1000:check(tag+' Amiodarona both routes fit desktop',p.locator('.fcc-record-selected').evaluate('e=>e.getBoundingClientRect().bottom<=innerHeight'))
      nav(p,'clinical','clin-drugs');p.wait_for_selector('#med4Search');p.evaluate("FCCMedications.show('Amiodarona')");p.wait_for_timeout(180);capture(p,'amiodarona-catalogue',tag,True)
      p.locator('.fcc-provenance summary').click();capture(p,'medication-references',tag)
      nav(p,'settings');capture(p,'settings',tag,True)
      p.evaluate("fccOrganizeSubcategories('clinical')");capture(p,'organize-dialog',tag);p.keyboard.press('Escape')
      if not p.evaluate('FCCAccess.isUnlocked()'):
       p.evaluate("async()=>{if(FCCStore.status().configured)await FCCStore.unlock('synthetic typography review 2026');else await FCCStore.create('synthetic typography review 2026');FCCAccess.refreshState();}")
      for area in ['personal','expenses','emergency','comms','garage','research','favorites']:
       nav(p,area);capture(p,area,tag,area=='expenses')
       if area in ['emergency','comms','garage']:
        for sub in p.evaluate('(a)=>FCCNavigation.items(a).map(x=>x.id)',area):nav(p,area,sub);capture(p,sub,tag)
      p.evaluate('FCCAccess.lock()');p.keyboard.press('Escape')
     check(engine+str(width)+' no unhandled errors',not errors,errors)
    except Exception as e:
     check(engine+str(width)+' complete survey',False,{'error':str(e),'trace':traceback.format_exc(),'pageErrors':errors})
     try:p.screenshot(path=str(OUT/(engine+'-'+str(width)+'-type-FAILED.png')))
     except Exception:pass
    finally:ctx.close()
   browser.close()
finally:
 if srv:srv.shutdown()
 report['summary']={'views':len(report['views']),'viewsWithTinyText':sum(bool(v['tiny']) for v in report['views']),'checks':len(report['checks']),'failures':sum(not c['pass'] for c in report['checks'])}
 (OUT/('typography-'+STAGE+'.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report['summary']))
if report['summary']['failures']:raise SystemExit(1)
