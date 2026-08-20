(()=>{
  if(window.__fccVersionSyncV1Installed)return;
  window.__fccVersionSyncV1Installed=true;
  function version(){return String(window.FCC_RUNTIME_VERSION||'1.1.4')}
  function sync(){
    const v=version();document.querySelectorAll('.master-chip').forEach(el=>el.textContent='MASTER '+v);
    const page=document.getElementById('page-settings');
    if(page){
      let box=document.getElementById('fccRuntimeVersionCard');
      if(!box){box=document.createElement('div');box.id='fccRuntimeVersionCard';box.className='card full';box.innerHTML='<div class="row"><div><span class="eyebrow">APLICAÇÃO</span><h3 style="margin:2px 0">Versão instalada</h3><p>Versão real do runtime/PWA carregado neste dispositivo.</p></div><div class="spacer"></div><span class="badge good" id="fccRuntimeVersionBadge"></span></div>';const head=page.querySelector(':scope > .pagehead');const grid=page.querySelector(':scope > .grid');if(grid)grid.prepend(box);else if(head)head.after(box);else page.prepend(box)}
      const badge=document.getElementById('fccRuntimeVersionBadge');if(badge)badge.textContent='MASTER '+v;
      page.querySelectorAll('[id*="Version" i],[id*="version" i]').forEach(el=>{if(el.id==='activePackVersion'||el.id==='contentHealth'||el.id==='fccRuntimeVersionBadge')return;if(/^MASTER\s+\d/i.test(el.textContent.trim()))el.textContent='MASTER '+v});
    }
    document.documentElement.dataset.fccVersion=v;
  }
  const old=window.renderMaintenance;if(typeof old==='function')window.renderMaintenance=function(...args){const r=old.apply(this,args);setTimeout(sync,0);return r};
  window.fccSyncRuntimeVersion=sync;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();setTimeout(sync,300);setTimeout(sync,1200);
})();
