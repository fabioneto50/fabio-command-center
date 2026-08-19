(()=>{
  const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  const unitDefaults={Noradrenalina:'mcgkgmin',Adrenalina:'mcgkgmin',Dobutamina:'mcgkgmin',Dopamina:'mcgkgmin',Propofol:'mgkgh',Dexmedetomidina:'mcgkgh',Alfentanil:'mcgkgh',Remifentanil:'mcgkgmin',Rocurónio:'mcgkgmin',Insulina:'uih',Amiodarona:'mgh',Heparina:'uih'};
  load('./theme-switcher.js?v=1.0.21')
    .then(()=>load('./navigation-core.js?v=1.0.21'))
    .then(()=>load('./perfusion-reference.js?v=1.0.21'))
    .then(()=>load('./family-security.js?v=1.0.21'))
    .then(()=>load('./clinical-material.js?v=1.0.21'))
    .then(()=>load('./iv-compatibility.js?v=1.0.21'))
    .then(()=>load('./iv-catalogue.js?v=1.0.21'))
    .then(()=>load('./iv-compatibility-ui-v2.js?v=1.0.21'))
    .then(()=>load('./iv-source-evidence.js?v=1.0.21'))
    .then(()=>load('./clinical-restructure.js?v=1.0.21'))
    .then(()=>load('./drug-reference-v2.js?v=1.0.21'))
    .then(()=>load('./medication-info-v3.js?v=1.0.21'))
    .then(()=>load('./ecg-photo-assist.js?v=1.0.21'))
    .then(()=>load('./clinical-legacy-shims.js?v=1.0.21'))
    .then(()=>load('./category-organizer.js?v=1.0.21'))
    .then(()=>load('./expense-recurring-engine.js?v=1.0.21'))
    .then(()=>load('./expense-center.js?v=1.0.21'))
    .then(()=>load('./expense-recurring-ui.js?v=1.0.21'))
    .then(()=>load('./theme-audit-fixes.js?v=1.0.21'))
    .then(()=>load('./search-enhancer.js?v=1.0.21'))
    .then(()=>load('./subtab-navigation-fix.js?v=1.0.21'))
    .then(()=>{
      const d=document.getElementById('infDrug'),u=document.getElementById('infDU');
      if(d&&u)d.addEventListener('change',()=>{u.value=unitDefaults[d.value]||'mcgkgmin'});
    }).catch(()=>{});
})();