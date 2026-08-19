(()=>{
  if(window.__fccMedicationBrandsV1Installed)return;
  window.__fccMedicationBrandsV1Installed=true;

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  // Exemplos de nomes comerciais validados em fontes INFARMED para Portugal.
  // Não representa uma lista exaustiva de marcas, apresentações ou disponibilidade atual.
  const BRANDS={
    'metamizol magnésico':['Nolotil'],
    'paracetamol':['Ben-U-Ron'],
    'ibuprofeno':['Brufen','Spidifen'],
    'diclofenac':['Voltaren','Voltaren Rapid','Voltaren 75','Olfen','Fenil-V'],
    'furosemida':['Lasix'],
    'amiodarona':['Cordarone'],
    'salbutamol':['Ventilan-Inalador'],
    'nifedipina':['Adalat CR'],
    'butilescopolamina':['Buscopan'],
    'peróxido de benzoílo':['Benzac 5','Benzac Wash 5']
  };

  const SUPPLEMENT={
    name:'Metamizol magnésico',
    group:'Analgesia / Dor / Anti-inflamatórios',
    mechanism:'Analgésico e antipirético não opioide da família das pirazolonas. O efeito resulta de mecanismos centrais e periféricos; a ficha não usa o mecanismo para inferir dose ou indicação.',
    use:'Dor moderada a intensa e febre em indicações autorizadas, conforme apresentação e prescrição.',
    monitor:'Resposta clínica e sinais de reação adversa; perante febre, arrepios, odinofagia ou lesões dolorosas das mucosas durante/depois do tratamento, considerar o risco conhecido de agranulocitose e seguir avaliação clínica apropriada.',
    risks:'Agranulocitose potencialmente grave, reações de hipersensibilidade e outras reações dependentes da apresentação/contexto. Confirmar RCM/SmPC e contraindicações.',
    prep:'A preparação e administração dependem da apresentação concreta. Não é definida aqui uma diluição ou dose automática.',
    brands:['Nolotil']
  };

  function baseName(name){
    const n=fold(name)
      .replace(/\s+(iv|oral|sc|im|inalat[oó]ri[oa]|t[oó]pic[oa]|transd[eé]rmic[oa]|oft[aá]lmic[oa]|nasal|retal|vaginal)$/,'')
      .replace(/\s+obst[eé]tric[oa]$/,'')
      .trim();
    if(BRANDS[n])return n;
    return Object.keys(BRANDS).find(k=>n===k||n.startsWith(k+' ')||n.endsWith(' '+k))||n;
  }
  function brandsFor(name){return BRANDS[baseName(name)]||[]}
  function brandEntries(){return Object.entries(BRANDS).flatMap(([generic,brands])=>brands.map(brand=>({generic,brand}))) }

  function addStyles(){
    if(document.getElementById('med-brand-style'))return;
    const s=document.createElement('style');s.id='med-brand-style';s.textContent=`
      .medbrand-field{border-color:rgba(168,156,255,.30)!important;background:rgba(168,156,255,.055)!important}.medbrand-field small{color:var(--violet)!important}.medbrand-mini{display:block!important;margin-top:3px!important;color:#9b93d8!important;font-size:7px!important;line-height:1.35!important}.medbrand-suggest{border-left:2px solid var(--violet)!important}.medbrand-suggest em{font-style:normal;color:var(--violet);font-size:7px;display:block;margin-top:2px}.medbrand-source-note{font-size:7px;color:var(--muted);margin-top:4px;line-height:1.45}
      html[data-fcc-theme="light"] .medbrand-field{background:#faf9ff!important}
    `;document.head.appendChild(s);
  }

  function supplementDetail(){
    const d=SUPPLEMENT;
    return `<article class="med4-detail"><div class="med4-head"><div><h3>${esc(d.name)}</h3><p>${esc(d.group)}</p></div><div class="spacer"></div><span class="badge good">Ficha adicionada</span></div><div class="med4-mech"><small>Como funciona · resumo</small><div>${esc(d.mechanism)}</div></div><div class="med4-grid"><div class="med4-field medbrand-field"><small>Nomes comerciais · exemplos PT</small><div>${esc(d.brands.join(' · '))}</div><div class="medbrand-source-note">Exemplos de marca; confirmar sempre substância ativa, dosagem, forma e apresentação.</div></div><div class="med4-field"><small>Utilização clínica</small><div>${esc(d.use)}</div></div><div class="med4-field"><small>Monitorização</small><div>${esc(d.monitor)}</div></div><div class="med4-field"><small>Riscos / precauções</small><div>${esc(d.risks)}</div></div><div class="med4-field"><small>Preparação / administração</small><div>${esc(d.prep)}</div></div></div><div class="notice med4-warning"><b>Referência clínica:</b> o nome comercial não substitui a identificação pela substância ativa. Confirmar RCM/SmPC, apresentação e protocolo institucional.</div><div class="med4-actions"><a class="btn" target="_blank" rel="noopener" href="https://www.ema.europa.eu/en/medicines/human/referrals/metamizole-containing-medicinal-products-0">EMA · Metamizol ↗</a></div></article>`;
  }

  function supplementMatches(){
    const q=fold(document.getElementById('med4Search')?.value||'');
    const g=document.getElementById('med4Group')?.value||'';
    if(g&&g!==SUPPLEMENT.group)return false;
    if(!q)return true;
    return fold([SUPPLEMENT.name,...SUPPLEMENT.brands].join(' ')).includes(q);
  }

  function ensureSupplement(){
    const root=document.getElementById('med4Results');if(!root||!supplementMatches())return;
    let list=root.querySelector('.med4-list');
    if(!list){root.innerHTML='<div class="med4-list"></div>';list=root.querySelector('.med4-list')}
    if(list.querySelector('[data-med4="Metamizol magnésico"]'))return;
    const b=document.createElement('button');b.type='button';b.className='med4-mini';b.dataset.med4=SUPPLEMENT.name;
    b.innerHTML=`<strong>${esc(SUPPLEMENT.name)}</strong><span>${esc(SUPPLEMENT.group)}</span><span class="medbrand-mini">Comercial: ${esc(SUPPLEMENT.brands.join(' · '))}</span>`;
    b.onclick=()=>{root.innerHTML=supplementDetail()};
    list.appendChild(b);
  }

  function decorateMinis(){
    document.querySelectorAll('#med4Results .med4-mini').forEach(b=>{
      const name=b.dataset.med4||b.querySelector('strong')?.textContent?.trim()||'';
      if(!name||b.querySelector('.medbrand-mini'))return;
      const brands=brandsFor(name);if(!brands.length)return;
      const span=document.createElement('span');span.className='medbrand-mini';span.textContent='Comercial: '+brands.join(' · ');b.appendChild(span);
    });
  }

  function decorateDetails(){
    document.querySelectorAll('#med4Results .med4-detail').forEach(card=>{
      if(card.dataset.brandDecorated==='1')return;
      const name=card.querySelector('.med4-head h3')?.textContent?.trim()||'';if(!name)return;
      card.dataset.brandDecorated='1';
      const brands=brandsFor(name);
      const grid=card.querySelector('.med4-grid');if(!grid)return;
      const f=document.createElement('div');f.className='med4-field medbrand-field';
      f.innerHTML=`<small>Nomes comerciais · exemplos PT</small><div>${brands.length?esc(brands.join(' · ')):'Sem nome comercial validado integrado nesta base.'}</div><div class="medbrand-source-note">A marca pode variar por dosagem, forma farmacêutica, titular e comercialização. Confirmar sempre a substância ativa.</div>`;
      grid.prepend(f);
    });
  }

  let suggestBusy=false,lastSuggestSig='';
  function decorateSuggestions(){
    if(suggestBusy)return;
    const input=document.getElementById('med4Search'),box=document.getElementById('med4Suggest');if(!input||!box)return;
    const q=fold(input.value);
    const existing=[...box.querySelectorAll('.medbrand-suggest')];
    if(q.length<2){
      if(existing.length)existing.forEach(x=>x.remove());
      lastSuggestSig='';
      return;
    }
    const matches=brandEntries().filter(x=>fold(x.brand).includes(q)||fold(x.generic).includes(q)).slice(0,6);
    const sig=q+'|'+matches.map(x=>x.brand+'>'+x.generic).join('|');
    if(!matches.length){
      if(existing.length)existing.forEach(x=>x.remove());
      lastSuggestSig=sig;
      return;
    }
    if(sig===lastSuggestSig&&existing.length===matches.length)return;
    suggestBusy=true;
    try{
      existing.forEach(x=>x.remove());
      matches.slice().reverse().forEach(x=>{
        const b=document.createElement('button');b.type='button';b.className='medbrand-suggest';
        const generic=x.generic==='metamizol magnésico'?SUPPLEMENT.name:x.generic;
        b.innerHTML=`<strong>${esc(x.brand)}</strong><span>${esc(generic)}</span><em>nome comercial → substância ativa</em>`;
        b.onmousedown=e=>{
          e.preventDefault();input.value=generic;input.dispatchEvent(new Event('input',{bubbles:true}));box.classList.remove('open');
          if(generic===SUPPLEMENT.name)setTimeout(()=>document.querySelector('#med4Results [data-med4="Metamizol magnésico"]')?.click(),80);
        };
        box.prepend(b);
      });
      lastSuggestSig=sig;
      box.classList.add('open');
    }finally{suggestBusy=false}
  }

  function refresh(){
    ensureSupplement();decorateMinis();decorateDetails();decorateSuggestions();
  }

  function install(){
    const host=document.getElementById('clin-drugs'),root=document.getElementById('med4Results'),input=document.getElementById('med4Search'),suggest=document.getElementById('med4Suggest');
    if(!host||!root||!input||!suggest)return false;
    addStyles();refresh();
    const rootObs=new MutationObserver(()=>queueMicrotask(refresh));rootObs.observe(root,{childList:true,subtree:true});
    const sugObs=new MutationObserver(()=>queueMicrotask(decorateSuggestions));sugObs.observe(suggest,{childList:true,subtree:true});
    input.addEventListener('input',()=>setTimeout(refresh,0));
    document.getElementById('med4Group')?.addEventListener('change',()=>setTimeout(refresh,0));
    window.fccMedicationBrands={brandsFor,brands:BRANDS};
    return true;
  }

  let tries=0;const boot=()=>{tries++;if(install()||tries>60)return;setTimeout(boot,120)};boot();
})();