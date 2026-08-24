import { chromium } from 'playwright';
const base='http://127.0.0.1:4173/';
function assert(cond,msg){if(!cond)throw new Error(msg)}
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForFunction(()=>window.FCC_RUNTIME_VERSION==='1.3.2'&&window.FCCDiagnostics,{timeout:30000});
await page.waitForFunction(()=>window.FCCMedicationPatch1114Health,{timeout:60000});
const h=await page.evaluate(()=>{const x=window.FCCMedicationPatch1114Health;return {version:x.version,sourceRows:x.sourceRows,uniqueIds:x.uniqueIds,uniqueNames:x.uniqueNames,matched:x.matched,applied:x.applied,unmatched:x.unmatched,duplicateTargets:x.duplicateTargets,catalogCount:x.catalogCount,sourceIntegrity:x.sourceIntegrity,safeToApply:x.safeToApply,ok:x.ok,matches:x.matches};});
console.log('PATCH_HEALTH',JSON.stringify(h,null,2));
assert(h.sourceRows===276,`source rows ${h.sourceRows}/276`);
assert(h.uniqueIds===276,'IDs are not unique');
assert(h.uniqueNames===276,'source names are not unique');
assert(h.sourceIntegrity===true,'source integrity failed');
assert(h.matched===276,`matched ${h.matched}/276; unmatched=${JSON.stringify(h.unmatched)}`);
assert(h.duplicateTargets===0,`duplicate targets=${h.duplicateTargets}`);
assert(h.applied===276,`applied ${h.applied}/276`);
assert(h.catalogCount===923,`catalog ${h.catalogCount}/923`);
assert(h.ok===true,'patch health not OK');
await page.evaluate(()=>window.fccNavigate('clinical'));
const tab=page.locator('#page-clinical > .tabs > .tab').filter({hasText:/INFO Medicação|Drug Reference/}).first();
await tab.click();
await page.waitForFunction(()=>document.querySelectorAll('#med4Results [data-med4]').length===923,{timeout:15000});
for(const id of [229,400,451,504]){
  const m=h.matches.find(x=>x.id===id);assert(m,`missing match metadata for ${id}`);
  const ok=await page.evaluate(({target,id})=>{const d=window.FCCMedicationCatalogV7.get(target);return !!d&&d.med1114?.id===id;},{target:m.target,id});
  assert(ok,`patch metadata not attached for ID ${id} -> ${m.target}`);
}
const diag=await page.evaluate(()=>window.FCCDiagnostics.stats());
assert(diag.moduleErrors===0,`module errors=${diag.moduleErrors}`);
assert(errors.length===0,`page errors: ${errors.join(' | ')}`);
console.log(`PASS medication patch v0.11.14 · applied=${h.applied} · catalogue=${h.catalogCount}`);
await browser.close();
