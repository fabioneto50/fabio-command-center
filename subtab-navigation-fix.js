(()=>{
  if(window.__fccSubtabNavigationFixV3Installed)return;
  window.__fccSubtabNavigationFixV3Installed=true;

  const parseTarget=tab=>{
    const data=tab?.dataset?.subId||'';
    if(data)return data;
    const code=tab?.getAttribute('onclick')||tab?.dataset?.originalOnclick||'';
    return code.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||'';
  };

  function pageTabs(page){
    return [...page.querySelectorAll('.tabs > .tab')].filter(t=>t.closest('.page')===page);
  }
  function pageSubs(page){
    return [...page.querySelectorAll('.sub')].filter(s=>s.closest('.page')===page);
  }

  function activate(tab,id=parseTarget(tab)){
    const page=tab?.closest?.('.page');
    const target=id?document.getElementById(id):null;
    if(!page||!target||target.closest('.page')!==page)return false;

    pageSubs(page).forEach(s=>s.classList.remove('active'));
    pageTabs(page).forEach(t=>{
      t.classList.remove('active');
      t.setAttribute('aria-selected','false');
      t.tabIndex=-1;
    });
    target.classList.add('active');
    tab.classList.add('active');
    tab.setAttribute('aria-selected','true');
    tab.tabIndex=0;

    try{
      if(id==='clin-cases'&&typeof window.currentCase!=='undefined'&&!window.currentCase&&typeof window.newCase==='function')window.newCase();
    }catch(e){}

    window.dispatchEvent(new CustomEvent('fcc-subtab-change',{detail:{page:page.id.replace(/^page-/,''),id}}));
    return true;
  }

  function bind(tab){
    const id=parseTarget(tab);if(!id||!document.getElementById(id))return;
    tab.dataset.subId=id;
    if(!tab.dataset.originalOnclick)tab.dataset.originalOnclick=tab.getAttribute('onclick')||'';
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',id);
    tab.setAttribute('aria-selected',tab.classList.contains('active')?'true':'false');
    tab.type='button';

    // O handler é colocado diretamente na tab. Isto evita diferenças entre desktop/mobile
    // causadas por listeners globais em capture, drag/reorder e handlers inline antigos.
    tab.onclick=function(e){
      e?.preventDefault?.();
      e?.stopPropagation?.();
      activate(tab,id);
      return false;
    };
    tab.onkeydown=function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(tab,id);return}
      if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
      e.preventDefault();const page=tab.closest('.page'),all=pageTabs(page),i=all.indexOf(tab),delta=e.key==='ArrowRight'?1:-1,next=all[(i+delta+all.length)%all.length];next?.focus();activate(next,parseTarget(next));
    };
  }

  function bindAll(root=document){
    root.querySelectorAll?.('.page .tabs > .tab').forEach(tab=>{if(tab.closest('.page'))bind(tab)});
  }

  // Mantém compatibilidade com qualquer chamada subtab() existente no código antigo.
  window.subtab=function(group,id,btn){
    if(btn&&activate(btn,id))return false;
    const page=document.getElementById('page-'+group);if(!page)return false;
    const tab=pageTabs(page).find(t=>parseTarget(t)===id);return tab?activate(tab,id):false;
  };

  const observer=new MutationObserver(records=>{
    let needed=false;
    for(const r of records){if(r.addedNodes?.length){needed=true;break}}
    if(needed)queueMicrotask(()=>bindAll());
  });
  const start=()=>{bindAll();observer.observe(document.body,{childList:true,subtree:true})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.fccActivateSubcategory=(pageName,id)=>{
    const page=document.getElementById('page-'+pageName);if(!page)return false;
    const tab=pageTabs(page).find(t=>parseTarget(t)===id);return tab?activate(tab,id):false;
  };
  window.fccRebindSubcategories=()=>bindAll();
})();
