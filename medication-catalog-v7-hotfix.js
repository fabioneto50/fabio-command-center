(()=>{
  if(window.__fccMedicationCatalogV7HotfixInstalled)return;
  window.__fccMedicationCatalogV7HotfixInstalled=true;

  const install=()=>{
    const A=window.FCCMedicationCatalogV7;
    const host=document.getElementById('clin-drugs');
    const input=document.getElementById('med4Search');
    const oldBox=document.getElementById('med4Suggest');
    if(!A||!host||!input||!oldBox)return false;

    // V7 used to observe this box while also rebuilding it. Replacing the node
    // detaches that observer and stops the recursive MutationObserver loop.
    const box=oldBox.cloneNode(true);
    oldBox.replaceWith(box);
    input.addEventListener('blur',()=>setTimeout(()=>box.classList.remove('open'),120));

    const updateCount=()=>{
      const count=A.count;
      const badge=[...host.querySelectorAll('.pagehead .badge')]
        .find(el=>/\d+\s+medicamentos/i.test(el.textContent||''));
      if(badge)badge.textContent=`${count} medicamentos`;
      host.dataset.medicationCatalogCount=String(count);
      host.dataset.medicationCatalogVersion=A.version||'V7';
    };

    // Force one safe reconciliation of the old V4/V6 list with the V7 catalogue.
    A.refresh?.();
    updateCount();
    setTimeout(()=>{A.refresh?.();updateCount()},250);

    window.FCCMedicationV7Health={
      version:'7.4.1-hotfix',
      get count(){return A.count},
      expected:923,
      get ok(){return A.count===923},
      reason:'search-observer-loop-fixed'
    };
    return true;
  };

  let tries=0;
  const run=()=>{if(install()||tries++>40)return;setTimeout(run,100)};
  run();
})();
