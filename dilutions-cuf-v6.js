(()=>{
  if(window.__fccDilutionsCUFV6Installed)return;
  window.__fccDilutionsCUFV6Installed=true;
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const alias={
    'amoxicilina/acido clavulanico':'amoxicilina + acido clavulanico',
    'amoxicilina + acido clavulanico':'amoxicilina + acido clavulanico',
    'piperacilina/tazobactam':'piperacilina + tazobactam',
    'piperacilina + tazobactam':'piperacilina + tazobactam',
    'trimetoprim/sulfametoxazol iv':'cotrimoxazol',
    'trimetoprim/sulfametoxazol':'cotrimoxazol',
    'colistimetato de sodio':'colistina',
    'colistimetato':'colistina',
    'benzilpenicilina':'benzilpenicilina sodica e potassica'
  };
  let docs=null,byDrug=new Map(),processing=false,queued=false,lastSignature='';

  function canonical(name){
    let n=fold(name).replace(/\s+iv$/,'').replace(/\s+\(.+?\)$/,'').trim();
    if(alias[n])n=alias[n];
    for(const [k,v] of byDrug){
      if(n===k||n.startsWith(k+' ')||k.startsWith(n+' ')||n.includes(k))return v[0].drug;
    }
    return '';
  }
  function recordsFor(name){const c=canonical(name);return c?byDrug.get(fold(c))||[]:[]}
  function field(label,value){return value?`<div class="ccd-doc-field"><small>${esc(label)}</small><div>${esc(value)}</div></div>`:''}
  function routeBlock(r){
    return `<section class="ccd-doc-route cuf2213-route">
      <div class="ccd-doc-routehead"><b>${esc(r.route)}</b><span>${esc(r.dose)} · pág. ${r.page}</span></div>
      <div class="ccd-doc-grid"><div class="ccd-doc-section">Apresentação</div>${field('Dosagem',r.dose)}${field('Forma farmacêutica',r.form)}${field('Fonte','INF.2213.00')}</div>
      <div class="ccd-doc-grid"><div class="ccd-doc-section">Reconstituição</div>${field('Especificações',r.reconstitution)}${field('Estabilidade',r.reconstitution_stability)}<div></div></div>
      <div class="ccd-doc-grid"><div class="ccd-doc-section">Diluição</div>${field('Especificações',r.dilution)}${field('Estabilidade',r.dilution_stability)}<div></div></div>
      ${r.observations?`<div class="ccd-doc-grid ccd-doc-grid-wide">${field('Observações do guia',r.observations)}</div>`:''}
    </section>`;
  }
  function currentDetails(drug,rows){
    return `<div class="cuf-current-note"><b>Fonte institucional atual para antibióticos: INF.2213.00</b><span>Os dados abaixo substituem, nesta ficha, os valores do documento legado de diluições. A apresentação, via e fabricante condicionam a preparação.</span></div>
      ${rows.map(routeBlock).join('')}
      <div class="ccd-doc-source"><b>INF.2213.00</b> · Guia de Reconstituição, Diluição e Administração de Antibióticos. Transcrição estruturada do documento fornecido; confirmar a apresentação concreta e o protocolo institucional em vigor.</div>`;
  }
  function makeCard(drug,rows){
    const a=document.createElement('article');a.className='card full ccd-doc-card cuf-current-card';a.dataset.cufDrug=drug;
    a.innerHTML=`<div class="ccd-doc-top"><div><h3>${esc(drug)}</h3><p><b>INF.2213.00</b> · Antibacterianos · ${rows.length} via${rows.length===1?'':'s'}/apresentação</p></div><div class="ccd-doc-routebadges">${[...new Set(rows.map(r=>r.route.split('(')[0].trim()))].map(x=>`<span class="badge">${esc(x)}</span>`).join('')}<span class="badge good">Atual CUF</span></div></div><details class="ccd-doc-details"><summary>Ver reconstituição, diluição e administração</summary>${currentDetails(drug,rows)}</details>`;
    return a;
  }
  function qMatch(rows,q){
    if(!q)return true;
    return fold(rows.map(r=>[r.drug,r.dose,r.form,r.route,r.reconstitution,r.reconstitution_stability,r.dilution,r.dilution_stability,r.observations].join(' ')).join(' ')).includes(q);
  }
  function updateSourceUI(){
    const banner=document.querySelector('#clin-perf .ccd-banner');
    if(banner&&banner.dataset.cufCurrent!=='1'){
      banner.dataset.cufCurrent='1';
      banner.innerHTML='<b>Fontes institucionais integradas:</b> <strong>INF.2213.00</strong> para reconstituição/diluição/administração de antibióticos e <strong>INF.1030.11</strong> para estabilidade após abertura. O antigo DILUIÇÕES.xlsx permanece apenas como fallback quando não existe entrada nestes documentos.';
    }
    const meta=document.querySelector('#clin-perf .ccd-meta');
    if(meta){
      let b=document.getElementById('cuf2213Badge');if(!b){b=document.createElement('span');b.id='cuf2213Badge';b.className='badge good';meta.appendChild(b)}b.textContent='INF.2213.00 · antibióticos';
      let s=document.getElementById('cuf1030Badge');if(!s){s=document.createElement('span');s.id='cuf1030Badge';s.className='badge';meta.appendChild(s)}s.textContent='INF.1030.11 · estabilidade';
      const old=document.getElementById('ccdDocSourceBadge');if(old)old.textContent='DILUIÇÕES.xlsx · fallback legado';
    }
  }
  function addStyles(){
    if(document.getElementById('cuf-dil-v6-style'))return;
    const s=document.createElement('style');s.id='cuf-dil-v6-style';s.textContent=`
      .cuf-current-note{border:1px solid rgba(114,227,167,.28);background:rgba(114,227,167,.07);border-radius:11px;padding:9px 10px;margin:9px 0}.cuf-current-note b{display:block;color:var(--tactical);font-size:9px}.cuf-current-note span{display:block;color:var(--muted);font-size:8px;line-height:1.45;margin-top:4px}
      .cuf-current-card>.ccd-doc-top{border-color:rgba(114,227,167,.16)}
      .cuf2213-route .ccd-doc-field{min-height:44px}
    `;document.head.appendChild(s);
  }
  function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;enhance()},0)}
  function enhance(){
    if(processing||!docs)return;const grid=document.getElementById('perfDilutionGrid');if(!grid)return;
    processing=true;
    try{
      updateSourceUI();addStyles();
      const q=fold(document.getElementById('perfDilutionSearch')?.value||'');
      const group=document.getElementById('ccdGroup')?.value||'';
      const allCards=[...grid.querySelectorAll(':scope > .ccd-doc-card')];
      const seen=new Set();
      for(const card of allCards){
        if(card.classList.contains('cuf-current-card'))continue;
        const h3=card.querySelector('.ccd-doc-top h3');if(!h3)continue;
        const rows=recordsFor(h3.textContent);
        if(!rows.length){card.style.removeProperty('display');continue}
        const drug=rows[0].drug,key=fold(drug);
        if(seen.has(key)){card.style.display='none';card.dataset.cufSuperseded='1';continue}
        seen.add(key);card.style.removeProperty('display');card.dataset.cufCurrent='1';
        h3.textContent=drug;
        const p=card.querySelector('.ccd-doc-top p');if(p)p.innerHTML=`<b>INF.2213.00</b> · Antibacterianos · ${rows.length} registo${rows.length===1?'':'s'} atuais`;
        const badges=card.querySelector('.ccd-doc-routebadges');if(badges&&!badges.querySelector('.cuf-current-badge'))badges.insertAdjacentHTML('beforeend','<span class="badge good cuf-current-badge">Atual CUF</span>');
        const det=card.querySelector(':scope > .ccd-doc-details');
        if(det&&det.dataset.cufCurrent!=='1'){det.dataset.cufCurrent='1';det.innerHTML=`<summary>Ver reconstituição, diluição e administração</summary>${currentDetails(drug,rows)}`}
      }
      if(!group||group==='Antibacterianos'){
        for(const [key,rows] of byDrug){
          if(seen.has(key)||!qMatch(rows,q))continue;
          grid.appendChild(makeCard(rows[0].drug,rows));seen.add(key);
        }
      }
    }finally{processing=false}
  }
  async function install(){
    const grid=document.getElementById('perfDilutionGrid');if(!grid||!window.fccCufClinicalDocs)return false;
    docs=await window.fccCufClinicalDocs;
    byDrug=new Map();
    for(const r of docs.antibiotics.records||[]){const k=fold(r.drug);if(!byDrug.has(k))byDrug.set(k,[]);byDrug.get(k).push(r)}
    addStyles();enhance();
    new MutationObserver(()=>{if(!processing)schedule()}).observe(grid,{childList:true,subtree:false});
    document.getElementById('perfDilutionSearch')?.addEventListener('input',schedule);
    document.getElementById('ccdGroup')?.addEventListener('change',schedule);
    document.getElementById('ccdOnlyVerified')?.addEventListener('change',schedule);
    return true;
  }
  let tries=0;const boot=()=>{tries++;Promise.resolve(install()).then(ok=>{if(!ok&&tries<=60)setTimeout(boot,120)}).catch(()=>{if(tries<=60)setTimeout(boot,180)})};boot();
})();
