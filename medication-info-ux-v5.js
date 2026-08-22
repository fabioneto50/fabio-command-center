(()=>{
  if(window.__fccMedicationStableBootInstalled)return;
  window.__fccMedicationStableBootInstalled=true;

  const V='923-v8.1.1';
  const EXPECTED_BASE=690;
  const EXPECTED_TOTAL=923;
  const host=()=>document.getElementById('clin-drugs');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const load=src=>new Promise((ok,no)=>{
    const s=document.createElement('script');
    s.src=`${src}?v=${V}`;
    s.async=false;
    s.onload=()=>ok(true);
    s.onerror=()=>no(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(s);
  });

  function shell(state='loading',message='A preparar o catálogo completo de medicação…'){
    const H=host();if(!H)return;
    H.dataset.medicationEngine='booting';
    H.innerHTML=`<div class="med8-shell"><div class="pagehead" style="margin-top:0"><div><h3>INFO Medicação</h3><p>Catálogo clínico modular · 923 fichas.</p></div><span class="badge ${state==='error'?'warn':''}">${state==='error'?'Erro':'A carregar'}</span></div><div class="card full"><div class="notice ${state==='error'?'':'oknote'}"><b>${state==='error'?'Não foi possível preparar a medicação.':'A preparar 923 medicamentos.'}</b><br>${message}</div></div></div>`;
  }

  async function waitFor(fn,{timeout=45000,interval=80,label='recurso'}={}){
    const start=Date.now();
    while(Date.now()-start<timeout){
      try{const value=fn();if(value)return value}catch(e){}
      await sleep(interval);
    }
    throw new Error(`Timeout a preparar ${label}`);
  }

  async function boot(){
    shell();

    // Não expor ao utilizador a interface parcial (~690) enquanto o catálogo
    // completo ainda está a ser construído.
    await load('medication-catalog-v6.js');
    await waitFor(()=>window.FCC_MEDICATION_CATALOG_V6?.count===EXPECTED_BASE&&window.FCC_MEDICATION_CATALOG_V6,{label:'catálogo V6'});

    await load('medication-catalog-v7.js');
    await waitFor(()=>window.FCCMedicationCatalogV7?.count===EXPECTED_TOTAL&&window.FCCMedicationCatalogV7,{label:'catálogo V7 com 923 fichas'});

    // Aplicar campos complementares já com os 923 registos presentes.
    await load('medication-catalog-v7-patch.js');
    await load('medication-search-v8.js');
    await waitFor(()=>window.FCCMedicationSearchV8?.ok&&window.FCCMedicationSearchV8,{timeout:15000,label:'motor de pesquisa V8'});
    await load('medication-search-bridge-v1.js');

    const H=host();if(H){H.dataset.medicationEngine='v8-single';H.dataset.medicationCatalogCount=String(EXPECTED_TOTAL)}
    document.dispatchEvent(new CustomEvent('fcc-medication-stable-ready',{detail:{count:EXPECTED_TOTAL,version:V}}));
  }

  boot().catch(e=>{
    console.error('[Medication stable boot]',e);
    shell('error','Atualiza a página. Se o erro persistir, consulta o Autodiagnóstico em Definições.');
    window.FCCDiagnostics?.log?.('medication-boot-error',e?.message||String(e));
  });
})();
