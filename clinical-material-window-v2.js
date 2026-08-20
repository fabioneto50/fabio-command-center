(()=>{
  if(window.__fccClinicalMaterialWindowV2Installed)return;
  window.__fccClinicalMaterialWindowV2Installed=true;
  function install(){
    const host=document.getElementById('clin-material'),frame=document.getElementById('materialStockFrame');if(!host||!frame)return false;
    if(!document.getElementById('material-window-v2-style')){const s=document.createElement('style');s.id='material-window-v2-style';s.textContent=`
      #clin-material .material-frame-card{min-height:84vh}
      #clin-material .material-frame{height:84vh;min-height:760px}
      #clin-material .material-frame-card.material-maximized{position:fixed;z-index:245;inset:10px;background:var(--panel);height:auto;min-height:0;box-shadow:0 24px 90px rgba(0,0,0,.55)}
      #clin-material .material-frame-card.material-maximized .material-frame{height:calc(100vh - 78px);min-height:0}
      @media(max-width:760px){#clin-material .material-frame-card{min-height:76vh}#clin-material .material-frame{height:76vh;min-height:620px}#clin-material .material-frame-card.material-maximized{inset:4px}#clin-material .material-frame-card.material-maximized .material-frame{height:calc(100vh - 72px)}}
    `;document.head.appendChild(s)}
    const card=frame.closest('.material-frame-card'),head=card?.querySelector('.material-frame-head');
    let btn=document.getElementById('materialExpandBtn');
    const restore=()=>{card?.classList.remove('material-maximized');if(btn)btn.textContent='Expandir';document.body.style.overflow=''};
    if(head&&!btn){btn=document.createElement('button');btn.id='materialExpandBtn';btn.type='button';btn.className='btn small';btn.textContent='Expandir';head.appendChild(btn);btn.addEventListener('click',()=>{const on=card.classList.toggle('material-maximized');btn.textContent=on?'Repor':'Expandir';document.body.style.overflow=on?'hidden':''})}
    document.addEventListener('fcc-subtab-change',e=>{if(e.detail?.page==='clinical'&&e.detail?.id!=='clin-material')restore()});
    return true;
  }
  let tries=0;const boot=()=>{tries++;if(install()||tries>60)return;setTimeout(boot,120)};boot();
})();
