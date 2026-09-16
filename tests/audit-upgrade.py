"""Release transition tests with real service workers on a Pages-style subpath.
Synthetic data only. Future fixture is built locally and is never deployed.
"""
import functools, http.server, json, os, shutil, socketserver, subprocess, tempfile, threading, traceback
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
report={'commit':os.environ.get('GITHUB_SHA','local'),'checks':[],'limitations':['Software engines on Linux, not physical iOS. WebKit connection loss is enforced at the origin server.']}
initial=json.loads((ROOT/'asset-manifest.json').read_text())['build']
def check(name,value,detail=None):
 report['checks'].append({'name':name,'pass':bool(value),'detail':detail})
 if not value:raise AssertionError(name+': '+str(detail))
class Handler(http.server.SimpleHTTPRequestHandler):
 directory_root=ROOT;fault='';network_down=False
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(type(self).directory_root),**kwargs)
 def do_GET(self):
  if type(self).network_down:self.connection.shutdown(2);self.connection.close();return
  path=urlsplit(self.path).path
  if not path.startswith('/site/'):
   self.send_error(404);return
  if type(self).fault and '/release/' in path and path.endswith('/fcc-core.js'):
   body=b'corrupted synthetic payload';self.send_response(503 if type(self).fault=='503' else 200);self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
  self.path=self.path[len('/site'):];super().do_GET()
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=Server(('127.0.0.1',4176),Handler);threading.Thread(target=srv.serve_forever,daemon=True).start();URL='http://127.0.0.1:4176/site/'
def ready(p):p.wait_for_function("window.FCCAppReady===true && [...document.querySelectorAll('.nav')].every(x=>!x.disabled)",timeout=45000)
def update(p):
 return p.evaluate("""async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();const w=r.installing;
 if(w&&!['installed','redundant'].includes(w.state))await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Update did not settle')),35000);w.addEventListener('statechange',()=>{if(['installed','redundant'].includes(w.state)){clearTimeout(t);resolve();}});});
 return {state:w?.state||null,waiting:!!r.waiting};}""")
try:
 with tempfile.TemporaryDirectory(prefix='fcc-future-') as tmp:
  future=Path(tmp)/'app';shutil.copytree(ROOT,future,ignore=shutil.ignore_patterns('.git','audit-evidence','node_modules'))
  with (future/'fcc-ui.css').open('a') as file:file.write('\n/* Synthetic next release: tests only. */\n')
  subprocess.run(['node','--expose-internals','scripts/build-assets.cjs'],cwd=future,check=True,capture_output=True)
  newer=json.loads((future/'asset-manifest.json').read_text())['build'];check('New fixture build differs',initial!=newer)
  check('Previous immutable source remains on new release', (future/'release'/initial/'fcc-medications.js').read_bytes()==(ROOT/'release'/initial/'fcc-medications.js').read_bytes())
  with sync_playwright() as pw:
   for engine in ['chromium','webkit']:
    Handler.directory_root=ROOT;Handler.fault='';Handler.network_down=False
    browser=getattr(pw,engine).launch();ctx=browser.new_context(locale='pt-PT',viewport={'width':390,'height':844});p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    try:
     p.goto(URL,wait_until='domcontentloaded');ready(p);p.wait_for_function('!!navigator.serviceWorker.controller',timeout=30000)
     p.evaluate("FCCOffline.send('CACHE_PACKAGE',{package:'clinical'})")
     p.evaluate("async()=>{await FCCStore.create('synthetic transition passphrase 2026');await FCCStore.setItem('fcc-master-user-data-v1',JSON.stringify({version:1,people:[{id:'transition-p',name:'SYNTHETIC TRANSITION PERSON'}],notes:{general:'Synthetic migration note'}}));await FCCStore.flush();}")
     vault=p.evaluate('localStorage.getItem(FCCStore.keys.vault)')
     p.evaluate("async()=>{await fccNavigate('clinical',{sub:'clin-perf'});document.getElementById('infWt').value='73';}")
     Handler.directory_root=future
     for fault in ['503','corrupt']:
      Handler.fault=fault;state=update(p);check(engine+' '+fault+' incomplete install discarded',not state['waiting'],state)
      check(engine+' '+fault+' previous working package intact',p.evaluate('(b)=>FCCOffline.send("STATUS").then(s=>s.packages.core.complete&&s.packages.clinical.complete&&s.build===b)',initial))
      check(engine+' '+fault+' encrypted data unchanged',p.evaluate('localStorage.getItem(FCCStore.keys.vault)')==vault)
     Handler.fault='';state=update(p);check(engine+' valid next version waits for consent',state['waiting'],state)
     check(engine+' status belongs to running page not pending worker',p.evaluate('(b)=>FCCOffline.send("STATUS").then(s=>s.build===b)',initial))
     check(engine+' unsaved input survives waiting update',p.locator('#infWt').input_value()=='73')
     oldtab=ctx.new_page();oldtab.goto(URL,wait_until='domcontentloaded');ready(oldtab)
     check(engine+' second tab still uses active version',oldtab.evaluate('FCC_ASSET_BASE').find(initial)>=0)
     # Exercise the actual user-facing confirmation and reload, not a test-only message.
     oldtab.evaluate("FCCOffline.send('STATUS')")
     p.evaluate("fccNavigate('settings')");p.evaluate('FCCOffline.applyUpdate()')
     p.locator('#fccUpdateDialog').wait_for(state='visible')
     with p.expect_navigation(wait_until='domcontentloaded',timeout=60000):
      p.get_by_role('button',name='Atualizar e recarregar',exact=True).click()
     ready(p)
     check(engine+' real confirmation activated and reloaded',newer in p.evaluate('FCC_ASSET_BASE'))
     check(engine+' older open page receives explicit version mismatch',oldtab.evaluate("async()=>{try{await FCCOffline.send('STATUS');return false}catch(e){return /versão|recarrega/.test(e.message)}}"))
     Handler.network_down=True
     check(engine+' offline control genuinely fails',oldtab.evaluate("async()=>{try{await fetch('./not-cached-control',{cache:'no-store'});return false}catch{return true}}"))
     check(engine+' older tab lazy module works after activation while origin offline',oldtab.evaluate("async()=>{await fccNavigate('clinical',{sub:'clin-drugs'});return FCCMedicationV7Health.count===923&&document.getElementById('clin-drugs').classList.contains('active')}"))
     Handler.network_down=False;p.reload(wait_until='domcontentloaded');ready(p)
     check(engine+' updated page uses new assets',newer in p.evaluate('FCC_ASSET_BASE'))
     check(engine+' ciphertext survives reload exactly',p.evaluate('localStorage.getItem(FCCStore.keys.vault)')==vault)
     check(engine+' new version unlocks existing data',p.evaluate("async()=>{await FCCStore.unlock('synthetic transition passphrase 2026');return JSON.parse(FCCStore.getItem('fcc-master-user-data-v1')).people[0].name==='SYNTHETIC TRANSITION PERSON'}"))
     status=p.evaluate("FCCOffline.send('STATUS')");check(engine+' new clinical package not falsely marked complete',not status['packages']['clinical']['complete'])
     p.screenshot(path=str(OUT/(engine+'-upgrade-mobile.png')))
     check(engine+' no unhandled application errors',not errors,errors)
    except Exception as e:
     try:diagnostic=p.evaluate("async()=>{const r=await navigator.serviceWorker.getRegistration();return {build:FCC_ASSET_BASE,waiting:r?.waiting?.state,active:r?.active?.state,installing:r?.installing?.state,controller:navigator.serviceWorker.controller?.state}}")
     except Exception:diagnostic={}
     report['checks'].append({'name':engine+' transition failed','pass':False,'error':str(e),'trace':traceback.format_exc(),'workerState':diagnostic,'pageErrors':errors})
    finally:Handler.fault='';Handler.network_down=False;ctx.close();browser.close()
finally:
 srv.shutdown();(OUT/'upgrade-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not x['pass'] for x in report['checks']):raise SystemExit(1)
