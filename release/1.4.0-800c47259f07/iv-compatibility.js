(()=>{
  if(window.__fccIVCompatibilityInstalled) return;
  window.__fccIVCompatibilityInstalled=true;

  const SOURCES={
    vch:{name:'VCH Critical Care Y-site Chart',detail:'Rev. 27Aug2025 · Lower Mainland Pharmacy Services',url:'https://pdtm.vch.ca/Supporting%20Documents/IV%20Compatibility/Y-site%20Compatibility%20Critical%20Care%20Chart.pdf'},
    stabilis:{name:'Stabilis 4.0',detail:'Base internacional de estabilidade e compatibilidade de injetáveis',url:'https://www.stabilis.org/'},
    greenhill:{name:'Greenhill et al., 2019',detail:'Physical compatibilities in cardiovascular critical care · Pharmaceuticals 2019;12:67',url:'https://doi.org/10.3390/ph12020067'},
    griffith:{name:'Griffith et al., 2020',detail:'Milrinone with cardiovascular medications · AJHP 2020;77:1938–1940',url:'https://doi.org/10.1093/ajhp/zxaa296'},
    ayari:{name:'Ayari et al., 2022',detail:'75 Y-site mixtures used in adult ICU · PTHP 2022;7:20220002',url:'https://doi.org/10.1515/pthp-2022-0002'},
    trisselProp:{name:'Trissel et al., 1997',detail:'Propofol with selected drugs during simulated Y-site administration · AJHP 1997;54:1287–1292',url:'https://pubmed.ncbi.nlm.nih.gov/?term=Compatibility+of+propofol+injectable+emulsion+with+selected+drugs+during+simulated+Y-site+administration'},
    robinson:{name:'Robinson et al., 2000',detail:'Chemical stability of epinephrine in pH-adjusted solutions · Anaesthesia 2000;55:853–858',url:'https://doi.org/10.1046/j.1365-2044.2000.01471.x'},
    baumgartner:{name:'Baumgartner et al., 1988',detail:'Norepinephrine stability in saline solutions · Hosp Pharm 1988;23:44,49,59',url:'https://stabilis.org/Bibliographie.php?IdBiblio=642&codeLangue=EN-en'},
    kufel:{name:'Kufel et al., 2017',detail:'Vancomycin + piperacillin/tazobactam Y-site incompatibility at premix concentrations · Hosp Pharm 2017;52:132–137',url:'https://doi.org/10.1310/hpj5202-132'},
    yamashita:{name:'Yamashita et al., 1996',detail:'Selected critical-care drugs during Y-site administration · AJHP 1996;53:1048–1051',url:'https://pubmed.ncbi.nlm.nih.gov/?term=Compatibility+of+selected+critical+care+drugs+during+Y-site+administration'}
  };

  const DRUGS=[
    'Amiodarona','Cefazolina','Ceftazidima','Ceftriaxona','Ciprofloxacina','Clindamicina','Dexmedetomidina','Dobutamina','Dopamina','Adrenalina','Fentanilo','Fluconazol','Furosemida','Gentamicina','Heparina','Hidrocortisona','Insulina regular','Ketamina','Labetalol','Lidocaína','Sulfato de magnésio','Meropenem','Metronidazol','Midazolam','Milrinona','Morfina','Nitroglicerina','Nitroprussiato','Noradrenalina','Piperacilina/tazobactam','Cloreto de potássio','Fosfato de potássio','Propofol','Remifentanil','Rocurónio','Bicarbonato de sódio','Tobramicina','Vancomicina','Vasopressina'
  ];

  const key=(a,b)=>[a,b].sort((x,y)=>x.localeCompare(y,'pt')).join('||');
  const DB={};
  const add=(a,b,status,title,note,conditions,sources)=>DB[key(a,b)]={a,b,status,title,note,conditions,sources};

  add('Noradrenalina','Propofol','compatible','Compatível em Y-site','Compatibilidade física descrita nas referências consultadas. Não usar este resultado para preparar ambos antecipadamente na mesma seringa ou saco.','Dados publicados incluem propofol 10 mg/mL com noradrenalina em diferentes concentrações; confirmar sempre as concentrações reais.', ['vch','stabilis','trisselProp']);
  add('Noradrenalina','Furosemida','compatible','Compatível nas concentrações estudadas','Estudos e bases consultadas suportam coadministração em Y nas concentrações avaliadas.','Greenhill et al.: furosemida 1–10 mg/mL com noradrenalina 0,016 mg/mL em NaCl 0,9%; Stabilis também contém dados noutras concentrações.', ['vch','stabilis','greenhill']);
  add('Adrenalina','Furosemida','compatible','Compatível nas concentrações estudadas','Compatibilidade física suportada para as concentrações testadas.','Greenhill et al.: adrenalina 16–100 mcg/mL com furosemida 1–10 mg/mL em NaCl 0,9%.', ['vch','stabilis','greenhill']);
  add('Vasopressina','Furosemida','compatible','Compatível nas concentrações estudadas','Compatibilidade física suportada para administração em Y nas condições estudadas.','Greenhill et al.: vasopressina 1 UI/mL com furosemida 1–10 mg/mL em NaCl 0,9%.', ['vch','stabilis','greenhill']);
  add('Dexmedetomidina','Furosemida','compatible','Compatível a 4 mcg/mL + 10 mg/mL','Há suporte específico para dexmedetomidina 4 mcg/mL com furosemida 10 mg/mL.','Não extrapolar automaticamente para concentrações diferentes.', ['vch','stabilis','greenhill']);
  add('Noradrenalina','Milrinona','compatible','Compatível nas concentrações estudadas','Compatibilidade física demonstrada em estudo simulado de Y-site.','Griffith et al.: milrinona 1 mg/mL com noradrenalina 0,032 mg/mL. Confirmar se as concentrações locais diferem.', ['stabilis','griffith']);
  add('Adrenalina','Milrinona','compatible','Compatível nas concentrações estudadas','Compatibilidade física demonstrada em estudo simulado de Y-site.','Griffith et al.: milrinona 1 mg/mL com adrenalina 32 mcg/mL.', ['stabilis','griffith']);
  add('Furosemida','Milrinona','incompatible','Incompatível nas concentrações estudadas','Foi demonstrada incompatibilidade física; usar lúmen separado salvo validação específica da Farmácia para outra combinação de concentração/diluente.','Griffith et al.: furosemida 10 mg/mL + milrinona 1 mg/mL.', ['stabilis','griffith']);
  add('Furosemida','Midazolam','incompatible','Incompatível na maioria das concentrações clínicas estudadas','Há múltiplos relatos de precipitação/turvação imediata ou instabilidade química.','Existem dados de compatibilidade apenas em concentrações muito baixas específicas; por isso não classificar como universalmente compatível.', ['vch','stabilis','yamashita']);
  add('Adrenalina','Bicarbonato de sódio','incompatible','Incompatível','A alcalinização pode comprometer a estabilidade da adrenalina. Não administrar simultaneamente pelo mesmo Y-site sem validação específica.','A incompatibilidade é química e depende do ambiente de pH.', ['vch','stabilis','robinson']);
  add('Noradrenalina','Bicarbonato de sódio','incompatible','Incompatível','A noradrenalina apresenta degradação/incompatibilidade em meio alcalino. Preferir via/lúmen separado.','Não extrapolar compatibilidade de outras soluções alcalinas.', ['vch','stabilis','baumgartner']);
  add('Vancomicina','Piperacilina/tazobactam','conditional','Dependente da concentração e formulação','A literatura contém resultados dependentes da concentração, diluente e metodologia. Não tratar este par como universalmente compatível.','Kufel et al. demonstraram incompatibilidade para vancomicina 5 mg/mL + piperacilina/tazobactam 67,5 mg/mL em glicose 5%. Confirmar as concentrações e o produto local com Farmácia.', ['vch','stabilis','kufel']);
  add('Noradrenalina','Remifentanil','compatible','Compatível nas concentrações estudadas','Stabilis descreve compatibilidade física para combinações estudadas e o VCH inclui ambos no chart de cuidados críticos.','Stabilis inclui remifentanil 25–250 mcg/mL em NaCl 0,9% com noradrenalina em concentrações estudadas.', ['vch','stabilis']);
  add('Adrenalina','Remifentanil','compatible','Compatível nas concentrações estudadas','Há suporte para coadministração em Y nas concentrações avaliadas.','Confirmar concentração local antes de extrapolar.', ['vch','stabilis']);
  add('Adrenalina','Propofol','conditional','Compatibilidade dependente da concentração/tempo','Existem dados compatíveis para algumas concentrações e dados de instabilidade da emulsão noutras condições.','Não assumir compatibilidade universal. Confirmar concentração e referência específica antes de partilhar Y-site.', ['vch','stabilis','trisselProp']);

  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function statusMeta(s){
    if(s==='compatible')return {icon:'✓',label:'COMPATÍVEL',cls:'ivc-ok',action:'Pode ser considerada administração em Y nas condições documentadas.'};
    if(s==='incompatible')return {icon:'×',label:'INCOMPATÍVEL',cls:'ivc-bad',action:'Não misturar no mesmo Y-site; usar outro lúmen/via quando possível.'};
    return {icon:'!',label:'CONDICIONADA',cls:'ivc-warn',action:'Confirmar concentração, diluente e produto antes de administrar em Y.'};
  }

  function ensureStyles(){
    if(document.getElementById('ivc-style'))return;
    const st=document.createElement('style');st.id='ivc-style';st.textContent=`
      .ivc-shell{display:grid;gap:12px;margin-top:10px}.ivc-pick{display:grid;grid-template-columns:1fr 56px 1fr;gap:10px;align-items:end}.ivc-swap{height:42px;border-radius:13px}.ivc-result{border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,rgba(10,25,39,.95),rgba(6,16,26,.95));padding:17px}.ivc-result-head{display:flex;gap:13px;align-items:center}.ivc-signal{width:58px;height:58px;border-radius:17px;display:grid;place-items:center;font-size:28px;font-weight:950;flex:0 0 auto}.ivc-ok .ivc-signal{background:rgba(59,209,155,.13);border:1px solid rgba(59,209,155,.42);color:#75e1bc}.ivc-bad .ivc-signal{background:rgba(255,110,121,.13);border:1px solid rgba(255,110,121,.42);color:#ff929b}.ivc-warn .ivc-signal{background:rgba(244,187,85,.12);border:1px solid rgba(244,187,85,.4);color:#f4c975}.ivc-result h3{margin:0;font-size:20px}.ivc-status{font-size:9px;font-weight:950;letter-spacing:.13em;margin-bottom:4px}.ivc-result p{margin:10px 0 0;color:var(--muted);font-size:10px;line-height:1.55}.ivc-action{margin-top:12px;border-radius:13px;padding:10px 12px;font-size:10px;font-weight:800}.ivc-ok .ivc-action{background:rgba(59,209,155,.07);border:1px solid rgba(59,209,155,.2);color:#bcebd9}.ivc-bad .ivc-action{background:rgba(255,110,121,.07);border:1px solid rgba(255,110,121,.2);color:#ffc2c6}.ivc-warn .ivc-action{background:rgba(244,187,85,.07);border:1px solid rgba(244,187,85,.2);color:#efd497}.ivc-evidence{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}.ivc-source{display:block;text-decoration:none;border:1px solid rgba(113,158,190,.18);border-radius:13px;padding:10px;background:rgba(8,22,34,.7)}.ivc-source:hover{border-color:rgba(92,202,255,.45)}.ivc-source b{font-size:10px;display:block}.ivc-source span{display:block;font-size:8px;color:var(--muted);line-height:1.4;margin-top:3px}.ivc-confidence{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:12px}.ivc-dot{width:8px;height:8px;border-radius:50%;background:#3bd19b;box-shadow:0 0 12px rgba(59,209,155,.5)}.ivc-empty{border:1px dashed rgba(244,187,85,.28);border-radius:18px;padding:18px;text-align:center;background:rgba(244,187,85,.04)}.ivc-empty strong{display:block;font-size:16px}.ivc-empty p{margin:6px auto 0;max-width:650px;color:var(--muted);font-size:10px;line-height:1.55}.ivc-policy{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ivc-policy>div{border:1px solid rgba(113,158,190,.16);border-radius:14px;padding:11px;background:rgba(8,22,34,.6)}.ivc-policy b{font-size:10px}.ivc-policy span{display:block;color:var(--muted);font-size:8px;line-height:1.45;margin-top:3px}.ivc-legend{display:flex;gap:8px;flex-wrap:wrap}.ivc-chip{font-size:9px;padding:6px 8px;border-radius:999px;border:1px solid var(--line)}
      @media(max-width:760px){.ivc-pick{grid-template-columns:1fr}.ivc-swap{height:36px;width:52px;justify-self:center}.ivc-evidence,.ivc-policy{grid-template-columns:1fr}.ivc-result-head{align-items:flex-start}.ivc-signal{width:48px;height:48px;border-radius:14px}}
    `;document.head.appendChild(st);
  }

  function sourceCards(ids){return ids.map(id=>{const s=SOURCES[id];return s?`<a class="ivc-source" href="${esc(s.url)}" target="_blank" rel="noopener"><b>${esc(s.name)} ↗</b><span>${esc(s.detail)}</span></a>`:''}).join('')}

  function analyze(){
    const a=document.getElementById('ivcDrugA')?.value,b=document.getElementById('ivcDrugB')?.value,out=document.getElementById('ivcResult');if(!out)return;
    if(!a||!b){out.innerHTML='<div class="ivc-empty"><strong>Seleciona dois fármacos</strong><p>O resultado só é classificado quando existem referências suficientes para o par.</p></div>';return}
    if(a===b){out.innerHTML='<div class="ivc-empty"><strong>Seleciona dois fármacos diferentes</strong></div>';return}
    const d=DB[key(a,b)];
    if(!d){out.innerHTML=`<div class="ivc-empty"><strong>Sem consenso local validado para este par</strong><p>Este resultado não significa incompatibilidade nem compatibilidade. A regra do módulo é não atribuir uma cor clínica sem pelo menos duas referências verificadas. Consulta Farmácia/Stabilis/VCH antes de partilhar a via.</p><div class="ivc-evidence" style="text-align:left">${sourceCards(['vch','stabilis'])}</div></div>`;return}
    const m=statusMeta(d.status),n=d.sources.length;
    out.innerHTML=`<div class="ivc-result ${m.cls}"><div class="ivc-result-head"><div class="ivc-signal">${m.icon}</div><div><div class="ivc-status">${m.label}</div><h3>${esc(a)} + ${esc(b)}</h3><p style="margin-top:4px">${esc(d.title)}</p></div></div><div class="ivc-action">${esc(m.action)}</div><p>${esc(d.note)}</p><p><b>Condições / limites:</b> ${esc(d.conditions)}</p><div class="ivc-confidence"><span class="ivc-dot"></span><span class="badge">${n} fontes/referências apresentadas</span>${n>=3?'<span class="badge good">Triangulação 3 fontes</span>':'<span class="badge warn">Validado em 2 fontes</span>'}</div><div class="ivc-evidence">${sourceCards(d.sources)}</div></div>`;
  }

  function ensureModule(){
    const page=document.getElementById('page-clinical');if(!page)return;
    const tabs=page.querySelector('.tabs');if(!tabs||document.getElementById('clin-ivcompat'))return;
    const tab=document.createElement('button');tab.type='button';tab.className='tab';tab.textContent='Compatibilidade IV';tab.setAttribute('onclick',"subtab('clinical','clin-ivcompat',this)");
    const material=[...tabs.querySelectorAll('.tab')].find(x=>/material/i.test(x.textContent));
    if(material)tabs.insertBefore(tab,material);else tabs.appendChild(tab);
    const opts='<option value="">Selecionar fármaco…</option>'+DRUGS.map(x=>`<option>${esc(x)}</option>`).join('');
    const sub=document.createElement('div');sub.className='sub';sub.id='clin-ivcompat';sub.innerHTML=`
      <div class="ivc-shell">
        <div class="pagehead" style="margin-top:0"><div><h2 style="font-size:22px">Compatibilidade IV</h2><p>Consulta rápida de compatibilidade física em Y-site com validação multi-fonte.</p></div><span class="badge warn">Y-site ≠ mistura em seringa/saco</span></div>
        <div class="notice">A compatibilidade depende de concentração, diluente, formulação, pH, temperatura e condições de contacto. Um resultado verde aplica-se apenas às condições documentadas; protocolo local/Farmácia prevalece.</div>
        <div class="card full"><div class="ivc-pick"><label>Fármaco A<select id="ivcDrugA">${opts}</select></label><button type="button" class="btn ivc-swap" id="ivcSwap" title="Trocar">⇄</button><label>Fármaco B<select id="ivcDrugB">${opts}</select></label></div><div id="ivcResult" style="margin-top:12px"></div></div>
        <div class="card full"><div class="panel-title"><div><h3>Regra de validação</h3><p>O módulo prefere segurança a preencher todas as combinações.</p></div><div class="ivc-legend"><span class="ivc-chip">✓ Compatível</span><span class="ivc-chip">× Incompatível</span><span class="ivc-chip">! Condicionada</span></div></div><div class="ivc-policy" style="margin-top:10px"><div><b>1 · VCH Critical Care</b><span>Chart institucional específico para Y-site em cuidados críticos, Rev. 27Aug2025.</span></div><div><b>2 · Stabilis</b><span>Base internacional que agrega dados físicos/químicos por fármaco, concentração e solvente.</span></div><div><b>3 · Literatura primária</b><span>Estudo laboratorial/peer-reviewed usado sempre que disponível para reforçar ou explicar o resultado.</span></div></div></div>
        <div class="advice"><strong>Importante:</strong> “Sem consenso” não significa “incompatível”. Significa apenas que esta versão local ainda não tem pelo menos duas referências verificadas para esse par. Nunca usar ausência de dados como autorização para misturar.</div>
      </div>`;
    const materialSub=document.getElementById('clin-material');if(materialSub)page.insertBefore(sub,materialSub);else page.appendChild(sub);
    const A=document.getElementById('ivcDrugA'),B=document.getElementById('ivcDrugB');A?.addEventListener('change',analyze);B?.addEventListener('change',analyze);document.getElementById('ivcSwap')?.addEventListener('click',()=>{const t=A.value;A.value=B.value;B.value=t;analyze()});analyze();
  }

  ensureStyles();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureModule);else ensureModule();
})();
