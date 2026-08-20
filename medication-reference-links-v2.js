(()=>{
  if(window.__fccMedicationReferenceLinksV2Installed)return;
  window.__fccMedicationReferenceLinksV2Installed=true;

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const validCode=c=>/^\d{9}$/.test(String(c||'').trim())?String(c).trim():'';
  const INFOMED='https://extranet.infarmed.pt/INFOMED-fo/';
  const aliases={
    'noradrenalina':['norepinefrina','norepinephrine'],'adrenalina':['epinefrina','epinephrine'],
    'alfentanil':['alfentanilo'],'remifentanil':['remifentanilo'],'fentanil':['fentanilo'],'fentanilo':['fentanil'],
    'heparina nao fracionada':['heparina','heparina sodica','heparina 25.000ui/5 ml'],
    'insulina regular':['insulina hum soluvel','actrapid'],'metamizol magnesico':['metamizol','nolotil'],
    'amoxicilina/acido clavulanico':['amoxicilina + acido clavulanico','amoxicilina+ac clavulan'],
    'amoxicilina + acido clavulanico':['amoxicilina/acido clavulanico','amoxicilina+ac clavulan'],
    'piperacilina/tazobactam':['piperacilina + tazobactam'],'cloreto de potassio':['cloreto potassio','cloreto potassio 20%'],
    'gluconato de calcio':['calcio gluconato'],'cloreto de calcio':['calcio cloreto'],'sulfato de magnesio':['sulfato magnesio'],
    'bicarbonato de sodio':['bicarb sodio'],'fosfato de potassio':['fosf monopotassico','fosf bipotassico']
  };

  let stability=[],highAlert=[];
  const codeCache=new Map();

  function coreName(name){return fold(name).replace(/\s+(iv|ev|oral|or|sc|im|inalatorio|inal|topico|top|oftalmico|nasal|retal|vaginal)\b.*$/,'').replace(/\s+\([^)]*\)\s*$/,'').trim()}
  function terms(name){const n=coreName(name);return [...new Set([n,...(aliases[n]||[])].map(fold).filter(x=>x.length>=3))]}
  function matchDesignation(name,designation){const h=fold(designation),ts=terms(name);return ts.some(t=>h===t||h.startsWith(t+' ')||h.startsWith(t+'/')||h.startsWith(t+'+')||h.startsWith(t+'(')||h.includes(' '+t+' '))}

  function knownCodes(name){
    const cacheKey=coreName(name);if(codeCache.has(cacheKey))return codeCache.get(cacheKey);
    const out=[];
    for(const r of stability){const c=validCode(r.code);if(c&&matchDesignation(name,[r.designation,r.brand].filter(Boolean).join(' ')))out.push({code:c,label:[r.designation,r.brand,r.form].filter(Boolean).join(' · '),source:'INF.1030.11'})}
    for(const r of highAlert){const c=validCode(r.code);if(c&&matchDesignation(name,r.designation))out.push({code:c,label:[r.designation,r.category].filter(Boolean).join(' · '),source:'IMP.1636.05'})}
    const seen=new Set(),rows=out.filter(x=>{const k=x.code+'|'+fold(x.label);if(seen.has(k))return false;seen.add(k);return true}).slice(0,24);
    codeCache.set(cacheKey,rows);return rows;
  }

  function uniqueCodeNumbers(name){return [...new Set(knownCodes(name).map(x=>x.code).filter(Boolean))]}
  function inlineCodes(name){
    const codes=uniqueCodeNumbers(name);if(!codes.length)return '';
    return `<small class="fcc-code-inline" title="Códigos CUF conhecidos. Confirmar a apresentação concreta na ficha aberta."><span>CUF</span> ${codes.map(esc).join(' · ')}</small>`;
  }

  function slug(name){return fold(name).replace(/\+/g,' ').replace(/[\/,_()]+/g,' ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  function refs(name){const s=slug(coreName(name));return `<div class="fcc-med-ref-links"><a class="btn small" target="_blank" rel="noopener" href="https://www.indice.eu/pt/medicamentos/DCI/${encodeURIComponent(s)}/informacao-geral">Ficha DCI · Índice ↗</a><a class="btn small" target="_blank" rel="noopener" href="${INFOMED}">INFOMED · RCM/FI ↗</a></div>`}
  function codesBlock(name){const rows=knownCodes(name);if(!rows.length)return `<div class="fcc-known-codes"><div class="fcc-known-title">Códigos conhecidos</div><div class="tiny">Sem código CUF validado integrado para esta substância/apresentação.</div></div>`;return `<details class="fcc-known-codes"><summary>Códigos CUF conhecidos <span>${rows.length}</span></summary><div class="fcc-code-note">Cada código pertence à apresentação indicada. Não extrapolar para outra concentração, forma ou via.</div>${rows.map(x=>`<div class="fcc-code-row"><div><b>${esc(x.label)}</b><small>${esc(x.source)}</small></div><code>${esc(x.code)}</code></div>`).join('')}</details>`}

  function addStyles(){
    if(document.getElementById('fcc-med-reference-v2-style'))return;
    const s=document.createElement('style');s.id='fcc-med-reference-v2-style';s.textContent=`
      .fcc-code-inline{display:block!important;margin-top:2px!important;font-size:7px!important;line-height:1.3!important;font-weight:650!important;letter-spacing:.015em!important;color:var(--muted)!important;text-transform:none!important;white-space:normal!important}
      .fcc-code-inline span{font-size:6px;font-weight:950;letter-spacing:.08em;color:var(--clinical);margin-right:3px}
      #clin-drugs .med4-mini>.fcc-code-inline{margin-bottom:1px!important}
      #clin-perf .ccd-doc-top h3+.fcc-code-inline{margin-top:3px!important;max-width:620px}
      .fcc-med-ref-links{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.fcc-med-ref-links .btn{font-size:8px}
      .fcc-known-codes{margin-top:9px;border:1px solid rgba(98,212,255,.18);border-radius:11px;padding:8px;background:rgba(98,212,255,.035)}
      .fcc-known-codes>summary{cursor:pointer;color:var(--clinical);font-size:8px;font-weight:900}.fcc-known-codes>summary span{float:right;color:var(--muted)}
      .fcc-known-title{font-size:8px;font-weight:900;color:var(--muted);margin-bottom:3px}.fcc-code-note{font-size:7px;color:var(--muted);line-height:1.4;margin:7px 0}
      .fcc-code-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;border-top:1px solid var(--line);padding:6px 0}.fcc-code-row b{display:block;font-size:8px}.fcc-code-row small{display:block;color:var(--muted);font-size:7px;margin-top:2px}.fcc-code-row code{font-size:8px;color:var(--clinical);font-weight:900}.fcc-dil-ref-strip{margin:2px 3px 8px}
    `;document.head.appendChild(s);
  }

  function decorateDrugMini(btn){
    if(!btn||btn.nodeType!==1||!btn.classList.contains('med4-mini')||btn.querySelector(':scope > .fcc-code-inline'))return;
    const name=btn.dataset.med4||btn.querySelector('strong')?.textContent?.trim()||'';if(!name)return;
    const html=inlineCodes(name);if(!html)return;
    const strong=btn.querySelector(':scope > strong');if(strong)strong.insertAdjacentHTML('afterend',html);
  }
  function decorateDilutionHeader(card){
    if(!card||card.nodeType!==1||!card.classList.contains('ccd-doc-card'))return;
    const h=card.querySelector('.ccd-doc-top h3');if(!h||h.parentElement?.querySelector(':scope > .fcc-code-inline'))return;
    const name=h.textContent?.trim()||'';const html=inlineCodes(name);if(html)h.insertAdjacentHTML('afterend',html);
  }
  function decorateDrugRow(row){
    if(!row||row.nodeType!==1||row.dataset.fccRefs==='1'||!row.classList.contains('med5-detail-row'))return;
    const name=row.dataset.name||row.querySelector('.med4-head h3')?.textContent?.trim()||'';if(!name)return;
    const detail=row.querySelector('.med4-detail')||row;detail.insertAdjacentHTML('beforeend',refs(name)+codesBlock(name));row.dataset.fccRefs='1';
  }
  function decorateDilution(card){
    if(!card||card.nodeType!==1||card.dataset.fccRefs==='1'||!card.classList.contains('ccd-doc-card'))return;
    const name=card.querySelector('.ccd-doc-top h3')?.textContent?.trim()||'';if(!name)return;
    const top=card.querySelector('.ccd-doc-top');if(top)top.insertAdjacentHTML('afterend',`<div class="fcc-dil-ref-strip">${refs(name)}${codesBlock(name)}</div>`);card.dataset.fccRefs='1';
  }

  function decorateBatch(nodes,fn){
    let i=0;const run=deadline=>{let n=0;while(i<nodes.length&&n<24&&(!deadline||deadline.timeRemaining()>2)){fn(nodes[i++]);n++}if(i<nodes.length){if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:300});else setTimeout(()=>run(null),16)}};
    if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:300});else setTimeout(()=>run(null),0);
  }
  function decorateExisting(){
    decorateBatch([...document.querySelectorAll('#clin-drugs .med4-mini')],decorateDrugMini);
    decorateBatch([...document.querySelectorAll('#perfDilutionGrid .ccd-doc-card')],decorateDilutionHeader);
    document.querySelectorAll('#clin-drugs .med5-detail-row').forEach(decorateDrugRow);
  }
  function watchMedicationList(host){
    if(!host)return;new MutationObserver(changes=>{for(const c of changes)for(const n of c.addedNodes||[]){if(n.nodeType!==1)continue;decorateDrugMini(n);decorateDrugRow(n);n.querySelectorAll?.('.med4-mini').forEach(decorateDrugMini);n.querySelectorAll?.('.med5-detail-row').forEach(decorateDrugRow)}}).observe(host,{childList:true,subtree:true});
  }
  function watchDilutions(grid){
    if(!grid)return;new MutationObserver(changes=>{for(const c of changes)for(const n of c.addedNodes||[]){if(n.nodeType!==1)continue;decorateDilutionHeader(n);n.querySelectorAll?.('.ccd-doc-card').forEach(decorateDilutionHeader)}}).observe(grid,{childList:true,subtree:true});
    grid.addEventListener('click',e=>{const top=e.target.closest('.ccd-doc-top');if(top&&grid.contains(top))setTimeout(()=>decorateDilution(top.closest('.ccd-doc-card')),0)});
    grid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('.ccd-doc-top'))setTimeout(()=>decorateDilution(e.target.closest('.ccd-doc-card')),0)});
  }

  async function install(){
    if(!window.fccCufClinicalDocs||!window.fccIMP1636Data)return false;
    const [docs,imp]=await Promise.all([window.fccCufClinicalDocs,window.fccIMP1636Data]);
    stability=docs?.stability?.records||[];highAlert=imp?.records||[];codeCache.clear();addStyles();decorateExisting();
    watchMedicationList(document.getElementById('med4Results')||document.getElementById('clin-drugs'));
    watchDilutions(document.getElementById('perfDilutionGrid'));
    window.fccKnownMedicationCodes=knownCodes;
    return true;
  }

  let tries=0;const boot=()=>{tries++;Promise.resolve(install()).then(ok=>{if(!ok&&tries<80)setTimeout(boot,150)}).catch(()=>{if(tries<80)setTimeout(boot,220)})};boot();
})();
