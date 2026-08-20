(()=>{
  if(window.__fccVersionSystemHealthV2Installed)return;
  window.__fccVersionSystemHealthV2Installed=true;
  const version=()=>String(window.FCC_RUNTIME_VERSION||document.documentElement.dataset.fccRuntimeVersion||'1.3.0').replace(/^MASTER\s*/i,'').trim();
  function sync(){const label='MASTER '+version(),page=document.getElementById('page-settings');document.querySelectorAll('.master-chip').forEach(x=>x.textContent=label);if(page){const app=[...page.querySelectorAll('.health')].find(x=>/^App$/i.test(x.querySelector('span')?.textContent.trim()||''));if(app?.querySelector('b'))app.querySelector('b').textContent=label;const badge=document.getElementById('fccRuntimeVersionBadge');if(badge)badge.textContent=label}document.documentElement.dataset.fccVersion=version()}
  document.addEventListener('fcc-runtime-version-change',sync);document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='settings')queueMicrotask(sync)});window.addEventListener('pageshow',sync);sync();
})();
