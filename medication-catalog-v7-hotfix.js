(()=>{
  if(window.__fccMedicationCatalogV7HotfixInstalled)return;
  window.__fccMedicationCatalogV7HotfixInstalled=true;

  const install=()=>{
    const A=window.FCCMedicationCatalogV7;
    const host=document.getElementById('clin-drugs');
    const input=document.getElementById('med4Search');
    const group=document.getElementById('med4Group');
    const oldBox=document.getElementById('med4Suggest');
    if(!A||!host||!input||!group||!oldBox)return false;

    // V7 used to observe this box while also rebuilding it. Replacing the node
    // detaches that observer and stops the recursive MutationObserver loop.
    const box=oldBox.cloneNode(true);
    oldBox.replaceWith(box);
    input.addEventListener('blur',()=>setTimeout(()=>box.classList.remove('open'),120));

    let scheduled=0;
    const updateCount=()=>{
      const count=A.count;
      const badge=[...host.querySelectorAll('.pagehead .badge')]
        .find(el=>/\d+\s+medicamentos/i.test(el.textContent||''));
      if(badge)badge.textContent=`${count} medicamentos`;
      host.dataset.medicationCatalogCount=String(count);
      host.dataset.medicationCatalogVersion=A.version||'V7';
      const alphaCount=document.getElementById('med5AlphaCount');
      const q=(input.value||'').trim();
      const g=group.value||'';
      if(alphaCount&&!q&&!g)alphaCount.textContent=`${count} medicamentos`;
    };

    const reconcile=()=>{
      scheduled=0;
      try{A.refresh?.()}catch(e){console.error('[Medication V7 reconcile]',e)}
      updateCount();
    };

    const schedule=()=>{
      if(scheduled)return;
      scheduled=requestAnimationFrame(reconcile);
    };

    // V4 renders synchronously first. Reconcile immediately afterwards with
    // the complete V7 catalogue so search/filter results always include all 923.
    input.addEventListener('input',()=>setTimeout(schedule,0));
    input.addEventListener('focus',()=>setTimeout(schedule,0));
    group.addEventListener('change',()=>setTimeout(schedule,0));
    document.addEventListener('fcc-subtab-change',e=>{
      if(e.detail?.page==='clinical'&&e.detail?.id==='clin-drugs')setTimeout(schedule,0);
    });

    // Initial safe reconciliation, plus two delayed passes for slower iOS/PWA loads.
    schedule();
    setTimeout(schedule,250);
    setTimeout(schedule,1000);

    window.FCCMedicationV7Health={
      version:'7.4.2-hotfix',
      get count(){return A.count},
      expected:923,
      get ok(){return A.count===923},
      refresh:reconcile,
      search:q=>{
        input.value=q||'';
        input.dispatchEvent(new Event('input',{bubbles:true}));
        schedule();
      },
      reason:'stable-923-reconciliation'
    };
    return true;
  };

  let tries=0;
  const run=()=>{if(install()||tries++>60)return;setTimeout(run,100)};
  run();
})();
