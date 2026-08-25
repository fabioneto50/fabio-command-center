(()=>{
if(window.__fccMedicationCatalogV6Installed)return;window.__fccMedicationCatalogV6Installed=true;
const EXPECTED=690;
const VERSION='0.2-recovery-v4.1';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
let observedMax=0;

function groupMechanism(group){
  const g=fold(group);
  if(g.includes('analgesia'))return 'Atua em vias nociceptivas/inflamatórias; o alvo exato depende da classe (COX, recetores opioides, canais iónicos ou vias centrais).';
  if(g.includes('cardiovascular'))return 'Modula pressão, frequência, contratilidade, volume ou remodelagem cardiovascular através de RAAS, canais iónicos, recetores autonómicos ou transporte renal.';
  if(g.includes('antiagreg')||g.includes('anticoag'))return 'Reduz formação de trombo por inibição da ativação plaquetária ou de fatores específicos da coagulação.';
  if(g.includes('dislip'))return 'Reduz colesterol/lipoproteínas através de síntese hepática, absorção intestinal ou regulação de recetores LDL/PCSK9.';
  if(g.includes('diabetes'))return 'Reduz glicemia através de aumento de insulina, maior sensibilidade, menor produção/absorção de glicose ou maior eliminação urinária.';
  if(g.includes('respir'))return 'Modula broncomotricidade e/ou inflamação das vias aéreas por recetores β2, muscarínicos, glucocorticoides ou alvos biológicos.';
  if(g.includes('alerg')||g.includes('antihist'))return 'Modula vias histaminérgicas e/ou inflamatórias/alérgicas; confirmar mecanismo específico no RCM/SmPC.';
  if(g.includes('psiquiatr')||g.includes('ansiol'))return 'Modula neurotransmissão central serotoninérgica, noradrenérgica, dopaminérgica, GABAérgica ou vias de segundos mensageiros, consoante a classe.';
  if(g.includes('neurolog'))return 'Modula excitabilidade neuronal, canais iónicos, neurotransmissores ou proteínas/alvos específicos do sistema nervoso.';
  if(g.includes('demência')||g.includes('cogni'))return 'Modula neurotransmissão colinérgica e/ou glutamatérgica conforme o medicamento; confirmar particularidades no RCM/SmPC.';
  if(g.includes('gastro')||g.includes('inflamatória intestinal')||g.includes('hepat'))return 'Atua sobre secreção ácida, motilidade, secreção intestinal, inflamação mucosa ou vias hepato-biliares conforme a classe.';
  if(g.includes('antibacter'))return 'Inibe estruturas ou processos essenciais bacterianos, como parede celular, ribossomas, DNA/RNA ou metabolismo do folato.';
  if(g.includes('tubercul'))return 'Atua em alvos específicos das micobactérias, incluindo parede celular, RNA-polimerase, metabolismo energético ou síntese proteica.';
  if(g.includes('hiv'))return 'Interrompe etapas do ciclo do HIV, como transcriptase reversa, integrase, protease, entrada ou capsídeo.';
  if(g.includes('antiviral'))return 'Inibe replicação viral através de polimerases, proteases, neuraminidase ou outros alvos específicos do vírus.';
  if(g.includes('antifúng'))return 'Compromete membrana/parede fúngica ou síntese de ergosterol, consoante a classe.';
  if(g.includes('antiparas'))return 'Interfere em metabolismo, microtúbulos, canais ou outras estruturas essenciais do parasita.';
  if(g.includes('endocrin'))return 'Substitui ou modula hormonas e respetivos eixos, recetores ou síntese hormonal.';
  if(g.includes('osso'))return 'Modula reabsorção/formação óssea, cálcio-vitamina D ou sinalização osteoclástica/osteoblástica.';
  if(g.includes('reumat')||g.includes('transplante'))return 'Reduz ativação imune por antimetabolitos, calcineurina, citocinas, células B/T ou outras vias inflamatórias.';
  if(g.includes('hematologia'))return 'Repõe substratos hematopoiéticos ou estimula/modula produção de células sanguíneas, conforme a terapêutica.';
  if(g.includes('oncologia'))return 'Interfere na proliferação tumoral, DNA, microtúbulos ou vias moleculares/alvos específicos do tumor.';
  if(g.includes('urolog'))return 'Modula tónus do trato urinário, crescimento prostático, bexiga ou vias de ereção, dependendo da classe.';
  if(g.includes('ginec')||g.includes('obst'))return 'Modula recetores hormonais/uterinos ou coagulação conforme o objetivo terapêutico.';
  if(g.includes('dermat'))return 'Atua local ou sistemicamente sobre inflamação, queratinização, glândulas sebáceas ou microrganismos cutâneos.';
  if(g.includes('oftalm'))return 'Modula produção/drenagem do humor aquoso, inflamação, infeção ou alvos retinianos conforme a classe.';
  if(g.includes('orl'))return 'Reduz inflamação, congestão ou sintomas alérgicos locais através de glucocorticoides, antihistamínicos ou vasoconstritores.';
  if(g.includes('anestesia local'))return 'Bloqueia canais de sódio dependentes de voltagem nos nervos, impedindo propagação do potencial de ação.';
  if(g.includes('anestesia inalat'))return 'Produz anestesia por modulação de múltiplos canais e recetores neuronais excitatórios/inibitórios.';
  if(g.includes('vacina'))return 'Apresenta antigénios ou instruções antigénicas ao sistema imunitário para induzir memória e resposta protetora específica.';
  if(g.includes('vitamin')||g.includes('nutri'))return 'Repõe micronutriente/substrato necessário a vias metabólicas específicas.';
  if(g.includes('renal'))return 'Modula equilíbrio mineral/ácido-base, anemia da DRC, fósforo, potássio ou metabolismo mineral conforme a classe.';
  if(g.includes('gota'))return 'Reduz produção de ácido úrico, aumenta excreção ou bloqueia inflamação por cristais de urato.';
  if(g.includes('raras')||g.includes('especiais'))return 'Mecanismo altamente específico da terapêutica; confirmar monografia individual e RCM/SmPC.';
  if(g.includes('hospital')||g.includes('uci')||g.includes('urgência'))return 'Mecanismo dependente da substância e do contexto hospitalar; confirmar RCM/SmPC e protocolo institucional.';
  return 'Mecanismo específico dependente do medicamento; confirmar no RCM/SmPC antes de usar esta informação em decisão clínica.';
}

function baseInfo(name){
  try{
    const arr=(typeof contentPack!=='undefined'&&Array.isArray(contentPack?.drugs))?contentPack.drugs:[];
    const alias={'Insulina regular':'Insulina','Heparina não fracionada':'Heparina'};
    return arr.find(d=>fold(d.name)===fold(name)||fold(d.name)===fold(alias[name]||''))||null;
  }catch(e){return null}
}

function readV4Rows(){
  const buttons=[...document.querySelectorAll('#med4Results [data-med4]')];
  observedMax=Math.max(observedMax,buttons.length);
  if(buttons.length!==EXPECTED)return null;
  const map=new Map();
  for(const b of buttons){
    const n=String(b.dataset.med4||b.querySelector('strong')?.textContent||'').trim();
    const g=String(b.querySelector('span')?.textContent||'').trim();
    if(!n||!g)return null;
    const k=fold(n);
    if(map.has(k))return null;
    map.set(k,{n,g});
  }
  return map.size===EXPECTED?[...map.values()]:null;
}

function build(rows){
  return rows.map(x=>{
    const base=baseInfo(x.n);
    const pd=groupMechanism(x.g);
    const use=base?.use||'Consultar indicação aprovada no RCM/SmPC e protocolo aplicável.';
    const mon=base?.monitor||'A monitorização depende da indicação, dose, via, função renal/hepática e perfil de segurança.';
    const risk=base?.risks||'Confirmar contraindicações, interações e reações adversas no RCM/SmPC.';
    return {
      n:x.n,g:x.g,
      s:'BASE V0.2 RECUPERADA · confirmar monografia individual',
      q:`${pd} Monitorizar: ${mon} Risco-chave: ${risk}`,
      pd,use,
      pk:'Farmacocinética dependente da substância, via e formulação; confirmar dados individuais no RCM/SmPC da apresentação concreta.',
      mon,risk,
      renal:'Avaliar função renal e confirmar necessidade de ajuste/contraindicação no RCM/SmPC específico.',
      hepatic:'Avaliar função hepática e confirmar necessidade de ajuste/contraindicação no RCM/SmPC específico.',
      inter:'Rever medicação concomitante e confirmar interações farmacodinâmicas/farmacocinéticas relevantes no RCM/SmPC.',
      antidote:'Confirmar reversão/antídoto específico quando aplicável; na ausência de reversor específico seguir toxicologia e suporte dirigido.',
      nursing:'Confirmar identidade, indicação, dose, via, apresentação, alergias, parâmetros basais, resposta e protocolo institucional antes da administração.'
    };
  });
}

async function ensureReadableV4(){
  if(window.__fccMedicationInfoV4Installed)return true;
  try{await load(`medication-info-v4.js?v=${encodeURIComponent(VERSION)}`);return !!window.__fccMedicationInfoV4Installed}
  catch(e){console.error('[Medication Catalog V6 recovery] não foi possível carregar medication-info-v4.js',e);return false}
}

async function boot(){
  await ensureReadableV4();
  const started=Date.now();
  let rows=null;
  while(Date.now()-started<9000){
    rows=readV4Rows();
    if(rows)break;
    await new Promise(r=>setTimeout(r,75));
  }
  if(!rows){
    console.error(`[Medication Catalog V6 recovery] base V4 não atingiu ${EXPECTED} entradas únicas; máximo observado=${observedMax}; V6 não publicado.`);
    window.FCC_MEDICATION_CATALOG_V6_RECOVERY={version:VERSION,expected:EXPECTED,count:0,observedMax,ok:false};
    document.dispatchEvent(new CustomEvent('fcc-medication-catalog-v6-recovery-failed',{detail:{expected:EXPECTED,observedMax}}));
    return;
  }
  const DATA=build(rows);
  const unique=new Set(DATA.map(d=>fold(d.n)));
  if(DATA.length!==EXPECTED||unique.size!==EXPECTED){
    console.error('[Medication Catalog V6 recovery] validação de integridade falhou.');
    return;
  }
  window.FCC_MEDICATION_CATALOG_V6={version:VERSION,count:DATA.length,records:DATA};
  window.FCC_MEDICATION_CATALOG_V6_RECOVERY={version:VERSION,expected:EXPECTED,count:DATA.length,unique:unique.size,observedMax,ok:true,source:'medication-info-v4 DOM + contentPack'};
  document.dispatchEvent(new CustomEvent('fcc-medication-catalog-v6-ready',{detail:{version:VERSION,count:DATA.length,recovered:true}}));
}
boot().catch(e=>console.error('[Medication Catalog V6 recovery]',e));
})();
