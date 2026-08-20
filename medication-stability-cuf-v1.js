(()=>{
  if(window.__fccMedicationStabilityCUFV1Installed)return;
  window.__fccMedicationStabilityCUFV1Installed=true;
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const aliases={
    'amoxicilina/acido clavulanico':['amoxicilina+ac clavulan','amoxicilina + acido clavulan'],
    'amoxicilina + acido clavulanico':['amoxicilina+ac clavulan'],
    'insulina regular':['insulina hum soluvel','actrapid'],
    'salbutamol':['salbutamol'],
    'ipratropio':['ipratropio'],
    'paracetamol':['paracetamol'],
    'lidocaina':['lidocaina'],
    'rifampicina':['rifampicina'],
    'cefuroxima':['cefuroxima'],
    'azitromicina':['azitromicina'],
    'claritromicina':['claritromicina'],
    'flucloxacilina':['flucloxacilina'],
    'ciprofloxacina':['ciprofloxacina'],
    'cotrimoxazol':['cotrimoxazol'],
    'metronidazol':['metronidazol']
  };
  let records=[],processing=false,queued=false;

  function termsFor(name){
    const n=fold(name).replace(/\s+iv$/,'').replace(/\s+\(.+?\)$/,'').trim();
    const a=aliases[n];if(a)return a;
    const core=n.split(/[\/+]/)[0].trim();
    return core.length>=4?[core]:[];
  }
  function matches(name){
    const terms=termsFor(name);if(!terms.length)return[];
    return records.filter(r=>{
      const hay=fold([r.designation,r.brand].join(' '));
      return terms.some(t=>hay.startsWith(t)||hay.includes(' '+t)||hay.includes(t+' '));
    });
  }
  function row(r){
    return `<div class="cuf-stab-row"><div class="cuf-stab-main"><b>${esc(r.designation)}</b>${r.brand?`<span>${esc(r.brand)}</span>`:''}</div><div class="cuf-stab-code">${r.code?`Código <b>${esc(r.code)}</b>`:'Código não indicado'}</div><div><small>Forma</small>${esc(r.form||'—')}</div><div><small>Estabilidade após abertura</small><b>${esc(r.stability||'—')}</b></div>${r.observations?`<div class="cuf-stab-obs"><small>Observações</small>${esc(r.observations)}</div>`:''}</div>`;
  }
  function panel(name,rows){
    return `<details class="cuf-stab-panel"><summary>Estabilidade após abertura · INF.1030.11 <span>${rows.length} produto${rows.length===1?'':'s'}</span></summary><div class="cuf-stab-note">Códigos e estabilidade são específicos da apresentação/produto abaixo; não extrapolar para outra forma farmacêutica.</div>${rows.map(row).join('')}<div class="cuf-stab-source">Fonte: <b>INF.1030.11</b> · Estabilidade após abertura de Medicamentos e Produtos Farmacêuticos.</div></details>`;
  }
  function addStyles(){
    if(document.getElementById('cuf-stability-med-style'))return;
    const s=document.createElement('style');s.id='cuf-stability-med-style';s.textContent=`
      .cuf-stab-panel{margin-top:10px;border:1px solid rgba(168,156,255,.28);border-radius:12px;padding:9px;background:rgba(168,156,255,.05)}.cuf-stab-panel>summary{cursor:pointer;color:var(--violet);font-size:9px;font-weight:900}.cuf-stab-panel>summary span{float:right;color:var(--muted);font-size:8px}.cuf-stab-note,.cuf-stab-source{font-size:7px;color:var(--muted);line-height:1.45;margin:7px 0}.cuf-stab-row{display:grid;grid-template-columns:minmax(180px,1.5fr) 120px 1fr 1fr;gap:6px;border-top:1px solid var(--line);padding:8px 0;font-size:8px}.cuf-stab-row small{display:block;color:var(--muted);font-size:7px;margin-bottom:2px}.cuf-stab-main b{display:block;font-size:8px}.cuf-stab-main span{display:block;color:var(--muted);margin-top:2px}.cuf-stab-code{font-size:8px}.cuf-stab-obs{grid-column:1/-1;line-height:1.45}@media(max-width:760px){.cuf-stab-row{grid-template-columns:1fr}.cuf-stab-obs{grid-column:auto}}
    `;document.head.appendChild(s);
  }
  function decorate(){
    if(processing)return;processing=true;
    try{
      document.querySelectorAll('#clin-drugs .med5-detail-row').forEach(host=>{
        if(host.querySelector('.cuf-stab-panel'))return;
        const name=host.dataset.name||'';
        const rows=matches(name);
        if(!rows.length)return;
        const detail=host.querySelector('.med4-detail')||host;
        detail.insertAdjacentHTML('beforeend',panel(name,rows));
      });
    }finally{processing=false}
  }
  function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorate()})}
  async function install(){
    const host=document.getElementById('clin-drugs');if(!host||!window.fccCufClinicalDocs)return false;
    const docs=await window.fccCufClinicalDocs;records=docs.stability.records||[];
    addStyles();decorate();
    new MutationObserver(schedule).observe(host,{childList:true,subtree:true});
    return true;
  }
  let tries=0;const boot=()=>{tries++;Promise.resolve(install()).then(ok=>{if(!ok&&tries<=60)setTimeout(boot,120)}).catch(()=>{if(tries<=60)setTimeout(boot,180)})};boot();
})();
