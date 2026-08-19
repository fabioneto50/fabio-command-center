(()=>{
  if(window.__fccMedicationInfoV3Installed)return;
  window.__fccMedicationInfoV3Installed=true;

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const LEGACY={
    'Noradrenalina':{aliases:['norepinefrina','norepinephrine'],prep:'2 mg + diluente q.s.p. 50 mL · exemplo de referência; confirmar produto e protocolo local.',source:'https://www.medicines.org.uk/emc/product/13172/smpc'},
    'Adrenalina':{aliases:['epinefrina','epinephrine'],prep:'A concentração de perfusão depende da apresentação e do protocolo institucional.',source:'https://www.medicines.org.uk/emc/product/2024/smpc'},
    'Dobutamina':{aliases:['dobutamine'],prep:'250 mg + diluente q.s.p. 50 mL · exemplo de referência; confirmar protocolo local.',source:'https://www.medicines.org.uk/emc/product/100017/smpc'},
    'Dopamina':{aliases:['dopamine'],prep:'Existem várias concentrações de perfusão descritas; confirmar a preparação utilizada no serviço.',source:'https://www.medicines.org.uk/emc/product/100811/smpc'},
    'Propofol':{aliases:['propofol'],prep:'Solução 1% = 10 mg/mL; preferencialmente sem diluição no produto de referência.',source:'https://www.medicines.org.uk/emc/product/11295/smpc'},
    'Dexmedetomidina':{aliases:['dexmedetomidine'],prep:'Preparações de 4 ou 8 mcg/mL são descritas no produto de referência.',source:'https://www.medicines.org.uk/emc/product/13154/smpc'},
    'Alfentanil':{aliases:['alfentanil'],prep:'Solução de origem 500 mcg/mL; pode ser diluída conforme protocolo.',source:'https://www.medicines.org.uk/emc/product/6427/smpc'},
    'Remifentanil':{aliases:['remifentanil'],prep:'Reconstituir e depois diluir para perfusão; confirmar concentração final local.',source:'https://www.medicines.org.uk/emc/product/15232/smpc'},
    'Rocurónio':{aliases:['rocuronium'],prep:'Solução de origem 10 mg/mL; diluição possível conforme produto/protocolo.',source:'https://www.medicines.org.uk/emc/product/553/smpc'},
    'Insulina regular':{aliases:['insulina','insulin'],prep:'A preparação IV depende do tipo de insulina e do protocolo. Não generalizar concentrações entre produtos.',source:'https://www.medicines.org.uk/emc/product/1640/smpc'},
    'Amiodarona':{aliases:['amiodarone'],prep:'O produto de referência utiliza glicose 5% para perfusão; confirmar apresentação e concentração.',source:'https://www.medicines.org.uk/emc/product/8739/smpc'},
    'Heparina não fracionada':{aliases:['heparina','heparin'],prep:'A concentração final de perfusão deve seguir o protocolo/indicação local.',source:'https://www.medicines.org.uk/emc/product/1680/smpc'}
  };

  const MECH={
    'Adrenalina':'Agonista adrenérgico α e β; aumenta inotropismo/cronotropismo, provoca vasoconstrição dependente da dose e broncodilatação.',
    'Noradrenalina':'Agonista adrenérgico predominantemente α, com ação β1; aumenta sobretudo a resistência vascular e a pressão arterial.',
    'Dopamina':'Agonista dopaminérgico e adrenérgico com efeitos dependentes da dose sobre D1, β1 e α1.',
    'Dobutamina':'Agonista predominantemente β1; aumenta a contratilidade e o débito cardíaco, com efeito vascular variável.',
    'Vasopressina':'Agonista dos recetores V1 vasculares; aumenta o tónus vascular por uma via não adrenérgica.',
    'Fenilefrina':'Agonista α1 predominantemente periférico; produz vasoconstrição e aumento da resistência vascular.',
    'Metaraminol':'Simpaticomimético com ação α-adrenérgica direta e indireta; aumenta o tónus vascular.',
    'Efedrina':'Simpaticomimético de ação mista; promove libertação de noradrenalina e também estimula recetores adrenérgicos.',
    'Isoprenalina':'Agonista β1/β2 não seletivo; aumenta frequência/contratilidade cardíaca e causa vasodilatação β2.',
    'Milrinona':'Inibidor da fosfodiesterase-3; aumenta AMP cíclico, promovendo inotropismo e vasodilatação.',
    'Levosimendano':'Sensibiliza a troponina C ao cálcio e abre canais KATP; aumenta contratilidade com vasodilatação.',
    'Amiodarona':'Bloqueia múltiplos canais iónicos e tem efeitos antiadrenérgicos; prolonga repolarização e refratariedade.',
    'Adenosina':'Ativa recetores A1 no nó AV, provocando bloqueio transitório da condução AV.',
    'Lidocaína':'Bloqueia canais rápidos de sódio; reduz excitabilidade e condução em tecido ventricular.',
    'Procainamida':'Bloqueia canais de sódio e prolonga repolarização por efeito adicional sobre canais de potássio.',
    'Digoxina':'Inibe Na+/K+-ATPase e aumenta tónus vagal; aumenta cálcio intracelular e abranda condução AV.',
    'Atropina':'Antagonista muscarínico; reduz a influência vagal sobre o nó sinusal e o nó AV.',
    'Esmolol':'Bloqueador β1 de ação muito curta; reduz frequência, contratilidade e condução AV.',
    'Landiolol':'Bloqueador β1 ultracurto e altamente seletivo; reduz sobretudo a frequência cardíaca.',
    'Labetalol':'Bloqueia recetores β e α1; reduz frequência/contratilidade e resistência vascular.',
    'Metoprolol IV':'Bloqueador β1; reduz frequência cardíaca, contratilidade e condução AV.',
    'Nicardipina':'Bloqueia canais de cálcio tipo L no músculo liso arterial, causando vasodilatação.',
    'Clevidipina':'Bloqueador dihidropiridínico ultracurto dos canais de cálcio tipo L; causa vasodilatação arterial.',
    'Hidralazina':'Vasodilatador predominantemente arteriolar por relaxamento do músculo liso vascular.',
    'Nitroglicerina':'Liberta óxido nítrico, aumentando GMPc; causa sobretudo venodilatação e, em doses maiores, vasodilatação arterial.',
    'Nitroprussiato':'Dador de óxido nítrico de ação rápida; causa vasodilatação arterial e venosa por aumento de GMPc.',
    'Propofol':'Potencia a neurotransmissão inibitória mediada por GABA-A, produzindo hipnose/sedação de início rápido.',
    'Midazolam':'Benzodiazepina que potencia a ação do GABA no recetor GABA-A, produzindo sedação, ansiólise e amnésia.',
    'Dexmedetomidina':'Agonista α2 central; reduz libertação de noradrenalina e promove sedação com menor depressão respiratória relativa.',
    'Ketamina':'Antagonista não competitivo do recetor NMDA; produz anestesia dissociativa e analgesia.',
    'Fentanilo':'Agonista dos recetores μ-opioides; reduz transmissão nociceptiva e pode deprimir ventilação.',
    'Alfentanil':'Agonista μ-opioide de início rápido e curta duração; produz analgesia e depressão respiratória dose-dependente.',
    'Remifentanil':'Agonista μ-opioide ultracurto metabolizado rapidamente por esterases; produz analgesia titulável.',
    'Morfina':'Agonista μ-opioide; reduz transmissão nociceptiva e produz analgesia, sedação e depressão respiratória.',
    'Hidromorfona':'Agonista μ-opioide potente; produz analgesia e depressão respiratória dose-dependente.',
    'Petidina':'Agonista opioide, predominantemente μ; produz analgesia, com metabolito neurotóxico relevante em acumulação.',
    'Tramadol':'Agonismo μ fraco associado à inibição da recaptação de noradrenalina e serotonina.',
    'Paracetamol IV':'Analgésico/antipirético de ação predominantemente central; o mecanismo completo não está totalmente definido.',
    'Metamizol IV':'Analgésico e antipirético; o mecanismo é multifatorial e não está completamente esclarecido.',
    'Droperidol':'Antagonista dopaminérgico D2 com efeito antiemético e sedativo.',
    'Rocurónio':'Antagonista competitivo dos recetores nicotínicos da junção neuromuscular; provoca bloqueio neuromuscular não despolarizante.',
    'Cisatracúrio':'Bloqueador neuromuscular não despolarizante que antagoniza competitivamente recetores nicotínicos.',
    'Atracúrio':'Bloqueador neuromuscular não despolarizante por antagonismo competitivo nicotínico.',
    'Succinilcolina':'Agonista nicotínico despolarizante; causa despolarização persistente da placa motora e paralisia transitória.',
    'Sugamadex':'Encapsula rocurónio/vecurónio no plasma, reduzindo a fração livre e revertendo o bloqueio neuromuscular.',
    'Neostigmina':'Inibe acetilcolinesterase, aumentando acetilcolina na junção neuromuscular.',
    'Glicopirrolato':'Antagonista muscarínico periférico; reduz efeitos muscarínicos da acetilcolina.',
    'Vancomicina':'Liga-se ao terminal D-Ala-D-Ala dos precursores da parede bacteriana e inibe a síntese do peptidoglicano.',
    'Teicoplanina':'Glicopeptídeo que se liga a D-Ala-D-Ala e bloqueia síntese da parede bacteriana.',
    'Daptomicina':'Liga-se à membrana bacteriana dependente de cálcio e provoca despolarização rápida da membrana.',
    'Linezolida':'Liga-se à subunidade 50S e impede a formação do complexo de iniciação da síntese proteica.',
    'Clindamicina':'Liga-se à subunidade 50S e inibe síntese proteica bacteriana.',
    'Metronidazol':'Em microrganismos suscetíveis, gera metabolitos reduzidos que danificam o DNA.',
    'Ciprofloxacina':'Inibe DNA-girase e topoisomerase IV bacterianas, bloqueando replicação do DNA.',
    'Levofloxacina':'Inibe DNA-girase e topoisomerase IV bacterianas.',
    'Azitromicina IV':'Liga-se à subunidade 50S e inibe a translocação/síntese proteica bacteriana.',
    'Doxiciclina IV':'Liga-se à subunidade 30S e impede a incorporação de aminoacil-tRNA.',
    'Tigeciclina':'Liga-se à subunidade 30S e inibe síntese proteica bacteriana.',
    'Colistimetato de sódio':'Converte-se em colistina, que interage com LPS e desorganiza a membrana externa de Gram-negativos.',
    'Fosfomicina IV':'Inibe a enzima MurA, bloqueando uma etapa inicial da síntese da parede bacteriana.',
    'Trimetoprim/sulfametoxazol IV':'Bloqueia sequencialmente duas etapas da síntese bacteriana de folato.',
    'Fluconazol':'Inibe a 14-α-desmetilase fúngica, reduzindo síntese de ergosterol.',
    'Voriconazol':'Inibe a 14-α-desmetilase fúngica e compromete síntese de ergosterol.',
    'Posaconazol IV':'Inibe a 14-α-desmetilase fúngica, reduzindo ergosterol da membrana.',
    'Isavuconazol':'Inibe a 14-α-desmetilase fúngica, comprometendo síntese de ergosterol.',
    'Anfotericina B lipossómica':'Liga-se ao ergosterol da membrana fúngica e forma poros que alteram a permeabilidade.',
    'Anidulafungina':'Inibe a β-(1,3)-D-glucano sintase, comprometendo a parede celular fúngica.',
    'Caspofungina':'Inibe a β-(1,3)-D-glucano sintase da parede fúngica.',
    'Micafungina':'Inibe a síntese de β-(1,3)-D-glucano da parede fúngica.',
    'Aciclovir':'Após fosforilação em células infetadas, inibe a DNA-polimerase viral e termina alongamento do DNA.',
    'Ganciclovir':'Após fosforilação, inibe a DNA-polimerase viral e a síntese de DNA, sobretudo em CMV.',
    'Foscarnet':'Análogo do pirofosfato que inibe diretamente DNA-polimerases virais sem necessitar de ativação por fosforilação.',
    'Remdesivir':'Pró-fármaco de um análogo nucleotídico que inibe a RNA-polimerase viral dependente de RNA.',
    'Letermovir IV':'Inibe o complexo terminase do CMV, interferindo com processamento/empacotamento do DNA viral.',
    'Insulina regular':'Liga-se ao recetor de insulina com atividade tirosina-quinase, promovendo captação de glicose e armazenamento energético.',
    'Glucagon':'Ativa recetores Gs hepáticos, aumenta AMP cíclico e estimula glicogenólise/gluconeogénese.',
    'Hidrocortisona':'Agonista do recetor glucocorticoide; modula transcrição génica e reduz respostas inflamatórias/imunes.',
    'Metilprednisolona':'Agonista glucocorticoide com potente efeito anti-inflamatório e imunossupressor.',
    'Dexametasona':'Agonista glucocorticoide de longa duração; regula transcrição de mediadores inflamatórios.',
    'Levotiroxina IV':'T4 sintética convertida parcialmente em T3; atua em recetores nucleares tiroideus e regula expressão génica/metabolismo.',
    'Desmopressina':'Agonista V2; aumenta reabsorção renal de água e promove libertação endotelial de vWF/FVIII.',
    'Octreótido':'Análogo da somatostatina; ativa recetores de somatostatina e reduz secreção hormonal e esplâncnica.',
    'Heparina não fracionada':'Potencia a antitrombina, acelerando a inativação de trombina e fator Xa, entre outros fatores.',
    'Bivalirudina':'Inibidor direto e reversível da trombina.',
    'Argatroban':'Inibidor direto da trombina.',
    'Alteplase':'Ativador do plasminogénio com afinidade pela fibrina; promove formação de plasmina e fibrinólise.',
    'Tenecteplase':'Variante modificada do tPA com maior especificidade pela fibrina e maior semivida; promove fibrinólise.',
    'Ácido tranexâmico':'Análogo da lisina que bloqueia ligação do plasminogénio/plasmina à fibrina e reduz fibrinólise.',
    'Protamina':'Proteína catiónica que se liga à heparina e neutraliza a sua atividade anticoagulante.',
    'Vitamina K IV':'Cofator necessário à γ-carboxilação hepática dos fatores II, VII, IX, X e proteínas C/S.',
    'Idarucizumab':'Fragmento de anticorpo que se liga com alta afinidade ao dabigatrano e neutraliza o seu efeito.',
    'Andexanet alfa':'Proteína recombinante semelhante ao fator Xa que atua como isco para inibidores do fator Xa.',
    'Levetiracetam':'Liga-se à proteína vesicular SV2A e modula libertação de neurotransmissores.',
    'Valproato de sódio':'Tem múltiplos efeitos, incluindo aumento de neurotransmissão GABAérgica e modulação de canais de sódio.',
    'Fenitoína':'Bloqueia canais de sódio dependentes de voltagem no estado inativado, reduzindo descargas repetitivas.',
    'Fosfenitoína':'Pró-fármaco da fenitoína; após conversão, bloqueia canais de sódio dependentes de voltagem.',
    'Lacosamida':'Favorece a inativação lenta dos canais de sódio dependentes de voltagem.',
    'Fenobarbital':'Barbitúrico que potencia GABA-A, aumentando a duração de abertura do canal de cloro.',
    'Diazepam IV':'Benzodiazepina que potencia a ação de GABA no recetor GABA-A.',
    'Tiopental':'Barbitúrico que potencia neurotransmissão GABA-A e produz hipnose/anestesia rápida.',
    'Piridoxina IV':'Vitamina B6; atua como cofator em múltiplas reações, incluindo síntese de neurotransmissores.',
    'Pantoprazol':'Inibe irreversivelmente a H+/K+-ATPase das células parietais e reduz secreção ácida gástrica.',
    'Omeprazol IV':'Inibe irreversivelmente a bomba H+/K+-ATPase gástrica.',
    'Famotidina':'Antagonista dos recetores H2 da histamina nas células parietais, reduzindo secreção ácida.',
    'Metoclopramida':'Antagoniza D2 e tem atividade 5-HT4; aumenta motilidade GI e tem efeito antiemético.',
    'Ondansetrom':'Antagonista seletivo 5-HT3 central e periférico; reduz náuseas e vómitos.',
    'Granisetrom':'Antagonista seletivo 5-HT3 com efeito antiemético.',
    'Terlipressina':'Análogo da vasopressina com atividade V1 predominante; provoca vasoconstrição esplâncnica e sistémica.',
    'Acetilcisteína':'Repõe precursores de glutationa e também atua como agente mucolítico por redução de pontes dissulfureto.',
    'Tiamina IV':'Vitamina B1; após conversão em tiamina-pirofosfato atua como cofator no metabolismo energético.',
    'Furosemida':'Inibe o cotransportador Na+/K+/2Cl− no ramo ascendente espesso da ansa de Henle.',
    'Bumetanida':'Inibe o cotransportador Na+/K+/2Cl− no ramo ascendente espesso da ansa de Henle.',
    'Acetazolamida':'Inibe anidrase carbónica, aumentando excreção renal de bicarbonato e sódio.',
    'Naloxona':'Antagonista competitivo dos recetores opioides, com maior afinidade funcional pelos recetores μ.',
    'Flumazenil':'Antagonista competitivo no local benzodiazepínico do recetor GABA-A.',
    'Hidroxocobalamina':'Liga-se ao cianeto formando cianocobalamina, que pode ser eliminada.',
    'Azul de metileno':'Atua como aceitador artificial de eletrões e pode facilitar redução de meta-hemoglobina em contextos específicos.',
    'Fomepizol':'Inibe álcool-desidrogenase, reduzindo formação de metabolitos tóxicos do metanol e etilenoglicol.',
    'Digoxina Fab':'Fragmentos de anticorpo que se ligam à digoxina livre, reduzindo a fração farmacologicamente ativa.',
    'Pralidoxima':'Reativa acetilcolinesterase fosforilada por organofosforados quando administrada antes do envelhecimento enzimático.',
    'Emulsão lipídica 20%':'Pode sequestrar fármacos lipofílicos e fornecer substrato energético; mecanismo de resgate é multifatorial.',
    'Oxitocina':'Ativa recetores de oxitocina acoplados a Gq no miométrio, aumentando cálcio intracelular e contração uterina.',
    'Carbetocina':'Agonista prolongado dos recetores de oxitocina, promovendo contração uterina.',
    'Ciclofosfamida':'Pró-fármaco alquilante que forma ligações cruzadas no DNA e impede replicação celular.',
    'Citarabina':'Análogo de pirimidina que inibe DNA-polimerase e síntese de DNA.',
    'Metotrexato IV':'Inibe diidrofolato-redutase e outras vias dependentes de folato, reduzindo síntese de nucleótidos.',
    'Doxorrubicina':'Intercala no DNA, inibe topoisomerase II e gera radicais livres.',
    'Epirrubicina':'Antraciclina que intercala no DNA e inibe topoisomerase II.',
    'Etopósido':'Inibe topoisomerase II e provoca quebras de DNA.',
    'Vincristina':'Liga-se à tubulina e inibe polimerização dos microtúbulos, bloqueando mitose.',
    'Vinblastina':'Liga-se à tubulina e inibe formação de microtúbulos.',
    'Paclitaxel':'Estabiliza microtúbulos e impede a sua despolimerização, bloqueando divisão celular.',
    'Docetaxel':'Estabiliza microtúbulos e bloqueia a dinâmica necessária à mitose.',
    'Carboplatina':'Forma ligações cruzadas no DNA, impedindo replicação e transcrição.',
    'Cisplatina':'Forma adutos e ligações cruzadas no DNA, desencadeando morte celular.',
    'Oxaliplatina':'Forma ligações cruzadas no DNA por complexos de platina.',
    'Fluorouracilo':'Metabolitos inibem timidilato-sintase e incorporam-se em RNA/DNA.',
    'Gemcitabina':'Análogo nucleosídico que inibe síntese de DNA e ribonucleótido-redutase.',
    'Irinotecano':'Pró-fármaco cujo metabolito SN-38 inibe topoisomerase I.',
    'Rituximab':'Anticorpo monoclonal anti-CD20 que promove depleção de linfócitos B.',
    'Trastuzumab':'Anticorpo anti-HER2 que bloqueia sinalização e promove citotoxicidade contra células HER2-positivas.',
    'Pembrolizumab':'Anticorpo anti-PD-1 que remove um travão imunológico e aumenta resposta antitumoral dos linfócitos T.',
    'Nivolumab':'Anticorpo anti-PD-1 que restaura atividade antitumoral dos linfócitos T.',
    'Infliximab':'Anticorpo monoclonal que neutraliza TNF-α.',
    'Tocilizumab':'Anticorpo contra o recetor da IL-6, bloqueando sinalização desta citocina.',
    'Imunoglobulina humana IV':'Exerce imunomodulação por múltiplos mecanismos, incluindo neutralização de anticorpos e modulação de recetores Fc/complemento.',
    'Ciclosporina IV':'Inibe calcineurina após ligação à ciclofilina, reduzindo ativação de linfócitos T e transcrição de IL-2.',
    'Tacrolímus IV':'Liga-se a FKBP12 e inibe calcineurina, reduzindo ativação de linfócitos T.',
    'Ferro sacarose':'Fornece ferro biodisponível para reposição dos depósitos e síntese de hemoglobina.',
    'Carboximaltose férrica':'Complexo de ferro IV que fornece ferro para eritropoiese e reposição dos depósitos.',
    'Ácido zoledrónico':'Bisfosfonato que inibe farnesil-pirofosfato sintase nos osteoclastos e reduz reabsorção óssea.',
    'Pamidronato':'Bisfosfonato que reduz atividade osteoclástica e reabsorção óssea.',
    'Denosumab':'Anticorpo anti-RANKL que inibe formação e atividade dos osteoclastos.',
    'Contraste iodado IV':'Não é terapêutico: o iodo aumenta atenuação dos raios X e permite opacificação radiológica.'
  };

  const betaLactams=new Set(['Amoxicilina/ácido clavulânico','Ampicilina','Ampicilina/sulbactam','Piperacilina/tazobactam','Penicilina G','Flucloxacilina','Cefazolina','Cefuroxima','Cefotaxima','Ceftriaxona','Ceftazidima','Cefepima','Ceftarolina','Ceftolozano/tazobactam','Ceftazidima/avibactam','Aztreonam','Ertapenem','Imipenem/cilastatina','Meropenem','Meropenem/vaborbactam']);
  const aminoglycosides=new Set(['Gentamicina','Amicacina','Tobramicina']);
  const replacement=new Set(['Cloreto de potássio','Fosfato de potássio','Fosfato de sódio','Sulfato de magnésio','Cloreto de cálcio','Gluconato de cálcio','Bicarbonato de sódio','Cloreto de sódio hipertónico','Glicose hipertónica','NaCl 0,9%','Glicose 5%','Ringer lactato','Plasma-Lyte','Albumina humana']);
  const factors=new Set(['Concentrado complexo protrombínico','Fibrinogénio concentrado','Fator VIII','Fator IX','Fator von Willebrand','Antitrombina III']);

  function mechanism(name,group){
    if(MECH[name])return MECH[name];
    if(betaLactams.has(name))return 'Antibacteriano β-lactâmico: liga-se a proteínas de ligação à penicilina (PBPs) e inibe a síntese da parede bacteriana; combinações com inibidor protegem o β-lactâmico de β-lactamases específicas.';
    if(aminoglycosides.has(name))return 'Aminoglicosídeo: liga-se à subunidade 30S ribossómica, causa erros de leitura do mRNA e inibe síntese proteica bacteriana.';
    if(replacement.has(name))return name==='Manitol'?'Agente osmótico filtrado no rim; aumenta osmolaridade tubular e promove diurese osmótica.':`Solução/eletrólito de reposição: fornece ${name} ou componentes osmoticamente ativos para corrigir défices ou alterar tonicidade conforme a indicação.`;
    if(factors.has(name))return 'Terapêutica de substituição hemostática: repõe diretamente um ou mais componentes da coagulação em défice ou neutralizados.';
    if(group==='Oncologia / Hematologia especializada')return 'Terapêutica antineoplásica/hematológica. O mecanismo específico deve ser confirmado na ficha do produto antes de decisões clínicas.';
    return `Pertence ao grupo ${group||'hospitalar'}. O mecanismo específico ainda não está curado nesta base; confirmar no SmPC antes de usar esta informação para decisão clínica.`;
  }

  function catalogue(){
    const sel=document.getElementById('ivcDrugA');
    const map=new Map();
    if(sel){
      [...sel.options].forEach(o=>{
        if(!o.value)return;
        const name=o.textContent.trim(),group=o.parentElement?.tagName==='OPTGROUP'?o.parentElement.label:'Hospitalar IV';
        if(!map.has(name))map.set(name,{name,group});
      });
    }
    try{
      if(typeof contentPack!=='undefined'&&Array.isArray(contentPack?.drugs))contentPack.drugs.forEach(d=>{const name=d.name==='Insulina'?'Insulina regular':d.name==='Heparina'?'Heparina não fracionada':d.name;if(!map.has(name))map.set(name,{name,group:d.cls||'Fármaco'})});
    }catch(e){}
    return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt'));
  }

  function baseInfo(name){
    try{
      const arr=(typeof contentPack!=='undefined'&&Array.isArray(contentPack?.drugs))?contentPack.drugs:[];
      const aliases={"Insulina regular":"Insulina","Heparina não fracionada":"Heparina"};
      return arr.find(d=>fold(d.name)===fold(name)||fold(d.name)===fold(aliases[name]||''))||null;
    }catch(e){return null}
  }

  function records(){return catalogue().map(x=>{
    const base=baseInfo(x.name),legacy=LEGACY[x.name]||{};
    return {name:x.name,group:x.group,aliases:legacy.aliases||[],mechanism:mechanism(x.name,x.group),use:base?.use||'Consultar indicação específica no SmPC/protocolo institucional.',monitor:base?.monitor||'Monitorização dependente da indicação, via, dose e perfil de segurança do medicamento.',risks:base?.risks||'Confirmar contraindicações, interações, ajuste renal/hepático e reações adversas no SmPC.',prep:legacy.prep||'Preparação/administração específica ainda não integrada nesta ficha. Confirmar SmPC, concentração e protocolo local.',source:legacy.source||'',curated:!!base||!!MECH[x.name]||betaLactams.has(x.name)||aminoglycosides.has(x.name)};
  })}

  function addStyles(){
    if(document.getElementById('med-info-v3-style'))return;
    const s=document.createElement('style');s.id='med-info-v3-style';s.textContent=`
      .medv3-shell{display:grid;gap:12px}.medv3-search{position:relative}.medv3-search input{font-size:15px;padding:12px 40px 12px 13px}.medv3-search:after{content:'⌕';position:absolute;right:13px;top:10px;color:var(--muted);font-size:17px;pointer-events:none}.medv3-suggest{position:absolute;left:0;right:0;top:calc(100% + 5px);z-index:240;display:none;max-height:320px;overflow:auto;border:1px solid var(--line-strong);border-radius:14px;background:var(--panel);box-shadow:0 18px 55px rgba(0,0,0,.35);padding:5px}.medv3-suggest.open{display:block}.medv3-suggest button{display:block;width:100%;border:0;border-radius:10px;background:transparent;color:var(--text);padding:9px 10px;text-align:left;cursor:pointer}.medv3-suggest button:hover,.medv3-suggest button.active{background:var(--clinical-soft)}.medv3-suggest strong{font-size:10px}.medv3-suggest span{display:block;color:var(--muted);font-size:8px;margin-top:2px}.medv3-count{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.medv3-detail{border:1px solid var(--line);border-radius:18px;background:var(--panel);padding:15px}.medv3-head{display:flex;gap:10px;align-items:flex-start}.medv3-head h3{margin:0;font-size:22px}.medv3-head p{margin:4px 0 0;color:var(--muted);font-size:9px}.medv3-head .spacer{flex:1}.medv3-mech{margin-top:11px;border:1px solid rgba(98,212,255,.22);background:var(--clinical-soft);border-radius:14px;padding:12px}.medv3-mech small{display:block;color:var(--clinical);font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.09em}.medv3-mech div{font-size:10px;line-height:1.55;margin-top:4px}.medv3-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:10px}.medv3-field{border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:10px}.medv3-field small{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.08em}.medv3-field div{font-size:9px;line-height:1.5;margin-top:4px}.medv3-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.medv3-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.medv3-mini{border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:11px;cursor:pointer;text-align:left;color:var(--text)}.medv3-mini:hover{border-color:var(--line-strong)}.medv3-mini strong{display:block;font-size:10px}.medv3-mini span{display:block;color:var(--muted);font-size:8px;margin-top:3px}.medv3-status{font-size:8px;margin-top:5px}.medv3-status.good{color:var(--good)}.medv3-status.warn{color:var(--warn)}
      html[data-fcc-theme="light"] .medv3-suggest{box-shadow:0 18px 45px rgba(31,62,76,.16)}
      @media(max-width:850px){.medv3-list{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.medv3-grid,.medv3-list{grid-template-columns:1fr}.medv3-head{flex-wrap:wrap}}
    `;document.head.appendChild(s);
  }

  let matches=[],active=-1;
  function openCompat(name){
    if(typeof openClin==='function')openClin('ivcompat');
    setTimeout(()=>{const sel=document.getElementById('ivcDrugA');if(!sel)return;const opt=[...sel.options].find(o=>fold(o.textContent)===fold(name)||fold(o.value)===fold(name));if(!opt)return;sel.value=opt.value;sel.dispatchEvent(new Event('change',{bubbles:true}));const input=sel.closest('.ivc-combo')?.querySelector('input');if(input)input.value=opt.textContent.trim()},100);
  }
  window.openMedInfoCompat=openCompat;
  window.openMedInfoPerf=function(name){if(typeof openClin==='function')openClin('perf');setTimeout(()=>{const q=document.getElementById('perfDilutionSearch');if(q){q.value=name;window.renderPerfDilutions?.();q.focus()}},100)};

  function detail(d){
    return `<article class="medv3-detail"><div class="medv3-head"><div><h3>${esc(d.name)}</h3><p>${esc(d.group)}</p></div><div class="spacer"></div><span class="badge ${d.curated?'good':'warn'}">${d.curated?'Ficha com dados integrados':'Ficha parcial'}</span></div><div class="medv3-mech"><small>Como funciona</small><div>${esc(d.mechanism)}</div></div><div class="medv3-grid"><div class="medv3-field"><small>Utilização clínica</small><div>${esc(d.use)}</div></div><div class="medv3-field"><small>Monitorização</small><div>${esc(d.monitor)}</div></div><div class="medv3-field"><small>Riscos / precauções</small><div>${esc(d.risks)}</div></div><div class="medv3-field"><small>Preparação / administração IV</small><div>${esc(d.prep)}</div></div></div><div class="notice" style="margin-top:10px"><b>Segurança:</b> esta ficha é apoio rápido. Confirmar indicação, dose, apresentação, concentração, compatibilidade, função renal/hepática e protocolo/SmPC antes de administrar.</div><div class="medv3-actions"><button class="btn primary" type="button" onclick="openMedInfoCompat('${esc(d.name)}')">Compatibilidade IV</button><button class="btn" type="button" onclick="openMedInfoPerf('${esc(d.name)}')">Perfusões / diluição</button>${d.source?`<a class="btn" target="_blank" rel="noopener" href="${esc(d.source)}">SmPC / fonte ↗</a>`:''}</div></article>`;
  }

  function select(name){const input=document.getElementById('medv3Search'),box=document.getElementById('medv3Suggest');if(input)input.value=name;box?.classList.remove('open');render(name)}
  function render(q=''){
    const out=document.getElementById('medv3Results');if(!out)return;const all=records(),f=fold(q),rows=!f?all:all.filter(d=>fold([d.name,d.group,d.mechanism,d.use,d.monitor,d.risks,...d.aliases].join(' ')).includes(f));const exact=rows.find(d=>fold(d.name)===f||d.aliases.some(a=>fold(a)===f));
    if(exact){out.innerHTML=detail(exact);return}
    out.innerHTML=rows.length?`<div class="medv3-list">${rows.map(d=>`<button type="button" class="medv3-mini" data-med="${esc(d.name)}"><strong>${esc(d.name)}</strong><span>${esc(d.group)}</span><div class="medv3-status ${d.curated?'good':'warn'}">${d.curated?'Informação integrada':'Ficha parcial'}</div></button>`).join('')}</div>`:'<div class="item"><span>Sem correspondências.</span></div>';
    out.querySelectorAll('[data-med]').forEach(b=>b.onclick=()=>select(b.dataset.med));
  }
  function suggest(){
    const input=document.getElementById('medv3Search'),box=document.getElementById('medv3Suggest');if(!input||!box)return;const q=fold(input.value),all=records();matches=all.filter(d=>!q||fold([d.name,d.group,...d.aliases].join(' ')).includes(q)).sort((a,b)=>{const aa=fold(a.name).startsWith(q)?0:1,bb=fold(b.name).startsWith(q)?0:1;return aa-bb||a.name.localeCompare(b.name,'pt')}).slice(0,12);active=-1;box.innerHTML=matches.length?matches.map((d,i)=>`<button type="button" data-i="${i}"><strong>${esc(d.name)}</strong><span>${esc(d.group)}</span></button>`).join(''):'<div class="item"><span>Sem resultados.</span></div>';box.classList.add('open');box.querySelectorAll('[data-i]').forEach(b=>b.onmousedown=e=>{e.preventDefault();select(matches[+b.dataset.i].name)});
  }

  function install(){
    const host=document.getElementById('clin-drugs'),sel=document.getElementById('ivcDrugA');if(!host||!sel||sel.options.length<5)return false;
    addStyles();
    const tab=[...document.querySelectorAll('#page-clinical > .tabs > .tab')].find(t=>(t.getAttribute('onclick')||'').includes("'clin-drugs'"));if(tab)tab.textContent='INFO Medicação';
    const total=catalogue().length;
    host.innerHTML=`<div class="medv3-shell"><div class="pagehead" style="margin-top:0"><div><h3>INFO Medicação</h3><p>Pesquisa rápida de terapêutica hospitalar: mecanismo, utilização, monitorização, riscos, preparação e ligações à compatibilidade/perfusões.</p></div><span class="badge good">${total} medicamentos</span></div><div class="card full"><div class="medv3-search"><input id="medv3Search" autocomplete="off" spellcheck="false" placeholder="Escreve o nome da medicação…"><div id="medv3Suggest" class="medv3-suggest"></div></div><div class="medv3-count"><span class="badge">Mesma lista da Compatibilidade IV</span><span class="badge">Pesquisa por nome, grupo ou mecanismo</span></div></div><div id="medv3Results"></div></div>`;
    const input=document.getElementById('medv3Search'),box=document.getElementById('medv3Suggest');input.addEventListener('input',()=>{suggest();render(input.value)});input.addEventListener('focus',suggest);input.addEventListener('blur',()=>setTimeout(()=>box.classList.remove('open'),120));input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,matches.length-1)}else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0)}else if(e.key==='Enter'){e.preventDefault();if(active>=0&&matches[active])select(matches[active].name);else if(matches[0])select(matches[0].name)}else if(e.key==='Escape')box.classList.remove('open');box.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active',i===active))});render('');return true;
  }

  let tries=0;const run=()=>{tries++;if(install()||tries>40)return;setTimeout(run,150)};run();
})();