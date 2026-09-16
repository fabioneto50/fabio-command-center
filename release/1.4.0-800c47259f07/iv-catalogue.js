(()=>{
  if(window.__fccIVCatalogueInstalled)return;
  window.__fccIVCatalogueInstalled=true;

  const CATEGORIES={"Vasoativos / Inotrópicos":["Adrenalina","Noradrenalina","Dopamina","Dobutamina","Vasopressina","Fenilefrina","Metaraminol","Efedrina","Isoprenalina","Milrinona","Levosimendano"],"Antiarrítmicos / Cardiovascular":["Amiodarona","Adenosina","Lidocaína","Procainamida","Digoxina","Atropina","Esmolol","Landiolol","Labetalol","Metoprolol IV","Nicardipina","Clevidipina","Hidralazina","Nitroglicerina","Nitroprussiato"],"Sedação / Analgesia / Anestesia":["Propofol","Midazolam","Dexmedetomidina","Ketamina","Fentanilo","Alfentanil","Remifentanil","Morfina","Hidromorfona","Petidina","Tramadol","Paracetamol IV","Metamizol IV","Droperidol"],"Bloqueio neuromuscular / Reversão":["Rocurónio","Cisatracúrio","Atracúrio","Succinilcolina","Sugamadex","Neostigmina","Glicopirrolato"],"Antibacterianos":["Amoxicilina/ácido clavulânico","Ampicilina","Ampicilina/sulbactam","Piperacilina/tazobactam","Penicilina G","Flucloxacilina","Cefazolina","Cefuroxima","Cefotaxima","Ceftriaxona","Ceftazidima","Cefepima","Ceftarolina","Ceftolozano/tazobactam","Ceftazidima/avibactam","Aztreonam","Ertapenem","Imipenem/cilastatina","Meropenem","Meropenem/vaborbactam","Gentamicina","Amicacina","Tobramicina","Vancomicina","Teicoplanina","Daptomicina","Linezolida","Clindamicina","Metronidazol","Ciprofloxacina","Levofloxacina","Azitromicina IV","Doxiciclina IV","Tigeciclina","Colistimetato de sódio","Fosfomicina IV","Trimetoprim/sulfametoxazol IV"],"Antifúngicos":["Fluconazol","Voriconazol","Posaconazol IV","Isavuconazol","Anfotericina B lipossómica","Anidulafungina","Caspofungina","Micafungina"],"Antivirais":["Aciclovir","Ganciclovir","Foscarnet","Remdesivir","Letermovir IV"],"Eletrólitos / Soluções / Metabólico":["Cloreto de potássio","Fosfato de potássio","Fosfato de sódio","Sulfato de magnésio","Cloreto de cálcio","Gluconato de cálcio","Bicarbonato de sódio","Cloreto de sódio hipertónico","Glicose hipertónica","NaCl 0,9%","Glicose 5%","Ringer lactato","Plasma-Lyte","Manitol","Albumina humana"],"Endócrino / Corticoterapia":["Insulina regular","Glucagon","Hidrocortisona","Metilprednisolona","Dexametasona","Levotiroxina IV","Desmopressina","Octreótido"],"Hemostase / Anticoagulação / Fibrinólise":["Heparina não fracionada","Bivalirudina","Argatroban","Alteplase","Tenecteplase","Ácido tranexâmico","Protamina","Vitamina K IV","Concentrado complexo protrombínico","Fibrinogénio concentrado","Fator VIII","Fator IX","Fator von Willebrand","Antitrombina III","Idarucizumab","Andexanet alfa"],"Neurologia / Antiepiléticos":["Levetiracetam","Valproato de sódio","Fenitoína","Fosfenitoína","Lacosamida","Fenobarbital","Diazepam IV","Tiopental","Piridoxina IV"],"Gastrointestinal / Hepático / Antieméticos":["Pantoprazol","Omeprazol IV","Famotidina","Metoclopramida","Ondansetrom","Granisetrom","Octreótido","Terlipressina","Acetilcisteína","Tiamina IV"],"Renal / Diuréticos":["Furosemida","Bumetanida","Acetazolamida"],"Antídotos / Toxicologia":["Naloxona","Flumazenil","Acetilcisteína","Hidroxocobalamina","Azul de metileno","Fomepizol","Digoxina Fab","Pralidoxima","Atropina","Glucagon","Emulsão lipídica 20%"],"Obstetrícia":["Oxitocina","Carbetocina","Sulfato de magnésio","Ácido tranexâmico","Labetalol","Hidralazina"],"Oncologia / Hematologia especializada":["Ciclofosfamida","Citarabina","Metotrexato IV","Doxorrubicina","Epirrubicina","Etopósido","Vincristina","Vinblastina","Paclitaxel","Docetaxel","Carboplatina","Cisplatina","Oxaliplatina","Fluorouracilo","Gemcitabina","Irinotecano","Rituximab","Trastuzumab","Pembrolizumab","Nivolumab"],"Imunologia / Biológicos":["Infliximab","Tocilizumab","Rituximab","Imunoglobulina humana IV","Metilprednisolona"],"Outros hospitalares IV":["Ciclosporina IV","Tacrolímus IV","Ferro sacarose","Carboximaltose férrica","Ácido zoledrónico","Pamidronato","Denosumab","Contraste iodado IV"]};
  const WHO_URL='https://www.who.int/publications/i/item/B09474';
  const INFARMED_URL='https://www.infarmed.pt/web/infarmed/perguntas-frequentes-area-transversal/codigo-hospitalar-nacional-do-medicamento';
  const STABILIS_URL='https://www.stabilis.org/';
  const VCH_URL='https://pdtm.vch.ca/Supporting%20Documents/IV%20Compatibility/Y-site%20Compatibility%20Critical%20Care%20Chart.pdf';
  const uniq=[...new Set(Object.values(CATEGORIES).flat())];
  const total=uniq.length;

  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

  function addStyles(){
    if(document.getElementById('ivcat-style'))return;
    const st=document.createElement('style');st.id='ivcat-style';st.textContent=`
      .ivcat-bar{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:0 0 10px}.ivcat-stat{font-size:9px;padding:6px 8px;border-radius:999px;border:1px solid rgba(92,202,255,.18);background:rgba(92,202,255,.05);color:#b7e8fa}
      .ivcat-filter{display:flex;gap:8px;align-items:end;flex-wrap:wrap;margin:0 0 10px}.ivcat-filter label{min-width:240px;flex:1}.ivcat-filter small{display:block;color:var(--muted);font-size:8px;margin-bottom:5px}
      .ivcat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}.ivcat-card{border:1px solid rgba(113,158,190,.16);border-radius:14px;padding:10px;background:rgba(8,22,34,.6)}.ivcat-card h4{margin:0;font-size:10px}.ivcat-card h4 span{color:#8ddfff;font-size:8px}.ivcat-card p{margin:6px 0 0;color:var(--muted);font-size:8px;line-height:1.5}
      .ivcat-special{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.ivcat-special>div{border:1px solid rgba(244,187,85,.18);background:rgba(244,187,85,.045);border-radius:13px;padding:10px}.ivcat-special b{font-size:9px;color:#efd497}.ivcat-special span{display:block;color:var(--muted);font-size:8px;line-height:1.45;margin-top:3px}
      .ivcat-sources{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.ivcat-sources a{font-size:8px;text-decoration:none;border:1px solid rgba(113,158,190,.18);border-radius:10px;padding:7px 8px;background:rgba(8,22,34,.55)}
      @media(max-width:820px){.ivcat-grid,.ivcat-special{grid-template-columns:1fr}.ivcat-filter label{min-width:100%}}
    `;document.head.appendChild(st);
  }

  function fillSelect(sel,category=''){
    if(!sel)return;
    const current=sel.value;
    sel.innerHTML='<option value="">Selecionar fármaco…</option>';
    Object.entries(CATEGORIES).forEach(([cat,items])=>{
      if(category&&cat!==category)return;
      const group=document.createElement('optgroup');group.label=cat;
      items.forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;group.appendChild(o)});
      sel.appendChild(group);
    });
    if([...sel.options].some(o=>o.value===current))sel.value=current;else sel.value='';
  }

  function catalogueHTML(){
    return Object.entries(CATEGORIES).map(([cat,items])=>`<div class="ivcat-card"><h4>${esc(cat)} <span>· ${items.length}</span></h4><p>${items.map(esc).join(' · ')}</p></div>`).join('');
  }

  function install(){
    const sub=document.getElementById('clin-ivcompat'),A=document.getElementById('ivcDrugA'),B=document.getElementById('ivcDrugB');
    if(!sub||!A||!B)return false;
    if(document.getElementById('ivcat-filter'))return true;
    addStyles();

    fillSelect(A);fillSelect(B);

    const notice=sub.querySelector('.notice');
    const bar=document.createElement('div');bar.className='ivcat-bar';bar.innerHTML=`<span class="ivcat-stat">${total} terapêuticas IV</span><span class="ivcat-stat">${Object.keys(CATEGORIES).length} grupos terapêuticos</span><span class="ivcat-stat">Catálogo ≠ compatibilidade validada</span>`;
    if(notice)notice.after(bar);else sub.prepend(bar);

    const card=A.closest('.card');
    const filter=document.createElement('div');filter.className='ivcat-filter';filter.id='ivcat-filter';filter.innerHTML=`<label><small>Filtrar os dois seletores por área terapêutica</small><select id="ivcatCategory"><option value="">Todas as áreas · ${total} terapêuticas</option>${Object.entries(CATEGORIES).map(([c,v])=>`<option value="${esc(c)}">${esc(c)} · ${v.length}</option>`).join('')}</select></label><button class="btn" type="button" id="ivcatAll">Mostrar todas</button>`;
    card?.insertBefore(filter,card.firstChild);
    const catSel=document.getElementById('ivcatCategory');
    catSel?.addEventListener('change',()=>{fillSelect(A,catSel.value);fillSelect(B,catSel.value);A.dispatchEvent(new Event('change',{bubbles:true}));B.dispatchEvent(new Event('change',{bubbles:true}));});
    document.getElementById('ivcatAll')?.addEventListener('click',()=>{if(catSel)catSel.value='';fillSelect(A);fillSelect(B)});

    const ruleCard=[...sub.querySelectorAll('.card')].find(c=>/Regra de validação/i.test(c.textContent));
    const catalog=document.createElement('div');catalog.className='card full';catalog.innerHTML=`<div class="panel-title"><div><h3>Catálogo hospitalar IV alargado</h3><p>Organizado por área terapêutica. Inclui fármacos de cuidados críticos, bloco, urgência, medicina, cirurgia, infecciologia, neurologia, oncologia, obstetrícia e outras áreas.</p></div><span class="badge">${total} entradas</span></div><div class="ivcat-grid">${catalogueHTML()}</div><div class="ivcat-sources"><a href="${VCH_URL}" target="_blank" rel="noopener">VCH Critical Care ↗</a><a href="${STABILIS_URL}" target="_blank" rel="noopener">Stabilis ↗</a><a href="${WHO_URL}" target="_blank" rel="noopener">WHO EML 2025 ↗</a><a href="${INFARMED_URL}" target="_blank" rel="noopener">INFARMED CHNM ↗</a></div>`;
    if(ruleCard)ruleCard.after(catalog);else sub.appendChild(catalog);

    const special=document.createElement('div');special.className='card full';special.innerHTML=`<h3>Terapêuticas com regras próprias</h3><div class="ivcat-special"><div><b>Hemoderivados / transfusão</b><span>Não são avaliados por esta matriz geral de Y-site. Seguir protocolo transfusional.</span></div><div><b>Nutrição parentérica / lípidos</b><span>Requer compatibilidade específica com NPT e emulsões lipídicas; não extrapolar de soluções aquosas.</span></div><div><b>Intratecal / epidural</b><span>Fora do âmbito desta ferramenta. Usar apenas referências/protocolos específicos.</span></div><div><b>Quimioterapia / biológicos</b><span>Estão representados no catálogo, mas o resultado só será classificado quando existir evidência específica para formulação, concentração e par.</span></div></div>`;
    catalog.after(special);
    return true;
  }

  if(!install()){
    let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>30)clearInterval(timer)},200);
  }
})();
