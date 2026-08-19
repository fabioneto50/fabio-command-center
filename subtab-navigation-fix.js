(()=>{
  if(window.__fccSubtabNavigationFixInstalled)return;
  window.__fccSubtabNavigationFixInstalled=true;

  function targetId(tab){
    const code=tab?.getAttribute('onclick')||'';
    return code.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||tab?.dataset?.subId||'';
  }

  function directSubs(page){
    return [...page.children].filter(x=>x.classList?.contains('sub'));
  }

  function directTabs(page){
    const wrap=[...page.children].find(x=>x.classList?.contains('tabs'));
    return wrap?[...wrap.children].filter(x=>x.classList?.contains('tab')):[];
  }

  function activate(tab,id=targetId(tab)){
    const page=tab?.closest?.('.page');
    const target=id?document.getElementById(id):null;
    if(!page||!target||!page.contains(target))return false;

    directSubs(page).forEach(x=>x.classList.remove('active'));
    directTabs(page).forEach(x=>x.classList.remove('active'));
    target.classList.add('active');
    tab.classList.add('active');

    try{
      if(id==='clin-cases'&&typeof window.currentCase!=='undefined'&&!window.currentCase&&typeof window.newCase==='function')window.newCase();
    }catch(e){}

    window.dispatchEvent(new CustomEvent('fcc-subtab-change',{detail:{page:page.id.replace(/^page-/,''),id}}));
    return true;
  }

  // Substitui o helper antigo por uma versão que trabalha apenas com as tabs/subs
  // de primeiro nível da página, evitando interferência de painéis internos.
  const oldSubtab=window.subtab;
  window.subtab=function(group,id,btn){
    if(btn&&activate(btn,id))return;
    if(typeof oldSubtab==='function')return oldSubtab(group,id,btn);
  };

  // Fallback robusto para todas as tabs atuais e futuras. A captura é instalada
  // depois da segurança da Família; por isso o PIN continua a poder bloquear
  // o clique antes de a navegação chegar aqui.
  document.addEventListener('click',e=>{
    const tab=e.target?.closest?.('.tab');
    if(!tab||!tab.parentElement?.classList.contains('tabs'))return;
    const page=tab.parentElement.parentElement;
    if(!page?.classList.contains('page'))return;
    const id=targetId(tab);
    if(!id||!document.getElementById(id))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    activate(tab,id);
  },true);

  window.fccActivateSubcategory=(pageName,id)=>{
    const page=document.getElementById('page-'+pageName);if(!page)return false;
    const tab=directTabs(page).find(t=>targetId(t)===id);return tab?activate(tab,id):false;
  };
})();
