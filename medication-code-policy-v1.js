(()=>{
  if(window.__fccMedicationCodePolicyV1Installed)return;
  window.__fccMedicationCodePolicyV1Installed=true;

  const LEGACY_F=/\bF\s*[-._/]?\s*\d[A-Z0-9._/-]{2,}\b/gi;
  const CUF_CODE=/^\d{9}$/;
  let processing=false,queued=false;

  function cleanText(s){
    return String(s||'')
      .replace(LEGACY_F,'')
      .replace(/Documento HBA\s*·\s*mod\.\s*19\/09\/2018/gi,'DILUIÇÕES.xlsx · legado 2018 · códigos institucionais removidos')
      .replace(/HBA\s*·\s*documento\s*2018/gi,'DILUIÇÕES.xlsx · legado sem códigos')
      .replace(/^\s*·\s*/,'')
      .replace(/\s*·\s*·\s*/g,' · ')
      .replace(/\s*·\s*$/,'');
  }

  function cleanTextNodes(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const n of nodes){
      const v=n.nodeValue||'',next=cleanText(v);
      if(next!==v)n.nodeValue=next;
    }
  }

  function validateCufCodes(){
    document.querySelectorAll('#clin-drugs .cuf-stab-code').forEach(el=>{
      const b=el.querySelector('b');
      const code=(b?.textContent||'').trim();
      if(code&&CUF_CODE.test(code)){
        if(el.firstChild?.nodeType===Node.TEXT_NODE)el.firstChild.nodeValue='Código CUF ';
        return;
      }
      if(b||code)el.textContent='Código CUF não indicado';
    });

    document.querySelectorAll('#clin-lasa .cuf-imp-code').forEach(el=>{
      const code=(el.querySelector('b')?.textContent||el.textContent||'').match(/\b\d{9}\b/)?.[0]||'';
      if(!code){el.remove();return}
      const b=el.querySelector('b');if(b)b.textContent=code;
    });
  }

  function updateLegacySourceNotice(){
    const badge=document.getElementById('ccdDocSourceBadge');
    if(badge)badge.textContent='DILUIÇÕES.xlsx · legado sem códigos';
    const banner=document.querySelector('#clin-perf .ccd-banner');
    if(banner&&!banner.querySelector('.fcc-code-policy-note')){
      const n=document.createElement('div');n.className='fcc-code-policy-note tiny';
      n.textContent='Os códigos institucionais existentes no DILUIÇÕES.xlsx foram removidos. Códigos apresentados noutras fichas provêm apenas de documentos CUF e permanecem ligados à apresentação concreta.';
      banner.appendChild(n);
    }
  }

  function sanitize(){
    if(processing)return;processing=true;
    try{
      ['clin-perf','clin-drugs','clin-lasa'].forEach(id=>cleanTextNodes(document.getElementById(id)));
      validateCufCodes();
      updateLegacySourceNotice();
    }finally{processing=false}
  }
  function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;sanitize()})}

  function install(){
    const page=document.getElementById('page-clinical');if(!page)return false;
    sanitize();
    new MutationObserver(records=>{if(processing)return;if(records.some(r=>r.addedNodes?.length))schedule()}).observe(page,{childList:true,subtree:true});
    window.addEventListener('fcc-subtab-change',schedule);
    setTimeout(sanitize,150);setTimeout(sanitize,700);setTimeout(sanitize,1600);
    window.fccSanitizeMedicationCodes=sanitize;
    return true;
  }

  let tries=0;const boot=()=>{tries++;if(install()||tries>60)return;setTimeout(boot,120)};boot();
})();
