import { chromium, webkit } from 'playwright';

const base='http://127.0.0.1:4173/';
const engines=[['chromium',chromium],['webkit',webkit]];
function assert(cond,msg){if(!cond)throw new Error(msg)}

for(const [name,type] of engines){
  const browser=await type.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  let stage='startup';
  const pageErrors=[];
  const requestFailures=[];
  const consoleErrors=[];
  page.on('pageerror',e=>pageErrors.push({stage,error:String(e?.stack||e)}));
  page.on('requestfailed',r=>requestFailures.push({stage,url:r.url(),method:r.method(),error:r.failure()?.errorText||''}));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push({stage,text:m.text()})});

  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.FCC_RUNTIME_VERSION==='1.3.2'&&window.FCCNavigation&&window.FCCDiagnostics,{timeout:30000});
  await page.waitForFunction(()=>window.FCCDiagnostics?.get?.().some(x=>x.type==='runtime-ready'),{timeout:60000});
  const initial=await page.evaluate(async()=>({stats:window.FCCDiagnostics.stats(),sw:'serviceWorker'in navigator?(await navigator.serviceWorker.getRegistrations()).length:0}));
  assert(initial.stats.moduleErrors===0,`${name}: module failures during startup: ${initial.stats.moduleErrors}`);
  assert(initial.stats.moduleOK>=88,`${name}: only ${initial.stats.moduleOK}/88 runtime modules loaded`);
  assert(initial.sw===1,`${name}: expected exactly 1 service worker registration, got ${initial.sw}`);

  const setGlobalSearch=async(query)=>{
    const ok=await page.evaluate(q=>{
      const input=document.getElementById('globalSearch');
      if(!input)return false;
      input.value=q; input.dispatchEvent(new Event('input',{bubbles:true}));
      if(typeof window.renderGlobalSearch==='function')window.renderGlobalSearch();
      return true;
    },query);
    assert(ok,`${name}: global search input missing`); await page.waitForTimeout(180);
  };

  stage='private-search';
  await setGlobalSearch('Emergency');
  const beforeUnlock=await page.locator('#globalResults').innerText().catch(()=> '');
  assert(!/Emergency ·|Inventário|Família/i.test(beforeUnlock),`${name}: private global-search result visible before PIN`);
  await setGlobalSearch('');

  stage='medication-catalogue';
  await page.evaluate(()=>window.fccNavigate('clinical'));
  const medTab=page.locator('#page-clinical > .tabs > .tab').filter({hasText:/INFO Medicação|Drug Reference/}).first();
  await medTab.click();
  await page.waitForFunction(()=>window.FCCMedicationV7Health?.ok===true&&window.FCCMedicationV7Health?.count===923,{timeout:60000});
  await page.locator('#med4Search').waitFor({timeout:5000});
  await page.waitForFunction(()=>document.querySelectorAll('#med4Results [data-med4]').length===923,{timeout:15000});
  const medHealth=await page.evaluate(()=>({count:window.FCCMedicationV7Health.count,catalog:document.getElementById('clin-drugs')?.dataset.medicationCatalogCount,buttons:document.querySelectorAll('#med4Results [data-med4]').length,version:window.FCCMedicationV7Health.version}));
  assert(medHealth.count===923,`${name}: medication API count ${medHealth.count}, expected 923`);
  assert(medHealth.catalog==='923',`${name}: medication host count ${medHealth.catalog}, expected 923`);
  assert(medHealth.buttons===923,`${name}: only ${medHealth.buttons}/923 medication cards rendered`);
  assert(/^7\.4\./.test(medHealth.version),`${name}: unexpected medication hotfix ${medHealth.version}`);
  const medSearch=page.locator('#med4Search');
  await medSearch.fill('Noradrenalina');
  await page.waitForFunction(()=>/noradrenalina/i.test(document.querySelector('#med4Results .med4-detail h3')?.textContent||''),{timeout:5000});
  assert((await page.locator('#med4Results .med4-detail h3').innerText()).toLowerCase().includes('noradrenalina'),`${name}: wrong medication detail`);
  await medSearch.fill('');
  await page.waitForFunction(()=>document.querySelectorAll('#med4Results [data-med4]').length===923,{timeout:10000});

  stage='global-medication-search';
  await setGlobalSearch('paracetamol');
  const globalMedCount=await page.evaluate(()=>[...document.querySelectorAll('#globalResults .search-hit')].filter(el=>/paracetamol/i.test(el.textContent||'')).length);
  assert(globalMedCount>=1,`${name}: paracetamol missing from global search`);
  const clicked=await page.evaluate(()=>{const hit=[...document.querySelectorAll('#globalResults .search-hit')].find(el=>/paracetamol/i.test(el.textContent||''));if(!hit)return false;hit.click();return true});
  assert(clicked,`${name}: could not open paracetamol from global search`);
  await page.waitForFunction(()=>/paracetamol/i.test(document.querySelector('#med4Results .med4-detail h3')?.textContent||''),{timeout:5000});

  stage='personal-pin';
  await page.locator('.nav[data-page="personal"]').click();
  await page.locator('#fccPersonalPinModal.open').waitFor({timeout:5000});
  await page.locator('#fccPersonalPinInput').fill('2558');
  await page.locator('#fccPersonalPinSubmit').click();
  await page.locator('#page-personal.active').waitFor({timeout:5000});

  stage='navigation-stress';
  const pages=['home','clinical','settings','personal','emergency','comms','garage','research','expenses'];
  for(let i=0;i<180;i++){
    const p=pages[i%pages.length]; const ok=await page.evaluate(p=>window.fccNavigate(p),p);
    assert(ok!==false,`${name}: navigation returned false for ${p} at iteration ${i}`);
    assert(await page.locator('.page.active').getAttribute('id')===`page-${p}`,`${name}: wrong active page after ${p}`);
  }

  stage='clinical-tabs';
  await page.evaluate(()=>window.fccNavigate('clinical'));
  const tabs=page.locator('#page-clinical > .tabs > .tab'); const tabCount=await tabs.count();
  assert(tabCount>=8,`${name}: unexpectedly few Clinical tabs (${tabCount})`);
  for(let round=0;round<3;round++)for(let i=0;i<tabCount;i++){
    await tabs.nth(i).click({timeout:3000});
    assert(await page.locator('#page-clinical > .sub.active').count()===1,`${name}: invalid active Clinical subtab after ${i}`);
  }
  await medTab.click();
  await page.waitForFunction(()=>window.FCCMedicationV7Health?.ok===true&&document.querySelectorAll('#med4Results [data-med4]').length===923,{timeout:10000});

  stage='material';
  const materialTab=page.locator('#page-clinical > .tabs > .tab').filter({hasText:'Material'}).first();
  if(await materialTab.count()){
    await materialTab.click(); const expand=page.locator('#materialExpandBtn');
    if(await expand.count()){
      await expand.click(); assert((await page.evaluate(()=>document.body.style.overflow))==='hidden',`${name}: material expand did not lock`);
      await page.evaluate(()=>window.fccNavigate('home')); assert((await page.evaluate(()=>document.body.style.overflow))!=='hidden',`${name}: body remained locked`);
    }
  }

  stage='expenses';
  await page.evaluate(()=>window.fccNavigate('expenses')); await page.locator('#page-expenses.active').waitFor({timeout:3000});
  assert(await page.locator('.nav[data-page="personal"].active').count()===1,`${name}: Expenses did not keep Pessoal active`);

  stage='diagnostics';
  await page.evaluate(()=>window.fccNavigate('settings')); await page.locator('#page-settings.active').waitFor({timeout:3000}); await page.locator('#fccRuntimeDiagnosticsCard').waitFor({timeout:3000});
  const diag=await page.evaluate(()=>({stats:window.FCCDiagnostics.stats(),errors:window.FCCDiagnostics.get().filter(x=>/error/.test(x.type))}));
  assert(diag.stats.moduleErrors===0,`${name}: ${diag.stats.moduleErrors} module load failures`);

  const sameOriginFailures=requestFailures.filter(x=>x.url.startsWith(base));
  const optionalGoogleScript='https://script.google.com/a/macros/jmellosaude.pt/s/AKfycbwT0u4ALCsK7x4mplTIEm5pJueq13mIWLcgGehaEp9JHFn5B5-OYSe_w3wZJd3YQLSj/exec';
  const allowedExternalFailures=requestFailures.filter(x=>x.url.startsWith(optionalGoogleScript)&&(x.error==='net::ERR_ABORTED'||x.error==='Load request cancelled'));
  const unexpectedRequestFailures=requestFailures.filter(x=>!sameOriginFailures.includes(x)&&!allowedExternalFailures.includes(x));
  const actionablePageErrors=pageErrors.filter(x=>{
    const headlessChromium=x.stage==='startup'&&x.error==='TypeError: Failed to fetch';
    const headlessWebKit=x.stage==='startup'&&/^Unhandled Promise Rejection: TypeError: TypeError: Failed to Decode Data\.\s*$/.test(x.error);
    return !((headlessChromium||headlessWebKit)&&sameOriginFailures.length===0&&initial.stats.moduleErrors===0&&initial.stats.moduleOK>=88);
  });
  const actionableConsoleErrors=consoleErrors.filter(x=>!x.text.includes('[Medication Catalog V6 recovery] base V4 não atingiu 690 entradas únicas'));

  if(pageErrors.length||requestFailures.length||consoleErrors.length){
    console.log(`${name.toUpperCase()}_PAGE_ERRORS`,JSON.stringify(pageErrors));
    console.log(`${name.toUpperCase()}_REQUEST_FAILURES`,JSON.stringify(requestFailures));
    console.log(`${name.toUpperCase()}_CONSOLE_ERRORS`,JSON.stringify(consoleErrors));
  }
  assert(sameOriginFailures.length===0,`${name}: same-origin request failures: ${JSON.stringify(sameOriginFailures)}`);
  assert(unexpectedRequestFailures.length===0,`${name}: unexpected external request failures: ${JSON.stringify(unexpectedRequestFailures)}`);
  assert(actionablePageErrors.length===0,`${name}: actionable page errors: ${JSON.stringify(actionablePageErrors)}`);
  assert(actionableConsoleErrors.length===0,`${name}: unexpected console errors: ${JSON.stringify(actionableConsoleErrors)}`);

  console.log(`${name}: PASS · medications=923 · ${medHealth.version} · tabs=${tabCount} · modules=${diag.stats.moduleOK} · serviceWorkers=${initial.sw} · navigation=180`);
  await browser.close();
}
