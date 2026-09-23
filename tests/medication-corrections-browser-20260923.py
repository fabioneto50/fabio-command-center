"""Functional regression of the bounded catalogue corrections; no clinical certification.
Fresh profiles only. SITE_URL permits read-only checking of the published build.
"""
import os,json,threading,functools,http.server,socketserver
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
server=None
BASE=os.environ.get('SITE_URL','')
if not BASE:
    server=Server(('127.0.0.1',4189),functools.partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    BASE='http://127.0.0.1:4189/'
report={'scope':'Functional checks, not full clinical verification','base':BASE,'checks':[]}
expected=json.loads((ROOT/'build-info.json').read_text())['assetBuild']
def check(label,value):
    report['checks'].append({'name':label,'pass':bool(value)})
    assert value,label
try:
    with sync_playwright() as pw:
        for engine in os.environ.get('BROWSER_ENGINE','chromium,webkit').split(','):
            browser=getattr(pw,engine).launch(headless=True)
            for width in (390,1440):
                prefix=engine+'-'+str(width)
                ctx=browser.new_context(viewport={'width':width,'height':900},locale='pt-PT',timezone_id='Europe/Lisbon')
                page=ctx.new_page();errors=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.goto(BASE,wait_until='domcontentloaded')
                page.wait_for_function('window.FCCAppReady===true',timeout=60000)
                check(prefix+' correct build',expected in page.locator('script[src*="fcc-core.js"]').get_attribute('src'))
                def nav(sub):
                    check(prefix+' navigate '+sub,page.evaluate('(sub)=>fccNavigate("clinical",{sub})',sub) is True)
                nav('clin-drugs')
                check(prefix+' preserved 923',page.evaluate('FCCMedicationV7Health.count===923'))
                for name,field,text in [('Alopurinol','hepatic','doses reduzidas'),('Leflunomida','renal','moderada a grave é uma contraindicação'),('Metildopa','hepatic','6–12 semanas'),('Isotretinoína oral','hepatic','contraindicação'),('Febuxostate','hepatic','Child-Pugh C')]:
                    page.evaluate('(name)=>FCCMedications.show(name)',name)
                    check(prefix+' corrected '+name,text in page.locator('[data-clinical-field="'+field+'"]').inner_text())
                    check(prefix+' reflow '+name,page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                for name in ('Azitromicina IV','Paracetamol IV','Budesonida/formoterol','Tramadol/paracetamol'):
                    page.evaluate('(name)=>FCCMedications.show(name)',name);page.wait_for_timeout(150)
                    check(prefix+' no unrelated stability '+name,page.locator('#med4Results .cuf-stab-panel').count()==0)
                page.evaluate('FCCMedications.show("Loratadina")');page.wait_for_timeout(250)
                check(prefix+' Aerius not on loratadine','Aerius' not in page.locator('#med4Results').text_content())
                page.evaluate('FCCMedications.show("Levetiracetam")')
                page.wait_for_function('document.querySelector("#med4Results .cuf-stab-panel")?.textContent.includes("7 meses")')
                check(prefix+' Keppra oral update','7 meses' in page.locator('#med4Results .cuf-stab-panel').text_content())
                page.screenshot(path=str(OUT/(prefix+'-amended-monograph.png')),full_page=True)
                nav('clin-perf')
                page.wait_for_function('window.FCCDilutionView && document.querySelectorAll(".ccd-doc-card").length>50')
                for term,expected_text in [('Remifentanilo 1 mg','20–250 microgramas/mL'),('Sufentanilo 0.005','Exemplo retirado'),('Propofol 20mg','20 mg/mL (2%)')]:
                    page.evaluate('()=>{if(document.getElementById("clin-perf").dataset.fccRecordView==="detail")FCCDilutionView.back()}')
                    page.wait_for_timeout(150)
                    page.locator('#perfDilutionSearch').fill(term);page.wait_for_timeout(400)
                    opened=page.evaluate('(term)=>{const c=[...document.querySelectorAll(".ccd-doc-card")].find(c=>c.querySelector("h3")?.textContent.includes(term));if(!c)return false;FCCDilutionView.open(c);return true}',term)
                    check(prefix+' open dilution '+term,opened)
                    check(prefix+' amended dilution '+term,expected_text in page.locator('#perfDilutionGrid').text_content())
                    check(prefix+' dilution reflow '+term,page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                page.screenshot(path=str(OUT/(prefix+'-amended-dilution.png')),full_page=True)
                nav('clin-ivcompat')
                def pair(a,b):
                    valid=page.evaluate('([a,b])=>{const A=document.getElementById("ivcDrugA"),B=document.getElementById("ivcDrugB");A.value=a;B.value=b;if(!A.value||!B.value)return false;A.dispatchEvent(new Event("change",{bubbles:true}));B.dispatchEvent(new Event("change",{bubbles:true}));return true}',[a,b])
                    check(prefix+' select '+a+' / '+b,valid);page.wait_for_timeout(350)
                pair('Levetiracetam','Piperacilina/tazobactam')
                text=page.locator('#ivcResult').inner_text()
                check(prefix+' both LEV PIP conditions','33,75' in text and 'incompatibilidade física com 45' in text)
                check(prefix+' conditional not green',page.locator('#ivcResult .ivc-warn').count()>0 and page.locator('#ivcResult .ivc-ok').count()==0)
                pair('Paracetamol','Fentanilo')
                check(prefix+' physical only','não foi avaliada quimicamente' in page.locator('#ivcResult').inner_text())
                pair('Levetiracetam','Noradrenalina')
                check(prefix+' disputed unit suspended','suspenso' in page.locator('#ivcResult').inner_text())
                pair('Adrenalina','Verapamil')
                check(prefix+' orphan rule reachable','COMPATIBILIDADE CONDICIONADA' in page.locator('#ivcResult').inner_text())
                pair('Isoprenalina','Vecurónio')
                check(prefix+' vecuronium rule reachable','COMPATIBILIDADE CONDICIONADA' in page.locator('#ivcResult').inner_text())
                pair('Dexmedetomidina','Furosemida')
                text=page.locator('#ivcResult').inner_text()
                check(prefix+' no false certification','Triangulação 3 fontes' not in text and 'Validado em 2 fontes' not in text)
                check(prefix+' dex furo conditional',page.locator('#ivcResult .ivc-warn').count()>0)
                check(prefix+' compat reflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                page.screenshot(path=str(OUT/(prefix+'-amended-compatibility.png')),full_page=True)
                nav('clin-vent');nav('clin-drugs')
                check(prefix+' no runtime errors',not errors)
                ctx.close()
            browser.close()
finally:
    if server:server.shutdown()
    (OUT/'medication-corrections-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps({'checks':len(report['checks']),'failed':[x['name'] for x in report['checks'] if not x['pass']]}))
