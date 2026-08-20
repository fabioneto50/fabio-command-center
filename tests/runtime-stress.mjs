import { chromium, webkit } from 'playwright';

const base='http://127.0.0.1:4173/';
const engines=[['chromium',chromium],['webkit',webkit]];

function assert(cond,msg){if(!cond)throw new Error(msg)}

for(const [name,type] of engines){
  const browser=await type.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.stack||e)));

  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.FCC_RUNTIME_VERSION==='1.3.0'&&window.FCCNavigation&&window.FCCDiagnostics,{timeout:30000});
  await page.waitForFunction(()=>window.FCCDiagnostics?.get?.().some(x=>x.type==='runtime-ready'),{timeout:60000});
  const initial=await page.evaluate(async()=>({stats:window.FCCDiagnostics.stats(),sw:'serviceWorker'in navigator?(await navigator.serviceWorker.getRegistrations()).length:0}));
  assert(initial.stats.moduleErrors===0,`${name}: module failures during startup: ${initial.stats.moduleErrors}`);
  assert(initial.stats.moduleOK>=84,`${name}: only ${initial.stats.moduleOK}/84 runtime modules loaded`);
  assert(initial.sw===1,`${name}: expected exactly 1 service worker registration, got ${initial.sw}`);

  // Private results must not leak before PIN unlock.
  const search=page.locator('#globalSearch');
  await search.fill('Emergency');
  await page.waitForTimeout(80);
  const beforeUnlock=await page.locator('#globalResults').innerText().catch(()=> '');
  assert(!/Emergency ·|Inventário|Família/i.test(beforeUnlock),`${name}: private global-search result visible before PIN`);
  await search.fill('');

  // PIN gate and Pessoal entry.
  await page.locator('.nav[data-page="personal"]').click();
  await page.locator('#fccPersonalPinModal.open').waitFor({timeout:5000});
  await page.locator('#fccPersonalPinInput').fill('2558');
  await page.locator('#fccPersonalPinSubmit').click();
  await page.locator('#page-personal.active').waitFor({timeout:5000});

  // Main navigation stress: 180 switches without rerendering the sections.
  const pages=['home','clinical','settings','personal','emergency','comms','garage','research','expenses'];
  for(let i=0;i<180;i++){
    const p=pages[i%pages.length];
    const ok=await page.evaluate(p=>window.fccNavigate(p),p);
    assert(ok!==false,`${name}: navigation returned false for ${p} at iteration ${i}`);
    const active=await page.locator('.page.active').getAttribute('id');
    assert(active===`page-${p}`,`${name}: wrong active page after ${p}: ${active}`);
  }

  // Clinical subtab stress.
  await page.evaluate(()=>window.fccNavigate('clinical'));
  const tabs=page.locator('#page-clinical > .tabs > .tab');
  const tabCount=await tabs.count();
  assert(tabCount>=8,`${name}: unexpectedly few Clinical tabs (${tabCount})`);
  for(let round=0;round<5;round++){
    for(let i=0;i<tabCount;i++){
      await tabs.nth(i).click({timeout:3000});
      const activeCount=await page.locator('#page-clinical > .sub.active').count();
      assert(activeCount===1,`${name}: Clinical active-sub count ${activeCount} after tab ${i}`);
    }
  }

  // Material expand/exit must never leave body scroll locked.
  const materialTab=page.locator('#page-clinical > .tabs > .tab').filter({hasText:'Material'}).first();
  if(await materialTab.count()){
    await materialTab.click();
    const expand=page.locator('#materialExpandBtn');
    if(await expand.count()){
      await expand.click();
      assert((await page.evaluate(()=>document.body.style.overflow))==='hidden',`${name}: material expand did not lock while maximized`);
      await page.evaluate(()=>window.fccNavigate('home'));
      assert((await page.evaluate(()=>document.body.style.overflow))!=='hidden',`${name}: body remained locked after leaving Material`);
    }
  }

  // Expenses remain a child of Pessoal and direct page navigation remains responsive.
  await page.evaluate(()=>window.fccNavigate('expenses'));
  await page.locator('#page-expenses.active').waitFor({timeout:3000});
  assert(await page.locator('.nav[data-page="personal"].active').count()===1,`${name}: Expenses did not keep Pessoal active`);

  // Diagnostics page should be reachable after the stress cycle.
  await page.evaluate(()=>window.fccNavigate('settings'));
  await page.locator('#page-settings.active').waitFor({timeout:3000});
  await page.locator('#fccRuntimeDiagnosticsCard').waitFor({timeout:3000});

  const diag=await page.evaluate(()=>({stats:window.FCCDiagnostics.stats(),errors:window.FCCDiagnostics.get().filter(x=>/error/.test(x.type))}));
  assert(diag.stats.moduleErrors===0,`${name}: ${diag.stats.moduleErrors} module load failures`);
  assert(pageErrors.length===0,`${name}: page errors: ${pageErrors.join(' | ')}`);

  console.log(`${name}: PASS · tabs=${tabCount} · modules=${diag.stats.moduleOK} · serviceWorkers=${initial.sw} · navigation=180`);
  await browser.close();
}
