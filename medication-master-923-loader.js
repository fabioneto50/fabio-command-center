(()=>{
  if(window.__fccMedicationMaster923LoaderInstalled)return;
  window.__fccMedicationMaster923LoaderInstalled=true;
  const VERSION='923-canonical-v0.8.1-bridge-1';
  const EXPECTED=923,EXPECTED_BASE=690,EXPECTED_EXPANSION=233,EXPECTED_B64=124076;
  const JSON_SHA='ba3434f94ad5a8bf10673a9ad9d14c49db2dcca3ff4309e27eef0f3457cdabaf';
  const GZIP_SHA='553069927315e9fe8caa1d574db5f5b80d958c480f6fbaa9c8ed7e0ca955a297';
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=`${src}?v=${VERSION}`;s.async=false;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  const hex=buf=>[...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');
  const sha=async bytes=>hex(await crypto.subtle.digest('SHA-256',bytes));
  const d=(r,k,fallback='')=>String(r?.details?.[k]??fallback??'');
  function mapRecord(r){
    const src=String(r.source||'');
    return {
      n:String(r.name||''),g:String(r.drugClass||'Sem grupo definido'),q:String(r.use||d(r,'Utilização clínica')),
      pd:d(r,'Classe / farmacodinâmica',r.drugClass),use:d(r,'Utilização clínica',r.use),pk:d(r,'Farmacocinética'),
      mon:d(r,'Monitorização',r.monitoring),risk:d(r,'Riscos / precauções',r.precautions),renal:d(r,'Função renal'),hepatic:d(r,'Função hepática'),
      inter:d(r,'Interações'),antidote:d(r,'Antídoto / reversão'),nursing:d(r,'Pontos críticos de enfermagem'),preg:d(r,'Gravidez e aleitamento'),
      ger:d(r,'Idoso / fragilidade'),peds:d(r,'Pediatria'),obesity:d(r,'Obesidade / peso de dose'),hd:d(r,'Hemodiálise / CRRT'),ecmo:d(r,'ECMO'),
      albumin:d(r,'Hipoalbuminemia'),qt:d(r,'QT / ECG'),neuro:d(r,'Risco neurofarmacológico'),food:d(r,'Alimentos / álcool'),crush:d(r,'Pode esmagar?'),
      tube:d(r,'SNG / PEG'),photo:d(r,'Fotossensibilidade'),filter:d(r,'Filtro de linha'),access:d(r,'PVC vs CVC'),speed:d(r,'Velocidade máxima'),
      ph:d(r,'pH / osmolaridade'),extr:d(r,'Extravasamento'),storage:d(r,'Conservação'),high:d(r,'Medicamento de alto risco'),lasa:d(r,'LASA'),
      tdm:d(r,'TDM'),narrow:d(r,'Janela terapêutica'),onset:d(r,'Início / pico / duração'),event:d(r,'Se acontecer X..'),
      ...( /^https?:\/\//i.test(src)?{src}:{} ),
      sourceId:+r.sourceId,id:String(r.id||''),aliases:Array.isArray(r.aliases)?[...r.aliases]:[],administration:String(r.administration||''),sourceText:src
    };
  }
  async function boot(){
    window.__FCC_MED923_B64='';
    for(let i=1;i<=8;i++)await load(`medication-master-923-data-${String(i).padStart(2,'0')}.js`);
    const b64=String(window.__FCC_MED923_B64||'');
    if(b64.length!==EXPECTED_B64)throw new Error(`canonical base64 length ${b64.length}/${EXPECTED_B64}`);
    const gzip=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    const gzipHash=await sha(gzip);
    if(gzipHash!==GZIP_SHA)throw new Error(`canonical gzip hash mismatch ${gzipHash}`);
    const raw=await new Response(new Blob([gzip]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    const jsonHash=await sha(raw);
    if(jsonHash!==JSON_SHA)throw new Error(`canonical JSON hash mismatch ${jsonHash}`);
    const records=JSON.parse(new TextDecoder().decode(raw));
    if(!Array.isArray(records)||records.length!==EXPECTED)throw new Error(`canonical record count ${records?.length}/${EXPECTED}`);
    const sourceIds=records.map(r=>+r.sourceId),idSet=new Set(records.map(r=>String(r.id||''))),nameSet=new Set(records.map(r=>fold(r.name)));
    if(sourceIds.some((x,i)=>x!==i+1)||idSet.size!==EXPECTED||nameSet.size!==EXPECTED)throw new Error('canonical IDs/sourceIds/names integrity failed');
    const mapped=records.map(mapRecord);
    window.FCC_MED_EXPANSION_V7=[];
    for(let i=1;i<=3;i++)await load(`medication-expansion-v7-${String(i).padStart(2,'0')}.js`);
    const expansionNames=new Set((window.FCC_MED_EXPANSION_V7||[]).map(x=>fold(x.n)));
    const expansion=mapped.filter(x=>expansionNames.has(fold(x.n))),base=mapped.filter(x=>!expansionNames.has(fold(x.n)));
    const missing=[...(window.FCC_MED_EXPANSION_V7||[])].filter(x=>!nameSet.has(fold(x.n))).map(x=>x.n);
    if(expansionNames.size!==EXPECTED_EXPANSION||expansion.length!==EXPECTED_EXPANSION||base.length!==EXPECTED_BASE||missing.length)throw new Error(`canonical split failed base=${base.length} expansion=${expansion.length} expansionNames=${expansionNames.size} missing=${missing.join('|')}`);
    window.FCC_MEDICATION_MASTER_923={version:VERSION,count:EXPECTED,records,mapped,base,expansion,jsonSha256:JSON_SHA,gzipSha256:GZIP_SHA};
    window.FCC_MEDICATION_CATALOG_V6={version:'0.2-canonical-bridge',count:EXPECTED_BASE,records:base};
    window.FCCMedicationMaster923Health={ok:true,version:VERSION,count:EXPECTED,baseCount:base.length,expansionCount:expansion.length,uniqueIds:idSet.size,uniqueNames:nameSet.size,jsonSha256:jsonHash,gzipSha256:gzipHash};
    window.FCC_MED_EXPANSION_V7=[];
    document.dispatchEvent(new CustomEvent('fcc-medication-master-923-ready',{detail:{...window.FCCMedicationMaster923Health}}));
    console.info(`[Medication Master 923] verified ${EXPECTED}; bridge=${base.length}+${expansion.length}`);
  }
  boot().catch(e=>{window.FCCMedicationMaster923Health={ok:false,version:VERSION,count:0,error:String(e?.message||e)};console.error('[Medication Master 923]',e)});
})();
