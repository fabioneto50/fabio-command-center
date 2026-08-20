(()=>{
  if(window.__fccSubtabNavigationV4Installed)return;
  window.__fccSubtabNavigationV4Installed=true;
  function activate(group,id,btn){
    const page=btn?.closest?.('.page')||document.getElementById('page-'+group),target=document.getElementById(id);if(!page||!target||target.closest('.page')!==page)return false;
    page.querySelectorAll(':scope > .sub').forEach(x=>x.classList.remove('active'));
    page.querySelectorAll(':scope > .tabs > .tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});
    target.classList.add('active');if(btn){btn.classList.add('active');btn.setAttribute('aria-selected','true')}
    try{if(id==='clin-cases'&&typeof window.currentCase!=='undefined'&&!window.currentCase&&typeof window.newCase==='function')window.newCase()}catch(e){}
    document.dispatchEvent(new CustomEvent('fcc-subtab-change',{detail:{page:page.id.replace(/^page-/,''),id}}));return true
  }
  window.subtab=activate;
  window.fccActivateSubcategory=(page,id)=>{const p=document.getElementById('page-'+page),tab=[...(p?.querySelectorAll(':scope > .tabs > .tab')||[])].find(t=>{const c=t.getAttribute('onclick')||'';return c.includes(`'${id}'`)||c.includes(`"${id}"`)||t.dataset.subId===id});return tab?activate(page,id,tab):false};
  window.fccRebindSubcategories=()=>true;
  document.addEventListener('keydown',e=>{
    const tab=e.target.closest?.('.tabs > .tab');if(!tab||!['ArrowRight','ArrowLeft'].includes(e.key))return;const page=tab.closest('.page'),all=[...page.querySelectorAll(':scope > .tabs > .tab')],i=all.indexOf(tab),next=all[(i+(e.key==='ArrowRight'?1:-1)+all.length)%all.length];if(!next)return;e.preventDefault();next.focus();next.click();
  });
})();
