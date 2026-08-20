(()=>{
  if(window.__fccClinicalCasesUXPatchV1Installed)return;
  window.__fccClinicalCasesUXPatchV1Installed=true;
  const KEY='fcc-clinical-case-stats-v2';
  function syncScore(){try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');const el=document.getElementById('caseScore');if(el&&Number.isFinite(+s.correct)&&Number.isFinite(+s.total))el.textContent=`${+s.correct}/${+s.total}`}catch(e){}}
  function install(){
    const bank=document.getElementById('fccCaseBank');if(!bank)return false;
    if(!document.getElementById('fcc-case-ux-patch-style')){const s=document.createElement('style');s.id='fcc-case-ux-patch-style';s.textContent='#fccCaseBank{grid-column:1/-1;width:100%}';document.head.appendChild(s)}
    document.addEventListener('fcc-subtab-change',e=>{if(e.detail?.page==='clinical')syncScore()});
    syncScore();return true;
  }
  let tries=0;const boot=()=>{tries++;if(install()||tries>80)return;setTimeout(boot,140)};boot();
})();
