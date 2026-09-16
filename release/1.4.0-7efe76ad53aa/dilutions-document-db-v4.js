(()=>{
  if(window.__fccDilutionsDocumentDBV4Installed)return;
  window.__fccDilutionsDocumentDBV4Installed=true;

  const SOURCE_LABEL='Documento HBA · mod. 19/09/2018';
  const CURRENT_STANDARD={
    'Alteplase':'1 mg/mL','Amiodarona':'1,8 mg/mL','Argatroban':'1 mg/mL','Bumetanida':'0,1 mg/mL · 0,25 mg/mL',
    'Cisatracúrio':'2 mg/mL · não diluído','Dexmedetomidina':'4 mcg/mL','Diltiazem':'1 mg/mL','Dobutamina':'2 mg/mL · 4 mg/mL',
    'Dopamina':'1,6 mg/mL · 3,2 mg/mL','Adrenalina':'20 mcg/mL · 40 mcg/mL','Esmolol':'10 mg/mL · 20 mg/mL',
    'Fentanilo':'10 mcg/mL · 50 mcg/mL','Furosemida':'2 mg/mL · 10 mg/mL','Heparina não fracionada':'100 UI/mL',
    'Hidromorfona':'0,2 mg/mL · 1 mg/mL · 5 mg/mL','Insulina regular':'1 UI/mL · 16 UI/mL apenas em intoxicação por BCC/BB',
    'Isoprenalina':'4 mcg/mL','Ketamina':'2 mg/mL · 10 mg/mL','Labetalol':'1 mg/mL · 5 mg/mL','Lidocaína':'8 mg/mL',
    'Lorazepam':'1 mg/mL','Sulfato de magnésio':'40 mg/mL','Midazolam':'1 mg/mL · 5 mg/mL','Milrinona':'200 mcg/mL',
    'Morfina':'1 mg/mL · 5 mg/mL','Naloxona':'16 mcg/mL · 40 mcg/mL','Nicardipina':'0,1 mg/mL · 0,2 mg/mL · 0,5 mg/mL',
    'Nitroglicerina':'100 mcg/mL · 200 mcg/mL · 400 mcg/mL','Nitroprussiato':'200 mcg/mL · 500 mcg/mL',
    'Noradrenalina':'16 mcg/mL · 32 mcg/mL · 64 mcg/mL','Oxitocina':'0,06 UI/mL','Fenilefrina':'80 mcg/mL · 400 mcg/mL',
    'Propofol':'10 mg/mL · não diluído','Rocurónio':'10 mg/mL · não diluído','Ácido tranexâmico':'10 mg/mL',
    'Vasopressina':'0,2 UI/mL · 0,4 UI/mL · 1 UI/mL','Vecurónio':'1 mg/mL'
  };

  const GROUPS={
    'Vasoativos / Inotrópicos':['Noradrenalina','Adrenalina','Vasopressina','Fenilefrina','Metaraminol','Dopamina','Dobutamina','Milrinona','Levosimendano','Levossimendano','Isoprenalina','Efedrina'],
    'Cardiovascular / Antiarrítmicos':['Amiodarona','Adenosina','Lidocaína','Diltiazem','Esmolol','Labetalol','Metoprolol','Nicardipina','Nitroglicerina','Nitroprussiato','Digoxina','Atropina','Furosemida','Bumetanida','Flecainida','Nimodipina','Dinitrato de isossorbida'],
    'Sedação / Analgesia / Anestesia':['Propofol','Midazolam','Dexmedetomidina','Ketamina','Cetamina','Fentanilo','Alfentanilo','Alfentanil','Remifentanilo','Remifentanil','Morfina','Hidromorfona','Lorazepam','Paracetamol','Metamizol','Cetorolac','Ibuprofeno','Diclofenac','Clonixina','Parecoxib','Tiopental','Etomidato','Droperidol'],
    'Bloqueio neuromuscular / Reversão':['Rocurónio','Cisatracúrio','Atracúrio','Vecurónio','Succinilcolina','Suxametónio','Cloreto de suxametónio','Sugamadex','Neostigmina','Glicopirrolato','Edrofónio'],
    'Anticoagulação / Hemostase / Fibrinólise':['Heparina','Enoxaparina','Argatroban','Bivalirudina','Alteplase','Tenecteplase','Ácido tranexâmico','Ácido aminocapróico','Protamina','Fitomenadiona','Vitamina K','Complexo de Protrombina','Concentrado complexo protrombínico','Fibrinogénio','Eptacog alfa','Cola de Fibrina'],
    'Eletrólitos / Metabólico':['Cloreto de potássio','Fosfato de potássio','Fosfato monopotássico','Fosfato de sódio','Sulfato de magnésio','Cloreto de cálcio','Gluconato de cálcio','Bicarbonato de sódio','Cloreto de sodio','Cloreto de sódio','Glicose','Insulina','Glucagon','Glucagom','Manitol','Alfacalcidol','Paricalcitol'],
    'Neurologia / Convulsões':['Levetiracetam','Valproato','Ácido valpróico','Fenitoína','Fosfenitoína','Lacosamida','Fenobarbital','Diazepam','Clonazepam','Piridoxina','Dantroleno','Biperideno'],
    'Antibacterianos':['Amoxicilina','Ampicilina','Benzilpenicilina','Piperacilina','Flucloxacilina','Cefazolina','Cefuroxima','Cefotaxima','Ceftriaxona','Ceftazidima','Cefepima','Cefoxitina','Aztreonam','Ertapenem','Imipenem','Meropenem','Gentamicina','Amicacina','Vancomicina','Teicoplanina','Daptomicina','Linezolida','Clindamicina','Metronidazol','Ciprofloxacina','Levofloxacina','Azitromicina','Claritromicina','Eritromicina','Doxiciclina','Trimetoprim','Colistimetato','Fosfomicina'],
    'Antifúngicos / Antivirais':['Fluconazol','Voriconazol','Anfotericina','Anidulafungina','Caspofungina','Micafungina','Aciclovir','Ganciclovir','Foscarnet','Remdesivir'],
    'Antídotos / Toxicologia':['Naloxona','Flumazenil','Acetilcisteína','Hidroxocobalamina','Azul de metileno','Cloreto de metiltionina','Fomepizol','Anticorpos Anti Digitálicos','Pralidoxima','Obidoxima','Desferroxamina','Emulsão lipídica'],
    'Gastrointestinal / Hepático':['Pantoprazol','Omeprazol','Octreótido','Octreotida','Terlipressina','Metoclopramida','Ondansetrom','Granissetrom','Fosaprepitant','Butilescopolamina','Tiamina'],
    'Endócrino / Corticoterapia':['Hidrocortisona','Metilprednisolona','Dexametasona','Desmopressina','Betametasona','Levotiroxina'],
    'Respiratório / Broncoespasmo grave':['Terbutalina','Aminofilina','Salbutamol'],
    'Obstetrícia / Hemorragia crítica':['Oxitocina','Carbetocina','Atosibano'],
    'Hematologia / Imunologia':['Albumina','Imunoglobulina','Darbepoetina','Epoetina','Filgrastim','Pegfilgrastim','Carboximaltose férrica','Infliximab','Ciclosporina'],
    'Anestesia local / Regional':['Bupivacaina','Bupivacaína','Levobupivacaína','LEVObupivacaína','Ropivacaína','Mepivacaína','Prilocaína','Articaína'],
    'Diagnóstico / Contraste / Oftalmologia':['Gadobutrol','Iopromida','Fluoresceina','Azul Patente','Azul Trypan','Hexafluoreto de enxofre','Perfluoroctano','Hialuronato']
  };

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const normalizedGroups=Object.entries(GROUPS).map(([group,names])=>[group,names.map(fold).sort((a,b)=>b.length-a.length)]);
  let db=null,grouped=[];

  function classify(drug){
    const d=fold(drug);
    for(const [group,names] of normalizedGroups){if(names.some(n=>d.startsWith(n)||d.includes(' '+n+' ')))return group}
    return 'Outros / Documento';
  }

  function currentStandard(drug){
    const d=fold(drug);
    for(const [name,value] of Object.entries(CURRENT_STANDARD)){const n=fold(name);if(d.startsWith(n)||d.includes(' '+n+' '))return {name,value}}
    return null;
  }

  function groupRecords(records){
    const m=new Map();
    for(const r of records){
      const key=[r.article||'',r.drug||'',r.brand||''].join('|');
      if(!m.has(key))m.set(key,{article:r.article||'',drug:r.drug||'',brand:r.brand||'',routes:[],category:classify(r.drug||'')});
      m.get(key).routes.push(r);
    }
    return [...m.values()].sort((a,b)=>a.drug.localeCompare(b.drug,'pt',{sensitivity:'base'}));
  }

  function sourceField(label,value){return value?`<div class="ccd-doc-field"><small>${esc(label)}</small><div>${esc(value)}</div></div>`:''}

  function routeBlock(r){
    const hasRecon=r.reconstitution_solvent||r.reconstitution_volume||r.stability_reconstituted;
    const hasDil=r.diluent||r.dilution_volume||r.stability_diluted;
    return `<section class="ccd-doc-route"><div class="ccd-doc-routehead"><b>${esc(r.route||'Via não indicada')}</b><span>linha ${r.row}</span></div>${hasRecon?`<div class="ccd-doc-grid"><div class="ccd-doc-section">Reconstituição</div>${sourceField('Solvente',r.reconstitution_solvent)}${sourceField('Volume',r.reconstitution_volume)}${sourceField('Estabilidade',r.stability_reconstituted)}</div>`:''}${hasDil?`<div class="ccd-doc-grid"><div class="ccd-doc-section">Diluição</div>${sourceField('Veículo',r.diluent)}${sourceField('Volume / concentração descrita',r.dilution_volume)}${sourceField('Estabilidade',r.stability_diluted)}</div>`:''}${(r.protect_light||r.administration||r.observations)?`<div class="ccd-doc-grid ccd-doc-grid-wide">${sourceField('Proteger da luz',r.protect_light)}${sourceField('Administração',r.administration)}${sourceField('Conservação / observações',r.observations)}</div>`:''}</section>`;
  }

  function searchable(x){return fold([x.article,x.drug,x.brand,x.category,...x.routes.flatMap(r=>[r.route,r.reconstitution_solvent,r.reconstitution_volume,r.stability_reconstituted,r.diluent,r.dilution_volume,r.stability_diluted,r.protect_light,r.administration,r.observations])].join(' '))}
  function hasDilutionData(x){return !!(currentStandard(x.drug)||x.routes.some(r=>r.reconstitution_solvent||r.reconstitution_volume||r.diluent||r.dilution_volume))}

  function render(){
    const grid=document.getElementById('perfDilutionGrid');if(!grid)return;
    if(!db){grid.innerHTML='<div class="notice">A carregar base documental de diluições…</div>';return}
    const q=fold(document.getElementById('perfDilutionSearch')?.value||'');
    const group=document.getElementById('ccdGroup')?.value||'';
    const only=document.getElementById('ccdOnlyVerified')?.checked||false;
    const rows=grouped.filter(x=>(!group||x.category===group)&&(!only||hasDilutionData(x))&&(!q||searchable(x).includes(q)));
    const count=document.getElementById('ccdCount');if(count)count.textContent=`${rows.length} / ${grouped.length} apresentações`;
    if(!rows.length){grid.innerHTML='<div class="notice">Sem resultados para os filtros atuais.</div>';return}
    grid.innerHTML=rows.map(x=>{
      const std=currentStandard(x.drug),routeNames=[...new Set(x.routes.map(r=>r.route).filter(Boolean))];
      return `<article class="card full ccd-doc-card"><div class="ccd-doc-top"><div><h3>${esc(x.drug)}</h3><p>${x.brand?`<b>${esc(x.brand)}</b> · `:''}${esc(x.category)}${x.article?` · ${esc(x.article)}`:''}</p></div><div class="ccd-doc-routebadges">${routeNames.map(r=>`<span class="badge">${esc(r)}</span>`).join('')}</div></div>${std?`<div class="ccd-ashp"><span>Concentração standard atual · ASHP S4S 2026</span><b>${esc(std.value)}</b><div class="tiny">Quando divergir do documento de 2018, esta concentração standard atual não deve ser substituída pelo valor histórico sem confirmação institucional.</div></div>`:''}<details class="ccd-doc-details"><summary>Ver reconstituição, diluição e administração · ${x.routes.length} registo${x.routes.length===1?'':'s'}</summary>${x.routes.map(routeBlock).join('')}<div class="ccd-doc-source">Fonte importada: ${SOURCE_LABEL}. Conteúdo documental, não revalidado linha a linha em 2026. Confirmar RCM/SmPC e protocolo institucional antes de utilização clínica.</div></details></article>`;
    }).join('');
  }

  function addStyles(){
    if(document.getElementById('ccd-doc-v4-style'))return;
    const s=document.createElement('style');s.id='ccd-doc-v4-style';s.textContent=`.ccd-doc-card{padding:13px!important}.ccd-doc-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.ccd-doc-top h3{margin:0 0 4px!important}.ccd-doc-top p b{color:var(--text)}.ccd-doc-routebadges{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;max-width:46%}.ccd-doc-details{margin-top:9px;border-top:1px solid var(--line);padding-top:8px}.ccd-doc-details>summary{cursor:pointer;color:var(--clinical);font-size:9px;font-weight:800;list-style:none}.ccd-doc-details>summary::-webkit-details-marker{display:none}.ccd-doc-details>summary:after{content:' +';color:var(--muted)}.ccd-doc-details[open]>summary:after{content:' −'}.ccd-doc-route{margin-top:9px;border:1px solid var(--line);border-radius:12px;padding:9px;background:var(--panel-2)}.ccd-doc-routehead{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:7px}.ccd-doc-routehead b{font-size:10px}.ccd-doc-routehead span{font-size:7px;color:var(--muted)}.ccd-doc-grid{display:grid;grid-template-columns:90px repeat(3,minmax(0,1fr));gap:6px;margin-top:5px}.ccd-doc-grid-wide{grid-template-columns:repeat(3,minmax(0,1fr))}.ccd-doc-section{font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);display:flex;align-items:center}.ccd-doc-field{border:1px solid var(--line);border-radius:9px;padding:7px;background:var(--panel)}.ccd-doc-field small{display:block;font-size:7px;color:var(--muted);margin-bottom:3px}.ccd-doc-field div{font-size:8px;line-height:1.45}.ccd-doc-source{margin-top:8px;font-size:7px;line-height:1.5;color:var(--muted)}.ccd-ashp .tiny{margin-top:4px;line-height:1.45}.ccd-doc-source-banner{border-color:rgba(168,156,255,.25)!important;background:rgba(168,156,255,.06)!important}.ccd-doc-source-banner b{color:var(--violet)}html[data-fcc-theme="light"] .ccd-doc-route,html[data-fcc-theme="light"] .ccd-doc-field{background:#fff!important}@media(max-width:760px){.ccd-doc-top{display:block}.ccd-doc-routebadges{max-width:none;justify-content:flex-start;margin-top:7px}.ccd-doc-grid,.ccd-doc-grid-wide{grid-template-columns:1fr}.ccd-doc-section{margin-top:3px}}`;document.head.appendChild(s);
  }

  function prepareUI(){
    addStyles();
    const group=document.getElementById('ccdGroup');
    if(group){[...Object.keys(GROUPS),'Outros / Documento'].forEach(name=>{if(![...group.options].some(o=>o.value===name)){const o=document.createElement('option');o.value=name;o.textContent=name;group.appendChild(o)}})}
    const only=document.getElementById('ccdOnlyVerified'),onlyLabel=only?.closest('label');
    if(onlyLabel&&onlyLabel.dataset.docLabel!=='1'){
      onlyLabel.dataset.docLabel='1';
      [...onlyLabel.childNodes].forEach(n=>{if(n.nodeType===Node.TEXT_NODE)n.remove()});
      onlyLabel.appendChild(document.createTextNode('Só com dados de reconstituição/diluição'));
    }
    const banner=document.querySelector('#clin-perf .ccd-banner');
    if(banner){banner.classList.add('ccd-doc-source-banner');banner.innerHTML='<b>Base documental integrada:</b> 548 registos / 293 fichas agrupadas (291 designações de apresentação) do ficheiro DILUIÇÕES.xlsx. O ficheiro foi modificado em 19/09/2018; dados ASHP S4S 2026 já existentes são mantidos como referência atual e não são substituídos automaticamente por valores mais antigos.'}
    const meta=document.querySelector('#clin-perf .ccd-meta');
    if(meta&&!document.getElementById('ccdDocSourceBadge')){const b=document.createElement('span');b.id='ccdDocSourceBadge';b.className='badge';b.textContent='HBA · documento 2018';meta.appendChild(b)}
  }

  async function loadDB(){
    try{if(!window.fccDilutionsHBAData)throw new Error('Fonte documental não carregada');db=await window.fccDilutionsHBAData;grouped=groupRecords(db.records||[]);prepareUI();render()}
    catch(e){const grid=document.getElementById('perfDilutionGrid');if(grid)grid.innerHTML=`<div class="notice">Não foi possível carregar a base documental de diluições (${esc(e.message||'erro')}). Mantém disponível a base anterior após recarregar.</div>`}
  }

  function install(){
    const host=document.getElementById('clin-perf'),grid=document.getElementById('perfDilutionGrid'),search=document.getElementById('perfDilutionSearch'),group=document.getElementById('ccdGroup'),only=document.getElementById('ccdOnlyVerified');
    if(!host||!grid||!search||!group||!only)return false;
    prepareUI();search.addEventListener('input',()=>setTimeout(render,0));group.addEventListener('change',()=>setTimeout(render,0));only.addEventListener('change',()=>setTimeout(render,0));window.renderPerfDilutions=render;loadDB();return true;
  }

  let tries=0;const boot=()=>{tries++;if(install()||tries>60)return;setTimeout(boot,120)};boot();
})();