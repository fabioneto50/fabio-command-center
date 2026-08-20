(()=>{
  if(window.__fccRuntimeCoreV1Installed)return;
  window.__fccRuntimeCoreV1Installed=true;
  const guards=[];
  const parents=new Map();
  let navigating=false;

  function closeTransient(){
    document.querySelectorAll('.modal.open,.fcc-org-backdrop.open,.family-pin-backdrop.open').forEach(x=>x.classList.remove('open'));
    document.getElementById('fcc-sheet-backdrop')?.classList.remove('open');
    document.getElementById('fcc-category-sheet')?.classList.remove('open');
    document.getElementById('fccPersonalPinModal')?.classList.remove('open');
    document.querySelector('.material-frame-card.material-maximized')?.classList.remove('material-maximized');
    const expand=document.getElementById('materialExpandBtn');if(expand)expand.textContent='Expandir';
    document.body.style.overflow='';
  }

  function navOwner(page){return parents.get(page)||page}
  function applyPage(page){
    const target=document.getElementById('page-'+page);if(!target)return false;
    document.querySelectorAll('.page.active').forEach(x=>x.classList.remove('active'));
    target.classList.add('active');
    const owner=navOwner(page);
    document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===owner));
    return true;
  }

  function navigate(page,opts={}){
    page=String(page||'').trim();if(!page||navigating)return false;
    const target=document.getElementById('page-'+page);if(!target){window.FCCDiagnostics?.log('navigation-error','Página inexistente',page);return false}
    closeTransient();
    if(!opts.bypassGuard){
      for(const guard of guards){
        try{
          const proceed=()=>navigate(page,{...opts,bypassGuard:true});
          if(guard(page,proceed,opts)===false)return false;
        }catch(e){window.FCCDiagnostics?.log('navigation-guard-error',e?.message||e,page)}
      }
    }
    const active=document.querySelector('.page.active');
    if(active===target){
      if(typeof opts.after==='function')queueMicrotask(opts.after);
      return true;
    }
    navigating=true;
    try{
      if(!applyPage(page))return false;
      try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(e){window.scrollTo(0,0)}
      document.dispatchEvent(new CustomEvent('fcc-page-change',{detail:{page,owner:navOwner(page)}}));
      if(typeof opts.after==='function')queueMicrotask(opts.after);
      return true;
    }finally{navigating=false}
  }

  const api={
    navigate,
    addGuard(fn){if(typeof fn==='function'&&!guards.includes(fn))guards.push(fn)},
    removeGuard(fn){const i=guards.indexOf(fn);if(i>=0)guards.splice(i,1)},
    setParent(page,parent){if(page&&parent)parents.set(String(page),String(parent))},
    closeTransient,
    current:()=>document.querySelector('.page.active')?.id?.replace(/^page-/,'')||''
  };
  window.FCCNavigation=api;
  window.fccNavigate=navigate;
  window.go=navigate;
  window.__fccDirectGo=navigate;
  window.addEventListener('pageshow',closeTransient);
})();
