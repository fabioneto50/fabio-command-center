"""Verify the real 1.3.2 -> 1.4 migration at one origin with synthetic records.
The old source is an archived git commit supplied by CI, never the owner's profile.
"""
import http.server, json, os, socketserver, threading, traceback
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OLD=Path(os.environ['FCC_LEGACY_ROOT']).resolve();OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
report={'commit':os.environ.get('GITHUB_SHA','local'),'baseline':'fb19f424a5457427f86a1db927d6880286c535a2','checks':[],'method':'Real old source, old worker and new source; same origin; synthetic personal data only'}
def check(name,ok,detail=None):
 report['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
 if not ok:raise AssertionError(name+': '+str(detail))
class Handler(http.server.SimpleHTTPRequestHandler):
 root=OLD
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(type(self).root),**kwargs)
 def do_GET(self):
  if not urlsplit(self.path).path.startswith('/site/'):self.send_error(404);return
  self.path=self.path[len('/site'):];super().do_GET()
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=Server(('127.0.0.1',4177),Handler);threading.Thread(target=srv.serve_forever,daemon=True).start();URL='http://127.0.0.1:4177/site/'
USER='fcc-master-user-data-v1';EXP='fcc-master-expenses-v1';PASS='synthetic legacy migration passphrase 2026'
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   Handler.root=OLD;browser=getattr(pw,engine).launch();ctx=browser.new_context(locale='pt-PT');p=ctx.new_page();errors=[]
   try:
    p.goto(URL,wait_until='domcontentloaded');p.wait_for_function("window.FCCDiagnostics?.get?.().some(x=>x.type==='runtime-ready')||window.FCCAppReady===true",timeout=60000)
    p.wait_for_function('!!navigator.serviceWorker.controller',timeout=30000)
    oldWorker=p.evaluate('navigator.serviceWorker.controller.scriptURL');check(engine+' old worker controls source',oldWorker.endswith('/site/service-worker.js'))
    p.evaluate("([user,exp])=>{localStorage.setItem(user,JSON.stringify({version:1,people:[{id:'legacy-synthetic-person',name:'SYNTHETIC LEGACY PERSON'}],notes:{general:'Synthetic old note'},meta:{schemaVersion:1}}));localStorage.setItem(exp,JSON.stringify({version:1,expenses:[{id:'legacy-exp',merchant:'SYNTHETIC LEGACY MERCHANT',amount:9.5,date:'2026-09-01'}],recurring:{},budgets:{},categories:['Outros'],merchantRules:{},settings:{currency:'EUR'}}));}",[USER,EXP])
    original=p.evaluate('([a,b])=>[localStorage.getItem(a),localStorage.getItem(b)]',[USER,EXP])
    Handler.root=ROOT;p.on('pageerror',lambda e:errors.append(str(e)))
    p.reload(wait_until='domcontentloaded');p.wait_for_function("window.FCC_RUNTIME_VERSION==='1.4.0'&&window.FCCAppReady===true&&[...document.querySelectorAll('.nav')].every(x=>!x.disabled)",timeout=60000)
    check(engine+' old data retained until explicit migration',p.evaluate('([a,b])=>[localStorage.getItem(a),localStorage.getItem(b)]',[USER,EXP])==original)
    check(engine+' private legacy records not exposed by new UI',p.evaluate("!document.body.textContent.includes('SYNTHETIC LEGACY')&&!FCCAccess.isUnlocked()"))
    p.evaluate('async(pass)=>{await FCCStore.create(pass);await FCCStore.flush();}',PASS)
    check(engine+' all legacy records migrated',p.evaluate("([user,exp])=>JSON.parse(FCCStore.getItem(user)).people[0].name==='SYNTHETIC LEGACY PERSON'&&JSON.parse(FCCStore.getItem(exp)).expenses[0].merchant==='SYNTHETIC LEGACY MERCHANT'",[USER,EXP]))
    check(engine+' plaintext removed only after successful encryption',p.evaluate('([a,b])=>localStorage.getItem(a)===null&&localStorage.getItem(b)===null',[USER,EXP]))
    vault=p.evaluate('localStorage.getItem(FCCStore.keys.vault)')
    # The old worker cannot answer the new package protocol. Activate through the new UI.
    p.wait_for_function('navigator.serviceWorker.getRegistration().then(r=>!!r.waiting)',timeout=45000)
    p.evaluate("fccNavigate('settings')");p.evaluate('FCCOffline.applyUpdate()');p.locator('#fccUpdateDialog').wait_for(state='visible')
    with p.expect_navigation(wait_until='domcontentloaded',timeout=60000):p.get_by_role('button',name='Atualizar e recarregar',exact=True).click()
    p.wait_for_function('window.FCCAppReady===true&&!!navigator.serviceWorker.controller',timeout=60000)
    check(engine+' new worker reports complete current core',p.evaluate("FCCOffline.send('STATUS').then(s=>s.build.includes('1.4.0-')&&s.packages.core.complete)"))
    check(engine+' migration ciphertext survives actual update',p.evaluate('localStorage.getItem(FCCStore.keys.vault)')==vault)
    p.evaluate('(pass)=>FCCStore.unlock(pass)',PASS)
    check(engine+' migrated data decrypts after update',p.evaluate("JSON.parse(FCCStore.getItem('fcc-master-user-data-v1')).people[0].name==='SYNTHETIC LEGACY PERSON'"))
    check(engine+' no new unhandled app errors',not errors,errors)
   except Exception as e:report['checks'].append({'name':engine+' legacy migration failure','pass':False,'error':str(e),'trace':traceback.format_exc(),'pageErrors':errors})
   finally:ctx.close();browser.close()
finally:
 srv.shutdown();(OUT/'legacy-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not x['pass'] for x in report['checks']):raise SystemExit(1)
