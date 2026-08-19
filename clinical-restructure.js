(()=>{
  if(window.__fccClinicalRestructureInstalled)return;
  window.__fccClinicalRestructureInstalled=true;

  const ORDER_KEY='fcc-master-subcategory-order-v1';
  const MIGRATION_KEY='fcc-clinical-layout-compact-v1';
  const DESIRED=['clin-ivcompat','clin-material','clin-perf','clin-vent','clin-ecg','clin-hemo','clin-abg','clin-drugs','clin-sepsis','clin-transport','clin-sources'];
  const MERGED_MAP={
    elec:'hemo',fluid:'hemo',scales:'hemo',
    stroke:'sepsis',sed:'sepsis',als:'sepsis',crrt:'sepsis',cases:'sepsis',
    isbar:'transport'
  };

  function targetOf(tab){
    const on=tab?.getAttribute('onclick')||'';
    return on.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||tab?.dataset?.subId||'';
  }
  function tabsWrap(){return document.querySelector('#page-clinical > .tabs')}
  function tabs(){return [...(tabsWrap()?.querySelectorAll(':scope > .tab')||[])]}
  function tabByTarget(id){return tabs().find(t=>targetOf(t)===id)}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  function addStyles(){
    if(document.getElementById('fcc-clinical-compact-style'))return;
    const s=document.createElement('style');s.id='fcc-clinical-compact-style';s.textContent=`
      .clin-inner-nav{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 12px;padding:8px;border:1px solid var(--line);border-radius:14px;background:var(--panel-2)}
      .clin-inner-nav button{border:1px solid var(--line);background:var(--panel);color:var(--muted);border-radius:10px;padding:7px 9px;font-size:8px;font-weight:800;cursor:pointer}.clin-inner-nav button:hover{color:var(--text);border-color:var(--line-strong)}
      .clin-merge-stack{display:grid;gap:14px}.clin-merged-block{scroll-margin-top:120px;border-top:1px solid var(--line);padding-top:12px}.clin-merged-block:first-child{border-top:0;padding-top:0}.clin-merged-head{display:flex;gap:10px;align-items:flex-end;justify-content:space-between;margin:0 2px 8px}.clin-merged-head h3{margin:0;font-size:18px;letter-spacing:-.02em}.clin-merged-head span{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:900}.clin-merged-body>.grid{margin-top:0}
      html[data-fcc-theme="light"] .clin-inner-nav{background:#f7fafc!important}
      @media(max-width:640px){.clin-inner-nav{overflow:auto;flex-wrap:nowrap}.clin-inner-nav button{flex:0 0 auto}.clin-merged-head h3{font-size:16px}}
    `;document.head.appendChild(s);
  }

  function mergeInto(targetId,defs){
    const target=document.getElementById(targetId);if(!target||target.dataset.compactMerged==='1')return;
    const collected=[];
    defs.forEach(def=>{
      const src=document.getElementById(def.id);if(!src)return;
      collected.push({def,nodes:[...src.childNodes]});
      if(src!==target)src.remove();
    });
    target.textContent='';target.dataset.compactMerged='1';
    const nav=document.createElement('div');nav.className='clin-inner-nav';
    const stack=document.createElement('div');stack.className='clin-merge-stack';
    collected.forEach(({def,nodes},i)=>{
      const block=document.createElement('section');block.className='clin-merged-block';block.id='merged-'+def.id;
      const head=document.createElement('div');head.className='clin-merged-head';head.innerHTML=`<div><span>${esc(def.code||'CLINICAL')}</span><h3>${esc(def.title)}</h3></div>`;
      const body=document.createElement('div');body.className='clin-merged-body';nodes.forEach(n=>body.appendChild(n));
      block.append(head,body);stack.appendChild(block);
      const b=document.createElement('button');b.type='button';b.textContent=def.short||def.title;b.addEventListener('click',()=>block.scrollIntoView({behavior:'smooth',block:'start'}));nav.appendChild(b);
    });
    target.append(nav,stack);
  }

  function removeTabAndSection(id,removeSection=false){
    tabByTarget(id)?.remove();if(removeSection)document.getElementById(id)?.remove();
  }

  function setTabLabel(id,label){const t=tabByTarget(id);if(t)t.textContent=label}

  function reorder(){
    const wrap=tabsWrap();if(!wrap)return;
    const map=new Map(tabs().map(t=>[targetOf(t),t]));
    DESIRED.forEach(id=>{const t=map.get(id);if(t)wrap.appendChild(t)});
  }

  function migrateSavedOrder(){
    if(localStorage.getItem(MIGRATION_KEY)==='1')return;
    try{
      const saved=JSON.parse(localStorage.getItem(ORDER_KEY)||'{}')||{};
      saved.clinical=DESIRED.filter(id=>!!tabByTarget(id));
      localStorage.setItem(ORDER_KEY,JSON.stringify(saved));
      localStorage.setItem(MIGRATION_KEY,'1');
    }catch(e){}
  }

  function activateFirst(){
    const page=document.getElementById('page-clinical'),first=tabByTarget('clin-ivcompat')||tabs()[0];if(!page||!first)return;
    page.querySelectorAll(':scope > .sub').forEach(s=>s.classList.remove('active'));tabs().forEach(t=>t.classList.remove('active'));
    const id=targetOf(first);document.getElementById(id)?.classList.add('active');first.classList.add('active');
  }

  function overrideOpenClin(){
    window.openClin=function(k){
      const mapped=MERGED_MAP[k]||k;
      const target='clin-'+mapped;
      const direct=window.__fccDirectGo||window.go;
      direct?.('clinical');
      const t=tabByTarget(target);if(t){setTimeout(()=>t.click(),0);return}
    };
  }

  function install(){
    const page=document.getElementById('page-clinical');
    if(!page||!document.getElementById('clin-ivcompat')||!document.getElementById('clin-material'))return false;
    addStyles();

    mergeInto('clin-hemo',[
      {id:'clin-hemo',title:'Hemodinâmica',short:'Hemodinâmica',code:'MAP'},
      {id:'clin-elec',title:'Eletrólitos',short:'Eletrólitos',code:'K+ / Na+'},
      {id:'clin-fluid',title:'Balanço hídrico',short:'Balanço',code:'± mL'},
      {id:'clin-scales',title:'Escalas clínicas',short:'Escalas',code:'SCORES'}
    ]);
    mergeInto('clin-sepsis',[
      {id:'clin-sepsis',title:'Sépsis / Choque',short:'Sépsis / Choque',code:'SSC'},
      {id:'clin-stroke',title:'AVC',short:'AVC',code:'CNS'},
      {id:'clin-sed',title:'Sedação / Delirium',short:'Sedação',code:'RASS'},
      {id:'clin-als',title:'SAV / ALS',short:'SAV / ALS',code:'ALS'},
      {id:'clin-crrt',title:'TSR / CRRT',short:'TSR / CRRT',code:'CRRT'},
      {id:'clin-cases',title:'Casos clínicos',short:'Casos',code:'SIM'}
    ]);
    mergeInto('clin-transport',[
      {id:'clin-transport',title:'Transporte crítico',short:'Transporte',code:'TR'},
      {id:'clin-isbar',title:'ISBAR',short:'ISBAR',code:'HANDOVER'}
    ]);

    ['clin-elec','clin-fluid','clin-scales','clin-stroke','clin-sed','clin-als','clin-crrt','clin-cases','clin-isbar'].forEach(id=>removeTabAndSection(id,false));
    removeTabAndSection('clin-calcs',true);
    removeTabAndSection('clin-icu',true);

    setTabLabel('clin-hemo','Hemodinâmica e Escalas');
    setTabLabel('clin-transport','Transporte crítico + ISBAR');
    reorder();migrateSavedOrder();activateFirst();overrideOpenClin();

    setTimeout(()=>{try{if(document.getElementById('caseArea')&&!document.getElementById('caseArea').textContent.trim()&&typeof newCase==='function')newCase()}catch(e){}},0);
    return true;
  }

  let tries=0;const tick=()=>{tries++;if(install()||tries>40)return;setTimeout(tick,150)};tick();
})();