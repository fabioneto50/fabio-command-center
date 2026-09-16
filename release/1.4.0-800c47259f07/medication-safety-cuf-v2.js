(()=>{
  if(window.__fccMedicationSafetyCUFV2Installed)return;
  window.__fccMedicationSafetyCUFV2Installed=true;

  const PRO={
    printedCode:'PRO.0110.04',
    fileCode:'PRO.0110.03',
    date:'2021-06-18',
    vigente:'29-04-2026',
    title:'Medicamentos de alerta máximo, medicamentos look-alike sound-alike e concentrados eletrolíticos'
  };
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const uniq=(arr,keyFn)=>{const seen=new Set();return arr.filter(x=>{const k=keyFn(x);if(seen.has(k))return false;seen.add(k);return true})};
  const aliases={
    'alfentanil':['alfentanilo'],
    'remifentanil':['remifentanilo'],
    'fentanil':['fentanilo'],
    'sufentanil':['sufentanilo'],
    'insulina regular':['insulina hum soluvel'],
    'heparina nao fracionada':['heparina 25.000ui/5 ml'],
    'acido tranexamico':['ac tranexamico'],
    'vasopressina':['argipressina (vasop)'],
    'cloreto de potassio':['cloreto potassio','cloreto potassio 20%'],
    'gluconato de calcio':['calcio gluconato'],
    'cloreto de calcio':['cloreto calcio'],
    'sulfato de magnesio':['sulfato magnesio'],
    'bicarbonato de sodio':['bicarb sodio','bicarbonato sodio'],
    'fosfato de potassio':['fosf monopotassico','fosf bipotassico'],
    'agua para injetaveis':['agua p/ injectaveis'],
    'metotrexato':['metotrexato']
  };

  let data=null,records=[],cats=[],visibleLimit=80,processing=false,queued=false;

  function cleanMedName(name){
    return fold(name)
      .replace(/\s+(iv|ev|oral|or|sc|im|inalatorio|inal|topico|top|oftalmico|nasal|retal)\b.*$/,'')
      .replace(/\s+\([^)]*\)\s*$/,'')
      .trim();
  }
  function termsForMed(name){
    const n=cleanMedName(name);
    const out=[n,...(aliases[n]||[])].map(fold).filter(x=>x.length>=3);
    return [...new Set(out)];
  }
  function recordsForMed(name){
    const terms=termsForMed(name);
    if(!terms.length)return[];
    const matched=records.filter(r=>{
      const h=fold(r.designation);
      return terms.some(t=>h===t||h.startsWith(t+' ')||h.startsWith(t+'/')||h.startsWith(t+'+')||h.startsWith(t+'(')||h.startsWith(t));
    });
    return uniq(matched,r=>`${r.category}|${r.designation}|${r.code}`);
  }
  function isElectrolyte(r){
    const c=fold(r.category);
    return c.includes('concentrado electrolit')||c.includes('concentrado eletrolit')||c.includes('cloreto de potassio para perfusao')||c.includes('fosfato de potass')||c.includes('sulfato de magnesio')||c.includes('cloreto de sodio hipertonico');
  }

  function targetOf(tab){
    const data=tab?.dataset?.subId||'';
    if(data)return data;
    const on=tab?.getAttribute('onclick')||tab?.dataset?.originalOnclick||'';
    return on.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||'';
  }

  function ensureTab(){
    const page=document.getElementById('page-clinical'),wrap=page?.querySelector(':scope > .tabs');
    if(!page||!wrap)return false;
    if(!document.getElementById('clin-lasa')){
      const sec=document.createElement('div');sec.id='clin-lasa';sec.className='sub';
      const anchor=document.getElementById('clin-drugs');
      if(anchor?.parentNode)anchor.after(sec);else page.appendChild(sec);
    }
    let tab=[...wrap.querySelectorAll(':scope > .tab')].find(t=>targetOf(t)==='clin-lasa');
    if(!tab){
      tab=document.createElement('button');tab.className='tab';tab.type='button';tab.dataset.subId='clin-lasa';tab.textContent='Medicação LASA';
      const drugTab=[...wrap.querySelectorAll(':scope > .tab')].find(t=>targetOf(t)==='clin-drugs');
      if(drugTab)drugTab.after(tab);else wrap.appendChild(tab);
    }
    return true;
  }

  function symbolCard(kind,title,desc){
    let art='';
    if(kind==='alert')art='<div class="cuf-sym-oct"><span>ALERTA<br>MÁXIMO</span></div>';
    if(kind==='traffic')art='<div class="cuf-sym-traffic"><i></i><i></i><i></i></div>';
    if(kind==='dilution')art='<div class="cuf-sym-yellow">DILUIÇÃO OBRIGATÓRIA</div>';
    if(kind==='electrolyte')art='<div class="cuf-sym-yellow cuf-sym-two">DILUIÇÃO OBRIGATÓRIA<small>CONCENTRADO ELETRÓLITO</small></div>';
    if(kind==='acid')art='<div class="cuf-sym-acid"></div>';
    if(kind==='tallman')art='<div class="cuf-sym-tall">Tall <b>MAN</b> Lettering</div>';
    return `<article class="cuf-symbol-card"><div class="cuf-symbol-art">${art}</div><div><h4>${esc(title)}</h4><p>${esc(desc)}</p></div></article>`;
  }

  function nineRights(){
    const items=[
      'Doente certo','Medicamento certo (rótulo certo)','Dose/concentração certa','Via de administração certa',
      'Hora/frequência posológica certa','Tempo de administração certo','Validade certa','Informação ao doente certa','Registo certo'
    ];
    return `<div class="cuf-nine">${items.map((x,i)=>`<span><b>${i+1}</b>${esc(x)}</span>`).join('')}</div>`;
  }

  function renderSafetyShell(){
    const host=document.getElementById('clin-lasa');if(!host||host.dataset.cufRendered==='1')return;
    host.dataset.cufRendered='1';
    host.innerHTML=`
      <div class="cuf-safe-shell">
        <div class="cuf-safe-hero">
          <div><span class="eyebrow">SEGURANÇA DO MEDICAMENTO</span><h2>Medicação LASA</h2><p>Look-alike / sound-alike, símbolos de rotulagem e medicação de Alerta Máximo.</p></div>
          <div class="cuf-safe-meta"><span class="badge good">IMP.1636.05</span><span class="badge">${esc(PRO.printedCode)}</span></div>
        </div>

        <div class="cuf-safe-grid">
          <article class="card full cuf-lasa-card">
            <div class="cuf-safe-head"><div><span class="eyebrow">LASA</span><h3>Definição e identificação</h3></div><span class="badge">${esc(PRO.printedCode)}</span></div>
            <p><b>Medicamentos LASA</b> são medicamentos com nome ortográfico e/ou fonético e/ou aspeto semelhantes que podem ser confundidos uns com os outros. <b>Look-alike</b> refere-se ao aspeto ou ortografia semelhante; <b>sound-alike</b> ao nome foneticamente semelhante.</p>
            <div class="cuf-lasa-callout"><b>Tall Man Lettering</b><span>O procedimento determina a inserção seletiva de letras maiúsculas no meio das denominações de medicamentos ortograficamente semelhantes para facilitar a diferenciação.</span></div>
            <div class="cuf-source-gap">O documento fornecido define o processo LASA, mas <b>não enumera uma lista nominal de pares LASA</b>. Por segurança, esta aplicação não atribui estatuto LASA a um medicamento sem uma lista institucional específica.</div>
          </article>

          <article class="card full">
            <div class="cuf-safe-head"><div><span class="eyebrow">ROTULAGEM</span><h3>Símbolos e indicações</h3></div><span class="badge">${esc(PRO.printedCode)} · 4.3</span></div>
            <div class="cuf-symbol-grid">
              ${symbolCard('alert','Alerta Máximo','Medicamentos de alerta máximo, incluindo medicamentos LASA.')}
              ${symbolCard('traffic','Várias dosagens','Mesma substância ativa e mesma forma farmacêutica com várias dosagens disponíveis na Unidade.')}
              ${symbolCard('dilution','Diluição obrigatória','Etiqueta de fundo amarelo com a inscrição “DILUIÇÃO OBRIGATÓRIA”.')}
              ${symbolCard('electrolyte','Concentrado eletrólito','Concentrados eletrolíticos: “DILUIÇÃO OBRIGATÓRIA” e “CONCENTRADO ELETRÓLITO”.')}
              ${symbolCard('acid','Ácido de uso externo','Identificação por faixa/etiqueta vermelha para ácido de uso externo.')}
              ${symbolCard('tallman','LASA · Tall Man','Maiúsculas seletivas nas denominações ortograficamente semelhantes.')}
            </div>
          </article>

          <article class="card full">
            <div class="cuf-safe-head"><div><span class="eyebrow">PRÁTICA SEGURA</span><h3>Indicações do procedimento</h3></div><span class="badge">${esc(PRO.printedCode)}</span></div>
            <div class="cuf-rule-grid">
              <div><b>Segregação LASA</b><span>Nos armários, os medicamentos LASA não podem estar lado a lado, mesmo que a ordem alfabética deixe de ser cumprida.</span></div>
              <div><b>Dupla verificação</b><span>Reforçar a dupla verificação dos cálculos de dosagem para Alerta Máximo, LASA e Concentrados Eletrolíticos.</span></div>
              <div><b>Prescrição manual</b><span>Não utilizar abreviaturas. Caligrafia ilegível deve ser validada com o prescritor e requer nova prescrição.</span></div>
              <div><b>Ordem verbal</b><span>Para medicamentos de Alerta Máximo, fica reservada a situações de urgência/emergência.</span></div>
              <div><b>Concentrados eletrolíticos</b><span>Rotulagem individual amarela; nos carros de emergência, acondicionamento em saco transparente com fecho e etiqueta amarela grande no exterior.</span></div>
              <div><b>Preparação</b><span>Centralizar sempre que possível e garantir concordância entre dose prescrita, registo e programação das bombas/dispositivos de perfusão.</span></div>
            </div>
            <h4 class="cuf-nine-title">9 certos de preparação e administração</h4>${nineRights()}
          </article>

          <article class="card full cuf-imp-card">
            <div class="cuf-safe-head"><div><span class="eyebrow">ALERTA MÁXIMO</span><h3>Lista institucional · IMP.1636.05</h3><p id="cufImpCount"></p></div><span class="badge good">Vigente 29-04-2026</span></div>
            <div class="cuf-imp-tools"><input id="cufImpSearch" class="input" type="search" placeholder="Pesquisar medicamento, código ou grupo…" autocomplete="off"><select id="cufImpGroup" class="input"><option value="">Todos os grupos</option></select></div>
            <div id="cufImpList" class="cuf-imp-list"></div>
            <button class="btn" id="cufImpMore" type="button" style="display:none">Mostrar mais</button>
            <div class="cuf-safe-foot">Os códigos pertencem à apresentação concreta indicada no IMP.1636.05. Não extrapolar o código para outra concentração, forma farmacêutica ou via.</div>
          </article>

          <article class="card full cuf-source-card">
            <span class="eyebrow">FONTES INSTITUCIONAIS</span>
            <p><b>IMP.1636.05</b> · Lista de Medicação Alerta Máximo · 15 páginas · versão vigente à data 29-04-2026.</p>
            <p><b>${esc(PRO.printedCode)}</b> · ${esc(PRO.title)} · ${esc(PRO.date)} · versão vigente à data ${esc(PRO.vigente)}.</p>
            <p class="cuf-doc-discrepancy">Nota documental: o nome do ficheiro anexado contém “${esc(PRO.fileCode)}”, mas o código impresso nas páginas do procedimento é “${esc(PRO.printedCode)}”. A aplicação usa o código impresso no documento.</p>
          </article>
        </div>
      </div>`;
  }

  function addStyles(){
    if(document.getElementById('cuf-med-safety-v2-style'))return;
    const s=document.createElement('style');s.id='cuf-med-safety-v2-style';s.textContent=`
      .cuf-safe-shell{display:grid;gap:12px}.cuf-safe-hero{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;border:1px solid var(--line);border-radius:18px;background:linear-gradient(145deg,var(--panel),var(--panel-2));padding:14px}.cuf-safe-hero h2{margin:2px 0 4px;font-size:24px}.cuf-safe-hero p{margin:0;color:var(--muted);font-size:9px}.cuf-safe-meta{display:flex;gap:6px;flex-wrap:wrap}.cuf-safe-grid{display:grid;gap:12px}.cuf-safe-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.cuf-safe-head h3{margin:2px 0 4px}.cuf-safe-head p{margin:0;color:var(--muted);font-size:8px}.cuf-lasa-card>p{font-size:9px;line-height:1.55;color:var(--text)}.cuf-lasa-callout{border:1px solid rgba(242,185,94,.28);background:var(--amber-soft);border-radius:12px;padding:10px;margin-top:9px}.cuf-lasa-callout b{display:block;color:var(--amber);font-size:9px}.cuf-lasa-callout span{display:block;color:var(--muted);font-size:8px;line-height:1.45;margin-top:3px}.cuf-source-gap{margin-top:8px;color:var(--muted);font-size:8px;line-height:1.5}.cuf-symbol-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.cuf-symbol-card{display:grid;grid-template-columns:110px minmax(0,1fr);align-items:center;gap:10px;border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:9px}.cuf-symbol-card h4{margin:0 0 3px;font-size:9px}.cuf-symbol-card p{margin:0;color:var(--muted);font-size:8px;line-height:1.45}.cuf-symbol-art{display:grid;place-items:center;min-height:64px}.cuf-sym-oct{width:74px;height:68px;background:#e11616;clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);display:grid;place-items:center;position:relative}.cuf-sym-oct:before{content:'';position:absolute;inset:6px;border:2px solid white;clip-path:inherit}.cuf-sym-oct span{position:relative;z-index:1;color:white;font-size:9px;font-weight:1000;text-align:center;line-height:1.15}.cuf-sym-traffic{width:35px;height:72px;border-radius:17px;background:#1a2025;border:2px solid #4b555c;display:grid;place-items:center;padding:5px 0;box-sizing:border-box}.cuf-sym-traffic i{display:block;width:15px;height:15px;border-radius:50%;box-shadow:0 0 0 2px rgba(255,255,255,.16)}.cuf-sym-traffic i:nth-child(1){background:#ef4a52}.cuf-sym-traffic i:nth-child(2){background:#f4dc45}.cuf-sym-traffic i:nth-child(3){background:#48c873}.cuf-sym-yellow{width:98px;min-height:38px;box-sizing:border-box;border:2px solid #111;background:#ffe900;color:#111;display:grid;place-items:center;text-align:center;padding:5px;font-size:8px;font-weight:1000;line-height:1.1}.cuf-sym-yellow small{font-size:7px;font-weight:1000}.cuf-sym-two{gap:3px}.cuf-sym-acid{width:96px;height:28px;background:#ef1010;border:1px solid #7d0000}.cuf-sym-tall{border:1px solid var(--line-strong);border-radius:9px;background:var(--panel);padding:10px 8px;font-size:9px;letter-spacing:.02em}.cuf-sym-tall b{font-size:13px;color:var(--clinical)}.cuf-rule-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:9px}.cuf-rule-grid>div{border:1px solid var(--line);border-radius:11px;background:var(--panel-2);padding:9px}.cuf-rule-grid b{display:block;font-size:9px}.cuf-rule-grid span{display:block;color:var(--muted);font-size:8px;line-height:1.45;margin-top:3px}.cuf-nine-title{margin:12px 0 7px;font-size:10px}.cuf-nine{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.cuf-nine span{display:flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:10px;padding:7px;font-size:8px}.cuf-nine b{display:grid;place-items:center;min-width:22px;height:22px;border-radius:7px;background:var(--clinical-soft);color:var(--clinical)}.cuf-imp-tools{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:7px;margin:9px 0}.cuf-imp-list{display:grid;gap:5px}.cuf-imp-row{display:grid;grid-template-columns:38px minmax(0,1fr) 90px;gap:8px;align-items:center;border:1px solid var(--line);border-radius:11px;background:var(--panel-2);padding:7px 8px}.cuf-imp-mini-oct{width:30px;height:28px;background:#e11616;clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);display:grid;place-items:center;color:#fff;font-size:6px;font-weight:1000;text-align:center;line-height:1}.cuf-imp-main b{display:block;font-size:9px}.cuf-imp-main span{display:block;color:var(--muted);font-size:7px;margin-top:2px}.cuf-imp-code{font-size:8px;text-align:right}.cuf-imp-code b{display:block;color:var(--clinical);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.cuf-safe-foot,.cuf-source-card p{font-size:8px;color:var(--muted);line-height:1.5}.cuf-safe-foot{margin-top:8px}.cuf-doc-discrepancy{border-top:1px solid var(--line);padding-top:7px}.cuf-highalert-panel{margin-top:10px;border:1px solid rgba(235,74,82,.34);border-radius:12px;background:rgba(235,74,82,.055);padding:9px}.cuf-highalert-panel>summary{cursor:pointer;display:flex;align-items:center;gap:7px;font-size:9px;font-weight:900;color:#ff7c82}.cuf-highalert-panel>summary span:last-child{margin-left:auto;color:var(--muted);font-size:8px}.cuf-highalert-note{font-size:7px;color:var(--muted);line-height:1.45;margin:7px 0}.cuf-highalert-row{display:grid;grid-template-columns:minmax(0,1fr) 90px;gap:7px;border-top:1px solid var(--line);padding:7px 0;font-size:8px}.cuf-highalert-row small{display:block;color:var(--muted);font-size:7px;margin-top:2px}.cuf-ha-electro{display:inline-block;margin-left:5px;border:1px solid #6b5e00;background:#ffe900;color:#111;border-radius:5px;padding:2px 4px;font-size:6px;font-weight:1000}.cuf-ha-code{text-align:right;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--clinical)}
      @media(max-width:760px){.cuf-safe-hero{align-items:flex-start;flex-direction:column}.cuf-symbol-grid,.cuf-rule-grid{grid-template-columns:1fr}.cuf-symbol-card{grid-template-columns:92px minmax(0,1fr)}.cuf-nine{grid-template-columns:1fr}.cuf-imp-tools{grid-template-columns:1fr}.cuf-imp-row{grid-template-columns:34px minmax(0,1fr);}.cuf-imp-code{grid-column:2;text-align:left}.cuf-highalert-row{grid-template-columns:1fr}.cuf-ha-code{text-align:left}}
      html[data-fcc-theme="light"] .cuf-symbol-card,html[data-fcc-theme="light"] .cuf-rule-grid>div,html[data-fcc-theme="light"] .cuf-imp-row{background:#fff!important}
    `;document.head.appendChild(s);
  }

  function populateGroups(){
    const sel=document.getElementById('cufImpGroup');if(!sel||sel.dataset.ready==='1')return;
    sel.dataset.ready='1';
    cats=[...new Set(records.map(r=>r.category))].sort((a,b)=>a.localeCompare(b,'pt',{sensitivity:'base'}));
    sel.insertAdjacentHTML('beforeend',cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join(''));
  }

  function filteredImp(){
    const q=fold(document.getElementById('cufImpSearch')?.value||'');
    const g=document.getElementById('cufImpGroup')?.value||'';
    const rows=records.filter(r=>{
      if(g&&r.category!==g)return false;
      if(!q)return true;
      return fold(`${r.designation} ${r.code} ${r.category}`).includes(q);
    });
    return uniq(rows,r=>`${r.category}|${r.designation}|${r.code}`);
  }

  function renderImp(){
    const list=document.getElementById('cufImpList');if(!list||!records.length)return;
    const rows=filteredImp(),shown=rows.slice(0,visibleLimit);
    list.innerHTML=shown.map(r=>`<div class="cuf-imp-row"><div class="cuf-imp-mini-oct">AM</div><div class="cuf-imp-main"><b>${esc(r.designation)}</b><span>${esc(r.category)} · pág. ${r.page}${isElectrolyte(r)?' · concentrado/eletrólito':''}</span></div><div class="cuf-imp-code">Código<b>${esc(r.code)}</b></div></div>`).join('')||'<div class="med5-empty">Sem resultados.</div>';
    const count=document.getElementById('cufImpCount');if(count)count.textContent=`${rows.length} registos encontrados · ${cats.length} grupos`;
    const more=document.getElementById('cufImpMore');if(more){more.style.display=rows.length>shown.length?'':'none';more.textContent=`Mostrar mais (${rows.length-shown.length})`}
  }

  function bindSafety(){
    populateGroups();renderImp();
    const q=document.getElementById('cufImpSearch'),g=document.getElementById('cufImpGroup'),m=document.getElementById('cufImpMore');
    if(q&&q.dataset.bound!=='1'){q.dataset.bound='1';q.addEventListener('input',()=>{visibleLimit=80;renderImp()})}
    if(g&&g.dataset.bound!=='1'){g.dataset.bound='1';g.addEventListener('change',()=>{visibleLimit=80;renderImp()})}
    if(m&&m.dataset.bound!=='1'){m.dataset.bound='1';m.addEventListener('click',()=>{visibleLimit+=80;renderImp()})}
  }

  function highAlertPanel(rows){
    const safe=uniq(rows,r=>`${r.category}|${r.designation}|${r.code}`);
    return `<details class="cuf-highalert-panel"><summary><span class="cuf-ha-mini">AM</span>Alerta Máximo · IMP.1636.05 <span>${safe.length} apresentação${safe.length===1?'':'ões'}</span></summary><div class="cuf-highalert-note">A classificação e o código aplicam-se à apresentação concreta indicada na lista institucional. Confirmar concentração, forma e via antes de utilizar o código.</div>${safe.map(r=>`<div class="cuf-highalert-row"><div><b>${esc(r.designation)}</b><small>${esc(r.category)} · pág. ${r.page}${isElectrolyte(r)?'<span class="cuf-ha-electro">CONCENTRADO ELETRÓLITO</span>':''}</small></div><div class="cuf-ha-code">${esc(r.code)}</div></div>`).join('')}</details>`;
  }

  function decorateMedicationDetails(){
    if(processing||!records.length)return;processing=true;
    try{
      document.querySelectorAll('#clin-drugs .med5-detail-row').forEach(host=>{
        if(host.querySelector('.cuf-highalert-panel'))return;
        const name=host.dataset.name||'';
        const rows=recordsForMed(name);
        if(!rows.length)return;
        const detail=host.querySelector('.med4-detail')||host;
        detail.insertAdjacentHTML('beforeend',highAlertPanel(rows));
      });
    }finally{processing=false}
  }
  function scheduleDecorate(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorateMedicationDetails()})}

  async function install(){
    if(!ensureTab()||!window.fccIMP1636Data)return false;
    data=await window.fccIMP1636Data;records=data.records||[];
    addStyles();renderSafetyShell();bindSafety();decorateMedicationDetails();
    const medHost=document.getElementById('clin-drugs');
    if(medHost&&!medHost.dataset.cufHaObserved){medHost.dataset.cufHaObserved='1';new MutationObserver(scheduleDecorate).observe(medHost,{childList:true,subtree:true})}
    window.fccRebindSubcategories?.();
    return true;
  }

  let tries=0;const boot=()=>{tries++;Promise.resolve(install()).then(ok=>{if(!ok&&tries<=70)setTimeout(boot,120)}).catch(()=>{if(tries<=70)setTimeout(boot,180)})};boot();
})();
