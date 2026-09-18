/* Versioned dependency manifest. Unopened feature modules are not downloaded or rendered. */
(()=>{
 'use strict';const VERSION='1.4.0';window.FCC_RUNTIME_VERSION=VERSION;document.documentElement.dataset.fccRuntimeVersion=VERSION;
 const PRIVATE_MODULES=new Set(['personal','expenses','research']);
 const loaded=new Map(),jobs=new Map(),statusMap=new Map(),jsonCache=new Map();
 const wait=(check,ms=12000)=>new Promise((resolve,reject)=>{const start=performance.now();const tick=()=>{try{if(check())return resolve(true);}catch(e){}if(performance.now()-start>ms)return reject(new Error('O módulo não confirmou que está pronto.'));setTimeout(tick,40);};tick();});
 function script(name){
  if(loaded.has(name))return loaded.get(name);
  const job=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=FCC_ASSET_BASE+name+'?v='+VERSION;s.async=false;let done=false;const timer=setTimeout(()=>{if(done)return;done=true;s.remove();loaded.delete(name);reject(new Error('Tempo de espera excedido: '+name));},15000);s.onload=()=>{if(done)return;done=true;clearTimeout(timer);resolve();};s.onerror=()=>{if(done)return;done=true;clearTimeout(timer);loaded.delete(name);s.remove();reject(new Error('Não foi possível obter '+name));};document.head.append(s);});loaded.set(name,job);return job;
 }
 async function json(path){
  if(jsonCache.has(path))return jsonCache.get(path);
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
  const job=(async()=>{try{const r=await fetch(FCC_ASSET_BASE+path+'?v='+VERSION,{signal:ctrl.signal});if(!r.ok)throw new Error('HTTP '+r.status+' em '+path);const data=FCCCore.parseJSON(await r.text());return data;}catch(e){jsonCache.delete(path);throw new Error('Dados indisponíveis: '+path+'. Confirma a ligação ou o pacote offline.');}finally{clearTimeout(timer);}})();jsonCache.set(path,job);return job;
 }
 const definitions={
  shell:{scripts:['theme-switcher.js','theme-auto-v2.js','theme-audit-fixes.js','personal-security-v1.js','fcc-areas.js','fcc-navigation.js','personal-hub-v1.js','fcc-backup.js','search-enhancer.js','fcc-favorites.js','fcc-offline.js','fcc-appearance.js'],ready:()=>!!window.FCCNavigation&&!!window.FCCAccess&&!!window.FCCBackup},
  search:{data:['data/search-index.json'],ready:()=>true},
  home:{scripts:['home-current-news-v1.js'],ready:()=>!!document.getElementById('homeHealthNewsList')},
  clinical:{scripts:['fcc-content-core-v1.js','fcc-content-config-v1.js'],ready:()=>!!window.FCCContent},
  institution:{data:['data/institutional.json','data/high-alert.json'],init:async()=>{const [docs,high]=await Promise.all([json('data/institutional.json'),json('data/high-alert.json')]);window.fccCufClinicalDocs=Promise.resolve(docs);window.fccIMP1636Data=Promise.resolve(high);},ready:()=>!!window.fccCufClinicalDocs&&!!window.fccIMP1636Data},
  perfusion:{deps:['clinical','institution'],data:['data/dilutionSource.json'],init:async()=>{window.fccDilutionsHBAData=Promise.resolve(await json('data/dilutionSource.json'));},scripts:['perfusion-reference.js','critical-care-dilutions-v2.js','dilutions-ux-v3.js','dilutions-document-db-v4.js','dilutions-cuf-v6.js','dilutions-card-ux-v5.js'],ready:()=>document.querySelectorAll('#perfDilutionGrid .ccd-doc-card').length>50},
  medication:{deps:['clinical','institution'],data:['data/medications.json','data/brand-names.json'],scripts:['fcc-medications.js','medication-stability-cuf-v1.js'],after:()=>window.FCCMedicationReady,ready:()=>window.FCCMedicationV7Health?.count===923},
  safety:{deps:['clinical','institution'],scripts:['medication-safety-cuf-v2.js'],ready:()=>document.querySelectorAll('#cufImpList .cuf-imp-row').length>0},
  compatibility:{deps:['clinical'],scripts:['iv-compatibility.js','iv-catalogue.js','iv-compatibility-ui-v2.js','iv-source-evidence.js','iv-compatibility-expanded-v3.js','iv-compatibility-exit-reset-v1.js'],ready:()=>!!document.getElementById('ivcDrugA')&&!!document.getElementById('ivcDrugB')},
  dressings:{deps:['clinical'],data:['wound-images-curated-v1.json'],after:()=>window.FCCDressingMedia.load(),scripts:['wound-dressings-v1.js','wound-dressings-local-data-v1.js','wound-dressings-order-v1.js','wound-dressings-media-model-v1.js'],ready:()=>window.fccWoundDressings?.data?.length===28},
  cases:{deps:['clinical'],data:['data/cases.json','data/case-sources.json'],scripts:['fcc-cases.js'],after:()=>window.FCCCasesReady,ready:()=>!!window.FCCCases},
  ecg:{deps:['clinical'],scripts:['ecg-photo-assist.js','ecg-image-analyzer-v3.js'],ready:()=>!!document.getElementById('ecgAnalyzerV3')},
  material:{deps:['clinical'],scripts:['clinical-material.js','clinical-material-window-v2.js'],ready:()=>!!document.getElementById('materialStockFrame')},
  personal:{scripts:['fcc-personal.js'],ready:()=>!!window.FCCPersonal},
  expenses:{deps:['personal'],scripts:['expense-recurring-engine.js','expense-center.js','expense-recurring-ui.js'],ready:()=>!!document.getElementById('page-expenses')&&!!window.FCCRecurringEngine},
  research:{deps:['personal'],scripts:['research-live-search-v1.js'],ready:()=>!!document.getElementById('resLiveQuery')}
 };
 function forRoute(page,sub=''){
  if(page==='home')return 'home';if(page==='settings'||page==='favorites')return 'shell';
  if(page==='expenses')return 'expenses';if(page==='research')return 'research';if(['personal','emergency','comms','garage'].includes(page))return 'personal';
  return ({'clin-perf':'perfusion','clin-drugs':'medication','clin-ivcompat':'compatibility','clin-dressings':'dressings','clin-cases':'cases','clin-ecg':'ecg','clin-material':'material','clin-lasa':'safety','clin-safety':'safety'})[sub]||'clinical';
 }
 function ensure(name){
  if(!name)return Promise.resolve(true);
  if(PRIVATE_MODULES.has(name)&&!window.FCCAccess?.isUnlocked())return Promise.reject(new Error('Desbloqueia o cofre antes de abrir este módulo.'));
  if(jobs.has(name))return jobs.get(name);
  const def=definitions[name];if(!def)return Promise.reject(new Error('Módulo desconhecido: '+name));
  const job=(async()=>{
   statusMap.set(name,{state:'loading',startedAt:performance.now()});
   try{
    for(const dep of def.deps||[])await ensure(dep);
    if(def.init)await def.init();
    for(const path of def.scripts||[])await script(path);
    if(def.after){let timer;try{await Promise.race([def.after(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('O módulo não concluiu a preparação.')),16000);})]);}finally{clearTimeout(timer);}}await wait(def.ready||(()=>true));
    statusMap.set(name,{state:'ready'});window.fccRebindSubcategories?.();window.FCCUI?.init();window.FCCContent?.mountAll();
    document.dispatchEvent(new CustomEvent('fcc-module-ready',{detail:{name,version:VERSION}}));return true;
   }catch(e){statusMap.set(name,{state:'error',error:e.message});jobs.delete(name);if(name==='medication')loaded.delete('fcc-medications.js');if(name==='cases')loaded.delete('fcc-cases.js');throw e;}
  })();jobs.set(name,job);return job;
 }
 window.FCCModules=Object.freeze({ensure,json,forRoute,definitions,status:()=>Object.fromEntries(statusMap),version:VERSION});
 window.FCCDiagnostics=Object.freeze({log:(type,message)=>{if(/error/.test(type))console.warn('[FCC]',type,String(message).slice(0,300));},module:()=>{},get:()=>window.FCCAppReady?[{type:'runtime-ready',message:'1.4.0'}]:[],stats:()=>({moduleOK:[...statusMap.values()].filter(x=>x.state==='ready').length,moduleErrors:[...statusMap.values()].filter(x=>x.state==='error').length})});
 async function boot(){
  const nav=[...document.querySelectorAll('.nav')];nav.forEach(x=>x.disabled=true);
  try{
   await ensure('shell');FCCBackup.install();FCCUI.init();window.FCCAppReady=true;
   const brand=document.querySelector('.brand p');if(brand)brand.textContent='Clínica · Pessoal · 1.4.0';
   const title=document.querySelector('.nav[data-page="clinical"] span:last-child');if(title)title.textContent='Clínica';
   document.querySelectorAll('.master-chip,#appHealthVersion').forEach(x=>x.textContent='1.4.0');
   document.documentElement.dataset.fccClinicalShellReady='1';
   await FCCNavigation.restore();
   if(!location.hash)history.replaceState({fcc:true},'','#/home');
   nav.forEach(x=>x.disabled=false);document.querySelectorAll('.nav').forEach(x=>x.disabled=false);
   window.FCCOffline?.init();
  }catch(e){
   const root=document.getElementById('page-home');root.innerHTML='<div class="card full"><h2>A aplicação não conseguiu iniciar</h2><p id="fccBootError"></p><button class="btn" id="fccRetryBoot">Tentar novamente</button></div>';document.getElementById('fccBootError').textContent=e.message;document.getElementById('fccRetryBoot').onclick=()=>location.reload();
  }
 }
 boot();
})();
