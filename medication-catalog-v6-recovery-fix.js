(()=>{
  if(window.__fccMedicationCatalogV6RecoveryFixInstalled)return;
  window.__fccMedicationCatalogV6RecoveryFixInstalled=true;

  const EXPECTED=690;
  const VERSION='0.2-recovery-v4.2';
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();

  function baseInfo(name){
    try{
      const arr=(typeof contentPack!=='undefined'&&Array.isArray(contentPack?.drugs))?contentPack.drugs:[];
      const alias={'Insulina regular':'Insulina','Heparina não fracionada':'Heparina'};
      return arr.find(d=>fold(d.name)===fold(name)||fold(d.name)===fold(alias[name]||''))||null;
    }catch(e){return null}
  }

  function canonicalRows(){
    const list=document.querySelector('#med4Results .med4-list');
    if(!list)return null;
    const buttons=[...list.querySelectorAll(':scope > .med4-mini[data-med4]')];
    if(buttons.length!==EXPECTED)return null;
    const map=new Map();
    for(const b of buttons){
      const n=String(b.dataset.med4||b.querySelector('strong')?.textContent||'').trim();
      const g=String(b.querySelector('span')?.textContent||'').trim();
      const k=fold(n);
      if(!n||!g||map.has(k))return null;
      map.set(k,{n,g});
    }
    return map.size===EXPECTED?[...map.values()]:null;
  }

  function build(rows){
    return rows.map(({n,g})=>{
      const base=baseInfo(n);
      const use=base?.use||'Consultar indicação aprovada no RCM/SmPC e protocolo aplicável.';
      const mon=base?.monitor||'A monitorização depende da indicação, dose, via, função renal/hepática e perfil de segurança.';
      const risk=base?.risks||'Confirmar contraindicações, interações e reações adversas no RCM/SmPC.';
      return {
        n,g,
        s:'BASE V0.2 RECUPERADA · confirmar monografia individual',
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
    let rows=null,observed=0;
    while(Date.now()-started<8500){
      const list=document.querySelector('#med4Results .med4-list');
      observed=Math.max(observed,list?.querySelectorAll(':scope > .med4-mini[data-med4]').length||0);
      rows=canonicalRows();
      if(rows)break;
      await new Promise(r=>setTimeout(r,50));
    }
    if(!rows){
      console.error(`[Medication V6 recovery fix] canonical list did not reach ${EXPECTED}; observed=${observed}`);
      window.FCC_MEDICATION_CATALOG_V6_RECOVERY_FIX={version:VERSION,expected:EXPECTED,count:0,observed,ok:false};
      return false;
    }
    const records=build(rows);
    const unique=new Set(records.map(d=>fold(d.n)));
    if(records.length!==EXPECTED||unique.size!==EXPECTED){
      console.error('[Medication V6 recovery fix] integrity check failed');
      return false;
    }
    window.FCC_MEDICATION_CATALOG_V6={version:VERSION,count:EXPECTED,records};
    window.FCC_MEDICATION_CATALOG_V6_RECOVERY_FIX={version:VERSION,expected:EXPECTED,count:EXPECTED,unique:unique.size,observed,ok:true,source:'V4 canonical direct-list entries + contentPack'};
    document.dispatchEvent(new CustomEvent('fcc-medication-catalog-v6-ready',{detail:{version:VERSION,count:EXPECTED,recovered:true}}));
    console.info(`[Medication V6 recovery fix] restored ${EXPECTED}/${EXPECTED} canonical records`);
    return true;
  }

  install().catch(e=>console.error('[Medication V6 recovery fix]',e));
})();
