(()=>{
  if(window.__fccClinicalLegacyShimsInstalled)return;
  window.__fccClinicalLegacyShimsInstalled=true;
  function install(){
    const page=document.getElementById('page-clinical');if(!page)return false;
    let shim=document.getElementById('fccClinicalLegacyShims');
    if(!shim){shim=document.createElement('div');shim.id='fccClinicalLegacyShims';shim.hidden=true;page.appendChild(shim)}
    if(!document.getElementById('drugSearch')){const i=document.createElement('input');i.id='drugSearch';i.type='hidden';shim.appendChild(i)}
    if(!document.getElementById('drugGrid')){const d=document.createElement('div');d.id='drugGrid';shim.appendChild(d)}
    if(!document.getElementById('icuChecklist')){const d=document.createElement('div');d.id='icuChecklist';shim.appendChild(d)}
    return true;
  }
  let n=0;const run=()=>{n++;if(install()||n>30)return;setTimeout(run,100)};run();
})();