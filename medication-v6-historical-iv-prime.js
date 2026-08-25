(()=>{
  if(window.__fccMedicationV6HistoricalIVPrimeInstalled)return;
  window.__fccMedicationV6HistoricalIVPrimeInstalled=true;

  const EXPECTED=198;
  const HISTORICAL=[
    'Adrenalina','Noradrenalina','Dopamina','Dobutamina','Vasopressina','Fenilefrina','Metaraminol','Efedrina','Isoprenalina','Milrinona','Levosimendano',
    'Amiodarona','Adenosina','Lidocaína','Procainamida','Digoxina','Atropina','Esmolol','Landiolol','Labetalol','Metoprolol IV','Nicardipina','Clevidipina','Hidralazina','Nitroglicerina','Nitroprussiato',
    'Propofol','Midazolam','Dexmedetomidina','Ketamina','Fentanilo','Alfentanil','Remifentanil','Morfina','Hidromorfona','Petidina','Tramadol','Paracetamol IV','Metamizol IV','Droperidol',
    'Rocurónio','Cisatracúrio','Atracúrio','Succinilcolina','Sugamadex','Neostigmina','Glicopirrolato',
    'Amoxicilina/ácido clavulânico','Ampicilina','Ampicilina/sulbactam','Piperacilina/tazobactam','Penicilina G','Flucloxacilina','Cefazolina','Cefuroxima','Cefotaxima','Ceftriaxona','Ceftazidima','Cefepima','Ceftarolina','Ceftolozano/tazobactam','Ceftazidima/avibactam','Aztreonam','Ertapenem','Imipenem/cilastatina','Meropenem','Meropenem/vaborbactam','Gentamicina','Amicacina','Tobramicina','Vancomicina','Teicoplanina','Daptomicina','Linezolida','Clindamicina','Metronidazol','Ciprofloxacina','Levofloxacina','Azitromicina IV','Doxiciclina IV','Tigeciclina','Colistimetato de sódio','Fosfomicina IV','Trimetoprim/sulfametoxazol IV',
    'Fluconazol','Voriconazol','Posaconazol IV','Isavuconazol','Anfotericina B lipossómica','Anidulafungina','Caspofungina','Micafungina',
    'Aciclovir','Ganciclovir','Foscarnet','Remdesivir','Letermovir IV',
    'Cloreto de potássio','Fosfato de potássio','Fosfato de sódio','Sulfato de magnésio','Cloreto de cálcio','Gluconato de cálcio','Bicarbonato de sódio','Cloreto de sódio hipertónico','Glicose hipertónica','NaCl 0,9%','Glicose 5%','Ringer lactato','Plasma-Lyte','Manitol','Albumina humana',
    'Insulina regular','Glucagon','Hidrocortisona','Metilprednisolona','Dexametasona','Levotiroxina IV','Desmopressina','Octreótido',
    'Heparina não fracionada','Bivalirudina','Argatroban','Alteplase','Tenecteplase','Ácido tranexâmico','Protamina','Vitamina K IV','Concentrado complexo protrombínico','Fibrinogénio concentrado','Fator VIII','Fator IX','Fator von Willebrand','Antitrombina III','Idarucizumab','Andexanet alfa',
    'Levetiracetam','Valproato de sódio','Fenitoína','Fosfenitoína','Lacosamida','Fenobarbital','Diazepam IV','Tiopental','Piridoxina IV',
    'Pantoprazol','Omeprazol IV','Famotidina','Metoclopramida','Ondansetrom','Granisetrom','Octreótido','Terlipressina','Acetilcisteína','Tiamina IV',
    'Furosemida','Bumetanida','Acetazolamida',
    'Naloxona','Flumazenil','Acetilcisteína','Hidroxocobalamina','Azul de metileno','Fomepizol','Digoxina Fab','Pralidoxima','Atropina','Glucagon','Emulsão lipídica 20%',
    'Oxitocina','Carbetocina','Sulfato de magnésio','Ácido tranexâmico','Labetalol','Hidralazina',
    'Ciclofosfamida','Citarabina','Metotrexato IV','Doxorrubicina','Epirrubicina','Etopósido','Vincristina','Vinblastina','Paclitaxel','Docetaxel','Carboplatina','Cisplatina','Oxaliplatina','Fluorouracilo','Gemcitabina','Irinotecano','Rituximab','Trastuzumab','Pembrolizumab','Nivolumab',
    'Infliximab','Tocilizumab','Rituximab','Imunoglobulina humana IV','Metilprednisolona',
    'Ciclosporina IV','Tacrolímus IV','Ferro sacarose','Carboximaltose férrica','Ácido zoledrónico','Pamidronato','Denosumab','Contraste iodado IV'
  ];
  const UNIQUE=[...new Set(HISTORICAL)];

  window.FCCMedicationV6PrimePromise=(async()=>{
    const started=Date.now();
    let A=null;
    while(Date.now()-started<5000){
      A=document.getElementById('ivcDrugA');
      if(A)break;
      await new Promise(r=>setTimeout(r,50));
    }
    if(!A)throw new Error('[Medication V6 prime] ivcDrugA unavailable');
    if(UNIQUE.length!==EXPECTED)throw new Error(`[Medication V6 prime] historical IV integrity failed: ${UNIQUE.length}/${EXPECTED}`);

    const saved={html:A.innerHTML,value:A.value};
    window.__FCCMedicationV6SavedIV=saved;
    A.innerHTML='<option value="">Selecionar fármaco…</option>'+UNIQUE.map(n=>`<option value="${String(n).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${String(n).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</option>`).join('');
    A.value='';
    window.FCCMedicationV6PrimeHealth={ok:true,expected:EXPECTED,count:UNIQUE.length,source:'iv-catalogue.js @ V0.2 commit 0264d930'};
    return true;
  })();

  window.FCCMedicationV6RestoreIV=()=>{
    const A=document.getElementById('ivcDrugA'),saved=window.__FCCMedicationV6SavedIV;
    if(!A||!saved)return false;
    A.innerHTML=saved.html;
    if([...A.options].some(o=>o.value===saved.value))A.value=saved.value;
    delete window.__FCCMedicationV6SavedIV;
    return true;
  };
})();
