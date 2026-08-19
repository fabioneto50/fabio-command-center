(()=>{
  if(window.__fccDrugReferenceV2Installed)return;
  window.__fccDrugReferenceV2Installed=true;

  const DETAILS={
    'Noradrenalina':{group:'Vasopressor',aliases:['norepinefrina','norepinephrine'],prep:'2 mg + diluente q.s.p. 50 mL · exemplo de referência; confirmar produto e protocolo local.',source:'https://www.medicines.org.uk/emc/product/13172/smpc'},
    'Adrenalina':{group:'Catecolamina / vasopressor',aliases:['epinefrina','epinephrine'],prep:'A concentração de perfusão depende da apresentação e do protocolo institucional.',source:'https://www.medicines.org.uk/emc/product/2024/smpc'},
    'Dobutamina':{group:'Inotrópico',aliases:['dobutamine'],prep:'250 mg + diluente q.s.p. 50 mL · exemplo de referência; confirmar protocolo local.',source:'https://www.medicines.org.uk/emc/product/100017/smpc'},
    'Dopamina':{group:'Catecolamina',aliases:['dopamine'],prep:'Existem várias concentrações de perfusão descritas; confirmar a preparação utilizada no serviço.',source:'https://www.medicines.org.uk/emc/product/100811/smpc'},
    'Propofol':{group:'Sedativo-hipnótico',aliases:['propofol'],prep:'Solução 1% = 10 mg/mL; preferencialmente sem diluição no produto de referência.',source:'https://www.medicines.org.uk/emc/product/11295/smpc'},
    'Dexmedetomidina':{group:'Sedativo · agonista α2',aliases:['dexmedetomidine'],prep:'Preparações de 4 ou 8 mcg/mL são descritas no produto de referência.',source:'https://www.medicines.org.uk/emc/product/13154/smpc'},
    'Alfentanil':{group:'Opioide',aliases:['alfentanil'],prep:'Solução de origem 500 mcg/mL; pode ser diluída conforme protocolo.',source:'https://www.medicines.org.uk/emc/product/6427/smpc'},
    'Remifentanil':{group:'Opioide ultracurto',aliases:['remifentanil'],prep:'Reconstituir e depois diluir para perfusão; confirmar concentração final local.',source:'https://www.medicines.org.uk/emc/product/15232/smpc'},
    'Rocurónio':{group:'Bloqueador neuromuscular',aliases:['rocuronium'],prep:'Solução de origem 10 mg/mL; diluição possível conforme produto/protocolo.',source:'https://www.medicines.org.uk/emc/product/553/smpc'},
    'Insulina':{group:'Hipoglicemiante',aliases:['insulina regular','insulin'],prep:'A preparação IV depende do tipo de insulina e do protocolo. Não generalizar concentrações entre produtos.',source:'https://www.medicines.org.uk/emc/product/1640/smpc'},
    'Amiodarona':{group:'Antiarrítmico',aliases:['amiodarone'],prep:'O produto de referência utiliza glicose 5% para perfusão; confirmar apresentação e concentração.',source:'https://www.medicines.org.uk/emc/product/8739/smpc'},
    'Heparina':{group:'Anticoagulante',aliases:['heparina não fracionada','heparin'],prep:'A concentração final de perfusão deve seguir o protocolo/indicação local.',source:'https://www.medicines.org.uk/emc/product/1680/smpc'}
  };

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let activeIndex=-1,matches=[];

  function sourceDrugs(){
    try{
      const arr=(typeof contentPack!=='undefined'&&Array.isArray(contentPack?.drugs))?contentPack.drugs:[];
      return arr.map(d=>({...d,detail:DETAILS[d.name]||{group:d.cls||'Fármaco',aliases:[],prep:'Consultar protocolo/SmPC para preparação e administração.',source:''}}));
    }catch(e){return []}
  }

  function addStyles(){
    if(document.getElementById('drug-ref-v2-style'))return;
    const s=document.createElement('style');s.id='drug-ref-v2-style';s.textContent=`
      .drv2-shell{display:grid;gap:12px}.drv2-search-wrap{position:relative;max-width:720px}.drv2-search-wrap input{font-size:15px;padding:12px 40px 12px 13px}.drv2-search-wrap:after{content:'⌕';position:absolute;right:13px;top:9px;color:var(--muted);font-size:18px;pointer-events:none}.drv2-suggest{position:absolute;z-index:220;left:0;right:0;top:calc(100% + 5px);display:none;max-height:300px;overflow:auto;border:1px solid var(--line-strong);border-radius:14px;background:var(--panel);box-shadow:0 18px 55px rgba(0,0,0,.35);padding:5px}.drv2-suggest.open{display:block}.drv2-suggest button{width:100%;border:0;background:transparent;color:var(--text);padding:9px 10px;border-radius:10px;text-align:left;cursor:pointer}.drv2-suggest button:hover,.drv2-suggest button.active{background:var(--clinical-soft)}.drv2-suggest strong{font-size:10px}.drv2-suggest span{display:block;color:var(--muted);font-size:8px;margin-top:2px}
      .drv2-detail{border:1px solid var(--line);border-radius:18px;background:var(--panel);padding:15px}.drv2-head{display:flex;gap:10px;align-items:flex-start}.drv2-head h3{margin:0;font-size:22px}.drv2-head p{margin:4px 0 0;color:var(--muted);font-size:9px}.drv2-head .spacer{flex:1}.drv2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}.drv2-field{border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:10px}.drv2-field small{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.08em}.drv2-field div{font-size:9px;line-height:1.5;margin-top:4px}.drv2-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.drv2-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.drv2-mini{border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:11px;cursor:pointer;text-align:left;color:var(--text)}.drv2-mini:hover{border-color:var(--line-strong)}.drv2-mini strong{display:block;font-size:10px}.drv2-mini span{display:block;color:var(--muted);font-size:8px;margin-top:3px}.drv2-safety{font-size:9px;line-height:1.55}
      html[data-fcc-theme="light"] .drv2-suggest{box-shadow:0 18px 45px rgba(31,62,76,.16)}
      @media(max-width:700px){.drv2-grid,.drv2-list{grid-template-columns:1fr}.drv2-head{flex-wrap:wrap}.drv2-search-wrap{max-width:none}}
    `;document.head.appendChild(s);
  }

  function compatName(name){return ({Insulina:'Insulina regular',Heparina:'Heparina não fracionada'})[name]||name}

  window.openDrugCompat=function(name){
    if(typeof openClin==='function')openClin('ivcompat');
    setTimeout(()=>{
      const sel=document.getElementById('ivcDrugA');if(!sel)return;
      const wanted=fold(compatName(name));const opt=[...sel.options].find(o=>fold(o.textContent)===wanted||fold(o.value)===wanted);if(!opt)return;
      sel.value=opt.value;sel.dispatchEvent(new Event('change',{bubbles:true}));
      const input=sel.closest('.ivc-combo')?.querySelector('input');if(input)input.value=opt.textContent.trim();
    },120);
  };
  window.openDrugPerf=function(name){
    if(typeof openClin==='function')openClin('perf');
    setTimeout(()=>{const q=document.getElementById('perfDilutionSearch');if(q){q.value=name;window.renderPerfDilutions?.();q.focus()}},100);
  };

  function detailHTML(d){
    const x=d.detail||{};
    return `<article class="drv2-detail"><div class="drv2-head"><div><h3>${esc(d.name)}</h3><p>${esc(x.group||d.cls||'')} · ${esc(d.cls||'')}</p></div><div class="spacer"></div><span class="badge">Drug Reference</span></div><div class="drv2-grid"><div class="drv2-field"><small>Utilização clínica</small><div>${esc(d.use||'—')}</div></div><div class="drv2-field"><small>Monitorização</small><div>${esc(d.monitor||'—')}</div></div><div class="drv2-field"><small>Riscos / precauções</small><div>${esc(d.risks||'—')}</div></div><div class="drv2-field"><small>Preparação / administração IV</small><div>${esc(x.prep||'Consultar protocolo/SmPC.')}</div></div></div><div class="notice drv2-safety" style="margin-top:10px"><b>Dose:</b> esta referência não substitui protocolo institucional ou SmPC. Confirmar apresentação, concentração, indicação, função renal/hepática e contexto antes de administrar.</div><div class="drv2-actions"><button class="btn primary" type="button" onclick="openDrugCompat('${esc(d.name)}')">Compatibilidade IV</button><button class="btn" type="button" onclick="openDrugPerf('${esc(d.name)}')">Perfusões / diluição</button>${x.source?`<a class="btn" target="_blank" rel="noopener" href="${esc(x.source)}">SmPC / fonte ↗</a>`:''}</div></article>`;
  }

  function render(query=''){
    const grid=document.getElementById('drv2Results');if(!grid)return;
    const drugs=sourceDrugs(),q=fold(query);
    const rows=!q?drugs:drugs.filter(d=>fold([d.name,d.cls,d.use,d.monitor,d.risks,d.detail?.group,...(d.detail?.aliases||[])].join(' ')).includes(q));
    const exact=rows.find(d=>fold(d.name)===q||(d.detail?.aliases||[]).some(a=>fold(a)===q));
    if(exact){grid.innerHTML=detailHTML(exact);return}
    grid.innerHTML=rows.length?`<div class="drv2-list">${rows.map(d=>`<button type="button" class="drv2-mini" data-drug="${esc(d.name)}"><strong>${esc(d.name)}</strong><span>${esc(d.detail?.group||d.cls||'')}</span></button>`).join('')}</div>`:'<div class="item"><span>Sem correspondências nesta referência.</span></div>';
    grid.querySelectorAll('[data-drug]').forEach(b=>b.onclick=()=>selectDrug(b.dataset.drug));
  }

  function renderSuggest(){
    const input=document.getElementById('drv2Search'),box=document.getElementById('drv2Suggest');if(!input||!box)return;
    const q=fold(input.value),drugs=sourceDrugs();
    matches=drugs.filter(d=>!q||fold([d.name,...(d.detail?.aliases||[])].join(' ')).includes(q)).sort((a,b)=>{const aa=fold(a.name).startsWith(q)?0:1,bb=fold(b.name).startsWith(q)?0:1;return aa-bb||a.name.localeCompare(b.name,'pt')}).slice(0,10);activeIndex=-1;
    box.innerHTML=matches.length?matches.map((d,i)=>`<button type="button" data-i="${i}"><strong>${esc(d.name)}</strong><span>${esc(d.detail?.group||d.cls||'')}</span></button>`).join(''):'<div class="item"><span>Sem resultados.</span></div>';
    box.classList.add('open');box.querySelectorAll('[data-i]').forEach(b=>b.onmousedown=e=>{e.preventDefault();selectDrug(matches[+b.dataset.i].name)});
  }

  function selectDrug(name){const input=document.getElementById('drv2Search'),box=document.getElementById('drv2Suggest');if(input)input.value=name;box?.classList.remove('open');render(name)}

  function install(){
    const host=document.getElementById('clin-drugs');if(!host)return false;
    addStyles();host.innerHTML=`<div class="drv2-shell"><div class="pagehead" style="margin-top:0"><div><h3>Drug Reference</h3><p>Referência clínica rápida com pesquisa por nome, sinónimo, classe, utilização, monitorização e riscos.</p></div><span class="badge good">Pesquisa inteligente</span></div><div class="card full"><div class="drv2-search-wrap"><input id="drv2Search" autocomplete="off" spellcheck="false" placeholder="Escreve o nome do medicamento…"><div id="drv2Suggest" class="drv2-suggest"></div></div><div class="tiny" style="margin-top:6px">Ex.: noradrenalina, norepinephrine, propofol, heparina…</div></div><div id="drv2Results"></div></div>`;
    const input=document.getElementById('drv2Search'),box=document.getElementById('drv2Suggest');
    input.addEventListener('input',()=>{renderSuggest();render(input.value)});input.addEventListener('focus',renderSuggest);input.addEventListener('blur',()=>setTimeout(()=>box.classList.remove('open'),120));input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();activeIndex=Math.min(activeIndex+1,matches.length-1)}else if(e.key==='ArrowUp'){e.preventDefault();activeIndex=Math.max(activeIndex-1,0)}else if(e.key==='Enter'){e.preventDefault();if(activeIndex>=0&&matches[activeIndex])selectDrug(matches[activeIndex].name);else if(matches[0])selectDrug(matches[0].name)}else if(e.key==='Escape')box.classList.remove('open');box.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active',i===activeIndex))});
    render('');return true;
  }

  let n=0;const run=()=>{n++;if(install()||n>30)return;setTimeout(run,150)};run();
})();