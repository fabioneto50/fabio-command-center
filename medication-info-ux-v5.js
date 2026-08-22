(()=>{
  const V='923-v7.3';
  const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=`${src}?v=${V}`;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  load('medication-info-ux-v5-base.js')
    .then(()=>load('medication-catalog-v6.js'))
    .then(()=>load('medication-catalog-v7.js'))
    .then(()=>load('medication-catalog-v7-batch.js'))
    .then(()=>load('medication-catalog-v7-patch.js'))
    .catch(e=>console.error('[Medication UX loader]',e));
})();
