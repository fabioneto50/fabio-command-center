(()=>{
  if(window.__fccPersonalExpensesV2Installed)return;
  window.__fccPersonalExpensesV2Installed=true;
  function removeCentral(){document.querySelectorAll('.nav[data-page="expenses"]').forEach(x=>x.remove());document.getElementById('homeExpenseCard')?.remove()}
  function card(){
    const grid=document.getElementById('personalGrid'),page=document.getElementById('page-expenses');if(!grid||!page)return false;
    grid.querySelector('[data-personal-page="expenses"]')?.remove();
    const labels=[...page.querySelectorAll(':scope > .tabs > .tab')].map(x=>x.textContent.trim()).filter(Boolean),b=document.createElement('button');b.className='personal-area';b.type='button';b.dataset.personalPage='expenses';b.innerHTML=`<span class="personal-area-count">${labels.length} subtópicos</span><div class="personal-area-head"><span class="personal-area-code">€</span><div><h3>Despesas</h3><p>Registo, análise, orçamentos, recorrentes e relatórios.</p></div></div><div class="personal-mini-tabs">${labels.slice(0,5).map(x=>`<span>${String(x).replace(/[&<>"']/g,'')}</span>`).join('')}${labels.length>5?`<span>+${labels.length-5}</span>`:''}</div>`;b.addEventListener('click',()=>{if(typeof window.openCategoryMenu==='function')window.openCategoryMenu('expenses');else window.fccNavigate?.('expenses')});grid.appendChild(b);return true
  }
  function install(){removeCentral();window.FCCNavigation?.setParent('expenses','personal');card()}
  install();setTimeout(install,0);setTimeout(install,250);
  document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='personal')card()});
  window.fccRefreshPersonalExpenses=install;
})();
