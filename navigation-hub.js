(()=>{
  if(window.__fccCategoryHubInstalled) return;
  window.__fccCategoryHubInstalled=true;

  const originalGo=window.go;
  const originalSubtab=window.subtab;
  if(typeof originalGo!=='function'||typeof originalSubtab!=='function') return;

  const PAGE_META={
    clinical:{eyebrow:'CLINICAL OS',title:'Escolhe o módulo clínico',hint:'Cálculo, interpretação, workflows e consulta rápida.'},
    emergency:{eyebrow:'EMERGENCY',title:'Escolhe a área de preparação',hint:'Inventário, família, locais e resposta por cenário.'},
    comms:{eyebrow:'COMMS',title:'Escolhe a área de comunicações',hint:'Meshtastic, RF, telemetria, testes e configuração.'},
    garage:{eyebrow:'GARAGE',title:'Escolhe a área do Garage',hint:'Veículos, manutenção, custos, documentos e equipamento.'},
    research:{eyebrow:'RESEARCH',title:'Escolhe a área de investigação',hint:'Biblioteca, evidência, notas e referências.'},
    settings:{eyebrow:'SYSTEM',title:'Escolhe a área de configuração',hint:'Manutenção, dados, diagnóstico e definições.'}
  };

  const MODULE_META=[
    [/perfus/i,['IV','Perfusões e conversão dose ↔ débito']],
    [/ventil/i,['VM','Ventilação mecânica e GSA']],
    [/\becg\b/i,['ECG','Interpretação estruturada e treino']],
    [/hemodin/i,['MAP','Hemodinâmica e perfusão']],
    [/gasim/i,['GSA','Ácido-base e gasimetria']],
    [/eletr|electr/i,['K+','Eletrólitos e segurança']],
    [/drug|fármac/i,['Rx','Referência rápida de fármacos']],
    [/sépsis|sepsis|choque/i,['Σ','Sépsis, choque e ressuscitação']],
    [/\bavc\b|stroke/i,['CNS','AVC e reperfusão']],
    [/seda|delir/i,['RASS','Sedação, analgesia e delirium']],
    [/\bals\b|\bsav\b/i,['ALS','Suporte avançado de vida']],
    [/crrt|tsr/i,['CRRT','Terapia de substituição renal']],
    [/balanço|balanco|fluid/i,['±mL','Balanço hídrico']],
    [/escala/i,['▤','Escalas clínicas']],
    [/calcul/i,['ƒx','Calculadoras clínicas']],
    [/casos|case/i,['SIM','Casos e simulação']],
    [/admiss|uci|icu/i,['UCI','Admissão e checklist UCI']],
    [/transport/i,['TR','Transporte do doente crítico']],
    [/isbar|sbAR/i,['ISBAR','Comunicação estruturada']],
    [/fontes|source|refer/i,['REF','Fontes e verificação']],
    [/invent/i,['INV','Inventário e estado de preparação']],
    [/fam/i,['FAM','Família, contactos e responsabilidades']],
    [/local|ponto/i,['LOC','Locais e pontos de referência']],
    [/cenár|cenario|scenario/i,['PLAN','Planos por cenário']],
    [/mesh|node/i,['MESH','Nodes Meshtastic']],
    [/telemet/i,['TEL','Telemetria e sensores']],
    [/\brf\b|rádio|radio/i,['RF','Rádio e parâmetros RF']],
    [/teste|log/i,['LOG','Testes e registos']],
    [/africa|moto/i,['AT','Honda Africa Twin']],
    [/polaris|quad/i,['XP','Polaris']],
    [/manuten/i,['MNT','Manutenção preventiva']],
    [/custo|despesa/i,['€','Custos e histórico']],
    [/document/i,['DOC','Documentos e validade']],
    [/mod|acess/i,['MOD','Mods e acessórios']],
    [/bibli|artigo|paper/i,['LIB','Biblioteca de investigação']],
    [/guideline|guia/i,['GL','Guidelines']],
    [/nota/i,['NOTE','Notas e síntese']],
    [/manutenção|maintenance/i,['SYS','Maintenance Center']],
    [/backup|dados|data/i,['DATA','Backup e dados']],
    [/diagn/i,['QA','Diagnóstico do sistema']]
  ];

  function moduleMeta(label){
    for(const [re,data] of MODULE_META) if(re.test(label)) return data;
    const clean=label.replace(/[^A-Za-zÀ-ÿ0-9+]/g,'').slice(0,4).toUpperCase()||'OPEN';
    return [clean,'Abrir esta subcategoria'];
  }

  function directTabs(page){
    const wrap=page.querySelector('.tabs');
    if(!wrap) return {wrap:null,tabs:[]};
    const tabs=[...wrap.querySelectorAll('.tab')];
    return {wrap,tabs};
  }

  function ensureStyles(){
    if(document.getElementById('fcc-category-hub-style')) return;
    const style=document.createElement('style');
    style.id='fcc-category-hub-style';
    style.textContent=`
      .category-hub{display:none;margin:18px 0 6px;padding:18px;border:1px solid color-mix(in srgb,var(--accent,#62c4ff) 28%,transparent);border-radius:22px;background:linear-gradient(145deg,rgba(13,28,43,.86),rgba(7,17,27,.72));box-shadow:0 18px 60px rgba(0,0,0,.18)}
      .category-hub.active{display:block;animation:fccHubIn .18s ease-out}
      .category-hub-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin-bottom:16px}
      .category-hub-eyebrow{font-size:9px;letter-spacing:.18em;font-weight:900;color:var(--muted);text-transform:uppercase;margin-bottom:5px}
      .category-hub h3{font-size:clamp(20px,3vw,30px);margin:0;letter-spacing:-.025em}
      .category-hub-head p{margin:5px 0 0;color:var(--muted);font-size:11px;line-height:1.5}
      .category-hub-count{flex:0 0 auto;border:1px solid rgba(132,167,196,.22);border-radius:999px;padding:7px 10px;color:var(--muted);font-size:9px;background:rgba(255,255,255,.025)}
      .category-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      .category-card{position:relative;overflow:hidden;min-height:118px;text-align:left;border:1px solid rgba(132,167,196,.16);border-radius:17px;padding:15px;background:linear-gradient(145deg,rgba(16,34,50,.82),rgba(8,20,31,.76));color:var(--text);cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease}
      .category-card:before{content:'';position:absolute;inset:0 auto 0 0;width:2px;background:var(--section-accent,var(--accent,#62c4ff));opacity:.65}
      .category-card:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--section-accent,var(--accent,#62c4ff)) 48%,transparent);background:linear-gradient(145deg,rgba(20,43,62,.9),rgba(9,22,34,.82))}
      .category-card-code{display:inline-flex;align-items:center;justify-content:center;min-width:38px;height:30px;padding:0 8px;border-radius:9px;border:1px solid color-mix(in srgb,var(--section-accent,var(--accent,#62c4ff)) 30%,transparent);color:var(--section-accent,var(--accent,#62c4ff));font-size:10px;font-weight:950;letter-spacing:.04em;background:color-mix(in srgb,var(--section-accent,var(--accent,#62c4ff)) 7%,transparent)}
      .category-card strong{display:block;font-size:13px;margin-top:12px;line-height:1.25}
      .category-card small{display:block;font-size:9px;color:var(--muted);margin-top:5px;line-height:1.4}
      .category-card-arrow{position:absolute;right:13px;top:13px;color:var(--muted);font-size:13px}
      .category-tabs-hidden{display:none!important}
      .category-overview-btn{display:none;align-items:center;gap:7px;margin:12px 0 8px;border:1px solid rgba(132,167,196,.2);background:rgba(9,24,36,.66);color:var(--muted);padding:8px 11px;border-radius:10px;cursor:pointer;font-size:10px;font-weight:850}
      .category-overview-btn.visible{display:inline-flex}
      .category-overview-btn:hover{color:var(--text);border-color:rgba(132,167,196,.4)}
      #page-clinical{--section-accent:#58c8ff}#page-emergency{--section-accent:#f5b84b}#page-comms{--section-accent:#63d69a}#page-garage{--section-accent:#8db5d8}#page-research{--section-accent:#a88aff}#page-settings{--section-accent:#7ca8c9}
      @keyframes fccHubIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
      @media(max-width:1100px){.category-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:760px){.category-hub{padding:13px;margin-top:12px;border-radius:18px}.category-hub-head{align-items:flex-start;flex-direction:column;gap:8px}.category-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.category-card{min-height:105px;padding:13px}.category-card strong{font-size:12px}}
      @media(max-width:390px){.category-grid{grid-template-columns:1fr}.category-card{min-height:88px}}
    `;
    document.head.appendChild(style);
  }

  function ensureHub(pageName){
    const page=document.getElementById('page-'+pageName);
    if(!page) return null;
    const {wrap,tabs}=directTabs(page);
    if(!wrap||!tabs.length) return null;

    let hub=page.querySelector('.category-hub[data-page="'+pageName+'"]');
    if(!hub){
      hub=document.createElement('div');
      hub.className='category-hub';
      hub.dataset.page=pageName;
      page.insertBefore(hub,wrap);
    }

    let back=page.querySelector('.category-overview-btn[data-page="'+pageName+'"]');
    if(!back){
      back=document.createElement('button');
      back.type='button';
      back.className='category-overview-btn';
      back.dataset.page=pageName;
      back.innerHTML='<span>←</span><span>Todas as subcategorias</span>';
      back.addEventListener('click',()=>showHub(pageName));
      page.insertBefore(back,wrap);
    }

    const pm=PAGE_META[pageName]||{};
    const pageTitle=page.querySelector('.pagehead h2')?.textContent?.trim()||pageName;
    const grid=document.createElement('div');
    grid.className='category-grid';

    tabs.forEach(tab=>{
      const label=tab.textContent.trim();
      const [code,desc]=moduleMeta(label);
      const card=document.createElement('button');
      card.type='button';
      card.className='category-card';
      card.innerHTML=`<span class="category-card-code">${code}</span><span class="category-card-arrow">↗</span><strong></strong><small></small>`;
      card.querySelector('strong').textContent=label;
      card.querySelector('small').textContent=desc;
      card.addEventListener('click',()=>tab.click());
      grid.appendChild(card);
    });

    hub.replaceChildren();
    const head=document.createElement('div');
    head.className='category-hub-head';
    const copy=document.createElement('div');
    copy.innerHTML=`<div class="category-hub-eyebrow"></div><h3></h3><p></p>`;
    copy.querySelector('.category-hub-eyebrow').textContent=pm.eyebrow||pageTitle;
    copy.querySelector('h3').textContent=pm.title||('Escolhe uma área de '+pageTitle);
    copy.querySelector('p').textContent=pm.hint||'Seleciona a subcategoria que queres abrir.';
    const count=document.createElement('div');
    count.className='category-hub-count';
    count.textContent=tabs.length+' subcategorias';
    head.append(copy,count);
    hub.append(head,grid);
    return {page,hub,back,wrap,tabs};
  }

  function showHub(pageName){
    const parts=ensureHub(pageName);
    if(!parts) return false;
    const {page,hub,back,wrap,tabs}=parts;
    page.querySelectorAll('.sub.active').forEach(el=>el.classList.remove('active'));
    tabs.forEach(tab=>tab.classList.remove('active'));
    wrap.classList.add('category-tabs-hidden');
    back.classList.remove('visible');
    hub.classList.add('active');
    return true;
  }

  function showDetail(btn){
    const page=btn?.closest?.('.page');
    if(!page) return;
    const pageName=page.id.replace(/^page-/,'');
    const parts=ensureHub(pageName);
    if(!parts) return;
    parts.hub.classList.remove('active');
    parts.wrap.classList.remove('category-tabs-hidden');
    parts.back.classList.add('visible');
  }

  ensureStyles();

  window.go=function(pageName){
    const result=originalGo.apply(this,arguments);
    if(pageName!=='home') showHub(pageName);
    return result;
  };

  window.subtab=function(group,id,btn){
    showDetail(btn);
    return originalSubtab.apply(this,arguments);
  };

  const active=document.querySelector('.page.active');
  if(active&&active.id!=='page-home') showHub(active.id.replace(/^page-/,''));
})();
