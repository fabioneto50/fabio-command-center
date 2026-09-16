"""Freeze existing public clinical records without rewriting their clinical content.
Run against the unchanged 1.3.2 source before the 1.4.0 engineering migration.
Never reads localStorage, user state, credentials or the owner's browser profile.
"""
import functools,http.server,json,socketserver,threading,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'audit-evidence'/'canonical';OUT.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address=True
srv=Server(('127.0.0.1',4175),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(service_workers='block')
        page=context.new_page();page.goto('http://127.0.0.1:4175/',wait_until='domcontentloaded')
        page.wait_for_function("window.FCCMedicationPatch1114Health?.ok===true && window.FCCMedicationCatalogV7?.count===923 && window.FCC_CASE_BANK?.length===200",timeout=60000)
        page.wait_for_timeout(1000)
        data=page.evaluate("""async()=>({
          medications:window.FCCMedicationCatalogV7.records,
          cases:window.FCC_CASE_BANK,
          dressings:window.fccWoundDressings.data,
          dilutionSource:await window.fccDilutionsHBAData,
          dilutions:[...document.querySelectorAll('#perfDilutionGrid .ccd-doc-card')].map((c,i)=>({id:'dilution-'+i,name:c.querySelector('h3')?.textContent?.trim(),text:c.textContent.replace(/\\s+/g,' ').trim()})),
          ivNames:[...new Set([...document.querySelectorAll('#ivcDrugA option')].map(x=>x.value).filter(Boolean))],
          source:{runtime:window.FCC_RUNTIME_VERSION,catalogueCount:window.FCCMedicationCatalogV7.count,patchCount:window.FCCMedicationPatch1114Health.replaced,clinicalReview:'not-performed-by-export'}
        })""")
        assert len(data['medications'])==923 and data['source']['patchCount']==276
        assert len({x['n'] for x in data['medications']})==923
        for name,rows in data.items():
            text=json.dumps(rows,ensure_ascii=False,separators=(',',':'))
            (OUT/(name+'.json')).write_text(text)
        (OUT/'integrity.json').write_text(json.dumps({p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in OUT.glob('*.json')},indent=2))
        print('CANONICAL_EXPORT_OK medications=923 patch=276 cases=200')
        browser.close()
finally:srv.shutdown()
