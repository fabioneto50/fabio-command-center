"""Read-only baseline; upgraded revisions also run the regression suite.
All browser contexts are synthetic and never use the owner's browser profile.
"""
import json, os, time, threading, functools, http.server, socketserver
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'audit-evidence'; OUT.mkdir(exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address=True
srv=Server(('127.0.0.1',4173),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
report={'commit':os.environ.get('GITHUB_SHA','local'),'method':'Full static application via HTTP; fresh synthetic browser contexts','observations':[]}
try:
    with sync_playwright() as pw:
        for name in ['chromium','webkit']:
            browser=getattr(pw,name).launch(headless=True)
            for width,height in [(390,844),(1440,1000)]:
                ctx=browser.new_context(viewport={'width':width,'height':height},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=width<600,has_touch=width<600)
                page=ctx.new_page(); errors=[]; requests=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.on('requestfailed',lambda r:requests.append({'url':r.url,'error':r.failure}))
                t=time.monotonic(); page.goto('http://127.0.0.1:4173/',wait_until='domcontentloaded')
                try: page.wait_for_function("window.FCCDiagnostics?.get?.().some(x=>x.type==='runtime-ready') || window.FCCAppReady===true",timeout=60000)
                except Exception as e: errors.append('readiness timeout: '+str(e).splitlines()[0])
                page.wait_for_timeout(800)
                row={'browser':name,'viewport':[width,height],'initialWallSeconds':round(time.monotonic()-t,3),'pageErrors':errors,'requestFailures':requests}
                row['initial']=page.evaluate("""() => ({version:window.FCC_RUNTIME_VERSION,scripts:document.scripts.length,elements:document.querySelectorAll('*').length,searchVisible:!!document.getElementById('globalSearch')?.getClientRects().length,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,diag:window.FCCDiagnostics?.stats(),resources:performance.getEntriesByType('resource').length,transferBytes:performance.getEntriesByType('resource').reduce((s,x)=>s+x.transferSize,0),navigation:performance.getEntriesByType('navigation').map(x=>({dcl:x.domContentLoadedEventEnd,load:x.loadEventEnd})),paint:performance.getEntriesByType('paint').map(x=>({name:x.name,start:x.startTime}))})""")
                page.screenshot(path=str(OUT/f'{name}-home-{width}.png'),full_page=False)
                try:
                    page.evaluate("fccNavigate('clinical');fccActivateSubcategory('clinical','clin-drugs')")
                    page.wait_for_function("window.FCCMedicationV7Health?.count>=923",timeout=60000)
                    row['medication']=page.evaluate("({health:window.FCCMedicationV7Health,rendered:document.querySelectorAll('#med4Results [data-med4]').length})")
                    page.screenshot(path=str(OUT/f'{name}-medication-{width}.png'),full_page=False)
                    page.evaluate("fccActivateSubcategory('clinical','clin-perf');togglePerfDoseCalc()")
                    page.wait_for_timeout(300)
                    row['incompatibleInverse']=page.evaluate("""()=>{infAmount.value='4';infAmountUnit.value='mg';infVol.value='50';infWt.value='70';infRate.value='5';infDU.value='uih';rateToDose();return infResult.innerText}""")
                    page.evaluate("fccActivateSubcategory('clinical','clin-sepsis')")
                    row['emptySepsis']=page.evaluate("""()=>{for(const id of ['sWt','sAge','sMAP','sLac','sUrine','sCRT'])document.getElementById(id).value='';sShock.value='no';analyzeSepsis();return sepsisResult.innerText}""")
                    row['privateLockedDomPopulated']=page.evaluate("!fccPersonalUnlocked() && !!document.querySelector('#peopleList strong')")
                    page.evaluate("openCategoryMenu('clinical')")
                    page.screenshot(path=str(OUT/f'{name}-menu-{width}.png'),full_page=False)
                except Exception as e: row['inspectionError']=str(e)
                report['observations'].append(row)
                ctx.close()
            browser.close()
finally:
    srv.shutdown(); (OUT/'browser-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
