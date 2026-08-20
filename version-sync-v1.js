(()=>{
  if(window.__fccVersionSyncV2Installed)return;
  window.__fccVersionSyncV2Installed=true;
  const version=()=>String(window.FCC_RUNTIME_VERSION||document.documentElement.dataset.fccRuntimeVersion||'1.3.0').replace(/^MASTER\s*/i,'').trim();
  function ensureCard(page){let box=document.getElementById('fccRuntimeVersionCard');if(box)return box;box=document.createElement('div');box.id='fccRuntimeVersionCard';box.className='card full';box.innerHTML='<div class="row"><div><span class="eyebrow">APLICAÇÃO</span><h3 style="margin:2px 0">Versão instalada</h3><p>Versão real do runtime carregado neste dispositivo.</p></div><div class="spacer"></div><span class="badge good" id="fccRuntimeVersionBadge"></span></div>';const grid=page.querySelector(':scope > .grid');if(grid)grid.prepend(box);else page.appendChild(box);return box}
  function sync(){const v=version(),label='MASTER '+v;document.querySelectorAll('.master-chip').forEach(el=>el.textContent=label);const page=document.getElementById('page-settings');if(page){ensureCard(page);const badge=document.getElementById('fccRuntimeVersionBadge');if(badge)badge.textContent=label}document.documentElement.dataset.fccVersion=v}
  window.fccSyncRuntimeVersion=sync;
  document.addEventListener('fcc-runtime-version-change',sync);document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='settings')queueMicrotask(sync)});window.addEventListener('pageshow',sync);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});sync();
})();
