(()=>{
  if(window.__fccMedicationSearchV8Installed)return;
  window.__fccMedicationSearchV8Installed=true;

  const EXPECTED=923;
  const PAGE=EXPECTED;
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const labels={
    q:'Resumo rápido',pd:'Classe / farmacodinâmica',use:'Utilização clínica',pk:'Farmacocinética',mon:'Monitorização',risk:'Riscos / precauções',renal:'Função renal',hepatic:'Função hepática',inter:'Interações relevantes',antidote:'Antídoto / reversão',nursing:'Pontos críticos de enfermagem',preg:'Gravidez e aleitamento',ger:'Idoso / fragilidade',peds:'Pediatria',obesity:'Obesidade / peso de dose',hd:'Hemodiálise / CRRT',ecmo:'ECMO',albumin:'Hipoalbuminemia',qt:'QT / ECG',neuro:'Risco neurofarmacológico',food:'Alimentos / álcool',crush:'Pode esmagar?',tube:'SNG / PEG',photo:'Fotossensibilidade',filter:'Filtro de linha',access:'PVC vs CVC',speed:'Velocidade máxima',ph:'pH / osmolaridade',extr:'Extravasamento',storage:'Conservação',high:'Medicamento de alto risco',lasa:'LASA',tdm:'TDM',narrow:'Janela terapêutica',onset:'Início / pico / duração',event:'Se acontecer X...'
  };
  const status={R1:'RCM/SmPC específico confirmado',R2:'RCM/SmPC direto confirmado',R1F:'Produto/concentração/via ainda em validação',R2F:'Formulação/produto ainda por fechar',R2I:'Monografia produto-específica por fechar',HIST:'Histórico / ressalva'};

  let DATA=[],selected='',timer=null;
  const byName=new Map();
  const host=()=>document.getElementById('clin-drugs');
  const input=()=>document.getElementById('med8Search');
  const group=()=>document.getElementById('med8Group');
  const results=()=>document.getElementById('med4Results');

  function styles(){
    if(document.getElementById('med8-style'))return;
    const s=document.createElement('style');s.id='med8-style';s.textContent=`
      .med8-shell{display:grid;gap:12px}.med8-tools{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,280px);gap:8px}.med8-tools input,.med8-tools select{width:100%;box-sizing:border-box}.med8-meta{display:flex;gap:7px;flex-wrap:wrap;align-items:center}.med8-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}.med8-empty{border:1px dashed var(--line);border-radius:12px;padding:16px;color:var(--muted);text-align:center}.med8-health{font-size:8px;color:var(--muted)}.med8-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.med8-field{border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:11px}.med8-field small{display:block;color:var(--clinical);font-weight:900;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px}.med8-field div{font-size:10px;line-height:1.58}.med8-source{margin-left:auto}@media(max-width:650px){.med8-tools{grid-template-columns:1fr}.med8-list{grid-template-columns:1fr}.med8-detail-grid{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function ivAvailable(name){
    const sel=document.getElementById('ivcDrugA');
    return !!sel&&[...sel.options].some(o=>fold(o.textContent)===fold(name)||fold(o.value)===fold(name));
  }

  function brandTerms(name){
    try{return (window.fccMedicationBrands?.brandsFor?.(name)||[]).map(x=>typeof x==='string'?x:x?.brand).filter(Boolean)}catch(e){return[]}
  }

  function current(){
    const q=fold(input()?.value),g=group()?.value||'';
    return DATA.filter(d=>{
      if(g&&d.g!==g)return false;
      if(!q)return true;
      const brands=brandTerms(d.n);
      return fold([d.n,d.g,d.q,d.pd,d.use,d.pk,d.mon,d.risk,...brands].join(' ')).includes(q);
    });
  }

  function detail(d){
    const fields=Object.entries(labels).filter(([k])=>d[k]);
    const iv=ivAvailable(d.n);
    return `<article class="med4-detail med8-detail"><div class="med4-head"><div><h3>${esc(d.n)}</h3><p>${esc(d.g||'Sem grupo')}${iv?' · IV / hospitalar':''}</p></div><div class="spacer"></div><span class="badge good">${esc(status[d.st]||'Em validação')}</span></div><div class="med4-mech"><small>Como funciona</small><div>${esc(d.pd||d.q||'Consultar a ficha clínica e o RCM/SmPC da apresentação concreta.')}</div></div><div class="med8-detail-grid">${fields.map(([k,l])=>`<section class="med8-field"><small>${esc(l)}</small><div>${esc(d[k])}</div></section>`).join('')}</div><div class="notice med4-warning"><b>Referência clínica:</b> confirmar RCM/SmPC, prescrição, protocolo institucional, indicação, via, concentração e apresentação concreta.</div><div class="med4-actions">${iv?`<button class="btn primary" type="button" data-med8-compat="${esc(d.n)}">Compatibilidade IV</button><button class="btn" type="button" data-med8-perf="${esc(d.n)}">Perfusões / diluição</button>`:''}${d.src?`<a class="btn med8-source" target="_blank" rel="noopener" href="${esc(d.src)}">RCM / fonte ↗</a>`:''}<button class="btn" type="button" data-med8-back>Voltar à lista</button></div></article>`;
  }

  function updateCount(rows){
    const count=document.getElementById('med8VisibleCount');
    if(count)count.textContent=`${rows.length} de ${DATA.length}`;
  }

  function render(){
    const root=results();if(!root)return;
    if(selected){const d=byName.get(fold(selected));if(d){root.innerHTML=detail(d);return}selected=''}
    const rows=current();
    root.innerHTML=rows.length?`<div class="med8-list">${rows.slice(0,PAGE).map(d=>`<button class="med4-mini" type="button" data-med8-name="${esc(d.n)}"><strong>${esc(d.n)}</strong><span>${esc(d.g||'Sem grupo')}</span></button>`).join('')}</div>`:`<div class="med8-empty">Sem correspondências.</div>`;
    updateCount(rows);
  }

  function schedule(){clearTimeout(timer);timer=setTimeout(()=>{selected='';render()},60)}
  function open(name){
    const d=byName.get(fold(name));if(!d)return false;
    selected=d.n;
    const q=input();if(q)q.value=d.n;
    render();
    requestAnimationFrame(()=>results()?.querySelector('.med8-detail')?.scrollIntoView({behavior:'smooth',block:'start'}));
    return true;
  }

  function install(){
    const A=window.FCCMedicationCatalogV7,H=host();
    if(!A||A.count!==EXPECTED||!H)return false;
    DATA=A.records.slice().sort((a,b)=>a.n.localeCompare(b.n,'pt',{sensitivity:'base'}));
    if(DATA.length!==EXPECTED)return false;
    byName.clear();for(const d of DATA)byName.set(fold(d.n),d);
    styles();
    const groups=[...new Set(DATA.map(d=>d.g).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt',{sensitivity:'base'}));
    H.innerHTML=`<div class="med8-shell"><div class="pagehead" style="margin-top:0"><div><h3>INFO Medicação</h3><p>Catálogo clínico modular completo, com pesquisa sobre as 923 fichas.</p></div><span class="badge good">${DATA.length} medicamentos</span></div><div class="card full"><div class="med8-tools"><input id="med8Search" autocomplete="off" spellcheck="false" placeholder="Pesquisar medicação por nome, grupo, conteúdo ou nome comercial…"><select id="med8Group"><option value="">Todos os grupos terapêuticos</option>${groups.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('')}</select></div><div class="med8-meta"><span class="badge">923 fichas carregadas</span><span class="badge" id="med8VisibleCount">923 de 923</span><span class="med8-health">Motor V8.1 · catálogo completo</span></div></div><div id="med4Results"></div></div>`;
    input().addEventListener('input',schedule,{passive:true});
    group().addEventListener('change',()=>{selected='';render()});
    H.addEventListener('click',e=>{
      const b=e.target.closest('[data-med8-name],[data-med8-back],[data-med8-compat],[data-med8-perf]');if(!b)return;
      if(b.hasAttribute('data-med8-name')){open(b.dataset.med8Name);return}
      if(b.hasAttribute('data-med8-back')){selected='';if(input())input().value='';render();return}
      if(b.hasAttribute('data-med8-compat')){window.openMed4Compat?.(b.dataset.med8Compat);return}
      if(b.hasAttribute('data-med8-perf')){window.openMed4Perf?.(b.dataset.med8Perf);return}
    });
    render();
    H.dataset.medicationEngine='v8-single';
    H.dataset.medicationCatalogCount=String(DATA.length);
    window.FCCMedicationSearchV8={
      version:'8.1.0',count:DATA.length,expected:EXPECTED,records:DATA,
      get ok(){return DATA.length===EXPECTED},
      search:q=>{const el=input();if(el)el.value=q||'';selected='';render();return current().map(d=>d.n)},
      open,
      clear:()=>{const el=input();if(el)el.value='';const g=group();if(g)g.value='';selected='';render()}
    };
    document.dispatchEvent(new CustomEvent('fcc-medication-search-v8-ready',{detail:{count:DATA.length,version:'8.1.0'}}));
    return true;
  }

  let tries=0;const run=()=>{if(install()||tries++>120)return;setTimeout(run,100)};run();
})();
