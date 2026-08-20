(()=>{
  if(window.__fccClinicalCasesSeparateV3Installed)return;
  window.__fccClinicalCasesSeparateV3Installed=true;
  const ORDER_KEY='fcc-master-subcategory-order-v1';
  function targetOf(t){const on=t?.getAttribute('onclick')||'';return on.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||t?.dataset?.subId||''}
  function ensure(){
    const page=document.getElementById('page-clinical'),sepsis=document.getElementById('clin-sepsis');if(!page||!sepsis)return false;
    let section=document.getElementById('clin-cases');
    const merged=document.getElementById('merged-clin-cases');
    if(!section&&merged){
      section=document.createElement('div');section.className='sub';section.id='clin-cases';
      const body=merged.querySelector('.clin-merged-body');while(body?.firstChild)section.appendChild(body.firstChild);
      sepsis.after(section);merged.remove();
      [...sepsis.querySelectorAll('.clin-inner-nav button')].forEach(b=>{if(/^Casos$/i.test(b.textContent.trim()))b.remove()});
    }
    if(!section)return false;
    const tabs=page.querySelector(':scope > .tabs');if(!tabs)return false;
    let tab=[...tabs.querySelectorAll(':scope > .tab')].find(t=>targetOf(t)==='clin-cases');
    if(!tab){tab=document.createElement('button');tab.className='tab';tab.type='button';tab.dataset.subId='clin-cases';tab.textContent='Casos';tab.setAttribute('onclick',"subtab('clinical','clin-cases',this)");const st=[...tabs.children].find(t=>targetOf(t)==='clin-sepsis');if(st)st.after(tab);else tabs.appendChild(tab)}else tab.textContent='Casos';
    try{const saved=JSON.parse(localStorage.getItem(ORDER_KEY)||'{}')||{};let arr=Array.isArray(saved.clinical)?saved.clinical:[];if(!arr.includes('clin-cases')){const i=arr.indexOf('clin-sepsis');arr.splice(i>=0?i+1:arr.length,0,'clin-cases');saved.clinical=arr;localStorage.setItem(ORDER_KEY,JSON.stringify(saved))}}catch(e){}
    window.fccRebindSubcategories?.();
    return true;
  }
  const old=window.openClin;window.openClin=function(k,...a){if(String(k)==='cases'){const direct=window.__fccDirectGo||window.go;direct?.('clinical');setTimeout(()=>{const t=[...document.querySelectorAll('#page-clinical>.tabs>.tab')].find(x=>targetOf(x)==='clin-cases');t?.click()},0);return}return typeof old==='function'?old.call(this,k,...a):undefined};
  let tries=0;const boot=()=>{tries++;if(ensure()||tries>80)return;setTimeout(boot,120)};boot();
})();
