(()=>{
  if(window.__fccIVCompatibilityExpandedV3Installed)return;
  window.__fccIVCompatibilityExpandedV3Installed=true;
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
  const alias={'norepinefrina':'Noradrenalina','norepinephrine':'Noradrenalina','epinefrina':'Adrenalina','epinephrine':'Adrenalina','fentanyl':'Fentanilo','magnesium sulfate':'Sulfato de magnésio','potassium chloride':'Cloreto de potássio','sodium bicarbonate':'Bicarbonato de sódio','piperacillin/tazobactam':'Piperacilina/tazobactam','piperacillin-tazobactam':'Piperacilina/tazobactam','acetaminophen':'Paracetamol','levetiracetam':'Levetiracetam'};
  const canon=n=>alias[fold(n)]||n;
  const key=(a,b)=>[canon(a),canon(b)].map(fold).sort().join('||');
  const DB={};
  const add=(a,b,status,title,conditions,note,source,url)=>DB[key(a,b)]={a,b,status,title,conditions,note,source,url};

  const LEV='https://pubmed.ncbi.nlm.nih.gov/34381262/';
  ['Cisatracúrio','Dexmedetomidina','Noradrenalina','Piperacilina/tazobactam','Propofol','Vancomicina','Vasopressina'].forEach(x=>add('Levetiracetam',x,'compatible','Compatível nas condições estudadas','Levetiracetam IV testado em NaCl 0,9% com concentrações clínicas do fármaco associado.','Estudo de simulação Y-site sem evidência de incompatibilidade física nos tempos avaliados.','Levetiracetam Y-site study',LEV));

  const PARA='https://pubmed.ncbi.nlm.nih.gov/24421562/';
  ['Ceftriaxona','Clindamicina','Fentanilo','Hidrocortisona','Midazolam','Morfina','Piperacilina/tazobactam','Vancomicina'].forEach(x=>add('Paracetamol',x,'compatible','Compatível nas condições estudadas','Paracetamol IV 10 mg/mL; condições específicas do estudo.','Compatibilidade física/química suportada no estudo de administração Y-site simulada.','Paracetamol IV Y-site study',PARA));
  add('Paracetamol','Aciclovir','incompatible','Incompatível','Paracetamol IV 10 mg/mL + aciclovir nas condições estudadas.','O estudo identificou incompatibilidade; não coadministrar pelo mesmo Y-site sem validação alternativa específica.','Paracetamol IV Y-site study',PARA);
  add('Paracetamol','Diazepam','incompatible','Incompatível','Paracetamol IV 10 mg/mL + diazepam nas condições estudadas.','O estudo identificou incompatibilidade; usar via/lúmen separado salvo validação específica.','Paracetamol IV Y-site study',PARA);

  const CAL='https://pubmed.ncbi.nlm.nih.gov/37438091/';
  ['Insulina regular','Adrenalina','Noradrenalina'].forEach(x=>{add('Cloreto de cálcio',x,'compatible','Compatível nas condições estudadas','Solução de cloreto de cálcio 10% em simulação Y-site de ressuscitação toxicológica.','A avaliação visual e contagem de partículas não identificaram incompatibilidade nas combinações testadas.','Calcium salts Y-site study',CAL);add('Gluconato de cálcio',x,'compatible','Compatível nas condições estudadas','Solução de gluconato de cálcio 10% em simulação Y-site de ressuscitação toxicológica.','A avaliação visual e contagem de partículas não identificaram incompatibilidade nas combinações testadas.','Calcium salts Y-site study',CAL)});

  const PROP='https://pubmed.ncbi.nlm.nih.gov/31157085/';
  add('Propofol','Sulfato de magnésio','compatible','Compatível nas condições estudadas','Propofol MCT/LCT 2% com solução de sulfato de magnésio 10%.','Não houve quebra da emulsão nem alteração visível relevante durante o período estudado.','Propofol + electrolytes study',PROP);
  add('Propofol','Cloreto de potássio','compatible','Compatível nas condições estudadas','Propofol MCT/LCT 2% com solução de cloreto de potássio 10%.','Não houve quebra da emulsão nem alteração visível relevante durante o período estudado.','Propofol + electrolytes study',PROP);

  const VAS='https://www.stabilis.org/Monographie.php?IdMolecule=482&IdOnglet=Incomp&codeLangue=EN-en';
  add('Vasopressina','Amiodarona','compatible','Compatível nas concentrações descritas','Stabilis contém combinações compatíveis, incluindo vasopressina 0,2 UI/mL + amiodarona 6 mg/mL e outras concentrações publicadas.','Confirmar concentração, diluente e apresentação local antes de extrapolar.','Stabilis 4.0',VAS);

  function meta(status){return status==='compatible'?{ico:'✓',lab:'COMPATÍVEL',cls:'ivc-ok',action:'Pode ser considerada administração em Y apenas nas condições documentadas.'}:{ico:'×',lab:'INCOMPATÍVEL',cls:'ivc-bad',action:'Não administrar simultaneamente no mesmo Y-site sem validação específica alternativa.'}}
  function markup(d,a,b){const m=meta(d.status);return `<div class="ivc-result ${m.cls}"><div class="ivc-result-head"><div class="ivc-signal">${m.ico}</div><div><div class="ivc-status">${m.lab} · EVIDÊNCIA ADICIONAL</div><h3>${esc(a)} + ${esc(b)}</h3></div></div><p><b>${esc(d.title)}</b> · ${esc(d.note)}</p><div class="ivc-action">${esc(m.action)}</div><div class="notice" style="margin-top:9px"><b>Condições:</b> ${esc(d.conditions)}</div><div class="ivc-v2-sources"><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.source)} ↗</a><a href="https://pdtm.vch.ca/Supporting%20Documents/IV%20Compatibility/Y-site%20Compatibility%20Critical%20Care%20Chart.pdf" target="_blank" rel="noopener">VCH Critical Care 2025 ↗</a><a href="https://www.stabilis.org/" target="_blank" rel="noopener">Stabilis ↗</a></div></div>`}
  function ensureOptions(select){
    ['Levetiracetam','Paracetamol','Aciclovir','Diazepam'].forEach(name=>{if(![...select.options].some(o=>fold(o.value)===fold(name)||fold(o.textContent)===fold(name))){const o=document.createElement('option');o.value=name;o.textContent=name;select.appendChild(o)}});
  }
  function apply(){
    const A=document.getElementById('ivcDrugA'),B=document.getElementById('ivcDrugB'),out=document.getElementById('ivcResult');if(!A||!B||!out||!A.value||!B.value)return;
    const current=fold(out.textContent);if(!current.includes('sem consenso')&&!current.includes('sem dados')&&!current.includes('nao integrada')&&!current.includes('não integrada'))return;
    const d=DB[key(A.value,B.value)];if(!d)return;
    const a=A.options[A.selectedIndex]?.textContent?.trim()||A.value,b=B.options[B.selectedIndex]?.textContent?.trim()||B.value;out.innerHTML=markup(d,a,b);
  }
  let wasActive=false;
  function active(){const p=document.getElementById('page-clinical'),h=document.getElementById('clin-ivcompat');return !!(p?.classList.contains('active')&&h?.classList.contains('active'))}
  function reset(){
    const A=document.getElementById('ivcDrugA'),B=document.getElementById('ivcDrugB'),out=document.getElementById('ivcResult');
    if(A)A.value='';if(B)B.value='';document.querySelectorAll('#clin-ivcompat .ivc-combo input').forEach(i=>i.value='');document.querySelectorAll('#clin-ivcompat .ivc-suggest').forEach(x=>x.classList.remove('open'));
    if(out)out.innerHTML='<div class="ivc-empty"><strong>Seleciona dois fármacos</strong><p>O resultado só é classificado quando existem referências suficientes para o par.</p></div>';
  }
  function install(){
    const A=document.getElementById('ivcDrugA'),B=document.getElementById('ivcDrugB');if(!A||!B)return false;ensureOptions(A);ensureOptions(B);
    A.addEventListener('change',()=>setTimeout(apply,0));B.addEventListener('change',()=>setTimeout(apply,0));
    document.getElementById('ivcResult')&&new MutationObserver(()=>queueMicrotask(apply)).observe(document.getElementById('ivcResult'),{childList:true});
    wasActive=active();document.addEventListener('fcc-subtab-change',e=>{if(e.detail?.page!=='clinical')return;const now=e.detail.id==='clin-ivcompat';if(wasActive&&!now)reset();wasActive=now});
    return true;
  }
  let tries=0;const boot=()=>{tries++;if(install()||tries>70)return;setTimeout(boot,140)};boot();
})();
