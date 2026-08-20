(()=>{
  if(window.__fccResourceCleanupV1Installed)return;
  window.__fccResourceCleanupV1Installed=true;
  const STOCK='https://script.google.com/a/macros/jmellosaude.pt/s/AKfycbwT0u4ALCsK7x4mplTIEm5pJueq13mIWLcgGehaEp9JHFn5B5-OYSe_w3wZJd3YQLSj/exec';
  let lastSub='';
  function stopMaterial(){
    const f=document.getElementById('materialStockFrame');if(!f)return;
    if(f.src&&f.src!=='about:blank')f.dataset.fccSrc=f.src;
    if(f.src!=='about:blank')f.src='about:blank';
    document.querySelector('.material-frame-card.material-maximized')?.classList.remove('material-maximized');
    const b=document.getElementById('materialExpandBtn');if(b)b.textContent='Expandir';
    document.body.style.overflow='';
  }
  function startMaterial(){
    const f=document.getElementById('materialStockFrame');if(!f)return;
    if(!f.src||f.src==='about:blank')f.src=f.dataset.fccSrc||STOCK;
  }
  function clearECG(){
    document.getElementById('ecgPhotoClear')?.click();
    document.getElementById('ecgaReset')?.click();
    document.getElementById('ecg3Reset')?.click();
  }
  function onSub(e){
    const id=e.detail?.id||'';
    if(lastSub==='clin-material'&&id!=='clin-material')stopMaterial();
    if(id==='clin-material')startMaterial();
    if(lastSub==='clin-ecg'&&id!=='clin-ecg')clearECG();
    lastSub=id;
  }
  function onPage(e){
    const p=e.detail?.page||'';
    if(p!=='clinical'){stopMaterial();clearECG();lastSub=''}
    document.body.style.overflow='';
  }
  document.addEventListener('fcc-subtab-change',onSub);
  document.addEventListener('fcc-page-change',onPage);
  window.addEventListener('pagehide',()=>{stopMaterial();clearECG()});
  setTimeout(()=>{const f=document.getElementById('materialStockFrame');const active=document.getElementById('clin-material')?.classList.contains('active');if(f&&!active)stopMaterial()},0);
})();
