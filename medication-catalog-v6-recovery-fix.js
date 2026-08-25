(()=>{
  if(window.__fccMedicationCatalogV6RecoveryFixInstalled)return;
  window.__fccMedicationCatalogV6RecoveryFixInstalled=true;

  const EXPECTED=690;
  const EXPECTED_EXPANSION=233;
  const VERSION='0.2-recovery-v4.7-order-aware';
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const HISTORICAL_CURRENT_IV_OVERLAP=new Map([[fold('Paracetamol'),'Analgesia / Dor / Anti-inflamatórios']]);

  function baseInfo(name){
    try{
      const arr=(typeof contentPack!=='undefined'&&Array.isArray(contentPack?.drugs))?contentPack.drugs:[];
      const alias={'Insulina regular':'Insulina','Heparina não fracionada':'Heparina'};
      return arr.find(d=>fold(d.name)===fold(name)||fold(d.name)===fold(alias[name]||''))||null;
    }catch(e){return null}
  }

  function currentIVSet(){
    const sel=document.getElementById('ivcDrugA');
    if(!sel)return new Set();
    return new Set([...sel.options].filter(o=>o.value).map(o=>fold(o.textContent)));
  }

  function expansionSet(){
    const arr=Array.isArray(window.FCC_MED_EXPANSION_V7)?window.FCC_MED_EXPANSION_V7:[];
    return new Set(arr.map(x=>fold(x?.n)).filter(Boolean));
  }

  function canonicalRows(){
    const list=document.querySelector('#med4Results .med4-list');
    if(!list)return null;
    const buttons=[...list.querySelectorAll(':scope > .med4-mini[data-med4]')];
    if(buttons.length<EXPECTED)return null;
    const map=new Map(),duplicates=[];
    for(const b of buttons){
      const n=String(b.dataset.med4||b.querySelector('strong')?.textContent||'').trim();
      const g=String(b.querySelector('span')?.textContent||'').trim();
      const k=fold(n);
      if(!n||!g)return null;
      if(map.has(k)){duplicates.push(n);continue}
      map.set(k,{n,g});
    }
    return {rows:[...map.values()],raw:buttons.length,duplicates};
  }

  function removeExpansion(snapshot){
    const exp=expansionSet();
    if(exp.size===0){
      return {rows:snapshot.rows,diagnostic:{raw:snapshot.raw,uniqueCurrent:snapshot.rows.length,expansionDeclared:0,expansionMatched:0,withoutExpansion:snapshot.rows.length,duplicateCanonical:snapshot.duplicates}};
    }
    if(exp.size!==EXPECTED_EXPANSION)return null;
    let matched=0;
    const rows=snapshot.rows.filter(r=>{
      if(exp.has(fold(r.n))){matched++;return false}
      return true;
    });
    return {rows,diagnostic:{raw:snapshot.raw,uniqueCurrent:snapshot.rows.length,expansionDeclared:exp.size,expansionMatched:matched,withoutExpansion:rows.length,duplicateCanonical:snapshot.duplicates}};
  }

  function expansionStateOK(d){
    return d?.expansionDeclared===0||(d?.expansionDeclared===EXPECTED_EXPANSION&&d?.expansionMatched===EXPECTED_EXPANSION);
  }

  function historicalRows(snapshot){
    const base=removeExpansion(snapshot);
    if(!base)return null;
    const historicalNames=window.FCCMedicationV6HistoricalIVNames;
    const historicalHealth=window.FCCMedicationV6HistoricalIVHealth;
    if(!Array.isArray(historicalNames)||!historicalHealth?.ok||historicalNames.length!==198)return null;
    const historicalSet=new Set(historicalNames.map(fold));
    const ivNow=currentIVSet();
    if(ivNow.size<198)return null;

    const kept=[],seen=new Set(),removedCurrentOnlyNames=[],preservedOverlapNames=[];
    let nonIV=0,historicalMatched=0,currentIVRows=0;
    for(const row of base.rows){
      const k=fold(row.n),isCurrentIV=ivNow.has(k),isHistoricalIV=historicalSet.has(k);
      if(isCurrentIV)currentIVRows++;
      if(!isCurrentIV){nonIV++;kept.push(row);seen.add(k);continue}
      if(isHistoricalIV){historicalMatched++;kept.push(row);seen.add(k);continue}
      if(HISTORICAL_CURRENT_IV_OVERLAP.has(k)){
        preservedOverlapNames.push(row.n);
        kept.push({...row,g:HISTORICAL_CURRENT_IV_OVERLAP.get(k)});
        seen.add(k);
        nonIV++;
        continue;
      }
      removedCurrentOnlyNames.push(row.n);
    }
    const missingHistorical=historicalNames.filter(n=>!seen.has(fold(n)));
    return {
      rows:kept,
      diagnostic:{...base.diagnostic,currentIV:ivNow.size,currentIVRows,nonIV,historicalExpected:historicalNames.length,historicalMatched,preservedOverlapNames,removedCurrentOnly:removedCurrentOnlyNames.length,removedCurrentOnlyNames,filtered:kept.length,missingHistorical}
    };
  }

  function build(rows){
    return rows.map(({n,g})=>{
      const base=baseInfo(n);
      const use=base?.use||'Consultar indicação aprovada no RCM/SmPC e protocolo aplicável.';
      const mon=base?.monitor||'A monitorização depende da indicação, dose, via, função renal/hepática e perfil de segurança.';
      const risk=base?.risks||'Confirmar contraindicações, interações e reações adversas no RCM/SmPC.';
      return {
        n,g,
        s:'BASE V0.2 RECUPERADA · origem estrutural histórica validada',
        q:[use,`Monitorizar: ${mon}`,`Risco-chave: ${risk}`].join(' '),
        pd:'Mecanismo específico dependente do medicamento; confirmar no RCM/SmPC da apresentação concreta.',
        use,
        pk:'Farmacocinética dependente da substância, via e formulação; confirmar no RCM/SmPC da apresentação concreta.',
        mon,risk,
        renal:'Avaliar função renal e confirmar necessidade de ajuste/contraindicação no RCM/SmPC específico.',
        hepatic:'Avaliar função hepática e confirmar necessidade de ajuste/contraindicação no RCM/SmPC específico.',
        inter:'Rever medicação concomitante e confirmar interações relevantes no RCM/SmPC.',
        antidote:'Confirmar reversão/antídoto específico quando aplicável; seguir toxicologia e suporte dirigido.',
        nursing:'Confirmar identidade, indicação, dose, via, apresentação, alergias, parâmetros basais, resposta e protocolo institucional antes da administração.'
      };
    });
  }

  async function install(){
    if(window.FCC_MEDICATION_CATALOG_V6?.count===EXPECTED)return true;
    const started=Date.now();
    let snapshot=null,filtered=null,lastDiagnostic=null;
    while(Date.now()-started<10000){
      snapshot=canonicalRows();
      if(snapshot){
        filtered=historicalRows(snapshot);
        lastDiagnostic=filtered?.diagnostic||lastDiagnostic;
        if(filtered?.rows.length===EXPECTED&&expansionStateOK(filtered.diagnostic)&&filtered.diagnostic.historicalMatched===198&&!filtered.diagnostic.missingHistorical.length)break;
      }
      await new Promise(r=>setTimeout(r,50));
    }
    const d=filtered?.diagnostic||lastDiagnostic||{raw:snapshot?.raw||0,filtered:filtered?.rows?.length||0};
    if(!filtered||filtered.rows.length!==EXPECTED||!expansionStateOK(d)||d.historicalMatched!==198||d.missingHistorical?.length){
      console.error('[Medication V6 recovery fix] reconstruction failed',JSON.stringify(d));
      window.FCC_MEDICATION_CATALOG_V6_RECOVERY_FIX={version:VERSION,expected:EXPECTED,count:0,ok:false,diagnostic:d};
      return false;
    }
    const records=build(filtered.rows);
    const unique=new Set(records.map(x=>fold(x.n)));
    if(records.length!==EXPECTED||unique.size!==EXPECTED){
      console.error('[Medication V6 recovery fix] final integrity check failed');
      return false;
    }
    window.FCC_MEDICATION_CATALOG_V6={version:VERSION,count:EXPECTED,records};
    window.FCC_MEDICATION_CATALOG_V6_RECOVERY_FIX={version:VERSION,expected:EXPECTED,count:EXPECTED,unique:unique.size,ok:true,diagnostic:d,source:'V4 canonical rows, with optional V7 expansion subtraction; historical IV set; Paracetamol preserved from original V4 multi-route catalogue'};
    document.dispatchEvent(new CustomEvent('fcc-medication-catalog-v6-ready',{detail:{version:VERSION,count:EXPECTED,recovered:true}}));
    console.info(`[Medication V6 recovery fix] restored ${EXPECTED}/${EXPECTED}; raw=${d.raw}; expansion=${d.expansionMatched}/${d.expansionDeclared}; historicalIV=${d.historicalMatched}; preservedOverlap=${d.preservedOverlapNames?.join(',')||'none'}; removedCurrentOnly=${d.removedCurrentOnlyNames?.join(',')||'none'}`);
    return true;
  }

  install().catch(e=>console.error('[Medication V6 recovery fix]',e));
})();
