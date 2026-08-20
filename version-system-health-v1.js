(()=>{
  if(window.__fccVersionSystemHealthV1Installed)return;
  window.__fccVersionSystemHealthV1Installed=true;
  const version=()=>String(window.FCC_RUNTIME_VERSION||document.documentElement.dataset.fccRuntimeVersion||'1.2.0').replace(/^MASTER\s*/i,'').trim();
  function sync(){
    const label='MASTER '+version(),page=document.getElementById('page-settings');
    document.querySelectorAll('.master-chip').forEach(x=>x.textContent=label);
    if(!page)return;
    const app=[...page.querySelectorAll('.health')].find(x=>/^App$/i.test(x.querySelector('span')?.textContent.trim()||''));if(app?.querySelector('b'))app.querySelector('b').textContent=label;
    const badge=document.getElementById('fccRuntimeVersionBadge');if(badge)badge.textContent=label;
    document.documentElement.dataset.fccVersion=version();
  }
  const old=window.renderMaintenance;if(typeof old==='function')window.renderMaintenance=function(...a){const r=old.apply(this,a);queueMicrotask(sync);return r};
  window.addEventListener('pageshow',sync);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});document.addEventListener('fcc-runtime-version-change',sync);
  const page=document.getElementById('page-settings');if(page)new MutationObserver(()=>{if(page.classList.contains('active'))sync()}).observe(page,{attributes:true,attributeFilter:['class']});
  setTimeout(sync,0);setTimeout(sync,400);setTimeout(sync,1400);
})();
