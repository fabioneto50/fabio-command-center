(()=>{
  if(window.__fccVersionSyncV1Installed)return;
  window.__fccVersionSyncV1Installed=true;

  function version(){return String(window.FCC_RUNTIME_VERSION||document.documentElement.dataset.fccRuntimeVersion||'1.2.0').replace(/^MASTER\s*/i,'').trim()}
  function ensureCard(page){
    let box=document.getElementById('fccRuntimeVersionCard');
    if(box)return box;
    box=document.createElement('div');box.id='fccRuntimeVersionCard';box.className='card full';
    box.innerHTML='<div class="row"><div><span class="eyebrow">APLICAÇÃO</span><h3 style="margin:2px 0">Versão instalada</h3><p>Atualizada automaticamente a partir da versão real do runtime/PWA carregado neste dispositivo.</p></div><div class="spacer"></div><span class="badge good" id="fccRuntimeVersionBadge"></span></div>';
    const head=page.querySelector(':scope > .pagehead'),grid=page.querySelector(':scope > .grid');
    if(grid)grid.prepend(box);else if(head)head.after(box);else page.prepend(box);
    return box;
  }
  function sync(){
    const v=version(),label='MASTER '+v;
    document.querySelectorAll('.master-chip').forEach(el=>el.textContent=label);
    const page=document.getElementById('page-settings');
    if(page){
      ensureCard(page);
      const badge=document.getElementById('fccRuntimeVersionBadge');if(badge)badge.textContent=label;
      page.querySelectorAll('[id*="Version" i],[id*="version" i]').forEach(el=>{
        if(el.id==='activePackVersion'||el.id==='contentHealth'||el.id==='fccRuntimeVersionBadge')return;
        if(/^MASTER\s+\d/i.test(el.textContent.trim()))el.textContent=label;
      });
    }
    document.documentElement.dataset.fccVersion=v;
  }

  const oldMaintenance=window.renderMaintenance;
  if(typeof oldMaintenance==='function')window.renderMaintenance=function(...args){const r=oldMaintenance.apply(this,args);queueMicrotask(sync);return r};

  const oldGo=window.go;
  if(typeof oldGo==='function'&&!window.__fccVersionGoWrapped){
    window.__fccVersionGoWrapped=true;
    window.go=function(p,...args){const r=oldGo.call(this,p,...args);if(p==='settings')queueMicrotask(sync);return r};
  }

  function watchSettings(){
    const page=document.getElementById('page-settings');if(!page||page.dataset.fccVersionObserved==='1')return;
    page.dataset.fccVersionObserved='1';
    new MutationObserver(()=>{if(page.classList.contains('active'))sync()}).observe(page,{attributes:true,attributeFilter:['class']});
  }

  window.fccSyncRuntimeVersion=sync;
  window.addEventListener('pageshow',sync);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
  document.addEventListener('fcc-runtime-version-change',sync);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{watchSettings();sync()},{once:true});else{watchSettings();sync()}
  setTimeout(()=>{watchSettings();sync()},300);setTimeout(sync,1200);
})();