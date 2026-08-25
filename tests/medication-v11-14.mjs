import { chromium } from 'playwright';
const base='http://127.0.0.1:4173/';
function assert(cond,msg){if(!cond)throw new Error(msg)}
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];const consoleErrors=[];const requestFailures=[];
await page.addInitScript(()=>{
  window.__fccFetchTrace=[];
  window.__fccUnhandled=[];
  const originalFetch=window.fetch.bind(window);
  window.fetch=async(...args)=>{
    const input=args[0];
    const url=typeof input==='string'?input:(input?.url||String(input));
    const stack=(new Error('fetch-call')).stack||'';
    try{return await originalFetch(...args)}catch(error){
      window.__fccFetchTrace.push({url,error:String(error?.stack||error),stack});
      throw error;
    }
  };
  addEventListener('unhandledrejection',event=>{
    window.__fccUnhandled.push({reason:String(event.reason?.stack||event.reason),fetchTrace:[...window.__fccFetchTrace]});
  });
});
page.on('pageerror',e=>errors.push(String(e?.stack||e)));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
page.on('requestfailed',r=>requestFailures.push({url:r.url(),method:r.method(),resourceType:r.resourceType(),failure:r.failure()?.errorText||''}));
await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForFunction(()=>window.FCC_RUNTIME_VERSION==='1.3.2'&&window.FCCDiagnostics,{timeout:30000});
let snap=null;
for(let i=0;i<20;i++){
  await page.waitForTimeout(1500);
  snap=await page.evaluate(()=>({
    v6:window.FCC_MEDICATION_CATALOG_V6?.count??null,
    expansion:Array.isArray(window.FCC_MED_EXPANSION_V7)?window.FCC_MED_EXPANSION_V7.length:null,
    v7:window.FCCMedicationCatalogV7?.count??null,
    v7Health:window.FCCMedicationV7Health?{count:window.FCCMedicationV7Health.count,ok:window.FCCMedicationV7Health.ok,version:window.FCCMedicationV7Health.version}:null,
    batchWrapped:!!window.FCCMedicationCatalogV7?.__batchWrapped,
    patch:window.FCCMedicationPatch1114Health?{catalogCount:window.FCCMedicationPatch1114Health.catalogCount,matched:window.FCCMedicationPatch1114Health.matched,applied:window.FCCMedicationPatch1114Health.applied,reason:window.FCCMedicationPatch1114Health.reason||null}:null,
    runtime:window.FCCDiagnostics?.stats?.()||null
  }));
  console.log(`LOAD_STAGE_${i+1}`,JSON.stringify(snap));
  if(snap.patch)break;
}
assert(await page.evaluate(()=>!!window.FCCMedicationPatch1114Health),`patch health not created; final loading snapshot=${JSON.stringify(snap)}; consoleErrors=${JSON.stringify(consoleErrors)}`);
const h=await page.evaluate(()=>{const x=window.FCCMedicationPatch1114Health;return {version:x.version,sourceRows:x.sourceRows,uniqueIds:x.uniqueIds,uniqueNames:x.uniqueNames,matched:x.matched,applied:x.applied,unmatched:x.unmatched,duplicateTargets:x.duplicateTargets,catalogCount:x.catalogCount,sourceIntegrity:x.sourceIntegrity,safeToApply:x.safeToApply,ok:x.ok,matches:x.matches};});
console.log('PATCH_HEALTH',JSON.stringify({version:h.version,sourceRows:h.sourceRows,uniqueIds:h.uniqueIds,uniqueNames:h.uniqueNames,matched:h.matched,applied:h.applied,unmatched:h.unmatched,duplicateTargets:h.duplicateTargets,catalogCount:h.catalogCount,sourceIntegrity:h.sourceIntegrity,safeToApply:h.safeToApply,ok:h.ok},null,2));
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
  const ok=await page.evaluate(({target,id})=>{const d=window.FCCMedicationCatalogV7.get(target);return !!d&&d.med1114?.id===id&&d.patchSourceId===id&&d.med1114?.replacement===true;},{target:m.target,id});
  assert(ok,`patch metadata not attached for ID ${id} -> ${m.target}`);
}
const sample=h.matches.find(x=>x.id===229);
await page.evaluate(name=>{const q=document.getElementById('med4Search');q.value=name;q.dispatchEvent(new Event('input',{bubbles:true}));},sample.target);
await page.waitForFunction(()=>document.querySelector('#med4Results .med4-detail')?.textContent?.includes('Base v0.11.14'),{timeout:10000});
const sourceUI=await page.locator('#med4Results .med4-detail').innerText();
assert(sourceUI.includes('Revisão humana'),'patched UI does not show human-review source field');
assert(!sourceUI.includes('Campos produto-específicos permanecem'),'patched UI leaked legacy generic V7 footer');
const diag=await page.evaluate(()=>window.FCCDiagnostics.stats());
assert(diag.moduleErrors===0,`module errors=${diag.moduleErrors}`);
const asyncTrace=await page.evaluate(()=>({fetchTrace:window.__fccFetchTrace||[],unhandled:window.__fccUnhandled||[]}));
if(errors.length||requestFailures.length||asyncTrace.fetchTrace.length||asyncTrace.unhandled.length){
  console.log('PAGE_ERRORS',JSON.stringify(errors,null,2));
  console.log('REQUEST_FAILURES',JSON.stringify(requestFailures,null,2));
  console.log('FETCH_TRACE',JSON.stringify(asyncTrace.fetchTrace,null,2));
  console.log('UNHANDLED_REJECTIONS',JSON.stringify(asyncTrace.unhandled,null,2));
  console.log('CONSOLE_ERRORS',JSON.stringify(consoleErrors,null,2));
}
assert(errors.length===0,`page errors: ${errors.join(' | ')}; fetchTrace=${JSON.stringify(asyncTrace.fetchTrace)}; unhandled=${JSON.stringify(asyncTrace.unhandled)}`);
console.log(`PASS medication patch v0.11.14 · applied=${h.applied} · catalogue=${h.catalogCount}`);
await browser.close();
