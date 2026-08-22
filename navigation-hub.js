(()=>{
  const V='1.3.2',ASSET='1.3.2-modular-content-1';window.FCC_RUNTIME_VERSION=V;document.documentElement.dataset.fccRuntimeVersion=V;
  const unitDefaults={Noradrenalina:'mcgkgmin',Adrenalina:'mcgkgmin',Dobutamina:'mcgkgmin',Dopamina:'mcgkgmin',Propofol:'mgkgh',Dexmedetomidina:'mcgkgh',Alfentanil:'mcgkgh',Remifentanil:'mcgkgmin',Rocurónio:'mcgkgmin',Insulina:'uih',Amiodarona:'mgh',Heparina:'uih'};

  function installPrepaintStyles(){
    if(document.getElementById('fcc-fastboot-prepaint-v2'))return;
    const s=document.createElement('style');s.id='fcc-fastboot-prepaint-v2';s.textContent=`
      body{font-size:16px}
      .brand h1{font-size:18px!important}
      body .pagehead h2{font-size:31px!important}
      body .card h3{font-size:16px!important;line-height:1.3}
      body h4{font-size:14px!important;line-height:1.35}
      body p,body li,body dd,body dt{font-size:14px!important;line-height:1.62}
      body label{font-size:13px!important;line-height:1.45}
      body input,body textarea,body select{font-size:14px!important;line-height:1.45}
      body .btn,body .nav{font-size:14px!important}
      body .btn.small,body .tab{font-size:13px!important}
      body .pill,body .badge,body .master-chip,body .eyebrow{font-size:11px!important}
      body small,body .tiny{font-size:11.5px!important;line-height:1.5}
      body .brand p{font-size:11px!important}
      body .hero p,body .card p,body .pagehead p{font-size:14px!important}
      body .tab{padding:10px 12px!important}
      body .nav{padding:11px 11px!important}
      body .btn{padding-top:10px;padding-bottom:10px}
      #page-clinical>.tabs{visibility:hidden}
      html[data-fcc-clinical-shell-ready="1"] #page-clinical>.tabs{visibility:visible}
      @media(max-width:640px){
        .brand h1{font-size:17px!important}
        body .pagehead h2{font-size:27px!important}
        body .card h3{font-size:16px!important}
        body p,body li,body dd,body dt{font-size:14px!important}
        body label{font-size:13px!important}
        body input,body textarea,body select,body .btn,body .nav{font-size:14px!important}
        body .tab{font-size:13px!important}
      }
    `;document.head.appendChild(s);
  }
  function applyInitialTheme(){
    try{
      const key='fcc-theme-manual-until-v2',now=Date.now(),h=new Date().getHours();let theme=h>=8&&h<20?'light':'dark';
      const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&(saved.theme==='light'||saved.theme==='dark')&&+saved.until>now)theme=saved.theme;
      document.documentElement.dataset.fccTheme=theme;document.documentElement.style.colorScheme=theme;
    }catch(e){}
  }
  function bootstrapVisibleShell(){
    try{
      installPrepaintStyles();applyInitialTheme();
      const brand=document.querySelector('.brand p');if(brand)brand.textContent='MASTER · Clinical · Pessoal';
      const side=document.querySelector('nav.side');
      if(side){
        ['emergency','comms','garage','research'].forEach(page=>side.querySelectorAll(`.nav[data-page="${page}"]`).forEach(n=>n.remove()));
        let personal=side.querySelector('.nav[data-page="personal"]');
        if(!personal){
          personal=document.createElement('button');personal.className='nav';personal.dataset.page='personal';personal.type='button';personal.innerHTML='<span class="ni">◎</span><span>Pessoal</span>';
          personal.addEventListener('click',()=>{if(typeof window.fccNavigate==='function')window.fccNavigate('personal');else if(typeof window.go==='function')window.go('personal')});
          const clinical=side.querySelector('.nav[data-page="clinical"]');if(clinical)clinical.after(personal);else side.appendChild(personal);
        }
        const settings=side.querySelector('.nav[data-page="settings"] span:last-child');if(settings)settings.textContent='Definições';
      }
      const home=document.getElementById('page-home');
      if(home&&!document.getElementById('homeHealthNewsCard')){
        home.dataset.publicShell='3';
        home.innerHTML=`
          <div class="hero">
            <h2>Notícias</h2>
            <p>Saúde e atualidade mundial, atualizadas automaticamente.</p>
          </div>
          <div class="grid">
            <section class="card full home-news-card" id="homeHealthNewsCard">
              <div class="home-news-head">
                <div><span class="eyebrow">SAÚDE</span><h3>Notícias de Saúde</h3><div class="home-news-meta" id="homeHealthNewsMeta">A carregar notícias…</div></div>
                <div class="home-news-controls"><button class="btn small home-news-refresh" id="homeHealthNewsRefresh" type="button">Atualizar</button><button class="btn small home-news-arrow" type="button" data-news-prev aria-label="Notícias anteriores de saúde">‹</button><button class="btn small home-news-arrow" type="button" data-news-next aria-label="Próximas notícias de saúde">›</button></div>
              </div>
              <div class="home-news-list" id="homeHealthNewsList"><div class="home-news-empty">A carregar notícias de saúde…</div></div>
            </section>
            <section class="card full home-news-card" id="homeWorldNewsCard">
              <div class="home-news-head">
                <div><span class="eyebrow">MUNDO</span><h3>Atualidade do Mundo</h3><div class="home-news-meta" id="homeWorldNewsMeta">A carregar notícias…</div></div>
                <div class="home-news-controls"><button class="btn small home-news-refresh" id="homeWorldNewsRefresh" type="button">Atualizar</button><button class="btn small home-news-arrow" type="button" data-news-prev aria-label="Notícias anteriores de atualidade mundial">‹</button><button class="btn small home-news-arrow" type="button" data-news-next aria-label="Próximas notícias de atualidade mundial">›</button></div>
              </div>
              <div class="home-news-list" id="homeWorldNewsList"><div class="home-news-empty">A carregar atualidade mundial…</div></div>
            </section>
            <div hidden aria-hidden="true"><span id="homeHealth"></span><span id="homePrep"></span><div id="homeAlerts"></div><textarea id="homeNotes"></textarea></div>
          </div>`;
      }
    }catch(e){console.error('FCC fast boot shell failed',e)}
  }
  bootstrapVisibleShell();

  const load=name=>new Promise(resolve=>{const s=document.createElement('script');s.src=`./${name}?v=${ASSET}`;s.async=false;s.onload=()=>{window.FCCDiagnostics?.module(name,true);resolve(true)};s.onerror=()=>{console.error('FCC module load failed',name);window.FCCDiagnostics?.module(name,false,'load error');resolve(false)};document.head.appendChild(s)});
  const critical=[
    'runtime-diagnostics-v1.js','theme-switcher.js','theme-auto-v2.js','global-typography-v1.js','theme-audit-fixes.js',
    'runtime-core-v1.js','fcc-content-core-v1.js','fcc-content-config-v1.js','home-public-shell-v1.js','personal-security-v1.js','search-enhancer.js','navigation-core.js','personal-hub-v1.js','subtab-navigation-fix.js'
  ];
  const clinicalVisual=[
    'iv-compatibility.js','clinical-material.js','clinical-restructure.js','wound-dressings-v1.js','category-organizer-v2.js'
  ];
  const modules=[
    'home-current-news-v1.js',
    'perfusion-reference.js','critical-care-dilutions-v2.js','dilutions-ux-v3.js',
    'dilutions-hba-chunk-01.js','dilutions-hba-chunk-02.js','dilutions-hba-chunk-03.js','dilutions-hba-chunk-04.js','dilutions-hba-chunk-05.js','dilutions-hba-chunk-06.js','dilutions-hba-chunk-07.js','dilutions-hba-chunk-08.js','dilutions-source-hba-2018.js','dilutions-document-db-v4.js',
    'cuf-inf2213-data.js','cuf-inf1030-chunk-01.js','cuf-inf1030-chunk-02.js','cuf-inf1030-chunk-03.js','cuf-inf1030-chunk-04.js','cuf-inf1030-chunk-05.js','cuf-inf1030-chunk-06.js','cuf-inf1030-chunk-07.js','cuf-clinical-docs-loader.js',
    'cuf-imp1636-chunk-01.js','cuf-imp1636-chunk-02.js','cuf-imp1636-chunk-03.js','cuf-imp1636-chunk-04.js','cuf-imp1636-loader.js',
    'dilutions-cuf-v6.js','dilutions-card-ux-v5.js','family-security.js','clinical-material-window-v2.js',
    'iv-catalogue.js','iv-compatibility-ui-v2.js','iv-source-evidence.js','iv-compatibility-expanded-v3.js','iv-compatibility-exit-reset-v1.js',
    'wound-dressings-local-data-v1.js','wound-dressings-order-v1.js',
    'wound-images-chunk-01.js','wound-images-chunk-02.js','wound-images-chunk-03.js','wound-images-chunk-04.js','wound-images-chunk-05.js','wound-images-chunk-06.js','wound-images-chunk-07.js','wound-dressings-images-v2.js',
    'clinical-cases-separate-v3.js','clinical-cases-bank-v2.js','clinical-cases-ux-patch-v1.js','clinical-cases-upgrade-v3.js',
    'drug-reference-v2.js','medication-info-v4.js','medication-info-ux-v5.js','medication-brands-v1.js','medication-stability-cuf-v1.js','medication-safety-cuf-v2.js','medication-reference-links-v2.js',
    'ecg-photo-assist.js','ecg-image-analyzer-v3.js','clinical-legacy-shims.js',
    'expense-recurring-engine.js','expense-center.js','expense-recurring-ui.js','personal-expenses-v1.js','research-live-search-v1.js',
    'version-sync-v1.js','version-system-health-v1.js','resource-cleanup-v1.js'
  ];
  (async()=>{
    for(const name of critical)await load(name);
    for(const name of clinicalVisual)await load(name);
    window.fccRebindSubcategories?.();
    document.documentElement.dataset.fccClinicalShellReady='1';
    document.dispatchEvent(new CustomEvent('fcc-visual-shell-ready',{detail:{version:V}}));
    for(const name of modules)await load(name);
    window.FCCContent?.mountAll();
    const d=document.getElementById('infDrug'),u=document.getElementById('infDU');if(d&&u&&!d.dataset.fccUnitBound){d.dataset.fccUnitBound='1';d.addEventListener('change',()=>{u.value=unitDefaults[d.value]||'mcgkgmin'})}
    window.fccRefreshPersonalHub?.();window.fccRefreshPersonalExpenses?.();window.fccSyncRuntimeVersion?.();
    document.dispatchEvent(new CustomEvent('fcc-runtime-version-change',{detail:{version:V}}));
    if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.ready.then(reg=>reg.update()).catch(e=>window.FCCDiagnostics?.log('service-worker-error',e?.message||e));
    window.FCCDiagnostics?.log('runtime-ready','MASTER '+V,'Módulos carregados em modo fail-soft');
  })();
})();
