"""Full application regression suite: fresh Chromium/WebKit contexts, synthetic data.
No owner's browser profile, production personal data, external messages or stock writes.
"""
import json,os,time,threading,functools,http.server,socketserver,traceback,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 network_down=False
 def do_GET(self):
  if type(self).network_down:
   self.connection.shutdown(2);self.connection.close();return
  super().do_GET()
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=Server(('127.0.0.1',4173),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE='http://127.0.0.1:4173/'
PASS='uma frase sintética longa 2026'
report={'commit':os.environ.get('GITHUB_SHA','local'),'method':'Full HTTP app; synthetic browser contexts; software checks, not clinical validation','checks':[],'contexts':[],'limitations':['WebKit Linux offline emulation returned an internal navigation error in round 1; WebKit now tests actual origin connection loss, while Chromium tests context-wide offline. Physical Safari/iPhone offline remains a manual check.']}
def check(name,condition,detail=None):
 row={'name':name,'pass':bool(condition)}
 if detail is not None:row['detail']=detail
 report['checks'].append(row)
 if not condition:raise AssertionError(name+': '+str(detail))
def wait_ready(page):page.wait_for_function("window.FCCAppReady===true && [...document.querySelectorAll('.nav')].every(x=>!x.disabled)",timeout=45000)
def nav(page,sub='',area='clinical'):
 ok=page.evaluate('([page,sub])=>fccNavigate(page,{sub})',[area,sub]);check('Navigate '+area+'/'+sub,ok is True)
def screenshot(page,name):page.screenshot(path=str(OUT/(name+'.png')),full_page=False)
def seed(ctx):
 ctx.add_init_script("""if(!sessionStorage.getItem('synthetic-seeded')){sessionStorage.setItem('synthetic-seeded','1');localStorage.setItem('fcc-master-user-data-v1',JSON.stringify({version:1,people:[{id:'p-synthetic',name:'SYNTHETIC SECRET PERSON',contact:'000000000',role:'Test',location:'Test'}],notes:{general:'SYNTHETIC SECRET NOTE'},meta:{schemaVersion:1}}));localStorage.setItem('fcc-master-expenses-v1',JSON.stringify({version:1,expenses:[{id:'e-synthetic',merchant:'SYNTHETIC SECRET MERCHANT',amount:12.5,date:'2026-09-01'}],recurring:{},budgets:{},categories:['Outros'],merchantRules:{},settings:{currency:'EUR'}}));localStorage.setItem('unrelated-app-test','KEEP');}""")
def create_vault(page):
 page.locator('.nav[data-page="personal"]').click();page.locator('[data-area-unlock]').click();page.locator('#fccVaultDialog').wait_for(state='visible');page.locator('#fccVaultPass').fill(PASS);page.locator('#fccVaultConfirm').fill(PASS);page.locator('#fccVaultAccept').check();page.locator('#fccVaultSubmit').click();page.wait_for_function("FCCAccess.isUnlocked()&&FCCNavigation.current()==='personal'",timeout=15000)
def test_context(pw,name,width,height):
 browser=getattr(pw,name).launch(headless=True);ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<600,has_touch=width<600,locale='pt-PT',timezone_id='Europe/Lisbon');seed(ctx)
 page=ctx.new_page();errors=[];failed=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('requestfailed',lambda r:failed.append({'url':r.url,'error':r.failure}));prefix=f'{name}-{width}';start=time.monotonic()
 try:
  page.goto(BASE,wait_until='domcontentloaded');wait_ready(page)
  observation={'browser':name,'viewport':[width,height],'readySeconds':round(time.monotonic()-start,3)}
  observation['initial']=page.evaluate("""()=>({scripts:document.scripts.length,elements:document.querySelectorAll('*').length,resourceCount:performance.getEntriesByType('resource').length,transferBytes:performance.getEntriesByType('resource').reduce((s,x)=>s+x.transferSize,0),navigation:performance.getEntriesByType('navigation').map(x=>({dcl:x.domContentLoadedEventEnd,load:x.loadEventEnd})),paint:performance.getEntriesByType('paint').map(x=>({name:x.name,start:x.startTime}))})""")
  report['contexts'].append(observation)
  check(prefix+' version',page.evaluate("FCC_RUNTIME_VERSION==='1.4.0'"));check(prefix+' lazy initial scripts <30',observation['initial']['scripts']<30,observation['initial'])
  check(prefix+' global search visible',page.locator('#globalSearch').is_visible());check(prefix+' no document horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  check(prefix+' locked DOM has no private seed',page.evaluate("!document.body.textContent.includes('SYNTHETIC SECRET')"));check(prefix+' locked store has no private state',page.evaluate("FCCStore.getItem('fcc-master-user-data-v1')===null"));screenshot(page,prefix+'-home')
  # No migration just from opening the public site.
  check(prefix+' original plaintext not silently deleted',page.evaluate("localStorage.getItem('fcc-master-user-data-v1').includes('SYNTHETIC SECRET')"))
  page.locator('#globalSearch').fill('paracetamol');page.wait_for_selector('#globalResults [role=option]');check(prefix+' global index independent from medication UI',page.evaluate("!window.FCCMedications && FCCSearch.getHits().some(x=>x.type==='Medicação'&&x.title.toLowerCase()==='paracetamol')"))
  page.locator('#globalSearch').press('ArrowDown');page.locator('#globalSearch').press('Enter');page.wait_for_function("!!window.FCCMedications&&/paracetamol/i.test(document.querySelector('#med4Results h3')?.textContent||'')",timeout=30000)
  check(prefix+' direct medication route',page.evaluate("location.hash.includes('clin-drugs/m-paracetamol')"));check(prefix+' canonical count',page.evaluate('FCCMedicationV7Health.count===923'))
  page.locator('#fccMedBack').click();check(prefix+' catalogue paginated',page.locator('#med4Results [data-med4]').count()<=36)
  page.locator('#med4Search').fill('noradrenalina');page.wait_for_timeout(250);page.locator('#med4Results [data-med4]').first.click();check(prefix+' mandatory fields',page.locator('#med4Results [data-clinical-field]').count()>=8);screenshot(page,prefix+'-medication')
  # Deep-link list state is public; exercise actual browser back/forward and reload.
  page.go_back();page.wait_for_selector('#med4Results [data-med4]');check(prefix+' detail back restores filtered list',page.locator('#med4Search').input_value()=='noradrenalina' and page.locator('#med4Results .med5-detail-row').count()==0)
  check(prefix+' filter encoded in public URL','q=noradrenalina' in page.evaluate('location.hash'))
  page.go_forward();page.wait_for_selector('#med4Results h3');check(prefix+' forward restores medication detail','noradrenalina' in page.locator('#med4Results h3').inner_text().lower())
  page.locator('#fccMedBack').click();page.locator('#med4Search').fill('');page.wait_for_timeout(250);page.locator('#fccMedNext').click()
  before=page.locator('#med4Results [data-med4]').first.get_attribute('data-med4');check(prefix+' pagination encoded in URL','p=1' in page.evaluate('location.hash'))
  page.reload(wait_until='domcontentloaded');wait_ready(page);page.wait_for_selector('#med4Results [data-med4]')
  check(prefix+' list page survives reload',page.locator('#med4Results [data-med4]').first.get_attribute('data-med4')==before and 'página 2' in page.locator('#fccMedCount').inner_text())
  nav(page,'clin-cases');page.locator('#globalSearch').fill('Perfusão periférica');page.wait_for_timeout(400);matches=page.evaluate("FCCSearch.getHits().map((x,i)=>({x,i})).filter(y=>y.x.type==='Caso clínico')")
  check(prefix+' case found globally',len(matches)>0);page.evaluate('(i)=>FCCSearch.open(i)',matches[0]['i']);check(prefix+' case search correct route',page.evaluate("FCCNavigation.route().sub==='clin-cases'&&document.getElementById('clin-cases').classList.contains('active')"))
  # Keyboard focus and dialog behavior, all engines and sizes.
  page.locator('.nav[data-page="clinical"]').click();page.wait_for_function("FCCNavigation.route().page==='clinical'&&!FCCNavigation.route().sub");check(prefix+' clinical landing has no auto panel',page.locator('#page-clinical > .sub.active').count()==0 and not page.evaluate('!!FCCUI.active()'));page.evaluate("document.querySelector('.nav[data-page=clinical]').focus();openCategoryMenu('clinical')");page.locator('#fccCategoryDialog').wait_for(state='visible');check(prefix+' focus inside modal',page.evaluate("document.getElementById('fccCategoryDialog').contains(document.activeElement)"))
  for _ in range(35):page.keyboard.press('Tab');check(prefix+' modal Tab contained',page.evaluate("document.getElementById('fccCategoryDialog').contains(document.activeElement)"))
  screenshot(page,prefix+'-menu');page.keyboard.press('Escape');check(prefix+' Escape closes and returns focus',page.evaluate("document.getElementById('fccCategoryDialog').hidden&&document.activeElement.dataset.page==='clinical'"));check(prefix+' no stranded inert page',page.evaluate("!document.querySelector('.app').inert"))
  nav(page,'clin-perf');page.locator('#perfDoseToggle').click()
  for id,value in {'infAmount':'4','infVol':'50','infWt':'70','infRate':'5'}.items():page.locator('#'+id).fill(value)
  page.locator('#infAmountUnit').select_option('mg');page.locator('#infDU').select_option('uih');page.evaluate('rateToDose()');check(prefix+' inverse mass/UI rejected',page.locator('#infResult').get_attribute('data-valid')=='false');check(prefix+' no old wrong result',not '400 UI/h' in page.locator('#infResult').inner_text())
  page.locator('#infAmount').fill('8');page.locator('#infDU').select_option('mcgkgmin');page.locator('#infDose').fill('0.1');page.evaluate('doseToRate()');check(prefix+' infusion correct',abs(float(page.locator('#infRate').input_value())-2.625)<1e-8)
  page.locator('#infVol').fill('25');check(prefix+' result invalidates on edit',page.locator('#infResult').get_attribute('data-valid')=='false')
  page.locator('#infDose').fill('');page.evaluate('doseToRate()');check(prefix+' empty dose rejected',page.locator('#infResult').get_attribute('data-valid')=='false')
  nav(page,'clin-sepsis');page.evaluate("()=>{for(const id of ['sWt','sAge','sMAP','sLac','sUrine','sCRT'])document.getElementById(id).value='';sShock.value='no';analyzeSepsis()}")
  check(prefix+' empty sepsis qualified','Dados insuficientes' in page.locator('#sepsisResult').inner_text());page.locator('#sUrine').fill('0');page.evaluate('analyzeSepsis()');check(prefix+' urine zero alert','Diurese zero' in page.locator('#sepsisResult').inner_text())
  nav(page,'clin-vent');check(prefix+' measurement confirmations not preset',not page.locator('#vPassive').is_checked() and not page.locator('#vPlateauValid').is_checked())
  # Load and traverse every clinical module, rather than counting scripts alone.
  modules=page.evaluate("FCCNavigation.items('clinical').map(x=>x.id)")
  for sub in modules:
   nav(page,sub);check(prefix+' one clinical panel '+sub,page.locator('#page-clinical > .sub.active').count()==1);check(prefix+' active target '+sub,page.locator('#'+sub).get_attribute('class').find('active')>=0)
  check(prefix+' restored antibiotics count',page.evaluate("FCCModules.json('data/institutional.json').then(x=>x.antibiotics.records.length===66)"))
  check(prefix+' image metadata loaded',page.evaluate("!!window.FCCDressingMedia"));nav(page,'clin-dressings');screenshot(page,prefix+'-dressings')
  nav(page,'clin-material');check(prefix+' external stock not loaded implicitly',page.locator('#materialStockFrame').get_attribute('src')=='about:blank')
  # Synthetic migration through the real passphrase dialog, not a fake session flag.
  create_vault(page);check(prefix+' legacy migrated',page.evaluate("localStorage.getItem('fcc-master-user-data-v1')===null && localStorage.getItem('fcc-master-expenses-v1')===null"));check(prefix+' ciphertext not plaintext',page.evaluate("!localStorage.getItem(FCCStore.keys.vault).includes('SYNTHETIC SECRET')"))
  nav(page,'em-family','emergency');check(prefix+' contact preserved','SYNTHETIC SECRET PERSON' in page.locator('#page-emergency').inner_text());nav(page,'','expenses');check(prefix+' expense preserved',page.evaluate("JSON.parse(FCCStore.getItem('fcc-master-expenses-v1')).expenses.some(x=>x.merchant==='SYNTHETIC SECRET MERCHANT')"))
  for area in ['personal','emergency','comms','garage','research','expenses']:
   nav(page,'',area);check(prefix+' personal owner '+area,page.locator('.nav[data-page=personal].active').count()==1)
  # Imported source URLs are untrusted data, even in an authenticated backup.
  page.evaluate("""async()=>{const snap=FCCStore.snapshot(),data=JSON.parse(snap.records['fcc-master-user-data-v1']);data.research=[{id:'r-url-synthetic',title:'SYNTHETIC UNSAFE URL',url:'javascript:window.syntheticURLExecuted=1',topic:'Test',status:'Por ler'}];snap.records['fcc-master-user-data-v1']=JSON.stringify(data);await FCCStore.transaction(snap);FCCAccess.refreshState();}""")
  nav(page,'','research');check(prefix+' imported script URL has no clickable link',page.locator('#researchGrid a[href^="javascript:"]').count()==0 and not page.evaluate('!!window.syntheticURLExecuted'))
  page.evaluate('async()=>{await FCCStore.restorePrevious();FCCAccess.refreshState();}')
  # Backup/recovery is tested in real Web Crypto, in addition to Node unit tests.
  result=page.evaluate("""async(pass)=>{await FCCStore.flush();const before=FCCStore.snapshot(),backup=await FCCStore.exportBackup(),decoded=await FCCStore.readBackup(backup,pass);if(JSON.stringify(before.records)!==JSON.stringify(decoded.records))return false;await FCCStore.reset('expenses');if(FCCStore.getItem('fcc-master-expenses-v1')!==null)return false;await FCCStore.restorePrevious();FCCAccess.refreshState();return JSON.stringify(FCCStore.snapshot().records)===JSON.stringify(before.records)&&localStorage.getItem('unrelated-app-test')==='KEEP';}""",PASS)
  check(prefix+' full backup and reversible scoped reset',result)
  if width<600:
   backup=page.evaluate('FCCStore.exportBackup()');copy=browser.new_context(locale='pt-PT');target=copy.new_page()
   try:
    target.goto(BASE,wait_until='domcontentloaded');wait_ready(target)
    check(prefix+' clean browser backup restore',target.evaluate("""async([backup,oldPass])=>{await FCCStore.create('outra frase sintética de destino 2026');const payload=await FCCStore.readBackup(backup,oldPass);await FCCStore.transaction(payload);await FCCStore.lock();await FCCStore.unlock('outra frase sintética de destino 2026');return JSON.parse(FCCStore.getItem('fcc-master-expenses-v1')).expenses.some(x=>x.merchant==='SYNTHETIC SECRET MERCHANT')&&JSON.parse(FCCStore.getItem('fcc-master-user-data-v1')).people.some(x=>x.name==='SYNTHETIC SECRET PERSON');}""",[backup,PASS]))
   finally:copy.close()
  # Repeated normal navigation catches retained overlays, stale owner state and module reload races.
  for n in range(36):
   area=['home','clinical','personal','expenses','settings','research'][n%6];sub='clin-drugs' if area=='clinical' else '';nav(page,sub,area)
   check(prefix+' repeated navigation '+str(n),page.locator('.page.active').count()==1 and page.evaluate('FCCNavigation.current()')==area)

  # XSS fixture in imported checklist is rendered as text, never executed.
  page.evaluate("""async()=>{const snap=FCCStore.snapshot();snap.records['fcc-master-content-pack-v1']=JSON.stringify({type:'fcc-content-pack',schema:1,version:'synthetic',checklists:{icu:[['<img src=x onerror=window.syntheticXSS=1>','Text']],transport:[['Test','Text']]}});await FCCStore.transaction(snap);FCCAccess.refreshState();}""")
  nav(page,'clin-icu');check(prefix+' imported text cannot execute HTML',page.evaluate("!window.syntheticXSS && document.getElementById('icuChecklist').textContent.includes('<img') && !document.querySelector('#icuChecklist img')"))
  await_restore=page.evaluate("async()=>{await FCCStore.restorePrevious();FCCAccess.refreshState();return true}");check(prefix+' undo imported pack',await_restore)
  page.evaluate('FCCAccess.lock()');check(prefix+' lock removes private DOM',page.evaluate("!document.body.textContent.includes('SYNTHETIC SECRET')&&!FCCAccess.isUnlocked()"));check(prefix+' private route cannot bypass guard',page.evaluate("async()=>{await fccNavigate('expenses',{bypassGuard:true});return FCCNavigation.current()==='personal'&&!FCCNavigation.route().sub&&!FCCAccess.isUnlocked()&&!document.getElementById('fccVaultDialog').hidden;}"));page.keyboard.press('Escape')
  check(prefix+' module loader private access guarded',page.evaluate("async()=>{try{await FCCModules.ensure('expenses');return false}catch{return true}}"))
  # Back/forward, same-route reload and theme/reflow verification.
  nav(page,'clin-vent');nav(page,'clin-drugs');page.go_back();page.wait_for_function("FCCNavigation.route().sub==='clin-vent'",timeout=10000);check(prefix+' browser back restores module',page.locator('#clin-vent').is_visible());page.reload(wait_until='domcontentloaded');wait_ready(page);check(prefix+' deep link restored after reload',page.evaluate("FCCNavigation.route().sub==='clin-vent'"))
  for w in ([320,390,430] if width<600 else [768,1440]):
   page.set_viewport_size({'width':w,'height':height});check(prefix+' reflow '+str(w),page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));check(prefix+' mobile search accessible '+str(w),page.locator('#globalSearch').is_visible())
  page.set_viewport_size({'width':width,'height':height})
  for theme in ['light','dark']:
   page.evaluate('(t)=>fccSetTheme(t,false)',theme);page.wait_for_timeout(200);screenshot(page,prefix+'-vent-'+theme)
  # All modules after reload may lazily load again. No hidden failures masked by diagnostic counters.
  check(prefix+' no unhandled page errors',len(errors)==0,errors)
  observation['pageErrors']=errors;observation['requestFailures']=failed;observation['final']=page.evaluate("({scripts:document.scripts.length,elements:document.querySelectorAll('*').length,modules:FCCModules.status()})")
  # Core offline is tested on each engine; full clinical package on mobile to limit duplicate downloads.
  page.wait_for_function("navigator.serviceWorker.controller!==null",timeout=25000)
  status=page.evaluate("FCCOffline.send('STATUS')");check(prefix+' offline core complete',status['packages']['core']['complete'])
  if width<600:
   page.evaluate("FCCOffline.send('CACHE_PACKAGE',{package:'clinical'})");status=page.evaluate("FCCOffline.send('STATUS')");check(prefix+' clinical offline complete',status['packages']['clinical']['complete'])
   observation['offlineMechanism']='Playwright context offline' if name=='chromium' else 'Origin server forcibly closes every connection; external network not disabled'
   if name=='chromium':ctx.set_offline(True)
   else:Quiet.network_down=True
   # A never-cached control must fail, proving the application is not loading from the origin.
   check(prefix+' uncached network control fails',page.evaluate("async()=>{try{await fetch('/__offline_control__?t='+Date.now(),{cache:'no-store'});return false}catch{return true}}"))
   try:
    page.reload(wait_until='domcontentloaded');wait_ready(page);nav(page,'clin-drugs');check(prefix+' offline catalogue intact',page.evaluate('FCCMedicationV7Health.count===923'));nav(page,'clin-cases');check(prefix+' offline cases intact',page.evaluate('FCC_CASE_BANK.length===200'))
   finally:ctx.set_offline(False);Quiet.network_down=False
  screenshot(page,prefix+'-final')
 except Exception as e:
  report['checks'].append({'name':prefix+' uncaught test failure','pass':False,'error':str(e),'trace':traceback.format_exc(),'pageErrors':errors});
  try:screenshot(page,prefix+'-FAIL')
  except Exception:pass
 finally:Quiet.network_down=False;ctx.close();browser.close()
try:
 with sync_playwright() as pw:
  for engine in (os.environ.get('BROWSER_ENGINE','chromium,webkit').split(',')):
   for w,h in [(390,844),(1440,1000)]:test_context(pw,engine,w,h)
finally:
 srv.shutdown();(OUT/'browser-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not x['pass'] for x in report['checks']):sys.exit(1)
