(()=>{
  if(window.__fccMedicationStabilityCUFV1Installed)return;
  window.__fccMedicationStabilityCUFV1Installed=true;
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
  const validCode=c=>/^\d{9}$/.test(String(c||'').trim())?String(c).trim():'';
  const aliases={
    'amoxicilina/acido clavulanico':['amoxicilina+ac clavulan','amoxicilina + acido clavulan'],
    'amoxicilina + acido clavulanico':['amoxicilina+ac clavulan'],
    'insulina regular':['insulina hum soluvel','actrapid'],
    'salbutamol':['salbutamol'],'ipratropio':['ipratropio'],'paracetamol':['paracetamol'],'lidocaina':['lidocaina'],
    'rifampicina':['rifampicina'],'cefuroxima':['cefuroxima'],'azitromicina':['azitromicina'],'claritromicina':['claritromicina'],
    'flucloxacilina':['flucloxacilina'],'ciprofloxacina':['ciprofloxacina'],'cotrimoxazol':['cotrimoxazol'],'metronidazol':['metronidazol']
  };
  let records=[];

  function termsFor(name){
    const n=fold(name).replace(/\s+iv$/,'').replace(/\s+\(.+?\)$/,'').trim();
    const a=aliases[n];if(a)return a;
    const core=n.split(/[\/+]/)[0].trim();
    return core.length>=4?[core]:[];
  }
  function matches(name){
    const n=fold(name);
    const rejected=r=>{
      const d=fold(r.designation),b=fold(r.brand);
      if(n==='amoxicilina/acido clavulanico oral')return d.startsWith('amoxicilina oral')&&!d.includes('clavulan');
      if(n==='budesonida/formoterol')return d.startsWith('budesonida ')&&!d.includes('formoterol');
      if(n==='tramadol/paracetamol')return d.startsWith('tramadol oral')&&!d.includes('paracetamol');
      if(n==='loratadina')return d.startsWith('desloratadina')||b.startsWith('aerius');
      if(n==='fenilefrina')return d.startsWith('etilfenilefrina')||b.startsWith('effortil');
      if(n==='azitromicina iv'||n==='paracetamol iv')return /oral|sol or|susp or/.test(d+' '+fold(r.form));
      return false;
    };
    const terms=termsFor(name);if(!terms.length)return[];
    return records.filter(r=>{
      const hay=fold([r.designation,r.brand].join(' '));
      return !rejected(r)&&terms.some(t=>hay.startsWith(t)||hay.includes(' '+t)||hay.includes(t+' '));
    });
  }
  function row(r){
    const code=validCode(r.code);
    return `<div class="cuf-stab-row"><div class="cuf-stab-main"><b>${esc(r.designation)}</b>${r.brand?`<span>${esc(r.brand)}</span>`:''}</div><div class="cuf-stab-code">${code?`Código CUF <b>${esc(code)}</b>`:'Código CUF não indicado'}</div><div><small>Forma</small>${esc(r.form||'—')}</div><div><small>Estabilidade após abertura</small><b>${esc(r.stability||'—')}</b></div>${r.observations?`<div class="cuf-stab-obs"><small>Observações</small>${esc(r.observations)}${r.auditSource?`<br><a href="${esc(r.auditSource)}" target="_blank" rel="noopener">Fonte da correção pontual: EMA</a>`:''}</div>`:''}</div>`;
  }
  function panel(rows){
    return `<details class="cuf-stab-panel"><summary>Estabilidade após abertura · INF.1030.11 <span>${rows.length} produto${rows.length===1?'':'s'}</span></summary><div class="cuf-stab-note">Associação documental, não validação individual do prazo. Confirmar marca, concentração, recipiente e RCM; estabilidade físico-química não demonstra segurança microbiológica. As 12 associações incoerentes identificadas na auditoria foram retiradas.</div>${rows.map(row).join('')}<div class="cuf-stab-source">Fonte: <b>INF.1030.11</b> · Estabilidade após abertura de Medicamentos e Produtos Farmacêuticos.</div></details>`;
  }
  function addStyles(){
    if(document.getElementById('cuf-stability-med-style'))return;
    const s=document.createElement('style');s.id='cuf-stability-med-style';s.textContent=`.cuf-stab-panel{margin-top:10px;border:1px solid rgba(168,156,255,.28);border-radius:12px;padding:9px;background:rgba(168,156,255,.05)}.cuf-stab-panel>summary{cursor:pointer;color:var(--violet);font-size:var(--fcc-caption,.8125rem);font-weight:900}.cuf-stab-panel>summary span{float:right;color:var(--muted);font-size:var(--fcc-caption,.8125rem)}.cuf-stab-note,.cuf-stab-source{font-size:var(--fcc-caption,.8125rem);color:var(--muted);line-height:1.45;margin:7px 0}.cuf-stab-row{display:grid;grid-template-columns:minmax(180px,1.5fr) 120px 1fr 1fr;gap:6px;border-top:1px solid var(--line);padding:8px 0;font-size:var(--fcc-caption,.8125rem)}.cuf-stab-row small{display:block;color:var(--muted);font-size:var(--fcc-caption,.8125rem);margin-bottom:2px}.cuf-stab-main b{display:block;font-size:var(--fcc-caption,.8125rem)}.cuf-stab-main span{display:block;color:var(--muted);margin-top:2px}.cuf-stab-code{font-size:var(--fcc-caption,.8125rem)}.cuf-stab-obs{grid-column:1/-1;line-height:1.45}@media(max-width:760px){.cuf-stab-row{grid-template-columns:1fr}.cuf-stab-obs{grid-column:auto}}`;document.head.appendChild(s);
  }
  function decorateRow(host){
    if(!host||!host.classList?.contains('med5-detail-row')||host.querySelector('.cuf-stab-panel'))return;
    const rows=matches(host.dataset.name||'');if(!rows.length)return;
    const detail=host.querySelector('.med4-detail')||host;
    detail.insertAdjacentHTML('beforeend',panel(rows));
  }
  function decorateExisting(){document.querySelectorAll('#clin-drugs .med5-detail-row').forEach(decorateRow)}
  async function install(){
    const host=document.getElementById('clin-drugs');if(!host||!window.fccCufClinicalDocs)return false;
    const docs=await window.fccCufClinicalDocs;records=docs.stability.records||[];
    addStyles();decorateExisting();
    new MutationObserver(changes=>{
      for(const change of changes){
        for(const node of change.addedNodes||[]){
          if(node.nodeType!==1)continue;
          decorateRow(node);
          node.querySelectorAll?.('.med5-detail-row').forEach(decorateRow);
        }
      }
    }).observe(host,{childList:true,subtree:true});
    return true;
  }
  let tries=0;const boot=()=>{tries++;Promise.resolve(install()).then(ok=>{if(!ok&&tries<=60)setTimeout(boot,120)}).catch(()=>{if(tries<=60)setTimeout(boot,180)})};boot();
})();
