(()=>{
  const V='923-recovery-med1114-replace-v2';
  const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=`${src}?v=${V}`;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  const waitForV6=()=>new Promise((ok,no)=>{
    const started=Date.now();
    const check=()=>{
      if(window.FCC_MEDICATION_CATALOG_V6?.count===690)return ok();
      if(Date.now()-started>20000)return no(new Error('Base V6 não atingiu 690 fichas no prazo de segurança'));
      setTimeout(check,50);
    };
    check();
  });
  load('medication-info-ux-v5-base.js')
    .then(()=>load('medication-v6-historical-iv-data.js'))
    .then(()=>load('medication-catalog-v6.js'))
    .then(()=>load('medication-catalog-v6-recovery-fix.js'))
    .then(()=>waitForV6())
    .then(()=>load('medication-catalog-v7.js'))
    .then(()=>load('medication-catalog-v7-batch.js'))
    .then(()=>load('medication-catalog-v7-patch.js'))
    .then(()=>load('medication-catalog-v7-flush.js'))
    .then(()=>load('medication-catalog-v7-hotfix.js'))
    .then(()=>load('medication-catalog-v11-14-patch.js'))
    .catch(e=>console.error('[Medication UX loader]',e));
})();
