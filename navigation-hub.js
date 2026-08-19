(()=>{
  const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  load('./navigation-core.js?v=1.0.5').then(()=>load('./perfusion-reference.js?v=1.0.5')).catch(()=>{});
})();
