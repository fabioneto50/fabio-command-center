/* Training bank: distinguish learning objectives from numeric variants. */
(()=>{
 'use strict';const C=FCCCore,U=FCCUI,esc=C.escapeHTML,KEY='fcc-case-review-v1';
 let bank=[],sources={},exam=null,selected=null,answered=false,query='';
 function stats(){try{return JSON.parse(FCCStore.getItem(KEY)||'{"attempts":[],"objectives":{}}');}catch(e){return {attempts:[],objectives:{}};}}
 function record(item,correct){
  if(!FCCAccess.isUnlocked())return;
  const s=stats(),k=C.objective(item);s.attempts=(s.attempts||[]).slice(-1999);s.attempts.push({id:item.id,objective:k,correct,at:new Date().toISOString()});s.objectives=s.objectives||{};const o=s.objectives[k]||{correct:0,total:0};o.total++;if(correct)o.correct++;o.lastCorrect=correct;o.lastAt=new Date().toISOString();s.objectives[k]=o;
  FCCStore.setItem(KEY,JSON.stringify(s)).catch(e=>U.notify(e.message,'error'));
 }
 function renderStats(){const el=document.getElementById('fccCaseStats');if(!el)return;if(!FCCAccess.isUnlocked()){el.innerHTML='Treino sem guardar progresso. <button type="button" class="btn small" id="fccCaseUnlock">Desbloquear para guardar</button>';el.querySelector('button').onclick=()=>FCCAccess.run(renderStats);return;}const a=stats().attempts||[];el.textContent=`${a.length} respostas guardadas · ${a.filter(x=>x.correct).length} corretas · progresso cifrado no dispositivo`;}
 function list(){
  const root=document.getElementById('fccCaseList');if(!root)return;
  const grouped=new Map();bank.forEach(c=>{const key=C.objective(c);if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(c);});
  const q=C.fold(query);root.innerHTML=[...grouped.values()].filter(a=>!q||C.fold(a[0].topic+' '+a[0].subtopic+' '+a[0].text).includes(q)).map(a=>`<button class="btn fcc-module-link" data-case="${esc(a[0].id)}"><strong>${esc(a[0].topic+' · '+a[0].subtopic)}</strong><small>${a.length} variantes do mesmo objetivo</small></button>`).join('')||'<div class="fcc-empty">Sem objetivos encontrados.</div>';
  root.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>open(b.dataset.case));
 }
 function renderQuestion(){
  const root=document.getElementById('caseArea');if(!root||!selected)return;
  const c=selected;root.innerHTML=`<div class="card full"><div class="fcc-case-stats">${exam?'Teste · '+(exam.index+1)+'/'+exam.items.length:'Treino individual'}</div><h3 tabindex="-1">${esc(c.topic+' · '+c.subtopic)}</h3><p>${esc(c.text)}</p><div class="fcc-case-choices">${c.choices.map((choice,i)=>`<button type="button" class="btn fcc-case-choice" data-choice="${i}" data-choice-id="${esc(c.choiceIds[i])}">${String.fromCharCode(65+i)}. ${esc(choice)}</button>`).join('')}</div><div id="fccCaseFeedback" aria-live="polite"></div></div>`;
  root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>answer(+b.dataset.choice));root.querySelector('h3').focus({preventScroll:true});
 }
 function source(c){const s=sources[c.source];if(!s)return '<p>Referência não indicada nesta variante.</p>';return `<a class="btn small" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`;}
 function answer(i){
  if(answered||!selected)return;answered=true;const correct=i===selected.correct;
  document.querySelectorAll('#caseArea [data-choice]').forEach(b=>{b.disabled=true;if(+b.dataset.choice===selected.correct)b.classList.add('correct');else if(+b.dataset.choice===i)b.classList.add('wrong');});
  record(selected,correct);if(exam&&correct)exam.score++;
  const out=document.getElementById('fccCaseFeedback');out.innerHTML=`<div class="advice"><strong>${correct?'Resposta correta':'Resposta a rever'}</strong><p>${esc(selected.why)}</p><details><summary>Fonte e limites</summary>${source(selected)}<p>Conteúdo de treino preservado da base anterior. A reorganização de perguntas não representa validação clínica nova.</p></details><div class="actions"><button class="btn primary" id="fccCaseNext">${exam?'Seguinte':'Outra variante'}</button></div></div>`;
  out.querySelector('button').onclick=()=>{
   if(exam){exam.index++;if(exam.index>=exam.items.length){const root=document.getElementById('caseArea');root.innerHTML=`<div class="card full"><h3>Teste concluído</h3><p>${exam.score} / ${exam.items.length} respostas corretas, sem repetir objetivos no mesmo teste.</p><button class="btn" id="fccNewExam">Novo teste</button></div>`;root.querySelector('button').onclick=()=>start();exam=null;selected=null;renderStats();return;}selected=exam.items[exam.index];answered=false;renderQuestion();}
   else{const variants=bank.filter(c=>C.objective(c)===C.objective(selected));open(variants[Math.floor(Math.random()*variants.length)].id);}
  };renderStats();
 }
 function open(id,{route=true}={}){
  const c=bank.find(x=>x.id===id);if(!c)return false;exam=null;selected=C.shuffleCase(c);answered=false;renderQuestion();if(route)FCCNavigation.replaceDetail(c.id,false);return true;
 }
 function start(reviewOnly=false){
  let rows=bank;if(reviewOnly){const s=stats();rows=bank.filter(x=>s.objectives?.[C.objective(x)]?.lastCorrect===false);if(!rows.length){U.notify('Sem objetivos marcados para revisão.');return;}}
  const items=C.sampleCases(rows,10);exam={items,index:0,score:0};selected=items[0];answered=false;renderQuestion();
 }
 function install(){
  const host=document.getElementById('clin-cases'),objectives=new Set(bank.map(C.objective)).size;
  host.innerHTML=`<section class="card full"><h3>Casos clínicos · ${objectives} objetivos</h3><p>${bank.length} variantes de treino. Cada teste seleciona até 10 objetivos diferentes e altera a ordem das respostas.</p><div class="actions"><button class="btn primary" id="fccRandomCase">Caso aleatório</button><button class="btn" id="fccStartCaseTest">Teste de 10 perguntas</button><button class="btn" id="fccReviewCases">Rever erros</button></div><div class="fcc-case-stats" id="fccCaseStats"></div></section><div id="caseArea"></div><section class="card full"><label>Pesquisar objetivo<input type="search" id="fccCaseSearch"></label><div class="fcc-module-menu" id="fccCaseList"></div></section><span id="caseScore" hidden></span>`;
  host.querySelector('#fccRandomCase').onclick=()=>open(bank[Math.floor(Math.random()*bank.length)].id);
  host.querySelector('#fccStartCaseTest').onclick=()=>start();host.querySelector('#fccReviewCases').onclick=()=>FCCAccess.run(()=>start(true));host.querySelector('#fccCaseSearch').oninput=e=>{query=e.target.value;list();};list();renderStats();
 }
 window.FCCCasesReady=(async()=>{[bank,sources]=await Promise.all([FCCModules.json('data/cases.json'),FCCModules.json('data/case-sources.json')]);if(bank.length!==200)throw new Error('Banco de casos incompleto.');window.FCC_CASE_BANK=bank;install();window.FCCCases=Object.freeze({open,start,bank:()=>bank});window.newCase=()=>open(bank[Math.floor(Math.random()*bank.length)].id);document.addEventListener('fcc-private-refresh',()=>{renderStats();if(!FCCAccess.isUnlocked()){exam=null;selected=null;document.getElementById('caseArea')?.replaceChildren();}});return true;})();
})();
