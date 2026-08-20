(()=>{
  if(window.__fccNavigationStabilityV1Installed)return;
  window.__fccNavigationStabilityV1Installed=true;

  const RENDER_NAMES=['renderEmergency','renderComms','renderGarage','renderResearch','renderClinical'];
  const originalGo=window.go;
  const originalDirect=window.__fccDirectGo;
  let navigating=false;
  let lastPage='';
  let lastAt=0;

  function addStyles(){
    if(document.getElementById('fcc-navigation-stability-style'))return;
    const s=document.createElement('style');
    s.id='fcc-navigation-stability-style';
    s.textContent=`
      @media(max-width:920px){
        .fcc-sheet-backdrop,.fcc-org-backdrop,.personal-pin-backdrop,.modal{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
        .fcc-sheet-backdrop:not(.open){display:none!important}
        .fcc-sheet-backdrop.open{display:block!important}
      }
    `;
    document.head.appendChild(s);
  }

  function closeTransient(){
    document.getElementById('fcc-sheet-backdrop')?.classList.remove('open');
    document.getElementById('fcc-category-sheet')?.classList.remove('open');
    document.getElementById('fccOrgModal')?.classList.remove('open');
    document.querySelectorAll('.modal.open').forEach(x=>x.classList.remove('open'));
  }

  function withoutNavigationRenders(fn){
    const saved=[];
    RENDER_NAMES.forEach(name=>{
      const current=window[name];
      if(typeof current==='function'){
        saved.push([name,current]);
        window[name]=()=>{};
      }
    });
    try{return fn()}finally{saved.forEach(([name,fn0])=>{window[name]=fn0})}
  }

  function run(nav,ctx,page,args){
    if(typeof nav!=='function')return;
    const target=document.getElementById('page-'+page);
    if(!target)return;
    const active=document.querySelector('.page.active');
    const now=performance.now();
    closeTransient();
    if(active===target)return;
    if(navigating)return;
    if(page===lastPage&&now-lastAt<90)return;
    navigating=true;lastPage=page;lastAt=now;
    try{
      return withoutNavigationRenders(()=>nav.call(ctx,page,...args));
    }finally{
      navigating=false;
      requestAnimationFrame(()=>window.fccRebindSubcategories?.());
    }
  }

  if(typeof originalGo==='function')window.go=function(page,...args){return run(originalGo,this,page,args)};
  if(typeof originalDirect==='function')window.__fccDirectGo=function(page,...args){return run(originalDirect,this,page,args)};

  document.addEventListener('fcc-subtab-change',()=>{
    document.getElementById('fcc-sheet-backdrop')?.classList.remove('open');
    document.getElementById('fcc-category-sheet')?.classList.remove('open');
  });
  window.addEventListener('pageshow',closeTransient);
  addStyles();
})();
