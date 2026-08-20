(()=>{
  if(window.__fccNavV3Installed)return;
  window.__fccNavV3Installed=true;
  const CATEGORY_PAGES=new Set(['clinical','emergency','comms','garage','research']);
  const PAGE_META={
    clinical:{title:'Clinical OS',eyebrow:'CLINICAL',hint:'Escolhe primeiro o módulo que queres abrir.'},
    emergency:{title:'Emergency',eyebrow:'EMERGENCY',hint:'Escolhe inventário, família, cenários ou notas.'},
    comms:{title:'Comms',eyebrow:'COMMS',hint:'Escolhe a área de comunicações e telemetria.'},
    garage:{title:'Garage',eyebrow:'GARAGE',hint:'Escolhe o veículo ou área de gestão.'},
    research:{title:'Research',eyebrow:'RESEARCH',hint:'Escolhe biblioteca, referências ou notas.'},
    expenses:{title:'Despesas',eyebrow:'PESSOAL',hint:'Escolhe a área financeira que queres abrir.'}
  };
  const META=[
    [/perfus/i,['IV','Perfusões e diluições']],[/ventil/i,['VM','Ventilação mecânica e GSA']],[/\becg\b/i,['ECG','Interpretação estruturada e treino']],[/hemodin/i,['MAP','Hemodinâmica e perfusão']],[/gasim/i,['GSA','Ácido-base e gasimetria']],[/eletr|electr/i,['K+','Eletrólitos e segurança']],[/drug|fármac|medica/i,['Rx','Referência rápida de fármacos']],[/sépsis|sepsis|choque/i,['Σ','Sépsis, choque e ressuscitação']],[/\bavc\b|stroke/i,['CNS','AVC e reperfusão']],[/seda|delir/i,['RASS','Sedação, analgesia e delirium']],[/\bals\b|\bsav\b/i,['ALS','Suporte avançado de vida']],[/crrt|tsr/i,['CRRT','Terapia de substituição renal']],[/balanço|fluid/i,['±mL','Balanço hídrico']],[/escala/i,['▤','Escalas clínicas']],[/calcul/i,['ƒx','Calculadoras clínicas']],[/casos|case/i,['SIM','Casos e simulação']],[/admiss|uci|icu/i,['UCI','Admissão e checklist UCI']],[/transport/i,['TR','Transporte crítico']],[/isbar/i,['ISBAR','Comunicação estruturada']],[/fontes|source/i,['REF','Fontes e verificação']],[/material|penso/i,['MAT','Materiais e stock']],
    [/invent/i,['INV','Inventário e preparação']],[/fam/i,['FAM','Família e contactos']],[/cenár|scenario/i,['PLAN','Planos por cenário']],[/nota/i,['NOTE','Notas']],[/mesh|node/i,['MESH','Nodes Meshtastic']],[/telemet/i,['TEL','Telemetria e sensores']],[/\brf\b|rádio|radio/i,['RF','Rádio e parâmetros RF']],[/teste|log/i,['LOG','Testes e registos']],[/africa|moto/i,['AT','Honda Africa Twin']],[/polaris|quad/i,['XP','Polaris']],[/manuten/i,['MNT','Manutenção preventiva']],[/custo|despesa/i,['€','Custos e histórico']],[/document/i,['DOC','Documentos e validade']],[/mod|acess/i,['MOD','Mods e acessórios']],[/bibli|artigo|paper/i,['LIB','Biblioteca']],[/guideline|guia/i,['GL','Guidelines']]
  ];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function meta(label){for(const [re,data] of META)if(re.test(label))return data;return [label.slice(0,4).toUpperCase(),'Abrir esta subcategoria']}
  function getTabs(pageName){const page=document.getElementById('page-'+pageName);return page?[...page.querySelectorAll(':scope > .tabs > .tab')]:[]}
  function closeMenu(){document.getElementById('fcc-sheet-backdrop')?.classList.remove('open');document.getElementById('fcc-category-sheet')?.classList.remove('open')}
  function ensureUI(){
    if(document.getElementById('fcc-category-sheet'))return;
    const style=document.createElement('style');style.id='fcc-category-style-v3';style.textContent=`
      .fcc-sheet-backdrop{position:fixed;inset:0;background:rgba(1,7,12,.72);z-index:190;opacity:0;pointer-events:none;transition:.16s ease}.fcc-sheet-backdrop.open{opacity:1;pointer-events:auto}
      .fcc-category-sheet{position:fixed;z-index:191;left:230px;top:84px;width:min(620px,calc(100vw - 260px));max-height:calc(100vh - 110px);overflow:auto;border:1px solid rgba(111,164,201,.28);border-radius:24px;background:linear-gradient(160deg,rgba(8,22,34,.99),rgba(5,13,22,.99));box-shadow:0 30px 80px rgba(0,0,0,.5);padding:18px;opacity:0;transform:translateY(6px);pointer-events:none;transition:.16s ease}.fcc-category-sheet.open{opacity:1;transform:none;pointer-events:auto}
      .fcc-sheet-head{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;margin-bottom:15px}.fcc-sheet-head h3{margin:2px 0 4px;font-size:25px}.fcc-sheet-head p{margin:0;color:var(--muted);font-size:11px}.fcc-sheet-eyebrow{font-size:9px;letter-spacing:.18em;color:#82d8ff;font-weight:900}.fcc-sheet-close{width:38px;height:38px;border-radius:12px;border:1px solid var(--line);background:var(--panel-2);color:var(--text);font-size:18px}
      .fcc-subgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.fcc-subitem{display:grid;grid-template-columns:48px minmax(0,1fr) 20px;align-items:center;gap:11px;width:100%;text-align:left;border:1px solid rgba(105,148,181,.18);background:rgba(9,24,37,.72);color:var(--text);padding:12px;border-radius:16px}.fcc-subcode{width:48px;height:48px;display:grid;place-items:center;border-radius:13px;background:var(--clinical-soft);border:1px solid rgba(100,204,255,.22);font-size:10px;font-weight:950;color:var(--clinical)}.fcc-subitem strong{display:block;font-size:12px}.fcc-subitem small{display:block;color:var(--muted);font-size:9px;margin-top:3px}.fcc-subarrow{color:#7ba0bd;font-size:15px}
      @media(max-width:920px){.fcc-category-sheet{left:14px;right:14px;top:auto;bottom:82px;width:auto;max-height:72vh}.fcc-subgrid{grid-template-columns:1fr}.fcc-sheet-backdrop{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}}@media(max-width:640px){.fcc-category-sheet{left:8px;right:8px;bottom:76px;padding:14px}.fcc-sheet-head h3{font-size:22px}}
    `;document.head.appendChild(style);
    const backdrop=document.createElement('div');backdrop.id='fcc-sheet-backdrop';backdrop.className='fcc-sheet-backdrop';
    const sheet=document.createElement('section');sheet.id='fcc-category-sheet';sheet.className='fcc-category-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
    document.body.append(backdrop,sheet);backdrop.addEventListener('click',closeMenu);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  }
  function openMenu(pageName){
    ensureUI();const tabs=getTabs(pageName);if(!tabs.length){window.fccNavigate?.(pageName);return}
    const info=PAGE_META[pageName]||{title:pageName,eyebrow:'MENU',hint:'Escolhe uma subcategoria.'};const sheet=document.getElementById('fcc-category-sheet');
    sheet.innerHTML=`<div class="fcc-sheet-head"><div><div class="fcc-sheet-eyebrow">${esc(info.eyebrow)}</div><h3>${esc(info.title)}</h3><p>${esc(info.hint)}</p></div><button type="button" class="fcc-sheet-close" aria-label="Fechar">×</button></div><div class="fcc-subgrid"></div>`;
    sheet.querySelector('.fcc-sheet-close').addEventListener('click',closeMenu);const grid=sheet.querySelector('.fcc-subgrid');
    tabs.forEach(tab=>{const label=tab.textContent.trim(),[code,desc]=meta(label),b=document.createElement('button');b.type='button';b.className='fcc-subitem';b.innerHTML=`<span class="fcc-subcode">${esc(code)}</span><span><strong>${esc(label)}</strong><small>${esc(desc)}</small></span><span class="fcc-subarrow">›</span>`;b.addEventListener('click',()=>{closeMenu();window.fccNavigate?.(pageName,{after:()=>tab.click()})});grid.appendChild(b)});
    document.getElementById('fcc-sheet-backdrop').classList.add('open');sheet.classList.add('open');
  }
  window.openCategoryMenu=openMenu;window.closeCategoryMenu=closeMenu;
  document.addEventListener('click',e=>{
    const nav=e.target.closest('.nav[data-page]');if(nav&&CATEGORY_PAGES.has(nav.dataset.page)){e.preventDefault();e.stopImmediatePropagation();openMenu(nav.dataset.page);return}
    const home=e.target.closest('#page-home [onclick]');if(home){const m=(home.getAttribute('onclick')||'').match(/go\(['\"](clinical|emergency|comms|garage|research)['\"]\)/);if(m){e.preventDefault();e.stopImmediatePropagation();openMenu(m[1])}}
  },true);
})();
