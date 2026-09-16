(()=>{
  const REFS=[
    {
      drug:'Noradrenalina', code:'NA', status:'SmPC',
      prep:'2 mg + diluente q.s.p. 50 mL', conc:'40 mcg/mL',
      diluent:'Glicose 5% ou NaCl 0,9% (dependendo do produto)',
      note:'Exemplo de preparação do SmPC para concentrado 1 mg/mL. Outras concentrações podem ser usadas; confirmar sempre a apresentação e o protocolo local.',
      source:'https://www.medicines.org.uk/emc/product/13172/smpc'
    },
    {
      drug:'Adrenalina', code:'ADR', status:'Protocolo local',
      prep:'Perfusão contínua: confirmar preparação institucional', conc:'Sem concentração única nesta referência',
      diluent:'Depende da apresentação/protocolo',
      note:'A apresentação 1 mg/10 mL (0,1 mg/mL; 1:10 000) é uma solução pronta para injeção. Não deve ser assumida automaticamente como concentração padrão de perfusão contínua.',
      source:'https://www.medicines.org.uk/emc/product/2024/smpc'
    },
    {
      drug:'Dobutamina', code:'DOB', status:'SmPC',
      prep:'250 mg + diluente q.s.p. 50 mL', conc:'5 mg/mL',
      diluent:'Glicose 5%, NaCl 0,9% ou NaCl 0,45% em glicose 5%',
      note:'Preparação descrita no SmPC para bomba de seringa. Existem também preparações de menor concentração para sistemas de maior volume.',
      source:'https://www.medicines.org.uk/emc/product/100017/smpc'
    },
    {
      drug:'Dopamina', code:'DOPA', status:'SmPC',
      prep:'200 mg q.s.p. 250 mL · alternativa 200 mg q.s.p. 500 mL', conc:'800 mcg/mL · 400 mcg/mL',
      diluent:'NaCl 0,9%; glicose 5%/NaCl 0,45%; Ringer lactato',
      note:'O SmPC apresenta várias concentrações finais. Confirmar a preparação usada no serviço antes de calcular o débito.',
      source:'https://www.medicines.org.uk/emc/product/100811/smpc'
    },
    {
      drug:'Propofol', code:'PROP', status:'SmPC',
      prep:'Propofol 1%: preferencialmente sem diluição', conc:'10 mg/mL',
      diluent:'Se diluído: até 1 parte de propofol + 4 partes de diluente',
      note:'A concentração final não deve ser inferior a 2 mg/mL no SmPC consultado. Diluentes compatíveis incluem glicose 5% e, conforme o produto, NaCl 0,9%.',
      source:'https://www.medicines.org.uk/emc/product/11295/smpc'
    },
    {
      drug:'Dexmedetomidina', code:'DEX', status:'SmPC',
      prep:'2 mL (100 mcg/mL) + 48 mL · alternativa 4 mL + 46 mL', conc:'4 mcg/mL · 8 mcg/mL',
      diluent:'Glicose 5%, Ringer/Ringer lactato, manitol ou NaCl 0,9% conforme produto',
      note:'As duas concentrações são descritas como opções de preparação no SmPC.',
      source:'https://www.medicines.org.uk/emc/product/13154/smpc'
    },
    {
      drug:'Alfentanil', code:'ALF', status:'SmPC / local',
      prep:'Solução 500 mcg/mL; pode ser diluída', conc:'Concentração final depende do protocolo',
      diluent:'NaCl 0,9%, glicose 5% ou Ringer lactato (Hartmann)',
      note:'O SmPC confirma compatibilidade com estes diluentes, mas não define uma única concentração final de perfusão.',
      source:'https://www.medicines.org.uk/emc/product/6427/smpc'
    },
    {
      drug:'Remifentanil', code:'REMI', status:'SmPC',
      prep:'Reconstituir primeiro para ≈1 mg/mL; depois diluir para perfusão', conc:'50 mcg/mL recomendado em adultos (MCI)',
      diluent:'Água p/ injetáveis, glicose 5%, NaCl 0,9%, NaCl 0,45% ou glicose 5% + NaCl 0,9%',
      note:'Para perfusão manual em adultos o SmPC recomenda 50 mcg/mL; intervalo permitido 20–250 mcg/mL. Para TCI: 20–50 mcg/mL.',
      source:'https://www.medicines.org.uk/emc/product/15232/smpc'
    },
    {
      drug:'Rocurónio', code:'ROC', status:'SmPC / local',
      prep:'Solução de origem 10 mg/mL; diluição possível', conc:'SmPC demonstra estabilidade a 5 mg/mL e 0,1 mg/mL',
      diluent:'NaCl 0,9% ou glicose 5%',
      note:'Estas concentrações são dados de estabilidade/compatibilidade do SmPC, não uma concentração institucional obrigatória de perfusão. Confirmar protocolo local e garantir sedoanalgesia adequada.',
      source:'https://www.medicines.org.uk/emc/product/553/smpc'
    },
    {
      drug:'Insulina IV', code:'INS', status:'Produto específico',
      prep:'Confirmar primeiro o tipo de insulina e o protocolo', conc:'Ex.: insulina lispro 0,1–1 UI/mL',
      diluent:'NaCl 0,9% ou glicose 5% para lispro',
      note:'O SmPC de insulina lispro permite sistemas IV entre 0,1 e 1 UI/mL e recomenda primar o sistema. Não generalizar esta preparação a todas as insulinas.',
      source:'https://www.medicines.org.uk/emc/product/1640/smpc'
    },
    {
      drug:'Amiodarona', code:'AMIO', status:'SmPC',
      prep:'150 mg em 250 mL de glicose 5%', conc:'0,6 mg/mL',
      diluent:'Apenas glicose 5% no SmPC consultado',
      note:'Concentrações abaixo de 0,6 mg/mL são instáveis no produto consultado; não usar soluções salinas para esta preparação.',
      source:'https://www.medicines.org.uk/emc/product/8739/smpc'
    },
    {
      drug:'Heparina', code:'HEP', status:'Protocolo local',
      prep:'Perfusão IV: concentração final definida pelo protocolo', conc:'Sem concentração única no SmPC consultado',
      diluent:'Glicose 5% ou NaCl 0,9%',
      note:'O SmPC permite perfusão contínua nestes diluentes, mas a concentração final deve corresponder ao protocolo/indicação local.',
      source:'https://www.medicines.org.uk/emc/product/1680/smpc'
    }
  ];

  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function localPrepFor(drug){
    const n=drug.toLowerCase().replace(' iv','');
    const p=(window.state?.presets||[]).find(x=>String(x.name||'').toLowerCase().includes(n)||n.includes(String(x.name||'').toLowerCase()));
    return p?`${p.amount} ${p.unit} / ${p.vol} mL`:'';
  }

  function render(){
    const q=(document.getElementById('perfDilutionSearch')?.value||'').trim().toLowerCase();
    const grid=document.getElementById('perfDilutionGrid'); if(!grid)return;
    const rows=REFS.filter(x=>Object.values(x).join(' ').toLowerCase().includes(q));
    grid.innerHTML=rows.map(x=>{
      const lp=localPrepFor(x.drug);
      return `<article class="perf-dil-card">
        <div class="perf-dil-top"><div class="perf-dil-code">${esc(x.code)}</div><div class="perf-dil-title"><h3>${esc(x.drug)}</h3><span>${esc(x.status)}</span></div></div>
        <div class="perf-dil-main"><span>PREPARAÇÃO</span><strong>${esc(x.prep)}</strong></div>
        <div class="perf-dil-conc"><span>CONCENTRAÇÃO FINAL</span><b>${esc(x.conc)}</b></div>
        <div class="perf-dil-line"><span>Diluente</span><b>${esc(x.diluent)}</b></div>
        ${lp?`<div class="perf-local-line"><span>Preparação local guardada</span><b>${esc(lp)}</b></div>`:''}
        <p>${esc(x.note)}</p>
        <a class="perf-source" href="${esc(x.source)}" target="_blank" rel="noopener">Abrir SmPC ↗</a>
      </article>`;
    }).join('')||'<div class="item"><span>Sem resultados.</span></div>';
  }

  function bindDoseGlobals(){
    ['infDrug','infAmount','infAmountUnit','infVol','infWt','infDU','infDose','infRate','infResult','preName','preAmt','preUnit','preVol','preDU','presetList'].forEach(id=>{const el=document.getElementById(id);if(el)window[id]=el;});
    const d=document.getElementById('infDrug');
    if(d&&window.drugDefaults)d.addEventListener('change',()=>{document.getElementById('infDU').value=window.drugDefaults[d.value]||'mcgkgmin'});
  }

  window.togglePerfDoseCalc=function(){
    const p=document.getElementById('perfDosePanel');if(!p)return;
    const open=!p.classList.contains('open');p.classList.toggle('open',open);
    const b=document.getElementById('perfDoseToggle');if(b){b.classList.toggle('active',open);b.setAttribute('aria-expanded',String(open));}
  };
  window.togglePerfLocal=function(){
    const p=document.getElementById('perfLocalPanel');if(!p)return;
    const open=!p.classList.contains('open');p.classList.toggle('open',open);
  };
  window.renderPerfDilutions=render;

  function install(){
    const host=document.getElementById('clin-perf');if(!host||host.dataset.dilutionUi==='1')return;
    host.dataset.dilutionUi='1';
    host.innerHTML=`
      <div class="perf-head">
        <div><div class="perf-eyebrow">PERFUSÕES · REFERÊNCIA RÁPIDA</div><h3>Diluições e preparações</h3><p>Primeiro a preparação. Cálculo de dose fica disponível apenas quando precisares.</p></div>
        <button id="perfDoseToggle" type="button" class="perf-dose-toggle" onclick="togglePerfDoseCalc()" aria-expanded="false"><span>ƒx</span><b>Calcular<br>dose</b></button>
      </div>
      <div class="perf-safety">As concentrações abaixo são referências de SmPC/produto e não substituem a preparação institucional. Confirma apresentação, concentração da ampola, diluente, via e protocolo local antes de administrar.</div>
      <div class="perf-toolbar"><div class="search"><span>⌕</span><input id="perfDilutionSearch" oninput="renderPerfDilutions()" placeholder="Pesquisar fármaco, concentração ou diluente..."></div><button class="btn small" onclick="togglePerfLocal()">Preparações locais</button></div>
      <div id="perfDilutionGrid" class="perf-dil-grid"></div>

      <section id="perfDosePanel" class="perf-collapsible">
        <div class="perf-panel-head"><div><span>CÁLCULO</span><h3>Dose ↔ débito</h3></div><button class="btn small" onclick="togglePerfDoseCalc()">Fechar</button></div>
        <div class="form3">
          <label>Fármaco<select id="infDrug"><option>Noradrenalina</option><option>Adrenalina</option><option>Dobutamina</option><option>Dopamina</option><option>Propofol</option><option>Dexmedetomidina</option><option>Alfentanil</option><option>Remifentanil</option><option>Rocurónio</option><option>Insulina</option><option>Amiodarona</option><option>Heparina</option></select></label>
          <label>Quantidade<input id="infAmount" type="number" step="any"></label>
          <label>Unidade<select id="infAmountUnit"><option>mg</option><option>mcg</option><option>g</option><option>UI</option></select></label>
          <label>Volume final mL<input id="infVol" type="number" step="any"></label>
          <label>Peso kg<input id="infWt" type="number" step="any"></label>
          <label>Unidade dose<select id="infDU"><option value="mcgkgmin">mcg/kg/min</option><option value="mcgkgh">mcg/kg/h</option><option value="mgkgh">mg/kg/h</option><option value="mcgmin">mcg/min</option><option value="mgh">mg/h</option><option value="uikgh">UI/kg/h</option><option value="uih">UI/h</option></select></label>
          <label>Dose alvo<input id="infDose" type="number" step="any"></label><label>Débito mL/h<input id="infRate" type="number" step="any"></label>
        </div>
        <div class="actions"><button class="btn primary" onclick="doseToRate()">Dose → mL/h</button><button class="btn" onclick="rateToDose()">mL/h → Dose</button></div>
        <div id="infResult" class="result"><div class="big">—</div><div class="subtext">Introduz a concentração real utilizada.</div></div>
      </section>

      <section id="perfLocalPanel" class="perf-collapsible">
        <div class="perf-panel-head"><div><span>LOCAL</span><h3>Guardar preparação habitual</h3></div><button class="btn small" onclick="togglePerfLocal()">Fechar</button></div>
        <div class="form3"><label>Nome<input id="preName"></label><label>Quantidade<input id="preAmt" type="number" step="any"></label><label>Unidade<select id="preUnit"><option>mg</option><option>mcg</option><option>g</option><option>UI</option></select></label><label>Volume mL<input id="preVol" type="number"></label><label>Unidade dose<select id="preDU"><option value="mcgkgmin">mcg/kg/min</option><option value="mcgkgh">mcg/kg/h</option><option value="mgkgh">mg/kg/h</option><option value="mcgmin">mcg/min</option><option value="mgh">mg/h</option><option value="uih">UI/h</option></select></label></div>
        <div class="actions"><button class="btn primary" onclick="addPreset();renderPerfDilutions()">Guardar</button></div><div id="presetList" class="list"></div>
      </section>`;

    if(!document.getElementById('perf-ref-style')){
      const s=document.createElement('style');s.id='perf-ref-style';s.textContent=`
        #clin-perf{margin-top:12px}.perf-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin:4px 0 12px}.perf-head h3{font-size:26px;margin:2px 0 5px;letter-spacing:-.03em}.perf-head p{margin:0;color:var(--muted);font-size:11px}.perf-eyebrow{font-size:9px;font-weight:900;letter-spacing:.17em;color:#78d8ff}.perf-dose-toggle{flex:0 0 auto;width:92px;height:74px;border:1px solid rgba(77,195,239,.28);border-radius:17px;background:linear-gradient(145deg,rgba(13,46,67,.9),rgba(8,25,38,.95));color:var(--text);display:grid;grid-template-columns:28px 1fr;gap:7px;align-items:center;padding:10px;cursor:pointer;box-shadow:0 12px 30px rgba(0,0,0,.22)}.perf-dose-toggle span{width:28px;height:28px;display:grid;place-items:center;border-radius:9px;background:rgba(61,190,240,.12);color:#8ce5ff;font-weight:900}.perf-dose-toggle b{font-size:10px;line-height:1.15;text-align:left}.perf-dose-toggle.active{border-color:rgba(95,216,255,.65);background:rgba(17,55,76,.95)}
        .perf-safety{border-left:3px solid #4fbde7;background:rgba(12,38,55,.58);border-radius:0 12px 12px 0;padding:10px 12px;color:#bad4e2;font-size:10px;line-height:1.5;margin-bottom:11px}.perf-toolbar{display:flex;gap:8px;align-items:center;margin-bottom:10px}.perf-toolbar .search{flex:1}.perf-dil-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.perf-dil-card{border:1px solid rgba(101,150,183,.18);border-radius:18px;background:linear-gradient(160deg,rgba(10,28,42,.86),rgba(7,18,28,.92));padding:14px;min-width:0;box-shadow:0 12px 32px rgba(0,0,0,.16)}.perf-dil-top{display:flex;gap:10px;align-items:center;margin-bottom:12px}.perf-dil-code{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:rgba(39,139,181,.14);border:1px solid rgba(86,191,232,.21);font-size:9px;font-weight:950;color:#8de3ff}.perf-dil-title h3{margin:0;font-size:14px}.perf-dil-title span{display:inline-block;margin-top:3px;font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#82a8be}.perf-dil-main{border-radius:13px;background:rgba(9,40,56,.7);border:1px solid rgba(63,153,191,.18);padding:11px;margin-bottom:7px}.perf-dil-main span,.perf-dil-conc span{display:block;font-size:8px;letter-spacing:.12em;color:#6fa4bd;font-weight:900}.perf-dil-main strong{display:block;margin-top:5px;font-size:14px;line-height:1.3;color:#eaf8ff}.perf-dil-conc{padding:8px 2px 10px}.perf-dil-conc b{display:block;margin-top:3px;font-size:18px;color:#89dcff}.perf-dil-line,.perf-local-line{display:grid;grid-template-columns:80px minmax(0,1fr);gap:7px;padding:7px 0;border-top:1px solid rgba(92,132,160,.12)}.perf-dil-line span,.perf-local-line span{font-size:9px;color:var(--muted)}.perf-dil-line b,.perf-local-line b{font-size:9px;font-weight:700}.perf-local-line{color:#99e6be}.perf-dil-card p{font-size:9px;line-height:1.5;color:var(--muted);margin:9px 0}.perf-source{font-size:9px;color:#86dfff;text-decoration:none}.perf-source:hover{text-decoration:underline}.perf-collapsible{display:none;margin-top:12px;border:1px solid rgba(84,150,186,.24);border-radius:18px;background:rgba(7,20,31,.9);padding:14px}.perf-collapsible.open{display:block}.perf-panel-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px}.perf-panel-head span{font-size:8px;letter-spacing:.14em;color:#78bad6;font-weight:900}.perf-panel-head h3{margin:2px 0 0;font-size:16px}
        @media(max-width:760px){.perf-dil-grid{grid-template-columns:1fr}.perf-head h3{font-size:22px}.perf-dose-toggle{width:82px;height:68px}.perf-toolbar{align-items:stretch}.perf-toolbar .btn{white-space:nowrap}.perf-dil-main strong{font-size:13px}}
      `;document.head.appendChild(s);
    }
    bindDoseGlobals();
    const drug=document.getElementById('infDrug');if(drug&&window.drugDefaults)drug.addEventListener('change',()=>{document.getElementById('infDU').value=window.drugDefaults[drug.value]||'mcgkgmin'});
    if(typeof window.renderPresets==='function')window.renderPresets();
    render();
  }

  install();
})();