(()=>{
  if(window.__fccIVCompatUIV2Installed)return;
  window.__fccIVCompatUIV2Installed=true;

  const REVIEW_URL='https://www.medintensiva.org/en-compatibility-drugs-administered-as-y-site-articulo-S2173572719302139';
  const VCH_URL='https://pdtm.vch.ca/Supporting%20Documents/IV%20Compatibility/Y-site%20Compatibility%20Critical%20Care%20Chart.pdf';
  const STABILIS_URL='https://www.stabilis.org/TableIncompatibilites.php?codeLangue=EN-en';

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const ALIAS={
    'heparina':'Heparina não fracionada','heparina sodica':'Heparina não fracionada','sodium heparin':'Heparina não fracionada',
    'norepinefrina':'Noradrenalina','norepinephrine':'Noradrenalina','epinefrina':'Adrenalina','epinephrine':'Adrenalina',
    'phenylephrine':'Fenilefrina','isoproterenol':'Isoprenalina','potassium chloride':'Cloreto de potássio',
    'magnesium sulfate':'Sulfato de magnésio','sodium bicarbonate':'Bicarbonato de sódio','piperacillin-tazobactam':'Piperacilina/tazobactam',
    'dexmedetomidine':'Dexmedetomidina','fentanyl':'Fentanilo','remifentanil':'Remifentanil','furosemide':'Furosemida',
    'midazolam':'Midazolam','milrinone':'Milrinona','nitroglycerin':'Nitroglicerina','nitroprusside':'Nitroprussiato',
    'calcium chloride':'Cloreto de cálcio','calcium gluconate':'Gluconato de cálcio','ceftazidime':'Ceftazidima',
    'dopamine':'Dopamina','dobutamine':'Dobutamina','ketamine':'Ketamina','meropenem':'Meropenem','naloxone':'Naloxona','verapamil':'Verapamil','vecuronium':'Vecurónio'
  };

  const canonical=name=>ALIAS[fold(name)]||name;
  const pairKey=(a,b)=>[canonical(a),canonical(b)].map(fold).sort().join('||');
  const LIMITS={};
  const add=(a,b,conditions)=>LIMITS[pairKey(a,b)]={a,b,conditions};

  // Combinações explicitamente descritas como compatíveis apenas em concentrações/condições específicas na revisão sistemática de Castells Lao et al.
  add('Adrenalina','Pantoprazol','Adrenalina ≤32 mcg/mL + pantoprazol ≤0,8 mg/mL.');
  add('Adrenalina','Verapamil','Adrenalina ≤2 mcg/mL + verapamil ≤0,08 mg/mL.');
  add('Amiodarona','Fenilefrina','Amiodarona ≤4 mg/mL + fenilefrina ≤0,04 mg/mL.');
  add('Amiodarona','Furosemida','Amiodarona ≤6 mg/mL + furosemida ≤1 mg/mL.');
  add('Amiodarona','Nitroprussiato','Amiodarona ≤15 mg/mL + nitroprussiato ≤0,3 mg/mL.');
  add('Cloreto de cálcio','Dobutamina','Cloreto de cálcio ≤4 mg/mL + dobutamina ≤4 mg/mL.');
  add('Gluconato de cálcio','Dobutamina','Gluconato de cálcio ≤4 mg/mL + dobutamina ≤4 mg/mL.');
  add('Ceftazidima','Dobutamina','Ceftazidima ≤120 mg/mL + dobutamina ≤1 mg/mL.');
  add('Ceftazidima','Dopamina','Ceftazidima ≤120 mg/mL + dopamina ≤0,4 mg/mL.');
  add('Ceftazidima','Ketamina','Ceftazidima ≤125 mg/mL + ketamina ≤10 mg/mL.');
  add('Dobutamina','Heparina não fracionada','Dobutamina ≤1 mg/mL + heparina ≤50 UI/mL.');
  add('Dobutamina','Sulfato de magnésio','Dobutamina ≤4 mg/mL + sulfato de magnésio ≤40 mg/mL.');
  add('Dobutamina','Cloreto de potássio','Dobutamina ≤4 mg/mL + KCl ≤60 mEq/L.');
  add('Dopamina','Midazolam','Dopamina ≤3,2 mg/mL + midazolam ≤2 mg/mL.');
  add('Fentanilo','Remifentanil','Fentanilo ≤12,5 mcg/mL + remifentanil ≤0,25 mg/mL.');
  add('Heparina não fracionada','Verapamil','Heparina ≤20 UI/mL + verapamil ≤0,08 mg/mL.');
  add('Isoprenalina','Sulfato de magnésio','Isoprenalina ≤4 mcg/mL + sulfato de magnésio ≤1 mg/mL.');
  add('Isoprenalina','Cloreto de potássio','Compatibilidade publicada apenas dentro dos limites descritos na revisão; confirmar a concentração exata antes da coadministração.');
  add('Isoprenalina','Vecurónio','Isoprenalina ≤4 mcg/mL + vecurónio ≤0,1 mg/mL.');
  add('Isoprenalina','Verapamil','Isoprenalina ≤10 mcg/mL + verapamil ≤0,08 mg/mL.');
  add('Meropenem','Cloreto de potássio','Meropenem ≤22 mg/mL + KCl ≤40 mEq/L.');
  add('Naloxona','Verapamil','Naloxona ≤0,8 mcg/mL + verapamil ≤0,08 mg/mL.');
  add('Nitroglicerina','Verapamil','Nitroglicerina ≤0,1 mg/mL + verapamil ≤0,08 mg/mL.');
  add('Nitroprussiato','Vecurónio','Nitroprussiato ≤0,2 mg/mL + vecurónio ≤0,1 mg/mL.');
  add('Nitroprussiato','Verapamil','Nitroprussiato ≤0,1 mg/mL + verapamil ≤0,08 mg/mL.');
  add('Noradrenalina','Verapamil','Noradrenalina ≤0,008 mg/mL + verapamil ≤0,08 mg/mL.');
  add('Piperacilina/tazobactam','Dexmedetomidina','Piperacilina/tazobactam ≤40 mg/mL + dexmedetomidina ≤4 mcg/mL.');
  add('Piperacilina/tazobactam','Remifentanil','Piperacilina/tazobactam ≤40 mg/mL + remifentanil ≤250 mcg/mL.');
  add('Cloreto de potássio','Remifentanil','KCl ≤100 mEq/L + remifentanil ≤250 mcg/mL.');

  function css(){
    if(document.getElementById('ivc-combo-v2-style'))return;
    const st=document.createElement('style');st.id='ivc-combo-v2-style';st.textContent=`
      .ivc-native-hidden{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important;overflow:hidden!important}
      .ivc-combo{position:relative}.ivc-combo input{width:100%;padding-right:34px}.ivc-combo:after{content:'⌕';position:absolute;right:11px;top:50%;transform:translateY(-50%);color:#6f93ad;font-size:14px;pointer-events:none}
      .ivc-suggest{position:absolute;z-index:230;left:0;right:0;top:calc(100% + 5px);max-height:280px;overflow:auto;display:none;border:1px solid rgba(92,202,255,.25);border-radius:14px;background:rgba(6,17,27,.99);box-shadow:0 18px 50px rgba(0,0,0,.5);padding:5px}.ivc-suggest.open{display:block}
      .ivc-suggestion{display:flex;width:100%;gap:8px;align-items:center;text-align:left;border:0;background:transparent;color:var(--text);border-radius:10px;padding:9px 10px;cursor:pointer}.ivc-suggestion:hover,.ivc-suggestion.active{background:rgba(92,202,255,.09)}.ivc-suggestion strong{font-size:11px}.ivc-suggestion span{display:block;margin-top:2px;color:var(--muted);font-size:8px}.ivc-suggest-empty{padding:10px;color:var(--muted);font-size:9px}
      .ivc-evidence-lite{border:1px solid rgba(244,187,85,.28);border-radius:18px;padding:16px;background:rgba(244,187,85,.055)}.ivc-evidence-lite .signal{display:flex;gap:11px;align-items:center}.ivc-evidence-lite .ico{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:rgba(244,187,85,.12);border:1px solid rgba(244,187,85,.35);font-size:22px;color:#f3c878;font-weight:900}.ivc-evidence-lite h3{margin:0;font-size:17px}.ivc-evidence-lite p{font-size:10px;line-height:1.55;color:var(--muted);margin:8px 0 0}.ivc-evidence-lite .limits{margin-top:10px;padding:10px;border-radius:11px;background:rgba(244,187,85,.07);border:1px solid rgba(244,187,85,.18);font-size:10px;color:#ebd29d}.ivc-v2-sources{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.ivc-v2-sources a{font-size:8px;text-decoration:none;border:1px solid rgba(113,158,190,.2);border-radius:9px;padding:6px 8px;background:rgba(8,22,34,.7)}
    `;document.head.appendChild(st);
  }

  function getCatalogue(select){
    const seen=new Set(),arr=[];
    [...select.options].forEach(o=>{
      if(!o.value)return;
      const name=o.textContent.trim();if(seen.has(name))return;seen.add(name);
      const group=o.parentElement?.tagName==='OPTGROUP'?o.parentElement.label:'';
      arr.push({name,value:o.value,group,fold:fold(name)});
    });
    return arr;
  }

  function buildCombo(select,label){
    select.classList.add('ivc-native-hidden');
    const wrap=document.createElement('div');wrap.className='ivc-combo';
    const input=document.createElement('input');input.type='text';input.autocomplete='off';input.spellcheck=false;input.placeholder='Escrever '+label.toLowerCase()+'…';input.setAttribute('aria-label',label);
    const list=document.createElement('div');list.className='ivc-suggest';
    select.parentNode.insertBefore(wrap,select);wrap.append(input,list,select);
    let matches=[],active=-1;

    const render=()=>{
      const cat=getCatalogue(select),q=fold(input.value);
      matches=cat.filter(x=>!q||x.fold.startsWith(q)||x.fold.includes(q)).sort((a,b)=>{
        const ap=q&&a.fold.startsWith(q)?0:1,bp=q&&b.fold.startsWith(q)?0:1;return ap-bp||a.name.localeCompare(b.name,'pt');
      }).slice(0,10);active=-1;
      list.innerHTML=matches.length?matches.map((x,i)=>`<button type="button" class="ivc-suggestion" data-i="${i}"><div><strong>${x.name}</strong>${x.group?`<span>${x.group}</span>`:''}</div></button>`).join(''):'<div class="ivc-suggest-empty">Sem correspondências.</div>';
      list.classList.add('open');
      list.querySelectorAll('.ivc-suggestion').forEach(b=>b.addEventListener('mousedown',e=>{e.preventDefault();choose(+b.dataset.i)}));
    };
    const choose=i=>{const x=matches[i];if(!x)return;input.value=x.name;select.value=x.value;list.classList.remove('open');select.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(applySupplement,0)};
    const exact=()=>{const q=fold(input.value),cat=getCatalogue(select),x=cat.find(x=>x.fold===q)||cat.find(x=>fold(canonical(input.value))===x.fold);if(x){input.value=x.name;select.value=x.value;select.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(applySupplement,0);return true}return false};

    input.addEventListener('input',()=>{select.value='';render()});
    input.addEventListener('focus',render);
    input.addEventListener('blur',()=>setTimeout(()=>{if(!exact()&&!select.value){}list.classList.remove('open')},120));
    input.addEventListener('keydown',e=>{
      if(!list.classList.contains('open')&&(e.key==='ArrowDown'||e.key==='ArrowUp'))render();
      if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,matches.length-1)}
      else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0)}
      else if(e.key==='Enter'){e.preventDefault();if(active>=0)choose(active);else if(matches.length)choose(0);else exact()}
      else if(e.key==='Escape'){list.classList.remove('open')}
      list.querySelectorAll('.ivc-suggestion').forEach((b,i)=>b.classList.toggle('active',i===active));
      if(active>=0)list.querySelector(`[data-i="${active}"]`)?.scrollIntoView({block:'nearest'});
    });
    select.addEventListener('change',()=>{const o=select.options[select.selectedIndex];if(o&&o.value)input.value=o.textContent.trim()});
    return {input,select};
  }

  function supplementMarkup(d,a,b){return `<div class="ivc-evidence-lite"><div class="signal"><div class="ico">!</div><div><div class="ivc-status">COMPATIBILIDADE CONDICIONADA</div><h3>${a} + ${b}</h3></div></div><div class="limits"><b>Condições publicadas:</b> ${d.conditions}</div><p>A revisão sistemática encontrou compatibilidade apenas nestas condições/concentrações específicas. Fora destes limites, esta app não assume compatibilidade. Confirmar a concentração real, diluente e protocolo/Farmácia antes de partilhar o Y-site.</p><div class="ivc-v2-sources"><a href="${REVIEW_URL}" target="_blank" rel="noopener">Revisão sistemática ↗</a><a href="${VCH_URL}" target="_blank" rel="noopener">VCH 27Aug2025 ↗</a><a href="${STABILIS_URL}" target="_blank" rel="noopener">Stabilis ↗</a></div></div>`}

  function applySupplement(){
    const A=document.getElementById('ivcDrugA'),B=document.getElementById('ivcDrugB'),out=document.getElementById('ivcResult');if(!A||!B||!out||!A.value||!B.value)return;
    const text=fold(out.textContent);
    if(!text.includes('sem consenso')&&!text.includes('sem dados')&&!text.includes('nao integrada')&&!text.includes('não integrada'))return;
    const d=LIMITS[pairKey(A.value,B.value)];if(!d)return;
    const an=A.options[A.selectedIndex]?.textContent?.trim()||A.value,bn=B.options[B.selectedIndex]?.textContent?.trim()||B.value;
    out.innerHTML=supplementMarkup(d,an,bn);
  }

  function init(){
    css();
    const A=document.getElementById('ivcDrugA'),B=document.getElementById('ivcDrugB');if(!A||!B)return setTimeout(init,150);
    if(A.dataset.comboV2)return;A.dataset.comboV2=B.dataset.comboV2='1';
    const ca=buildCombo(A,'Fármaco A'),cb=buildCombo(B,'Fármaco B');
    document.getElementById('ivcSwap')?.addEventListener('click',()=>setTimeout(()=>{const ao=A.options[A.selectedIndex],bo=B.options[B.selectedIndex];ca.input.value=ao?.value?ao.textContent.trim():'';cb.input.value=bo?.value?bo.textContent.trim():'';applySupplement()},0));
    A.addEventListener('change',()=>setTimeout(applySupplement,0));B.addEventListener('change',()=>setTimeout(applySupplement,0));
    const note=document.createElement('div');note.className='tiny';note.style.marginTop='7px';note.textContent='Começa a escrever o nome do fármaco; as sugestões aparecem automaticamente.';
    ca.input.closest('label')?.appendChild(note.cloneNode(true));cb.input.closest('label')?.appendChild(note);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
