(()=>{
  const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  const unitDefaults={Noradrenalina:'mcgkgmin',Adrenalina:'mcgkgmin',Dobutamina:'mcgkgmin',Dopamina:'mcgkgmin',Propofol:'mgkgh',Dexmedetomidina:'mcgkgh',Alfentanil:'mcgkgh',Remifentanil:'mcgkgmin',Rocurónio:'mcgkgmin',Insulina:'uih',Amiodarona:'mgh',Heparina:'uih'};
  const V='1.1.3';window.FCC_RUNTIME_VERSION=V;
  const modules=[
    'theme-switcher.js','navigation-core.js','perfusion-reference.js','critical-care-dilutions-v2.js','dilutions-ux-v3.js',
    'dilutions-hba-chunk-01.js','dilutions-hba-chunk-02.js','dilutions-hba-chunk-03.js','dilutions-hba-chunk-04.js','dilutions-hba-chunk-05.js','dilutions-hba-chunk-06.js','dilutions-hba-chunk-07.js','dilutions-hba-chunk-08.js','dilutions-source-hba-2018.js','dilutions-document-db-v4.js',
    'cuf-inf2213-data.js','cuf-inf1030-chunk-01.js','cuf-inf1030-chunk-02.js','cuf-inf1030-chunk-03.js','cuf-inf1030-chunk-04.js','cuf-inf1030-chunk-05.js','cuf-inf1030-chunk-06.js','cuf-inf1030-chunk-07.js','cuf-clinical-docs-loader.js',
    'cuf-imp1636-chunk-01.js','cuf-imp1636-chunk-02.js','cuf-imp1636-chunk-03.js','cuf-imp1636-chunk-04.js','cuf-imp1636-loader.js',
    'dilutions-cuf-v6.js','dilutions-card-ux-v5.js','family-security.js',
    'clinical-material.js','clinical-material-window-v2.js',
    'iv-compatibility.js','iv-catalogue.js','iv-compatibility-ui-v2.js','iv-source-evidence.js','iv-compatibility-expanded-v3.js','iv-compatibility-exit-reset-v1.js',
    'clinical-restructure.js','wound-dressings-v1.js','wound-dressings-order-v1.js','clinical-cases-bank-v2.js','clinical-cases-ux-patch-v1.js',
    'drug-reference-v2.js','medication-info-v3.js','medication-info-v4.js','medication-info-ux-v5.js','medication-brands-v1.js','medication-stability-cuf-v1.js','medication-safety-cuf-v2.js','medication-reference-links-v2.js',
    'ecg-photo-assist.js','ecg-image-analyzer-v2.js','ecg-image-analyzer-v3.js','clinical-legacy-shims.js','category-organizer.js',
    'expense-recurring-engine.js','expense-center.js','expense-recurring-ui.js','research-live-search-v1.js','theme-audit-fixes.js','search-enhancer.js','subtab-navigation-fix.js','version-sync-v1.js'
  ];
  let chain=Promise.resolve();modules.forEach(name=>{chain=chain.then(()=>load(`./${name}?v=${V}`))});
  chain.then(()=>{
    const d=document.getElementById('infDrug'),u=document.getElementById('infDU');if(d&&u)d.addEventListener('change',()=>{u.value=unitDefaults[d.value]||'mcgkgmin'});
    window.fccRebindSubcategories?.();window.fccSyncRuntimeVersion?.();
    setTimeout(()=>window.fccRebindSubcategories?.(),120);setTimeout(()=>window.fccSyncRuntimeVersion?.(),220);setTimeout(()=>window.fccRebindSubcategories?.(),600);
  }).catch(e=>{console.error('FCC module load failed',e)});
})();
