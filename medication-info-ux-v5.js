(()=>{
  const V='923-recovery-med1114-replace-v1';
  const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=`${src}?v=${V}`;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  load('medication-info-ux-v5-base.js')
    .then(()=>load('medication-v6-historical-iv-data.js'))
    .then(()=>load('medication-catalog-v6.js'))
    .then(()=>load('medication-catalog-v6-recovery-fix.js'))
    .then(()=>load('medication-catalog-v7.js'))
    .then(()=>load('medication-catalog-v7-batch.js'))
    .then(()=>load('medication-catalog-v7-patch.js'))
    .then(()=>load('medication-catalog-v7-flush.js'))
    .then(()=>load('medication-catalog-v7-hotfix.js'))
    .then(()=>load('medication-catalog-v11-14-patch.js'))
    .catch(e=>console.error('[Medication UX loader]',e));
})();
