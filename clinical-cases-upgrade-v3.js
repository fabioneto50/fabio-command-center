(()=>{
  if(window.__fccClinicalCasesUpgradeV3Installed)return;
  window.__fccClinicalCasesUpgradeV3Installed=true;
  const SRC={
    SSC:{label:'Surviving Sepsis Campaign 2026',url:'https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines'},
    PADIS:{label:'SCCM PADIS Focused Update 2025',url:'https://www.sccm.org/clinical-resources/guidelines/guidelines/focused-update-padis-guideline'},
    ERC:{label:'ERC Guidelines 2025',url:'https://www.erc.edu/science-research/guidelines/guidelines-2025/'},
    ESCAF:{label:'ESC Atrial Fibrillation 2024',url:'https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/atrial-fibrillation/'},
    ESCACS:{label:'ESC Acute Coronary Syndromes 2023',url:'https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/acute-coronary-syndromes/'}
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const VARS=[
    {age:43,map:56,lac:'4,2',hr:168},{age:58,map:61,lac:'5,0',hr:176},{age:66,map:54,lac:'5,8',hr:154},{age:74,map:59,lac:'4,7',hr:182},{age:81,map:52,lac:'6,1',hr:160}
  ];
  const T=[
    ['Sépsis','Perfusão periférica','Doente de {age} anos com choque séptico em ressuscitação. Qual o papel do tempo de reperfusão capilar?',['Não tem qualquer utilidade','Pode ser usado como adjuvante a outras medidas de perfusão','Substitui obrigatoriamente lactato e avaliação clínica','Só é útil após alta da UCI'],1,'A SSC 2026 sugere usar o tempo de reperfusão capilar como adjuvante a outras medidas de perfusão.','SSC'],
    ['Choque','Escalada vasopressora','Choque séptico, MAP {map} mmHg e noradrenalina em escalada. Qual estratégia é apoiada pela SSC?',['Adicionar vasopressina quando a noradrenalina está a escalar','Trocar sempre para dopamina','Suspender vasopressor e aguardar','Usar terlipressina por rotina'],0,'A SSC 2026 sugere adicionar vasopressina em choque séptico sob doses crescentes de noradrenalina.','SSC'],
    ['Choque','Terceiro vasopressor','MAP permanece inadequada apesar de noradrenalina e vasopressina. Qual opção pode ser considerada?',['Epinefrina','Nitroprussiato','Furosemida como vasopressor','Terlipressina obrigatória'],0,'A SSC 2026 sugere adicionar epinefrina quando a MAP continua inadequada apesar de noradrenalina e vasopressina.','SSC'],
    ['Sedação','Sedação ligeira','Doente ventilado de {age} anos em que sedação ligeira e redução de delirium são prioridades. Qual opção é favorecida na atualização PADIS?',['Dexmedetomidina sobre propofol em contexto apropriado','Benzodiazepina obrigatória em todos','Bloqueio neuromuscular sem sedação','Sem avaliação de sedação'],0,'A atualização PADIS 2025 sugere dexmedetomidina sobre propofol quando sedação ligeira e/ou redução de delirium são prioridades.','PADIS'],
    ['Reabilitação','Mobilização UCI','Doente crítico estabilizado, sem contraindicação relevante. Qual abordagem é sugerida pela PADIS 2025?',['Mobilização/reabilitação reforçada em comparação com cuidados usuais','Repouso absoluto universal','Sedação profunda para impedir movimento','Evitar reabilitação durante toda a UCI'],0,'PADIS 2025 sugere mobilização/reabilitação reforçada em adultos internados em UCI.','PADIS'],
    ['Delirium','Antipsicóticos','Doente de {age} anos com delirium na UCI. Sobre antipsicóticos de rotina, qual formulação é correta?',['PADIS 2025 não conseguiu emitir recomendação a favor ou contra','São obrigatórios em todos os casos','São proibidos em qualquer circunstância','Substituem a procura de causas reversíveis'],0,'PADIS 2025 não emitiu recomendação a favor ou contra antipsicóticos para tratamento de delirium de rotina.','PADIS'],
    ['Arritmias','AF-CARE','Pessoa de {age} anos com fibrilhação auricular. Qual estrutura organiza a abordagem ESC 2024?',['AF-CARE: comorbilidades, evitar AVC/tromboembolismo, controlo de frequência/ritmo e reavaliação','Apenas cardioversão','Apenas controlo da frequência','Apenas anticoagulação sem reavaliação'],0,'A ESC 2024 organiza a abordagem da FA no framework AF-CARE.','ESCAF'],
    ['SCA','Avaliação inicial','Doente de {age} anos com dor torácica e alterações isquémicas no ECG. Qual princípio está alinhado com a ESC 2023?',['Avaliação e estratificação rápidas ao longo de todo o espectro de SCA','Aguardar sempre 24 h antes de ECG','Tratar STEMI e NSTE-ACS sem estratégia diagnóstica','Alta imediata se a dor diminuir'],0,'A guideline ESC 2023 integra diagnóstico, estratificação de risco e tratamento de todo o espectro de SCA.','ESCACS'],
    ['SAV','Ritmo desfibrilhável','PCR testemunhada com FV/TV sem pulso. Qual combinação é prioritária?',['RCP de elevada qualidade e desfibrilhação precoce','Esperar acesso venoso antes de desfibrilhar','Ventilar sem compressões','Aguardar exames laboratoriais'],0,'As ERC Guidelines 2025 mantêm RCP de alta qualidade e desfibrilhação precoce como pilares nos ritmos desfibrilháveis.','ERC'],
    ['Pós-PCR','Cuidados pós-ROSC','Após ROSC, doente de {age} anos permanece comatoso. Qual princípio é apropriado?',['Cuidados pós-ressuscitação estruturados com otimização fisiológica e pesquisa da causa','Suspender monitorização','Induzir hiperóxia sem alvo','Alta imediata'],0,'As ERC Guidelines 2025 incluem cuidados pós-ressuscitação estruturados como parte da cadeia de tratamento.','ERC']
  ];
  const fill=(s,v)=>String(s).replace(/\{(\w+)\}/g,(_,k)=>v[k]??'');
  function extras(){const out=[];let n=0;T.forEach((a,ai)=>VARS.forEach((v,vi)=>out.push({id:'ccx'+String(++n).padStart(3,'0'),topic:a[0],subtopic:a[1],title:`${a[0]} · ${a[1]} · extra ${vi+1}`,text:fill(a[2],v),choices:a[3],correct:a[4],why:a[5],source:a[6],variant:vi+6})));return out}
  let exam=null;
  function source(c){const s=SRC[c.source];return s?`<a class="btn small" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`:''}
  function sample(arr,n){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,n)}
  function ensureUI(bank){
    const heading=document.querySelector('#fccCaseBank h3');if(heading)heading.textContent='200 casos · treino crítico';
    const oldBtn=[...document.querySelectorAll('#clin-cases .actions .btn')].find(b=>/Novo caso|Caso aleatório/i.test(b.textContent));if(oldBtn&&!oldBtn.closest('#fccCaseModeActions'))oldBtn.remove();
    if(!document.getElementById('fccCaseModeActions')){
      const tools=document.querySelector('#fccCaseBank .fcc-case-tools')||document.getElementById('fccCaseBank');
      const row=document.createElement('div');row.id='fccCaseModeActions';row.className='fcc-case-mode-actions';row.innerHTML='<button class="btn primary" id="fccRandomCase" type="button">Caso aleatório</button><button class="btn" id="fccStartCaseTest" type="button">Teste · 10 perguntas</button>';
      tools?.before(row);document.getElementById('fccRandomCase').addEventListener('click',()=>{window.newCase?.();document.getElementById('caseArea')?.scrollIntoView({behavior:'smooth',block:'center'})});document.getElementById('fccStartCaseTest').addEventListener('click',()=>startExam(bank));
    }
    if(!document.getElementById('fcc-case-upgrade-style')){const s=document.createElement('style');s.id='fcc-case-upgrade-style';s.textContent=`.fcc-case-mode-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.fcc-case-exam{grid-column:1/-1;border:1px solid rgba(168,156,255,.28);background:var(--violet-soft);border-radius:16px;padding:14px;margin-bottom:10px}.fcc-case-exam-head{display:flex;gap:10px;align-items:center;justify-content:space-between}.fcc-case-exam-choice{display:block;width:100%;text-align:left;margin-top:7px;border:1px solid var(--line);background:var(--panel);border-radius:11px;padding:10px;cursor:pointer}.fcc-case-exam-choice.correct{border-color:var(--good);background:var(--tactical-soft)}.fcc-case-exam-choice.wrong{border-color:var(--danger);background:rgba(255,123,131,.08)}.fcc-case-progress{font-size:10px;color:var(--muted)}.fcc-case-exam-result{font-size:24px;font-weight:800;margin:8px 0}`;document.head.appendChild(s)}
  }
  function startExam(bank){exam={items:sample(bank,10),index:0,score:0,answered:false};renderExam()}
  function renderExam(){
    const host=document.querySelector('#clin-cases>.grid')||document.getElementById('clin-cases');if(!host||!exam)return;let box=document.getElementById('fccCaseExam');if(!box){box=document.createElement('section');box.id='fccCaseExam';box.className='fcc-case-exam';host.prepend(box)}
    if(exam.index>=exam.items.length){box.innerHTML=`<div class="fcc-case-exam-head"><div><span class="eyebrow">TESTE CONCLUÍDO</span><div class="fcc-case-exam-result">${exam.score}/10</div><p>Resultado do teste de 10 casos clínicos.</p></div></div><div class="actions"><button class="btn primary" id="fccExamAgain" type="button">Novo teste</button><button class="btn" id="fccExamClose" type="button">Fechar</button></div>`;document.getElementById('fccExamAgain').onclick=()=>startExam(window.FCC_CASE_BANK||[]);document.getElementById('fccExamClose').onclick=()=>{box.remove();exam=null};return}
    const c=exam.items[exam.index];box.innerHTML=`<div class="fcc-case-exam-head"><div><span class="eyebrow">TESTE CLÍNICO</span><h3>${esc(c.topic)} · ${esc(c.subtopic)}</h3></div><span class="fcc-case-progress">${exam.index+1}/10 · score ${exam.score}</span></div><p>${esc(c.text)}</p><div id="fccExamChoices">${c.choices.map((x,i)=>`<button class="fcc-case-exam-choice" type="button" data-i="${i}">${String.fromCharCode(65+i)}. ${esc(x)}</button>`).join('')}</div><div id="fccExamFeedback"></div>`;
    box.querySelectorAll('[data-i]').forEach(b=>b.addEventListener('click',()=>answerExam(+b.dataset.i)));
    box.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function answerExam(i){if(!exam||exam.answered)return;exam.answered=true;const c=exam.items[exam.index],box=document.getElementById('fccCaseExam');box.querySelectorAll('[data-i]').forEach(b=>{b.disabled=true;if(+b.dataset.i===c.correct)b.classList.add('correct');if(+b.dataset.i===i&&i!==c.correct)b.classList.add('wrong')});if(i===c.correct)exam.score++;const f=document.getElementById('fccExamFeedback');f.innerHTML=`<div class="advice" style="margin-top:9px"><strong>${i===c.correct?'Correto':'Resposta a rever'}</strong><br>${esc(c.why)}<div class="actions">${source(c)}<button class="btn primary" id="fccExamNext" type="button">${exam.index===9?'Ver resultado':'Seguinte'}</button></div></div>`;document.getElementById('fccExamNext').onclick=()=>{exam.index++;exam.answered=false;renderExam()}}
  function install(){
    const bank=window.FCC_CASE_BANK,ui=document.getElementById('fccCaseBank');if(!Array.isArray(bank)||!ui)return false;
    if(bank.length<200){const e=extras();const need=200-bank.length;bank.push(...e.slice(0,need))}
    ensureUI(bank);const search=document.getElementById('fccCaseSearch');if(search)search.dispatchEvent(new Event('input',{bubbles:true}));return true;
  }
  let tries=0;const boot=()=>{tries++;if(install()||tries>120)return;setTimeout(boot,120)};boot();
})();