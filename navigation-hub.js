(()=>{
  const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  const unitDefaults={Noradrenalina:'mcgkgmin',Adrenalina:'mcgkgmin',Dobutamina:'mcgkgmin',Dopamina:'mcgkgmin',Propofol:'mgkgh',Dexmedetomidina:'mcgkgh',Alfentanil:'mcgkgh',Remifentanil:'mcgkgmin',Rocurónio:'mcgkgmin',Insulina:'uih',Amiodarona:'mgh',Heparina:'uih'};
  load('./navigation-core.js').then(()=>load('./perfusion-reference.js')).then(()=>{
    const d=document.getElementById('infDrug'),u=document.getElementById('infDU');
    if(d&&u)d.addEventListener('change',()=>{u.value=unitDefaults[d.value]||'mcgkgmin'});
  }).catch(()=>{});
})();
