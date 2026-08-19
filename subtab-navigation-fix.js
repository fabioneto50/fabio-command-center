(()=>{
  if(window.__fccSubtabNavigationFixInstalled)return;
  window.__fccSubtabNavigationFixInstalled=true;

  function targetId(tab){
    const data=tab?.dataset?.subId||'';
    if(data)return data;
    const code=tab?.getAttribute('onclick')||'';
    return code.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||'';
  }
  function tabWrap(page){return [...page.children].find(x=>x.classList?.contains('tabs'))||page.querySelector(':scope > .tabs')}
  function directTabs(page){const wrap=tabWrap(page);return wrap?[...wrap.querySelectorAll(':scope > .tab')]:[]}
  function directSubs(page){return [...page.children].filter(x=>x.classList?.contains('sub'))}

  function activate(tab,id=targetId(tab)){
    const wrap=tab?.closest?.('.tabs');
    const page=wrap?.closest?.('.page');
    const target=id?document.getElementById(id):null;
    if(!wrap||!page||!target||!page.contains(target))return false;

    directSubs(page).forEach(x=>x.classList.remove('active'));
    directTabs(page).forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});
    target.classList.add('active');
    tab.classList.add('active');tab.setAttribute('aria-selected','true');

    try{
      if(id==='clin-cases'&&typeof window.currentCase!=='undefined'&&!window.currentCase&&typeof window.newCase==='function')window.newCase();
    }catch(e){}

    window.dispatchEvent(new CustomEvent('fcc-subtab-change',{detail:{page:page.id.replace(/^page-/,''),id}}));
    return true;
  }

  function prepareTabs(root=document){
    root.querySelectorAll?.('.page > .tabs > .tab').forEach(tab=>{
      const id=targetId(tab);if(!id)return;
      tab.dataset.subId=id;
      tab.setAttribute('role','tab');
      tab.setAttribute('aria-controls',id);
      tab.setAttribute('aria-selected',tab.classList.contains('active')?'true':'false');
    });
  }

  const oldSubtab=window.subtab;
  window.subtab=function(group,id,btn){
    if(btn&&activate(btn,id))return;
    if(typeof oldSubtab==='function')return oldSubtab(group,id,btn);
  };

  // Captura global robusta. Usa closest() em vez de depender da estrutura exata
  // pai/avô, o que evita falhas no desktop quando outros módulos reorganizam as tabs.
  document.addEventListener('click',e=>{
    const tab=e.target?.closest?.('.page > .tabs > .tab');
    if(!tab)return;
    const id=targetId(tab);if(!id)return;
    const target=document.getElementById(id);if(!target)return;
    e.preventDefault();e.stopImmediatePropagation();
    activate(tab,id);
  },true);

  // Também cobre ativação por teclado em desktop.
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const tab=e.target?.closest?.('.page > .tabs > .tab');if(!tab)return;
    e.preventDefault();activate(tab,targetId(tab));
  },true);

  const observer=new MutationObserver(m=>{if(m.some(x=>x.addedNodes.length))prepareTabs()});
  const start=()=>{prepareTabs();observer.observe(document.body,{childList:true,subtree:true})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.fccActivateSubcategory=(pageName,id)=>{
    const page=document.getElementById('page-'+pageName);if(!page)return false;
    const tab=directTabs(page).find(t=>targetId(t)===id);return tab?activate(tab,id):false;
  };
})();
