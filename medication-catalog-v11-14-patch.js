(()=>{
  if(window.__fccMedicationPatch1114Installed)return;
  window.__fccMedicationPatch1114Installed=true;
  const VERSION='0.11.14';
  const EXPECTED_ROWS=276;
  const EXPECTED_CATALOG=923;
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[‐‑‒–—]/g,'-').replace(/[^a-z0-9+/% -]+/g,' ').replace(/\s+/g,' ').trim();
  const stripQualifier=s=>String(s||'').split(/\s+[—–]\s+/)[0].trim();
  const stripBrand=s=>String(s||'').replace(/\s*\([^)]*\)\s*/g,' ').replace(/\s+/g,' ').trim();
  const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=`${src}?v=med1114-${VERSION}-replace`;s.async=false;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  const files=['medication-v11-14-data-01.js','medication-v11-14-data-02.js',...Array.from({length:24},(_,i)=>`medication-v11-14-data-r${String(i+3).padStart(2,'0')}.js`)];
  const unique=arr=>[...new Set(arr.filter(Boolean).map(x=>String(x).trim()).filter(Boolean))];

  function candidates(row){
    return unique([
      row.medicamento,row.medicamento_base_associacao,
      stripQualifier(row.medicamento),stripQualifier(row.medicamento_base_associacao),
      stripBrand(row.medicamento),stripBrand(row.medicamento_base_associacao),
      stripBrand(stripQualifier(row.medicamento)),stripBrand(stripQualifier(row.medicamento_base_associacao))
    ]);
  }

  function resolve(row,records,used){
    const exact=new Map();
    for(const d of records){const k=fold(d.n);if(!exact.has(k))exact.set(k,[]);exact.get(k).push(d)}
    for(const c of candidates(row)){
      const hits=(exact.get(fold(c))||[]).filter(d=>!used.has(fold(d.n)));
      if(hits.length===1)return {target:hits[0],method:`exact:${c}`};
    }
    const group=fold(row.categoria);
    const pool=records.filter(d=>!used.has(fold(d.n))&&(!group||fold(d.g)===group));
    for(const c of candidates(row)){
      const k=fold(c);if(k.length<4)continue;
      const hits=pool.filter(d=>{const n=fold(d.n);return n===k||n.startsWith(k+' ')||k.startsWith(n+' ')});
      if(hits.length===1)return {target:hits[0],method:`unique-group-prefix:${c}`};
    }
    return null;
  }

  function replacement(target,row){
    const primary=String(row.fonte_regulatoria_primaria||'').trim();
    const lact=[`Gravidez: ${row.gravidez||'—'}`,`Aleitamento: ${row.aleitamento||'—'}`];
    if(row.e_lactancia)lact.push(`e-Lactancia/LactMed: ${row.e_lactancia}`);
    const q=[row.utilizacao_clinica,row.riscos_precaucoes?`Risco-chave: ${row.riscos_precaucoes}`:''].filter(Boolean).join(' ');
    return {
      n:target.n,
      g:row.categoria||target.g,
      s:`Base v0.11.14 · substituição integral da ficha ${row.id}`,
      q,
      pd:row.classe_farmacodinamica||'',
      use:row.utilizacao_clinica||'',
      pk:'',
      mon:row.monitorizacao||'',
      risk:row.riscos_precaucoes||'',
      renal:row.funcao_renal||'',
      hepatic:row.funcao_hepatica||'',
      inter:row.interacoes||'',
      antidote:'',
      nursing:'',
      preg:lact.join(' '),
      ger:'',peds:'',obesity:'',hd:'',ecmo:'',albumin:'',qt:'',neuro:'',food:'',crush:'',tube:'',photo:'',filter:'',access:'',speed:'',ph:'',extr:'',storage:'',high:'',lasa:'',tdm:'',narrow:'',onset:'',event:'',
      src:/^https?:\/\//i.test(primary)?primary:'',
      routeVariant:row.via_variante||'',
      baseAssociation:row.medicamento_base_associacao||'',
      eLactancia:row.e_lactancia||'',
      sourceRegulatory:primary,
      sourceClinical:row.fonte_clinica_secundaria||'',
      validationStatus:row.validacao_status||'',
      confidenceLevel:row.nivel_confianca||'',
      humanReview:row.revisao_humana||'',
      correctionNotes:row.notas_correcao||'',
      patchSourceId:+row.id,
      med1114:{...row,version:VERSION,targetName:target.n,replacement:true}
    };
  }

  function install(){
    const A=window.FCCMedicationCatalogV7;
    if(!A||!Array.isArray(A.records)||A.count!==EXPECTED_CATALOG||window.FCCMedicationV7Health?.ok!==true)return false;
    const rows=Array.isArray(window.__FCC_MED1114_ROWS)?window.__FCC_MED1114_ROWS:[];
    const ids=rows.map(r=>+r.id).filter(Number.isFinite),idSet=new Set(ids),nameSet=new Set(rows.map(r=>fold(r.medicamento)));
    const sourceIntegrity=rows.length===EXPECTED_ROWS&&idSet.size===EXPECTED_ROWS&&Math.min(...ids)===229&&Math.max(...ids)===504&&nameSet.size===EXPECTED_ROWS;
    const records=A.records,used=new Set(),matches=[],unmatched=[];
    for(const row of rows){
      const r=resolve(row,records,used);
      if(!r){unmatched.push({id:row.id,name:row.medicamento,base:row.medicamento_base_associacao||'',group:row.categoria||''});continue}
      const key=fold(r.target.n);used.add(key);matches.push({row,target:r.target,method:r.method});
    }
    const duplicateTargets=matches.length-used.size;
    const safeToApply=sourceIntegrity&&matches.length===EXPECTED_ROWS&&unmatched.length===0&&duplicateTargets===0&&A.count===EXPECTED_CATALOG;
    if(safeToApply){
      for(const x of matches)A.add(replacement(x.target,x.row));
      A.refresh?.();
    }
    window.FCCMedicationPatch1114Health={
      version:VERSION,mode:'replace',sourceRows:rows.length,uniqueIds:idSet.size,uniqueNames:nameSet.size,
      matched:matches.length,replaced:safeToApply?matches.length:0,applied:safeToApply?matches.length:0,
      unmatched,duplicateTargets,catalogCount:A.count,expectedCatalog:EXPECTED_CATALOG,sourceIntegrity,safeToApply,
      get ok(){return this.sourceIntegrity&&this.replaced===EXPECTED_ROWS&&this.unmatched.length===0&&this.duplicateTargets===0&&A.count===EXPECTED_CATALOG},
      matches:matches.map(x=>({id:x.row.id,source:x.row.medicamento,target:x.target.n,method:x.method})),
      refresh:()=>A.refresh?.()
    };
    document.dispatchEvent(new CustomEvent('fcc-medication-patch-1114-ready',{detail:{...window.FCCMedicationPatch1114Health,matches:undefined}}));
    if(!safeToApply)console.error('[Medication Patch 0.11.14 replace] blocked',window.FCCMedicationPatch1114Health);
    else console.info(`[Medication Patch 0.11.14 replace] replaced ${matches.length}/${EXPECTED_ROWS}; catalogue=${A.count}`);
    return true;
  }

  (async()=>{
    window.__FCC_MED1114_ROWS=[];
    for(const f of files)await load(f);
    let tries=0;
    while(!install()&&tries++<600)await new Promise(r=>setTimeout(r,100));
    if(!window.FCCMedicationPatch1114Health){
      const A=window.FCCMedicationCatalogV7;
      window.FCCMedicationPatch1114Health={version:VERSION,mode:'replace',sourceRows:window.__FCC_MED1114_ROWS?.length||0,uniqueIds:0,uniqueNames:0,matched:0,replaced:0,applied:0,unmatched:[],duplicateTargets:0,catalogCount:A?.count||0,expectedCatalog:EXPECTED_CATALOG,sourceIntegrity:false,safeToApply:false,ok:false,reason:'catalogue-not-ready'};
      console.error('[Medication Patch 0.11.14 replace] catalogue did not reach 923 before timeout',window.FCCMedicationPatch1114Health);
    }
  })().catch(e=>console.error('[Medication Patch 0.11.14 replace]',e));
})();
