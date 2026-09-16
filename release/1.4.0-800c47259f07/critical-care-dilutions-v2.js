(()=>{
  if(window.__fccCriticalCareDilutionsV2Installed)return;
  window.__fccCriticalCareDilutionsV2Installed=true;

  const ASHP='https://www.ashp.org/-/media/assets/pharmacy-practice/s4s/docs/Adult-Infusion-Standards.pdf';
  const VCH='https://pdtm.vch.ca/';
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  // ASHP Standardize 4 Safety — Adult Continuous Infusion Standards, updated June 2026.
  // These are concentration standards, not automatic compounding recipes for every local product.
  const STANDARD={
    'Alteplase':'1 mg/mL',
    'Amiodarona':'1,8 mg/mL',
    'Argatroban':'1 mg/mL',
    'Bumetanida':'0,1 mg/mL · 0,25 mg/mL',
    'Cisatracúrio':'2 mg/mL · não diluído',
    'Dexmedetomidina':'4 mcg/mL',
    'Diltiazem':'1 mg/mL',
    'Dobutamina':'2 mg/mL · 4 mg/mL',
    'Dopamina':'1,6 mg/mL · 3,2 mg/mL',
    'Adrenalina':'20 mcg/mL · 40 mcg/mL',
    'Esmolol':'10 mg/mL · 20 mg/mL',
    'Fentanilo':'10 mcg/mL · 50 mcg/mL',
    'Furosemida':'2 mg/mL · 10 mg/mL',
    'Heparina não fracionada':'100 UI/mL',
    'Hidromorfona':'0,2 mg/mL · 1 mg/mL · 5 mg/mL',
    'Insulina regular':'1 UI/mL · 16 UI/mL apenas em intoxicação por BCC/BB',
    'Isoprenalina':'4 mcg/mL',
    'Ketamina':'2 mg/mL · 10 mg/mL',
    'Labetalol':'1 mg/mL · 5 mg/mL',
    'Lidocaína':'8 mg/mL',
    'Lorazepam':'1 mg/mL',
    'Sulfato de magnésio':'40 mg/mL',
    'Midazolam':'1 mg/mL · 5 mg/mL',
    'Milrinona':'200 mcg/mL',
    'Morfina':'1 mg/mL · 5 mg/mL',
    'Naloxona':'16 mcg/mL · 40 mcg/mL',
    'Nicardipina':'0,1 mg/mL · 0,2 mg/mL · 0,5 mg/mL',
    'Nitroglicerina':'100 mcg/mL · 200 mcg/mL · 400 mcg/mL',
    'Nitroprussiato':'200 mcg/mL · 500 mcg/mL',
    'Noradrenalina':'16 mcg/mL · 32 mcg/mL · 64 mcg/mL',
    'Oxitocina':'0,06 UI/mL',
    'Fenilefrina':'80 mcg/mL · 400 mcg/mL',
    'Propofol':'10 mg/mL · não diluído',
    'Rocurónio':'10 mg/mL · não diluído',
    'Ácido tranexâmico':'10 mg/mL',
    'Vasopressina':'0,2 UI/mL · 0,4 UI/mL · 1 UI/mL',
    'Vecurónio':'1 mg/mL'
  };

  // Product-specific preparations already present in the MASTER. They are retained and shown
  // separately from the ASHP standard concentration when the two are not identical.
  const PRODUCT={
    'Noradrenalina':{prep:'2 mg + diluente q.s.p. 50 mL',conc:'40 mcg/mL',diluent:'Glicose 5% ou NaCl 0,9%, dependendo do produto',note:'Exemplo de SmPC para concentrado 1 mg/mL. Existem também apresentações prontas a usar e outras concentrações.',source:'https://www.medicines.org.uk/emc/product/13172/smpc'},
    'Adrenalina':{prep:'Perfusão contínua: confirmar preparação institucional e apresentação',conc:'Sem concentração universal de produto',diluent:'Depende da apresentação/protocolo',note:'Não confundir apresentações de reanimação/bolus com uma concentração de perfusão contínua.',source:'https://www.medicines.org.uk/emc/product/2024/smpc'},
    'Dobutamina':{prep:'250 mg + diluente q.s.p. 50 mL',conc:'5 mg/mL',diluent:'Glicose 5%, NaCl 0,9% ou soluções indicadas no produto',note:'Exemplo de preparação por bomba de seringa no SmPC já integrado; pode diferir do standard ASHP.',source:'https://www.medicines.org.uk/emc/product/100017/smpc'},
    'Dopamina':{prep:'200 mg q.s.p. 250 mL · alternativa 200 mg q.s.p. 500 mL',conc:'800 mcg/mL · 400 mcg/mL',diluent:'NaCl 0,9%; glicose/salino; Ringer lactato conforme produto',note:'O SmPC apresenta várias concentrações finais; confirmar a preparação do serviço.',source:'https://www.medicines.org.uk/emc/product/100811/smpc'},
    'Propofol':{prep:'Propofol 1%: preferencialmente sem diluição',conc:'10 mg/mL',diluent:'Se diluído, seguir exatamente o SmPC da apresentação',note:'A emulsão e a apresentação são determinantes para manipulação e estabilidade.',source:'https://www.medicines.org.uk/emc/product/11295/smpc'},
    'Dexmedetomidina':{prep:'2 mL (100 mcg/mL) + 48 mL · alternativa 4 mL + 46 mL',conc:'4 mcg/mL · 8 mcg/mL',diluent:'Glicose 5%, Ringer/Ringer lactato, manitol ou NaCl 0,9% conforme produto',note:'O SmPC integrado descreve estas opções de preparação.',source:'https://www.medicines.org.uk/emc/product/13154/smpc'},
    'Alfentanil':{prep:'Solução 500 mcg/mL; pode ser diluída',conc:'Concentração final depende do protocolo',diluent:'NaCl 0,9%, glicose 5% ou Ringer lactato',note:'O SmPC confirma diluentes compatíveis, mas não define uma única concentração final de perfusão.',source:'https://www.medicines.org.uk/emc/product/6427/smpc'},
    'Remifentanil':{prep:'Reconstituir primeiro para ≈1 mg/mL; depois diluir para perfusão',conc:'50 mcg/mL recomendado em adultos para perfusão manual no SmPC integrado',diluent:'Água p/ injetáveis, glicose 5%, NaCl 0,9% e soluções indicadas no produto',note:'O SmPC integrado admite outras concentrações conforme técnica de administração.',source:'https://www.medicines.org.uk/emc/product/15232/smpc'},
    'Rocurónio':{prep:'Solução de origem 10 mg/mL',conc:'10 mg/mL não diluído no standard ASHP',diluent:'Se for necessária diluição, confirmar produto/protocolo',note:'Bloqueio neuromuscular exige sedoanalgesia adequada e monitorização.',source:'https://www.medicines.org.uk/emc/product/553/smpc'},
    'Insulina regular':{prep:'Perfusão IV: confirmar tipo de insulina e protocolo',conc:'ASHP: 1 UI/mL para perfusão habitual',diluent:'Confirmar SmPC da insulina usada e protocolo institucional',note:'A concentração de 16 UI/mL é uma recomendação ASHP específica para intoxicação por bloqueador dos canais de cálcio/beta-bloqueador.',source:'https://www.medicines.org.uk/emc/product/1640/smpc'},
    'Amiodarona':{prep:'Produto/apresentação e indicação determinam a preparação',conc:'ASHP S4S: 1,8 mg/mL',diluent:'Confirmar SmPC; várias apresentações requerem glicose 5%',note:'A antiga ficha do MASTER continha uma preparação específica de produto. O standard ASHP é mostrado separadamente.',source:'https://www.medicines.org.uk/emc/product/8739/smpc'},
    'Heparina não fracionada':{prep:'Perfusão IV: concentração final definida por protocolo/indicação',conc:'ASHP S4S: 100 UI/mL',diluent:'Confirmar produto e protocolo local',note:'A heparina tem múltiplas apresentações e utilizações; não extrapolar concentrações de flush/bolus para anticoagulação contínua.',source:'https://www.medicines.org.uk/emc/product/1680/smpc'}
  };

  const GROUPS={
    'Vasoativos / Inotrópicos':['Noradrenalina','Adrenalina','Vasopressina','Fenilefrina','Metaraminol','Dopamina','Dobutamina','Milrinona','Levosimendano','Isoprenalina'],
    'Cardiovascular / Antiarrítmicos':['Amiodarona','Adenosina','Lidocaína','Diltiazem','Esmolol','Labetalol','Metoprolol IV','Nicardipina','Nitroglicerina','Nitroprussiato','Digoxina','Atropina','Furosemida','Bumetanida'],
    'Sedação / Analgesia / Anestesia':['Propofol','Midazolam','Dexmedetomidina','Ketamina','Fentanilo','Alfentanil','Remifentanil','Morfina','Hidromorfona','Lorazepam','Paracetamol IV','Metamizol IV','Tiopental'],
    'Bloqueio neuromuscular / Reversão':['Rocurónio','Cisatracúrio','Atracúrio','Vecurónio','Succinilcolina','Sugamadex','Neostigmina','Glicopirrolato'],
    'Anticoagulação / Hemostase / Fibrinólise':['Heparina não fracionada','Argatroban','Bivalirudina','Alteplase','Tenecteplase','Ácido tranexâmico','Protamina','Vitamina K IV','Concentrado complexo protrombínico','Fibrinogénio concentrado'],
    'Eletrólitos / Metabólico':['Cloreto de potássio','Fosfato de potássio','Fosfato de sódio','Sulfato de magnésio','Cloreto de cálcio','Gluconato de cálcio','Bicarbonato de sódio','Cloreto de sódio hipertónico','Glicose hipertónica','Insulina regular','Glucagon','Manitol'],
    'Neurologia / Convulsões':['Levetiracetam','Valproato de sódio','Fenitoína','Fosfenitoína','Lacosamida','Fenobarbital','Diazepam IV','Piridoxina IV'],
    'Antibacterianos':['Amoxicilina/ácido clavulânico','Ampicilina','Piperacilina/tazobactam','Flucloxacilina','Cefazolina','Cefuroxima','Cefotaxima','Ceftriaxona','Ceftazidima','Cefepima','Ceftazidima/avibactam','Aztreonam','Ertapenem','Imipenem/cilastatina','Meropenem','Gentamicina','Amicacina','Vancomicina','Teicoplanina','Daptomicina','Linezolida','Clindamicina','Metronidazol','Ciprofloxacina','Levofloxacina','Azitromicina IV','Trimetoprim/sulfametoxazol IV','Colistimetato de sódio','Fosfomicina IV'],
    'Antifúngicos / Antivirais':['Fluconazol','Voriconazol','Anfotericina B lipossómica','Anidulafungina','Caspofungina','Micafungina','Aciclovir','Ganciclovir','Foscarnet','Remdesivir'],
    'Antídotos / Toxicologia':['Naloxona','Flumazenil','Acetilcisteína','Hidroxocobalamina','Azul de metileno','Fomepizol','Digoxina Fab','Pralidoxima','Emulsão lipídica 20%'],
    'Gastrointestinal / Hepático':['Pantoprazol','Omeprazol IV','Octreótido','Terlipressina','Metoclopramida','Ondansetrom','Tiamina IV'],
    'Endócrino / Corticoterapia':['Hidrocortisona','Metilprednisolona','Dexametasona','Desmopressina'],
    'Respiratório / Broncoespasmo grave':['Terbutalina','Aminofilina','Salbutamol IV'],
    'Obstetrícia / Hemorragia crítica':['Oxitocina','Carbetocina']
  };

  const all=[];
  Object.entries(GROUPS).forEach(([group,names])=>names.forEach(name=>{
    if(!all.some(x=>x.name===name))all.push({name,group,standard:STANDARD[name]||'',product:PRODUCT[name]||null});
  }));

  function localPrepFor(drug){
    const n=fold(drug).replace(/\s+iv$/,'');
    const p=(window.state?.presets||[]).find(x=>fold(x.name).includes(n)||n.includes(fold(x.name)));
    return p?`${p.amount} ${p.unit} / ${p.vol} mL`:'';
  }

  function addStyles(){
    if(document.getElementById('cc-dil-v2-style'))return;
    const s=document.createElement('style');s.id='cc-dil-v2-style';s.textContent=`
      .ccd-meta{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 9px}.ccd-filter{min-width:230px}.ccd-ashp{border:1px solid rgba(114,227,167,.25);background:rgba(114,227,167,.06);border-radius:11px;padding:8px 9px;margin-top:8px}.ccd-ashp span,.ccd-prod span{display:block;font-size:7px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:900}.ccd-ashp b{display:block;margin-top:3px;font-size:10px;color:var(--good)}.ccd-prod{margin-top:8px;border:1px solid var(--line);border-radius:11px;padding:8px 9px;background:var(--panel-2)}.ccd-prod strong{display:block;font-size:9px;margin-top:3px}.ccd-prod p{margin:5px 0 0!important}.ccd-unverified{border-color:rgba(242,185,94,.25)!important}.ccd-source-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.ccd-source-row a{font-size:8px}.ccd-group{font-size:8px;color:var(--muted);margin-top:2px}.ccd-local{margin-top:7px;border:1px solid rgba(98,212,255,.2);border-radius:10px;padding:7px 8px}.ccd-local span{font-size:7px;color:var(--muted);display:block}.ccd-local b{font-size:9px}.ccd-banner{font-size:9px;line-height:1.55;margin:0 0 9px}
      html[data-fcc-theme="light"] .ccd-prod{background:#fff!important}
    `;document.head.appendChild(s);
  }

  function code(name){return fold(name).split(/[^a-z0-9]+/).filter(Boolean).slice(0,3).map(x=>x[0]).join('').toUpperCase()||'IV'}

  function render(){
    const q=fold(document.getElementById('perfDilutionSearch')?.value||'');
    const group=document.getElementById('ccdGroup')?.value||'';
    const only=document.getElementById('ccdOnlyVerified')?.checked||false;
    const grid=document.getElementById('perfDilutionGrid');if(!grid)return;
    const rows=all.filter(x=>(!group||x.group===group)&&(!only||x.standard||x.product)&&(!q||fold([x.name,x.group,x.standard,x.product?.prep,x.product?.conc,x.product?.diluent].join(' ')).includes(q)));
    grid.innerHTML=rows.map(x=>{
      const p=x.product,lp=localPrepFor(x.name),integrated=!!(x.standard||p);
      return `<article class="perf-dil-card ${integrated?'':'ccd-unverified'}">
        <div class="perf-dil-top"><div class="perf-dil-code">${esc(code(x.name))}</div><div class="perf-dil-title"><h3>${esc(x.name)}</h3><span>${integrated?'Dados integrados':'Catálogo UCIP/Urgência'}</span><div class="ccd-group">${esc(x.group)}</div></div></div>
        ${x.standard?`<div class="ccd-ashp"><span>ASHP S4S · concentração standard adulta · Jun 2026</span><b>${esc(x.standard)}</b></div>`:''}
        ${p?`<div class="ccd-prod"><span>Preparação / produto já integrado</span><strong>${esc(p.prep)}</strong><div class="perf-dil-line"><span>Concentração</span><b>${esc(p.conc)}</b></div><div class="perf-dil-line"><span>Diluente</span><b>${esc(p.diluent)}</b></div><p>${esc(p.note)}</p></div>`:`<div class="ccd-prod"><span>Preparação</span><strong>Confirmar apresentação, SmPC e protocolo institucional</strong><p>${x.standard?'A concentração standard está integrada, mas a receita de preparação depende da apresentação, volume final, estabilidade e stock local.':'Ainda não existe uma diluição específica validada nesta ficha. O medicamento permanece pesquisável para cobertura UCIP/Urgência.'}</p></div>`}
        ${lp?`<div class="ccd-local"><span>Preparação local guardada</span><b>${esc(lp)}</b></div>`:''}
        <div class="ccd-source-row">${x.standard?`<a class="perf-source" href="${ASHP}" target="_blank" rel="noopener">ASHP S4S ↗</a>`:''}${p?.source?`<a class="perf-source" href="${esc(p.source)}" target="_blank" rel="noopener">SmPC ↗</a>`:''}<a class="perf-source" href="${VCH}" target="_blank" rel="noopener">VCH PDTM ↗</a></div>
      </article>`;
    }).join('')||'<div class="item"><span>Sem resultados com estes filtros.</span></div>';
    const count=document.getElementById('ccdCount');if(count)count.textContent=`${rows.length}/${all.length} fármacos`;
  }

  function install(){
    const host=document.getElementById('clin-perf'),grid=document.getElementById('perfDilutionGrid'),toolbar=host?.querySelector('.perf-toolbar');
    if(!host||!grid||!toolbar)return false;
    if(document.getElementById('ccdGroup')){window.renderPerfDilutions=render;render();return true}
    addStyles();
    const head=host.querySelector('.perf-head h3');if(head)head.textContent='Diluições · UCIP + Urgência';
    const desc=host.querySelector('.perf-head p');if(desc)desc.textContent='Pesquisa de terapêutica parenteral crítica. Concentrações standard são separadas da preparação específica do produto.';
    const safety=host.querySelector('.perf-safety');if(safety)safety.innerHTML='<b>Segurança:</b> uma concentração standard não é automaticamente uma receita de preparação. Confirma sempre apresentação, concentração da ampola, diluente, volume final, via, estabilidade, compatibilidade e protocolo local.';

    const meta=document.createElement('div');meta.className='ccd-meta';meta.innerHTML=`<span class="badge good">ASHP S4S atualizado Jun 2026</span><span class="badge" id="ccdCount">${all.length} fármacos</span><span class="badge warn">UCIP + Urgência · catálogo amplo</span>`;toolbar.before(meta);
    const sel=document.createElement('select');sel.id='ccdGroup';sel.className='ccd-filter';sel.innerHTML=`<option value="">Todas as áreas UCIP/Urgência</option>${Object.keys(GROUPS).map(g=>`<option>${esc(g)}</option>`).join('')}`;toolbar.appendChild(sel);
    const lab=document.createElement('label');lab.className='badge';lab.style.cursor='pointer';lab.innerHTML='<input id="ccdOnlyVerified" type="checkbox" style="width:auto;margin-right:5px">Só com dados integrados';toolbar.appendChild(lab);
    const banner=document.createElement('div');banner.className='notice ccd-banner';banner.innerHTML='<b>Cobertura:</b> inclui perfusões contínuas padronizadas, vasoativos, antiarrítmicos, sedoanalgesia, bloqueio neuromuscular, anticoagulação/trombólise, eletrólitos, anticonvulsivantes, antimicrobianos, antídotos, terapêutica GI/hepática e outras terapêuticas críticas. Fármacos sem preparação validada continuam listados, mas nunca recebem uma diluição inventada.';meta.before(banner);
    sel.addEventListener('change',render);lab.querySelector('input').addEventListener('change',render);
    window.renderPerfDilutions=render;
    render();return true;
  }

  let tries=0;const tick=()=>{tries++;if(install()||tries>40)return;setTimeout(tick,150)};tick();
})();