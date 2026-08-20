(()=>{
  if(window.__fccPersonalExpensesV1Installed)return;
  window.__fccPersonalExpensesV1Installed=true;
  function removeCentral(){document.querySelectorAll('.nav[data-page="expenses"]').forEach(x=>x.remove());document.getElementById('homeExpenseCard')?.remove()}
  function card(){
    const grid=document.getElementById('personalGrid'),page=document.getElementById('page-expenses');if(!grid||!page)return false;
    if(grid.querySelector('[data-personal-page="expenses"]'))return true;
    const labels=[...page.querySelectorAll(':scope > .tabs > .tab')].map(x=>x.textContent.trim()).filter(Boolean);
    const b=document.createElement('button');b.className='personal-area';b.type='button';b.dataset.personalPage='expenses';
    b.innerHTML=`<span class="personal-area-count">${labels.length} subtópicos</span><div class="personal-area-head"><span class="personal-area-code">€</span><div><h3>Despesas</h3><p>Registo, análise, orçamentos, recorrentes e relatórios.</p></div></div><div class="personal-mini-tabs">${labels.slice(0,5).map(x=>`<span>${x.replace(/[&<>"']/g,'')}</span>`).join('')}${labels.length>5?`<span>+${labels.length-5}</span>`:''}</div>`;
    b.addEventListener('click',()=>{if(typeof window.openCategoryMenu==='function')window.openCategoryMenu('expenses');else window.go?.('expenses')});grid.appendChild(b);return true;
  }
  function wrapGo(){if(window.__fccPersonalExpenseGoWrapped)return;window.__fccPersonalExpenseGoWrapped=true;const old=window.go;if(typeof old==='function')window.go=function(p,...a){const r=old.call(this,p,...a);if(p==='expenses')document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page==='personal'));return r}}
  function watch(){const side=document.querySelector('nav.side');if(side)new MutationObserver(removeCentral).observe(side,{childList:true});const main=document.querySelector('.layout main');if(main)new MutationObserver(()=>{removeCentral();card()}).observe(main,{childList:true});}
  const boot=()=>{removeCentral();wrapGo();watch();if(!card())setTimeout(boot,180)};boot();
})();
