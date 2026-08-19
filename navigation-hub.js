(()=>{
  const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  const unitDefaults={Noradrenalina:'mcgkgmin',Adrenalina:'mcgkgmin',Dobutamina:'mcgkgmin',Dopamina:'mcgkgmin',Propofol:'mgkgh',Dexmedetomidina:'mcgkgh',Alfentanil:'mcgkgh',Remifentanil:'mcgkgmin',Rocurónio:'mcgkgmin',Insulina:'uih',Amiodarona:'mgh',Heparina:'uih'};
  load('./navigation-core.js?v=1.0.9')
    .then(()=>load('./perfusion-reference.js?v=1.0.9'))
    .then(()=>load('./family-security.js?v=1.0.9'))
    .then(()=>load('./clinical-material.js?v=1.0.9'))
    .then(()=>load('./iv-compatibility.js?v=1.0.9'))
    .then(()=>load('./iv-catalogue.js?v=1.0.9'))
    .then(()=>{
      const d=document.getElementById('infDrug'),u=document.getElementById('infDU');
      if(d&&u)d.addEventListener('change',()=>{u.value=unitDefaults[d.value]||'mcgkgmin'});
    }).catch(()=>{});
})();
