import { chromium } from 'playwright';
const base='http://127.0.0.1:4173/';
function assert(cond,msg){if(!cond)throw new Error(msg)}

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.stack||e)));

await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForFunction(()=>window.FCC_RUNTIME_VERSION==='1.3.2'&&window.FCCDiagnostics,{timeout:30000});
await page.waitForFunction(()=>window.FCCMedicationPatch1114Health?.ok===true,{timeout:60000});

const h=await page.evaluate(()=>{
  const x=window.FCCMedicationPatch1114Health;
  return {
    version:x.version,mode:x.mode,sourceRows:x.sourceRows,uniqueIds:x.uniqueIds,uniqueNames:x.uniqueNames,
    matched:x.matched,replaced:x.replaced,applied:x.applied,unmatched:x.unmatched,
    duplicateTargets:x.duplicateTargets,catalogCount:x.catalogCount,sourceIntegrity:x.sourceIntegrity,
    safeToApply:x.safeToApply,ok:x.ok,matches:x.matches
  };
});
console.log('PATCH_HEALTH',JSON.stringify({...h,matches:undefined},null,2));
assert(h.version==='0.11.14',`unexpected patch version ${h.version}`);
assert(h.mode==='replace-in-place',`unexpected patch mode ${h.mode}`);
assert(h.sourceRows===276,`source rows ${h.sourceRows}/276`);
assert(h.uniqueIds===276,'IDs are not unique');
assert(h.uniqueNames===276,'source names are not unique');
assert(h.sourceIntegrity===true,'source integrity failed');
assert(h.matched===276,`matched ${h.matched}/276; unmatched=${JSON.stringify(h.unmatched)}`);
assert(h.replaced===276,`replaced ${h.replaced}/276`);
assert(h.applied===276,`applied ${h.applied}/276`);
assert(h.duplicateTargets===0,`duplicate targets=${h.duplicateTargets}`);
assert(h.catalogCount===923,`catalog ${h.catalogCount}/923`);
assert(h.safeToApply===true,'patch safety gate failed');
assert(h.ok===true,'patch health not OK');

const runtime=await page.evaluate(()=>window.FCCDiagnostics.stats());
assert(runtime.moduleErrors===0,`module errors=${runtime.moduleErrors}`);
assert(runtime.moduleOK>=88,`only ${runtime.moduleOK}/88 modules loaded`);

await page.evaluate(()=>window.fccNavigate('clinical'));
const tab=page.locator('#page-clinical > .tabs > .tab').filter({hasText:/INFO Medicação|Drug Reference/}).first();
await tab.click();
await page.waitForFunction(()=>window.FCCMedicationV7Health?.ok===true&&window.FCCMedicationV7Health?.count===923,{timeout:30000});
await page.waitForFunction(()=>document.querySelectorAll('#med4Results [data-med4]').length===923,{timeout:15000});

for(const id of [229,400,451,504]){
  const m=h.matches.find(x=>x.id===id);
  assert(m,`missing match metadata for ${id}`);
  const d=await page.evaluate(target=>{
    const x=window.FCCMedicationCatalogV7.get(target);
    return x?{patchSourceId:x.patchSourceId,sourceId:x.med1114?.id,replacement:x.med1114?.replacement,summary:x.s}:null;
  },m.target);
  assert(d?.patchSourceId===id&&d?.sourceId===id&&d?.replacement===true,`replacement metadata failed for ${id} -> ${m.target}`);
  assert(d.summary===`Base v0.11.14 · substituição integral da ficha ${id}`,`legacy summary survived for ${id}`);
}

const sample=h.matches.find(x=>x.id===229);
const sampleSource=await page.evaluate(target=>{
  const d=window.FCCMedicationCatalogV7.get(target);
  return {
    validationStatus:d.validationStatus||'',confidenceLevel:d.confidenceLevel||'',humanReview:d.humanReview||'',
    sourceRegulatory:d.sourceRegulatory||'',sourceClinical:d.sourceClinical||'',routeVariant:d.routeVariant||''
  };
},sample.target);
assert(sampleSource.validationStatus==='Validado com correções',`unexpected source validation status: ${sampleSource.validationStatus}`);
assert(sampleSource.confidenceLevel==='Alta',`unexpected source confidence: ${sampleSource.confidenceLevel}`);
assert(sampleSource.humanReview==='Pendente',`unexpected source human review: ${sampleSource.humanReview}`);
assert(sampleSource.routeVariant==='Oral',`unexpected source route: ${sampleSource.routeVariant}`);

await page.locator('#med4Search').fill(sample.target);
await page.waitForFunction(()=>document.querySelector('#med4Results .med4-detail')?.textContent?.includes('Base v0.11.14'),{timeout:10000});
const sourceUI=await page.locator('#med4Results .med4-detail').innerText();
for(const value of [sampleSource.validationStatus,sampleSource.confidenceLevel,sampleSource.humanReview,sampleSource.routeVariant,sampleSource.sourceClinical]){
  if(value)assert(sourceUI.includes(value),`patched UI does not expose source value: ${value}`);
}
assert(!sourceUI.includes('Campos produto-específicos permanecem'),'patched UI leaked generic legacy V7 footer');

assert(errors.length===0,`page errors with service worker isolated: ${errors.join(' | ')}`);
console.log(`PASS medication v0.11.14 · replaced=${h.replaced}/276 · catalogue=${h.catalogCount} · modules=${runtime.moduleOK}`);
await browser.close();
