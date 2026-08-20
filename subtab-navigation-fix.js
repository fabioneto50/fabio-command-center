(()=>{
  if(window.__fccSubtabNavigationV5Installed)return;
  window.__fccSubtabNavigationV5Installed=true;

  function targetOf(tab){
    const data=tab?.dataset?.subId||'';
    if(data)return data;
    const code=tab?.getAttribute?.('onclick')||tab?.dataset?.originalOnclick||'';
    return code.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||'';
  }

  function activate(group,id,btn){
    const page=btn?.closest?.('.page')||document.getElementById('page-'+group);
    const target=document.getElementById(id);
    if(!page||!target||target.closest('.page')!==page)return false;

    page.querySelectorAll(':scope > .sub').forEach(x=>x.classList.remove('active'));
    page.querySelectorAll(':scope > .tabs > .tab').forEach(x=>{
      x.classList.remove('active');
      x.setAttribute('aria-selected','false');
    });

    target.classList.add('active');
    if(btn){
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
    }

    try{
      if(id==='clin-cases'&&typeof window.currentCase!=='undefined'&&!window.currentCase&&typeof window.newCase==='function')window.newCase();
    }catch(e){}

    document.dispatchEvent(new CustomEvent('fcc-subtab-change',{detail:{page:page.id.replace(/^page-/,''),id}}));
    return true;
  }

  function bindDynamicTab(tab){
    if(!tab||tab.dataset.fccSubtabBound==='1')return;
    const id=targetOf(tab);
    if(!id||!document.getElementById(id))return;

    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',id);
    if(!tab.hasAttribute('aria-selected'))tab.setAttribute('aria-selected',tab.classList.contains('active')?'true':'false');

    if(tab.getAttribute('onclick'))return;

    tab.dataset.fccSubtabBound='1';
    tab.addEventListener('click',e=>{
      e.preventDefault();
      const page=tab.closest('.page');
      if(!page)return;
      activate(page.id.replace(/^page-/,''),id,tab);
    });
  }

  function rebind(root=document){
    root.querySelectorAll?.('.page > .tabs > .tab').forEach(bindDynamicTab);
    return true;
  }

  window.subtab=activate;
  window.fccActivateSubcategory=(page,id)=>{
    const p=document.getElementById('page-'+page);
    const tab=[...(p?.querySelectorAll(':scope > .tabs > .tab')||[])].find(t=>targetOf(t)===id);
    return tab?activate(page,id,tab):false;
  };
  window.fccRebindSubcategories=rebind;

  document.addEventListener('keydown',e=>{
    const tab=e.target.closest?.('.tabs > .tab');
    if(!tab||!['ArrowRight','ArrowLeft'].includes(e.key))return;
    const page=tab.closest('.page');
    const all=[...page.querySelectorAll(':scope > .tabs > .tab')];
    const i=all.indexOf(tab);
    const next=all[(i+(e.key==='ArrowRight'?1:-1)+all.length)%all.length];
    if(!next)return;
    e.preventDefault();
    next.focus();
    next.click();
  });

  rebind();
})();
