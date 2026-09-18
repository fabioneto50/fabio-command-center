(()=>{
  if(window.__fccDilutionsCardUXV5Installed)return;
  window.__fccDilutionsCardUXV5Installed=true;

  function targetOf(tab){
    const on=tab?.getAttribute('onclick')||'';
    return on.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||tab?.dataset?.subId||'';
  }

  function renameDilutions(){
    const wrap=document.querySelector('#page-clinical > .tabs');
    const tab=[...(wrap?.querySelectorAll(':scope > .tab')||[])].find(t=>targetOf(t)==='clin-perf');
    if(tab&&tab.textContent.trim()!=='Diluições')tab.textContent='Diluições';
    const head=document.querySelector('#clin-perf .perf-head h3');
    if(head)head.textContent='Diluições · UCIP + Urgência';
  }

  function addStyles(){
    if(document.getElementById('ccd-card-ux-v5-style'))return;
    const s=document.createElement('style');
    s.id='ccd-card-ux-v5-style';
    s.textContent=`
      #perfDilutionGrid .ccd-doc-top{position:relative;cursor:pointer;border:1px solid transparent;border-radius:11px;padding:8px 34px 8px 8px;margin:-5px -5px 0;transition:border-color .14s ease,background .14s ease;outline:none}
      #perfDilutionGrid .ccd-doc-top:hover{border-color:var(--line-strong);background:rgba(98,212,255,.045)}
      #perfDilutionGrid .ccd-doc-top:focus-visible{border-color:var(--clinical);box-shadow:0 0 0 2px var(--clinical-soft)}
      #perfDilutionGrid .ccd-doc-top:after{content:'›';position:absolute;right:11px;top:50%;transform:translateY(-50%);font-size:18px;line-height:1;color:var(--muted);transition:transform .14s ease,color .14s ease}
      #perfDilutionGrid .ccd-doc-card.ccd-card-open>.ccd-doc-top:after{transform:translateY(-50%) rotate(90deg);color:var(--clinical)}
      #perfDilutionGrid .ccd-doc-card.ccd-card-open>.ccd-doc-top{border-color:rgba(98,212,255,.30);background:var(--clinical-soft)}
      #perfDilutionGrid .ccd-doc-details>summary{display:none!important}
      #perfDilutionGrid .ccd-doc-details{margin-top:10px}
      @media(max-width:760px){#perfDilutionGrid .ccd-doc-top{padding-right:34px}}
    `;
    document.head.appendChild(s);
  }

  function decorate(){
    renameDilutions();
    document.querySelectorAll('#perfDilutionGrid .ccd-doc-card').forEach(card=>{
      const top=card.querySelector(':scope > .ccd-doc-top');
      const details=card.querySelector(':scope > .ccd-doc-details');
      if(!top||!details)return;
      top.setAttribute('role','button');
      top.setAttribute('tabindex','0');
      top.setAttribute('aria-expanded',String(details.open));
      top.setAttribute('aria-label',(details.open?'Fechar ':'Abrir ')+(top.querySelector('h3')?.textContent?.trim()||'detalhes da medicação'));
      card.classList.toggle('ccd-card-open',details.open);
    });
  }

  function toggle(top){
    const card=top?.closest('.ccd-doc-card');
    const details=card?.querySelector(':scope > .ccd-doc-details');
    if(!card||!details)return;
    details.open=!details.open;
    card.classList.toggle('ccd-card-open',details.open);
    top.setAttribute('aria-expanded',String(details.open));
    top.setAttribute('aria-label',(details.open?'Fechar ':'Abrir ')+(top.querySelector('h3')?.textContent?.trim()||'detalhes da medicação'));
  }

  function install(){
    const host=document.getElementById('clin-perf');
    const grid=document.getElementById('perfDilutionGrid');
    if(!host||!grid)return false;
    addStyles();renameDilutions();decorate();

    grid.addEventListener('click',e=>{
      const top=e.target.closest('.ccd-doc-top');
      if(!top||!grid.contains(top))return;
      e.preventDefault();
      toggle(top);
    });
    grid.addEventListener('keydown',e=>{
      const top=e.target.closest('.ccd-doc-top');
      if(!top||!grid.contains(top)||(e.key!=='Enter'&&e.key!==' '))return;
      e.preventDefault();
      toggle(top);
    });

    const mo=new MutationObserver(()=>queueMicrotask(decorate));
    mo.observe(grid,{childList:true,subtree:true});
    const tabs=document.querySelector('#page-clinical > .tabs');
    if(tabs)new MutationObserver(()=>queueMicrotask(renameDilutions)).observe(tabs,{childList:true,subtree:true,characterData:true});
    setTimeout(decorate,150);
    setTimeout(decorate,700);
    return true;
  }

  let tries=0;
  const boot=()=>{tries++;if(install()||tries>60)return;setTimeout(boot,120)};
  boot();
})();
