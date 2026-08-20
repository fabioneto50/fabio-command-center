(()=>{
  const V='1.3.0';window.FCC_RUNTIME_VERSION=V;document.documentElement.dataset.fccRuntimeVersion=V;
  const unitDefaults={Noradrenalina:'mcgkgmin',Adrenalina:'mcgkgmin',Dobutamina:'mcgkgmin',Dopamina:'mcgkgmin',Propofol:'mgkgh',Dexmedetomidina:'mcgkgh',Alfentanil:'mcgkgh',Remifentanil:'mcgkgmin',Rocurónio:'mcgkgmin',Insulina:'uih',Amiodarona:'mgh',Heparina:'uih'};
  const load=name=>new Promise(resolve=>{const s=document.createElement('script');s.src=`./${name}?v=${V}`;s.async=false;s.onload=()=>{window.FCCDiagnostics?.module(name,true);resolve(true)};s.onerror=()=>{console.error('FCC module load failed',name);window.FCCDiagnostics?.module(name,false,'load error');resolve(false)};document.head.appendChild(s)});
  const critical=['runtime-diagnostics-v1.js','theme-switcher.js','theme-auto-v2.js','runtime-core-v1.js','navigation-core.js','personal-hub-v1.js','subtab-navigation-fix.js','personal-security-v1.js'];
  const modules=[
    'perfusion-reference.js','critical-care-dilutions-v2.js','dilutions-ux-v3.js',
    'dilutions-hba-chunk-01.js','dilutions-hba-chunk-02.js','dilutions-hba-chunk-03.js','dilutions-hba-chunk-04.js','dilutions-hba-chunk-05.js','dilutions-hba-chunk-06.js','dilutions-hba-chunk-07.js','dilutions-hba-chunk-08.js','dilutions-source-hba-2018.js','dilutions-document-db-v4.js',
    'cuf-inf2213-data.js','cuf-inf1030-chunk-01.js','cuf-inf1030-chunk-02.js','cuf-inf1030-chunk-03.js','cuf-inf1030-chunk-04.js','cuf-inf1030-chunk-05.js','cuf-inf1030-chunk-06.js','cuf-inf1030-chunk-07.js','cuf-clinical-docs-loader.js',
    'cuf-imp1636-chunk-01.js','cuf-imp1636-chunk-02.js','cuf-imp1636-chunk-03.js','cuf-imp1636-chunk-04.js','cuf-imp1636-loader.js',
    'dilutions-cuf-v6.js','dilutions-card-ux-v5.js','family-security.js','clinical-material.js','clinical-material-window-v2.js',
    'iv-compatibility.js','iv-catalogue.js','iv-compatibility-ui-v2.js','iv-source-evidence.js','iv-compatibility-expanded-v3.js','iv-compatibility-exit-reset-v1.js',
    'clinical-restructure.js','wound-dressings-v1.js','wound-dressings-order-v1.js',
    'wound-images-chunk-01.js','wound-images-chunk-02.js','wound-images-chunk-03.js','wound-images-chunk-04.js','wound-images-chunk-05.js','wound-images-chunk-06.js','wound-images-chunk-07.js','wound-dressings-images-v2.js',
    'clinical-cases-separate-v3.js','clinical-cases-bank-v2.js','clinical-cases-ux-patch-v1.js','clinical-cases-upgrade-v3.js',
    'drug-reference-v2.js','medication-info-v4.js','medication-info-ux-v5.js','medication-brands-v1.js','medication-stability-cuf-v1.js','medication-safety-cuf-v2.js','medication-reference-links-v2.js',
    'ecg-photo-assist.js','ecg-image-analyzer-v3.js','clinical-legacy-shims.js','category-organizer-v2.js',
    'expense-recurring-engine.js','expense-center.js','expense-recurring-ui.js','personal-expenses-v1.js','research-live-search-v1.js',
    'theme-audit-fixes.js','search-enhancer.js','global-typography-v1.js','home-current-news-v1.js','version-sync-v1.js','version-system-health-v1.js','resource-cleanup-v1.js'
  ];
  (async()=>{
    for(const name of critical)await load(name);
    for(const name of modules)await load(name);
    const d=document.getElementById('infDrug'),u=document.getElementById('infDU');if(d&&u&&!d.dataset.fccUnitBound){d.dataset.fccUnitBound='1';d.addEventListener('change',()=>{u.value=unitDefaults[d.value]||'mcgkgmin'})}
    window.fccRefreshPersonalHub?.();window.fccRefreshPersonalExpenses?.();window.fccSyncRuntimeVersion?.();
    document.dispatchEvent(new CustomEvent('fcc-runtime-version-change',{detail:{version:V}}));
    if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.ready.then(reg=>reg.update()).catch(e=>window.FCCDiagnostics?.log('service-worker-error',e?.message||e));
    window.FCCDiagnostics?.log('runtime-ready','MASTER '+V,'Módulos carregados em modo fail-soft');
  })();
})();
