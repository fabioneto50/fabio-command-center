(()=>{
  const V='923-v7.4.3-med1114';
  const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=`${src}?v=${V}`;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  load('medication-info-ux-v5-base.js')
    .then(()=>load('medication-catalog-v6.js'))
    .then(()=>load('medication-catalog-v7.js'))
    .then(()=>load('medication-catalog-v7-batch.js'))
    .then(()=>load('medication-catalog-v7-patch.js'))
    .then(()=>load('medication-catalog-v7-flush.js'))
    .then(()=>load('medication-catalog-v7-hotfix.js'))
    .then(()=>load('medication-catalog-v11-14-patch.js'))
    .catch(e=>console.error('[Medication UX loader]',e));
})();
