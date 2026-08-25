(()=>{
  if(window.__fccMedicationMaster923OverlayInstalled)return;
  window.__fccMedicationMaster923OverlayInstalled=true;
  const EXPECTED=923;
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  async function install(){
    let tries=0;
    while((!window.FCCMedicationCatalogV7||!window.FCC_MEDICATION_MASTER_923)&&tries++<200)await new Promise(r=>setTimeout(r,50));
    const A=window.FCCMedicationCatalogV7,M=window.FCC_MEDICATION_MASTER_923;
    if(!A||!M||M.count!==EXPECTED||M.mapped?.length!==EXPECTED)throw new Error('canonical master or V7 unavailable');
    if(A.count!==EXPECTED)throw new Error(`V7 pre-overlay count ${A.count}/${EXPECTED}`);
    const before=new Set(A.records.map(x=>fold(x.n)));
    if(before.size!==EXPECTED)throw new Error(`V7 pre-overlay unique names ${before.size}/${EXPECTED}`);
    A.add(M.mapped);
    const after=A.records,sourceIds=after.map(x=>+x.sourceId).filter(Number.isFinite),uniqueSourceIds=new Set(sourceIds);
    if(A.count!==EXPECTED||uniqueSourceIds.size!==EXPECTED||Math.min(...sourceIds)!==1||Math.max(...sourceIds)!==923)throw new Error(`canonical overlay integrity failed count=${A.count} sourceIds=${uniqueSourceIds.size}`);
    window.FCCMedicationCanonicalOverlayHealth={ok:true,count:A.count,sourceIds:uniqueSourceIds.size,jsonSha256:M.jsonSha256};
    A.refresh?.();
    document.dispatchEvent(new CustomEvent('fcc-medication-canonical-overlay-ready',{detail:{...window.FCCMedicationCanonicalOverlayHealth}}));
    console.info(`[Medication Master 923 overlay] applied ${EXPECTED}/${EXPECTED}`);
  }
  install().catch(e=>{window.FCCMedicationCanonicalOverlayHealth={ok:false,count:window.FCCMedicationCatalogV7?.count||0,error:String(e?.message||e)};console.error('[Medication Master 923 overlay]',e)});
})();
