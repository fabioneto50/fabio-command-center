(()=>{
  if(window.__fccMedicationSearchBridgeV1Installed)return;
  window.__fccMedicationSearchBridgeV1Installed=true;

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();

  function indexAll(){
    const api=window.FCCMedicationSearchV8;
    const index=window.FCC_GLOBAL_SEARCH_INDEX;
    if(!api?.ok||!(index instanceof Map)||!Array.isArray(api.records))return false;
    for(const d of api.records){
      const title=d.n;if(!title)continue;
      const k=['medication','clinical','clin-drugs',fold(title),title].join('|');
      index.set(k,{
        type:'medication',title,
        sub:`Clinical · INFO Medicação${d.g?' · '+d.g:''}`,
        page:'clinical',target:'clin-drugs',ref:title,
        searchText:[title,d.g,d.q,d.pd,d.use,d.pk,d.mon,d.risk,'medicação medicamento fármaco'].filter(Boolean).join(' ')
      });
    }
    return true;
  }

  const originalOpen=window.openSearchHit;
  if(typeof originalOpen==='function'){
    window.openSearchHit=function(i){
      const box=document.getElementById('globalResults');
      const global=document.getElementById('globalSearch');
      const hit=box?._hits?.[i];
      if(hit?.type==='medication'&&window.FCCMedicationSearchV8?.ok){
        box?.classList.remove('open');if(global)global.value='';
        const open=()=>setTimeout(()=>window.FCCMedicationSearchV8?.open?.(hit.ref||hit.title),80);
        if(typeof window.fccNavigate==='function')window.fccNavigate('clinical',{after:()=>{
          const tabs=document.querySelectorAll('#page-clinical > .tabs > .tab');
          const tab=[...tabs].find(t=>((t.getAttribute('onclick')||'').includes("'clin-drugs'")||t.dataset.subId==='clin-drugs'));
          tab?.click();open();
        }});else{window.go?.('clinical');setTimeout(()=>{const tab=[...document.querySelectorAll('#page-clinical > .tabs > .tab')].find(t=>(t.getAttribute('onclick')||'').includes("'clin-drugs'"));tab?.click();open()},100)}
        return;
      }
      return originalOpen(i);
    };
  }

  indexAll();
  document.addEventListener('fcc-medication-search-v8-ready',()=>{indexAll();setTimeout(indexAll,150)});
  setTimeout(indexAll,500);
  window.FCCMedicationSearchBridge={version:'1.0.0',indexAll};
})();
