(()=>{
  if(window.__fccMedicationInfoV4Installed)return;
  window.__fccMedicationInfoV4Installed=true;

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const WHO='https://www.who.int/publications/i/item/B09474';
  const INFARMED='https://www.infarmed.pt/web/infarmed/-/codigo-hospitalar-nacional-medicamento';

  const EXPANDED={
    'Analgesia / Dor / Anti-inflamatórios':['Paracetamol','Ibuprofeno','Naproxeno','Diclofenac','Dexketoprofeno','Cetorolac','Celecoxib','Etoricoxib','Ácido acetilsalicílico','Codeína','Oxicodona','Tapentadol','Buprenorfina','Metadona','Gabapentina','Pregabalina','Capsaicina tópica','Lidocaína tópica/transdérmica'],
    'Cardiovascular · HTA / IC':['Captopril','Enalapril','Lisinopril','Ramipril','Perindopril','Losartan','Valsartan','Candesartan','Irbesartan','Telmisartan','Amlodipina','Nifedipina','Verapamil','Diltiazem','Bisoprolol','Carvedilol','Nebivolol','Atenolol','Hidroclorotiazida','Indapamida','Clortalidona','Espironolactona','Eplerenona','Sacubitril/valsartan','Ivabradina','Dapagliflozina','Empagliflozina'],
    'Antiagregação / Anticoagulação oral':['Ácido acetilsalicílico antiagregante','Clopidogrel','Prasugrel','Ticagrelor','Varfarina','Acenocumarol','Apixabano','Rivaroxabano','Edoxabano','Dabigatrano'],
    'Dislipidemia':['Atorvastatina','Rosuvastatina','Sinvastatina','Pravastatina','Ezetimiba','Fenofibrato','Ácido bempedóico','Evolocumab','Alirocumab','Inclisiran'],
    'Diabetes / Metabolismo':['Metformina','Gliclazida','Glimepirida','Sitagliptina','Linagliptina','Vildagliptina','Dapagliflozina','Empagliflozina','Canagliflozina','Semaglutido','Dulaglutido','Liraglutido','Tirzepatida','Acarbose','Pioglitazona','Insulina lispro','Insulina aspart','Insulina glulisina','Insulina NPH','Insulina glargina','Insulina degludec'],
    'Respiratório / Inalatórios':['Salbutamol','Terbutalina','Ipratrópio','Tiotrópio','Aclidínio','Umeclidínio','Formoterol','Salmeterol','Indacaterol','Budesonida','Beclometasona','Fluticasona inalatória','Ciclesonida','Budesonida/formoterol','Fluticasona/salmeterol','Fluticasona/vilanterol','Umeclidínio/vilanterol','Fluticasona/umeclidínio/vilanterol','Montelucaste','Roflumilaste','Omalizumab','Mepolizumab','Benralizumab','Dupilumab'],
    'Alergia / Antihistamínicos':['Cetirizina','Levocetirizina','Loratadina','Desloratadina','Bilastina','Fexofenadina','Hidroxizina','Clemastina','Dimetindeno','Adrenalina autoinjetor'],
    'Psiquiatria · Antidepressivos':['Sertralina','Escitalopram','Citalopram','Fluoxetina','Paroxetina','Fluvoxamina','Venlafaxina','Duloxetina','Vortioxetina','Mirtazapina','Trazodona','Bupropiom','Amitriptilina','Clomipramina','Nortriptilina','Moclobemida'],
    'Psiquiatria · Antipsicóticos / Humor':['Haloperidol','Risperidona','Paliperidona','Olanzapina','Quetiapina','Aripiprazol','Clozapina','Ziprasidona','Amissulprida','Lítio','Valproato oral','Lamotrigina','Carbamazepina'],
    'Ansiolíticos / Hipnóticos':['Alprazolam','Lorazepam','Diazepam oral','Oxazepam','Clonazepam','Bromazepam','Zolpidem','Zopiclona','Melatonina','Buspirona'],
    'Neurologia · Epilepsia':['Levetiracetam oral','Lamotrigina','Carbamazepina','Oxcarbazepina','Topiramato','Zonisamida','Brivaracetam','Perampanel','Gabapentina','Pregabalina','Clobazam','Etossuximida'],
    'Neurologia · Parkinson / Movimento':['Levodopa/carbidopa','Levodopa/benserazida','Pramipexol','Ropinirol','Rotigotina','Rasagilina','Selegilina','Entacapona','Opicapona','Amantadina','Tri-hexifenidilo'],
    'Neurologia · Enxaqueca':['Sumatriptano','Zolmitriptano','Rizatriptano','Eletriptano','Frovatriptano','Topiramato','Propranolol','Candesartan','Erenumab','Fremanezumab','Galcanezumab','Rimegepant'],
    'Demência / Cognição':['Donepezilo','Rivastigmina','Galantamina','Memantina'],
    'Gastrointestinal · Ácido / Motilidade':['Omeprazol','Esomeprazol','Pantoprazol oral','Lansoprazol','Famotidina oral','Sucralfato','Metoclopramida oral','Domperidona','Prucaloprida','Butilescopolamina'],
    'Gastrointestinal · Obstipação / Diarreia':['Macrogol','Lactulose','Bisacodilo','Sene','Docusato','Glicerina retal','Loperamida','Racecadotril','Colestiramina'],
    'Doença Inflamatória Intestinal':['Mesalazina','Sulfasalazina','Budesonida intestinal','Azatioprina','Mercaptopurina','Infliximab','Adalimumab','Vedolizumab','Ustekinumab','Tofacitinib','Upadacitinib'],
    'Hepatologia':['Lactulose','Rifaximina','Ácido ursodesoxicólico','Propranolol','Carvedilol','Terlipressina','Octreótido','Acetilcisteína'],
    'Antibacterianos · Oral / Comunitário':['Amoxicilina','Amoxicilina/ácido clavulânico oral','Penicilina V','Flucloxacilina oral','Cefalexina','Cefadroxil','Cefixima','Cefuroxima axetil','Azitromicina oral','Claritromicina','Doxiciclina oral','Minociclina','Ciprofloxacina oral','Levofloxacina oral','Moxifloxacina','Clindamicina oral','Metronidazol oral','Nitrofurantoína','Fosfomicina oral','Trimetoprim/sulfametoxazol oral'],
    'Tuberculose / Micobactérias':['Isoniazida','Rifampicina','Rifabutina','Pirazinamida','Etambutol','Bedaquilina','Delamanid','Linezolida oral','Clofazimina'],
    'HIV / Antirretrovirais':['Tenofovir disoproxil','Tenofovir alafenamida','Emtricitabina','Lamivudina','Abacavir','Dolutegravir','Bictegravir','Raltegravir','Darunavir','Atazanavir','Ritonavir','Doravirina','Rilpivirina','Efavirenz','Maraviroc','Cabotegravir','Lenacapavir'],
    'Antivirais · Oral':['Valaciclovir','Famciclovir','Oseltamivir','Baloxavir marboxil','Nirmatrelvir/ritonavir','Entecavir','Tenofovir para hepatite B','Sofosbuvir/velpatasvir','Glecaprevir/pibrentasvir'],
    'Antifúngicos · Oral / Tópico':['Fluconazol oral','Itraconazol','Voriconazol oral','Terbinafina','Griseofulvina','Nistatina','Clotrimazol','Miconazol','Ketoconazol tópico','Ciclopirox'],
    'Antiparasitários':['Albendazol','Mebendazol','Ivermectina','Praziquantel','Metronidazol antiparasitário','Atovaquona/proguanil','Arteméter/lumefantrina','Primaquina','Quinina'],
    'Endocrinologia · Tiroide':['Levotiroxina oral','Liotironina','Tiamazol','Propiltiouracilo','Iodo radioativo'],
    'Endocrinologia · Suprarrenal / Hipófise':['Hidrocortisona oral','Fludrocortisona','Cabergolina','Bromocriptina','Pegvisomant','Octreótido LAR','Lanreotida','Desmopressina nasal/oral'],
    'Osso / Osteoporose':['Alendronato','Risedronato','Ibandronato','Ácido zoledrónico','Denosumab','Teriparatida','Romosozumab','Cálcio carbonato','Colecalciferol','Calcitriol'],
    'Reumatologia / Autoimune':['Metotrexato oral/SC','Hidroxicloroquina','Leflunomida','Sulfasalazina','Azatioprina','Micofenolato mofetil','Ciclofosfamida','Adalimumab','Etanercept','Golimumab','Infliximab','Tocilizumab','Sarilumab','Abatacept','Rituximab','Secukinumab','Ixekizumab','Ustekinumab','Tofacitinib','Baricitinib','Upadacitinib'],
    'Transplante / Imunossupressão':['Tacrolímus oral','Ciclosporina oral','Sirolímus','Everolímus','Micofenolato mofetil','Ácido micofenólico','Azatioprina','Prednisolona','Basiliximab','Timoglobulina'],
    'Hematologia · Anemia / Suporte':['Ferro oral','Ácido fólico','Cianocobalamina','Hidroxocobalamina IM','Epoetina alfa','Darbepoetina alfa','Filgrastim','Pegfilgrastim','Hidroxiureia'],
    'Oncologia · Terapêutica oral/alvo':['Capecitabina','Temozolomida','Imatinib','Dasatinib','Nilotinib','Osimertinib','Erlotinib','Gefitinib','Alectinib','Lorlatinib','Crizotinib','Olaparib','Niraparib','Abemaciclib','Palbociclib','Ribociclib','Enzalutamida','Abiraterona','Sunitinib','Pazopanib','Sorafenib','Lenvatinib','Vemurafenib','Dabrafenib','Trametinib'],
    'Urologia':['Tamsulosina','Alfuzosina','Silodosina','Finasterida','Dutasterida','Oxibutinina','Solifenacina','Tolterodina','Mirabegron','Sildenafil','Tadalafil','Alprostadilo'],
    'Ginecologia / Contraceção / Menopausa':['Etinilestradiol/levonorgestrel','Etinilestradiol/drospirenona','Desogestrel','Levonorgestrel contraceção emergência','Ulipristal','Estradiol transdérmico','Estradiol vaginal','Progesterona micronizada','Medroxiprogesterona','Danazol'],
    'Obstetrícia · Oral / SC':['Ácido fólico gravidez','Ferro gravidez','Enoxaparina','Nifedipina obstétrica','Metildopa','Labetalol oral'],
    'Dermatologia · Corticoides / Inflamação':['Hidrocortisona tópica','Betametasona tópica','Mometasona tópica','Clobetasol','Tacrolímus tópico','Pimecrolímus','Calcipotriol','Calcipotriol/betametasona'],
    'Dermatologia · Acne / Infeção':['Peróxido de benzoílo','Adapaleno','Tretinoína tópica','Isotretinoína oral','Ácido azelaico','Clindamicina tópica','Mupirocina','Ácido fusídico tópico'],
    'Oftalmologia':['Latanoprost','Bimatoprost','Timolol oftálmico','Dorzolamida','Brinzolamida','Brimonidina','Pilocarpina oftálmica','Atropina oftálmica','Tropicamida','Fenilefrina oftálmica','Moxifloxacina oftálmica','Tobramicina oftálmica','Dexametasona oftálmica','Prednisolona oftálmica','Aflibercept intravítreo','Ranibizumab','Brolucizumab','Faricimab'],
    'ORL / Nasal':['Mometasona nasal','Fluticasona nasal','Budesonida nasal','Azelastina nasal','Oximetazolina','Xilometazolina','Soro fisiológico nasal'],
    'Anestesia local / Regional':['Lidocaína','Bupivacaína','Ropivacaína','Mepivacaína','Prilocaína','Articaína'],
    'Anestesia inalatória':['Sevoflurano','Desflurano','Isoflurano','Óxido nitroso'],
    'Vacinas / Imunização':['Vacina gripe','Vacina COVID-19','Vacina hepatite A','Vacina hepatite B','Vacina HPV','Vacina pneumocócica conjugada','Vacina pneumocócica polissacárida','Vacina meningocócica ACWY','Vacina meningocócica B','Vacina tétano/difteria/pertussis','Vacina MMR','Vacina varicela','Vacina herpes zoster','Vacina febre amarela','Vacina raiva'],
    'Vitaminas / Minerais / Nutrição':['Tiamina oral','Piridoxina oral','Cianocobalamina oral','Ácido fólico','Colecalciferol','Calcitriol','Vitamina C','Vitamina E','Zinco','Magnésio oral','Potássio oral','Fosfato oral'],
    'Renal / DRC':['Sevelâmero','Carbonato de lantânio','Cinacalcet','Calcitriol','Paricalcitol','Epoetina alfa','Darbepoetina alfa','Bicarbonato de sódio oral','Patiromer','Ciclossilicato de zircónio e sódio'],
    'Gota / Hiperuricemia':['Alopurinol','Febuxostate','Colchicina','Probenecida'],
    'Doenças raras / Terapêuticas especiais':['Eculizumab','Ravulizumab','Nusinersen','Risdiplam','Onasemnogene abeparvovec','Ivacaftor','Elexacaftor/tezacaftor/ivacaftor','Agalsidase beta','Imiglucerase']
  };

  const LEGACY={
    'Noradrenalina':{prep:'2 mg + diluente q.s.p. 50 mL · exemplo de referência; confirmar produto e protocolo local.',source:'https://www.medicines.org.uk/emc/product/13172/smpc'},
    'Adrenalina':{prep:'A concentração de perfusão depende da apresentação e do protocolo institucional.',source:'https://www.medicines.org.uk/emc/product/2024/smpc'},
    'Dobutamina':{prep:'250 mg + diluente q.s.p. 50 mL · exemplo de referência; confirmar protocolo local.',source:'https://www.medicines.org.uk/emc/product/100017/smpc'},
    'Propofol':{prep:'Solução 1% = 10 mg/mL; preferencialmente sem diluição no produto de referência.',source:'https://www.medicines.org.uk/emc/product/11295/smpc'},
    'Dexmedetomidina':{prep:'Preparações de 4 ou 8 mcg/mL são descritas no produto de referência.',source:'https://www.medicines.org.uk/emc/product/13154/smpc'},
    'Alfentanil':{prep:'Solução de origem 500 mcg/mL; pode ser diluída conforme protocolo.',source:'https://www.medicines.org.uk/emc/product/6427/smpc'},
    'Remifentanil':{prep:'Reconstituir e depois diluir para perfusão; confirmar concentração final local.',source:'https://www.medicines.org.uk/emc/product/15232/smpc'},
    'Rocurónio':{prep:'Solução de origem 10 mg/mL; diluição possível conforme produto/protocolo.',source:'https://www.medicines.org.uk/emc/product/553/smpc'},
    'Insulina regular':{prep:'A preparação IV depende do tipo de insulina e do protocolo. Não generalizar concentrações entre produtos.',source:'https://www.medicines.org.uk/emc/product/1640/smpc'},
    'Amiodarona':{prep:'O produto de referência utiliza glicose 5% para perfusão; confirmar apresentação e concentração.',source:'https://www.medicines.org.uk/emc/product/8739/smpc'},
    'Heparina não fracionada':{prep:'A concentração final de perfusão deve seguir o protocolo/indicação local.',source:'https://www.medicines.org.uk/emc/product/1680/smpc'}
  };

  const SPECIFIC={
    'Paracetamol':'Inibe predominantemente vias centrais de síntese de prostaglandinas; produz analgesia e antipirese com pouca ação anti-inflamatória periférica.',
    'Ibuprofeno':'Inibe reversivelmente COX-1/COX-2, reduzindo síntese de prostaglandinas e produzindo analgesia, antipirese e efeito anti-inflamatório.',
    'Ácido acetilsalicílico':'Inibe irreversivelmente COX; em plaquetas reduz tromboxano A2 durante toda a vida plaquetária.',
    'Clopidogrel':'Pró-fármaco que bloqueia irreversivelmente o recetor plaquetário P2Y12 de ADP, reduzindo agregação.',
    'Ticagrelor':'Antagonista reversível P2Y12 que reduz ativação e agregação plaquetária.',
    'Apixabano':'Inibidor direto e seletivo do fator Xa, reduzindo geração de trombina e formação de coágulo.',
    'Rivaroxabano':'Inibidor direto do fator Xa.',
    'Dabigatrano':'Inibidor direto da trombina (fator IIa).',
    'Varfarina':'Inibe VKORC1 e reduz síntese hepática dos fatores II, VII, IX e X dependentes da vitamina K.',
    'Atorvastatina':'Inibe HMG-CoA redutase, reduz síntese hepática de colesterol e aumenta expressão de recetores LDL.',
    'Ezetimiba':'Inibe o transportador NPC1L1 intestinal e reduz absorção de colesterol.',
    'Metformina':'Reduz sobretudo produção hepática de glicose e melhora sensibilidade à insulina, em parte via regulação energética celular.',
    'Dapagliflozina':'Inibe SGLT2 no túbulo proximal renal, aumentando glicosúria e natriurese.',
    'Empagliflozina':'Inibe SGLT2 renal, aumentando excreção urinária de glicose e sódio.',
    'Semaglutido':'Agonista do recetor GLP-1; aumenta secreção de insulina dependente da glicose, reduz glucagon, abranda esvaziamento gástrico e aumenta saciedade.',
    'Salbutamol':'Agonista β2 de curta ação que relaxa músculo liso brônquico.',
    'Ipratrópio':'Antagonista muscarínico inalado que reduz broncoconstrição vagal.',
    'Tiotrópio':'Antagonista muscarínico de longa ação que promove broncodilatação sustentada.',
    'Budesonida':'Glucocorticoide inalado que reduz transcrição de mediadores inflamatórios nas vias aéreas.',
    'Montelucaste':'Antagonista do recetor CysLT1 dos leucotrienos, reduzindo broncoconstrição e inflamação mediada por leucotrienos.',
    'Sertralina':'Inibe seletivamente a recaptação de serotonina (SSRI), aumentando serotonina sináptica.',
    'Venlafaxina':'Inibe recaptação de serotonina e noradrenalina (SNRI), de forma dependente da dose.',
    'Mirtazapina':'Antagoniza recetores α2 centrais e alguns recetores serotoninérgicos/histamínicos, aumentando transmissão noradrenérgica e serotoninérgica específica.',
    'Haloperidol':'Antagonista dopaminérgico D2, sobretudo em vias mesolímbicas e nigroestriatais.',
    'Clozapina':'Antipsicótico multirrecetor com antagonismo dopaminérgico/serotoninérgico e perfil distinto de D2.',
    'Lítio':'Modula múltiplas vias de segundos mensageiros e sinalização neuronal; o mecanismo estabilizador do humor é multifatorial.',
    'Levodopa/carbidopa':'Levodopa é precursor da dopamina; carbidopa inibe descarboxilação periférica e aumenta a fração que chega ao SNC.',
    'Donepezilo':'Inibe acetilcolinesterase no SNC e aumenta disponibilidade de acetilcolina.',
    'Omeprazol':'Inibe irreversivelmente a bomba H+/K+-ATPase das células parietais gástricas, reduzindo secreção ácida.',
    'Loperamida':'Agonista μ-opioide periférico intestinal que reduz motilidade e secreção gastrointestinal.',
    'Amoxicilina':'β-lactâmico que se liga a PBPs e inibe síntese da parede bacteriana.',
    'Nitrofurantoína':'Metabolitos reativos bacterianos danificam DNA e outras macromoléculas, sobretudo no trato urinário.',
    'Isoniazida':'Inibe síntese de ácidos micólicos da parede de Mycobacterium tuberculosis após ativação enzimática.',
    'Rifampicina':'Inibe RNA-polimerase bacteriana dependente de DNA.',
    'Dolutegravir':'Inibidor da integrase do HIV, impedindo integração do DNA viral no genoma da célula hospedeira.',
    'Oseltamivir':'Inibe neuraminidase dos vírus influenza A/B, reduzindo libertação de novos viriões.',
    'Valaciclovir':'Pró-fármaco de aciclovir; após ativação inibe DNA-polimerase viral e termina elongação do DNA.',
    'Terbinafina':'Inibe esqualeno epoxidase fúngica, reduzindo ergosterol e acumulando esqualeno.',
    'Levotiroxina oral':'T4 sintética convertida parcialmente em T3; atua em recetores nucleares tiroideus e regula expressão génica/metabolismo.',
    'Tiamazol':'Inibe tiroperoxidase e reduz organificação/acoplamento do iodo na síntese de hormonas tiroideias.',
    'Alendronato':'Bisfosfonato que se acumula no osso e inibe função osteoclástica, reduzindo reabsorção.',
    'Metotrexato oral/SC':'Antimetabolito do folato; em doses imunomoduladoras aumenta adenosina extracelular e modula inflamação, além de efeitos sobre enzimas do folato.',
    'Hidroxicloroquina':'Modula pH lisossomal e sinalização imune inata, incluindo processamento antigénico e recetores Toll-like.',
    'Tacrolímus oral':'Liga-se a FKBP12 e inibe calcineurina, reduzindo transcrição de IL-2 e ativação de linfócitos T.',
    'Tamsulosina':'Antagonista α1A predominante no trato urinário inferior, relaxando músculo liso prostático/uretral.',
    'Finasterida':'Inibe 5α-redutase tipo 2 e reduz conversão de testosterona em di-hidrotestosterona.',
    'Sildenafil':'Inibe PDE5, aumentando GMPc e potenciando vasodilatação dependente de óxido nítrico.',
    'Isotretinoína oral':'Retinoide que reduz tamanho/atividade das glândulas sebáceas e modula queratinização e inflamação.',
    'Latanoprost':'Análogo de prostaglandina F2α que aumenta drenagem uveoescleral do humor aquoso.',
    'Sevoflurano':'Anestésico inalatório que modula múltiplos canais/receptores neuronais inibitórios e excitatórios, produzindo anestesia geral.',
    'Eculizumab':'Anticorpo monoclonal anti-C5 que bloqueia clivagem do complemento C5 e formação do complexo terminal C5b-9.'
  };

  function groupMechanism(group){
    const g=fold(group);
    if(g.includes('analgesia'))return 'Atua em vias nociceptivas/inflamatórias; o alvo exato depende da classe (COX, recetores opioides, canais iónicos ou vias centrais).';
    if(g.includes('cardiovascular'))return 'Modula pressão, frequência, contratilidade, volume ou remodelagem cardiovascular através de RAAS, canais iónicos, recetores autonómicos ou transporte renal.';
    if(g.includes('antiagreg')||g.includes('anticoag'))return 'Reduz formação de trombo por inibição da ativação plaquetária ou de fatores específicos da coagulação.';
    if(g.includes('dislip'))return 'Reduz colesterol/lipoproteínas através de síntese hepática, absorção intestinal ou regulação de recetores LDL/PCSK9.';
    if(g.includes('diabetes'))return 'Reduz glicemia através de aumento de insulina, maior sensibilidade, menor produção/absorção de glicose ou maior eliminação urinária.';
    if(g.includes('respir'))return 'Modula broncomotricidade e/ou inflamação das vias aéreas por recetores β2, muscarínicos, glucocorticoides ou alvos biológicos.';
    if(g.includes('psiquiatr')||g.includes('ansiol'))return 'Modula neurotransmissão central serotoninérgica, noradrenérgica, dopaminérgica, GABAérgica ou vias de segundos mensageiros, consoante a classe.';
    if(g.includes('neurolog'))return 'Modula excitabilidade neuronal, canais iónicos, neurotransmissores ou proteínas/alvos específicos do sistema nervoso.';
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
    return 'Mecanismo específico dependente do medicamento; confirmar no RCM/SmPC antes de usar esta informação em decisão clínica.';
  }

  function ivCatalogue(){
    const map=new Map(),sel=document.getElementById('ivcDrugA');
    if(sel)[...sel.options].forEach(o=>{if(!o.value)return;const name=o.textContent.trim(),group=o.parentElement?.tagName==='OPTGROUP'?o.parentElement.label:'Hospitalar IV';if(!map.has(fold(name)))map.set(fold(name),{name,group,iv:true})});
    return map;
  }
  function baseInfo(name){
    try{const arr=(typeof contentPack!=='undefined'&&Array.isArray(contentPack?.drugs))?contentPack.drugs:[];const alias={'Insulina regular':'Insulina','Heparina não fracionada':'Heparina'};return arr.find(d=>fold(d.name)===fold(name)||fold(d.name)===fold(alias[name]||''))||null}catch(e){return null}
  }
  function records(){
    const map=ivCatalogue();
    Object.entries(EXPANDED).forEach(([group,names])=>names.forEach(name=>{const k=fold(name);if(!map.has(k))map.set(k,{name,group,iv:false})}));
    return [...map.values()].map(x=>{
      const base=baseInfo(x.name),legacy=LEGACY[x.name]||{};
      return {...x,mechanism:SPECIFIC[x.name]||groupMechanism(x.group),specific:!!SPECIFIC[x.name],use:base?.use||'Consultar indicação aprovada no RCM/SmPC e protocolo aplicável.',monitor:base?.monitor||'A monitorização depende da indicação, dose, via, função renal/hepática e perfil de segurança.',risks:base?.risks||'Confirmar contraindicações, interações e reações adversas no RCM/SmPC.',prep:legacy.prep||(x.iv?'Preparação/administração ainda não integrada nesta ficha; confirmar concentração, diluente e protocolo local.':'Via, formulação e posologia dependem do produto/indicação; confirmar RCM/SmPC.'),source:legacy.source||'',curated:!!base||!!SPECIFIC[x.name]};
    }).sort((a,b)=>a.name.localeCompare(b.name,'pt'));
  }

  let all=[],matches=[],active=-1;
  function addStyles(){
    if(document.getElementById('med-info-v4-style'))return;const s=document.createElement('style');s.id='med-info-v4-style';s.textContent=`
      .med4-shell{display:grid;gap:12px}.med4-tools{display:grid;grid-template-columns:minmax(260px,1.4fr) minmax(210px,.6fr);gap:9px}.med4-search{position:relative}.med4-search input{font-size:15px;padding:12px 40px 12px 13px}.med4-search:after{content:'⌕';position:absolute;right:13px;top:10px;color:var(--muted);font-size:17px;pointer-events:none}.med4-suggest{position:absolute;left:0;right:0;top:calc(100% + 5px);z-index:245;display:none;max-height:330px;overflow:auto;border:1px solid var(--line-strong);border-radius:14px;background:var(--panel);box-shadow:0 18px 55px rgba(0,0,0,.35);padding:5px}.med4-suggest.open{display:block}.med4-suggest button{width:100%;border:0;background:transparent;color:var(--text);padding:9px 10px;border-radius:10px;text-align:left;cursor:pointer}.med4-suggest button:hover,.med4-suggest button.active{background:var(--clinical-soft)}.med4-suggest strong{font-size:10px}.med4-suggest span{display:block;color:var(--muted);font-size:8px;margin-top:2px}.med4-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.med4-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.med4-mini{border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:11px;text-align:left;color:var(--text);cursor:pointer}.med4-mini strong{display:block;font-size:10px}.med4-mini span{display:block;color:var(--muted);font-size:8px;margin-top:3px}.med4-detail{border:1px solid var(--line);border-radius:18px;background:var(--panel);padding:15px}.med4-head{display:flex;gap:10px;align-items:flex-start}.med4-head h3{margin:0;font-size:22px}.med4-head p{margin:4px 0 0;color:var(--muted);font-size:9px}.med4-head .spacer{flex:1}.med4-mech{margin-top:11px;border:1px solid rgba(98,212,255,.22);background:var(--clinical-soft);border-radius:14px;padding:12px}.med4-mech small,.med4-field small{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.08em}.med4-mech small{color:var(--clinical);font-weight:900}.med4-mech div,.med4-field div{font-size:9px;line-height:1.55;margin-top:4px}.med4-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:10px}.med4-field{border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:10px}.med4-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.med4-sourcebar{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.med4-sourcebar a{font-size:8px;text-decoration:none;border:1px solid var(--line);border-radius:9px;padding:6px 8px}.med4-warning{font-size:9px;line-height:1.55;margin-top:10px}.med4-group-select select{height:100%}
      html[data-fcc-theme="light"] .med4-suggest{box-shadow:0 18px 45px rgba(31,62,76,.16)}
      @media(max-width:850px){.med4-list{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.med4-tools,.med4-grid,.med4-list{grid-template-columns:1fr}.med4-head{flex-wrap:wrap}}
    `;document.head.appendChild(s)
  }
  function openCompat(name){if(typeof openClin==='function')openClin('ivcompat');setTimeout(()=>{const sel=document.getElementById('ivcDrugA');if(!sel)return;const opt=[...sel.options].find(o=>fold(o.textContent)===fold(name)||fold(o.value)===fold(name));if(!opt)return;sel.value=opt.value;sel.dispatchEvent(new Event('change',{bubbles:true}));const input=sel.closest('.ivc-combo')?.querySelector('input');if(input)input.value=opt.textContent.trim()},100)}
  window.openMed4Compat=openCompat;
  window.openMed4Perf=name=>{if(typeof openClin==='function')openClin('perf');setTimeout(()=>{const q=document.getElementById('perfDilutionSearch');if(q){q.value=name;window.renderPerfDilutions?.();q.focus()}},100)};

  function detail(d){return `<article class="med4-detail"><div class="med4-head"><div><h3>${esc(d.name)}</h3><p>${esc(d.group)}${d.iv?' · Catálogo IV':''}</p></div><div class="spacer"></div><span class="badge ${d.curated?'good':'warn'}">${d.curated?'Ficha enriquecida':'Ficha base'}</span></div><div class="med4-mech"><small>Como funciona${d.specific?'':' · resumo da classe'}</small><div>${esc(d.mechanism)}</div></div><div class="med4-grid"><div class="med4-field"><small>Utilização clínica</small><div>${esc(d.use)}</div></div><div class="med4-field"><small>Monitorização</small><div>${esc(d.monitor)}</div></div><div class="med4-field"><small>Riscos / precauções</small><div>${esc(d.risks)}</div></div><div class="med4-field"><small>Preparação / administração</small><div>${esc(d.prep)}</div></div></div><div class="notice med4-warning"><b>Referência clínica:</b> esta ficha não define dose nem substitui RCM/SmPC, prescrição, protocolo institucional ou validação farmacêutica. Nas fichas “base”, parte da descrição é de classe e deve ser confirmada para o medicamento concreto.</div><div class="med4-actions">${d.iv?`<button class="btn primary" type="button" onclick="openMed4Compat('${esc(d.name)}')">Compatibilidade IV</button><button class="btn" type="button" onclick="openMed4Perf('${esc(d.name)}')">Perfusões / diluição</button>`:''}${d.source?`<a class="btn" target="_blank" rel="noopener" href="${esc(d.source)}">SmPC / fonte ↗</a>`:''}</div></article>`}
  function visible(){const q=fold(document.getElementById('med4Search')?.value),g=document.getElementById('med4Group')?.value||'';return all.filter(d=>(!g||d.group===g)&&(!q||fold([d.name,d.group,d.mechanism].join(' ')).includes(q)))}
  function render(){const root=document.getElementById('med4Results');if(!root)return;const rows=visible(),q=fold(document.getElementById('med4Search')?.value);const exact=q?rows.find(d=>fold(d.name)===q):null;if(exact){root.innerHTML=detail(exact);return}root.innerHTML=rows.length?`<div class="med4-list">${rows.map(d=>`<button class="med4-mini" type="button" data-med4="${esc(d.name)}"><strong>${esc(d.name)}</strong><span>${esc(d.group)}</span></button>`).join('')}</div>`:'<div class="item"><span>Sem correspondências.</span></div>';root.querySelectorAll('[data-med4]').forEach(b=>b.onclick=()=>select(b.dataset.med4))}
  function suggest(){const input=document.getElementById('med4Search'),box=document.getElementById('med4Suggest');if(!input||!box)return;const q=fold(input.value),g=document.getElementById('med4Group')?.value||'';matches=all.filter(d=>(!g||d.group===g)&&(!q||fold([d.name,d.group].join(' ')).includes(q))).sort((a,b)=>{const aa=q&&fold(a.name).startsWith(q)?0:1,bb=q&&fold(b.name).startsWith(q)?0:1;return aa-bb||a.name.localeCompare(b.name,'pt')}).slice(0,12);active=-1;box.innerHTML=matches.length?matches.map((d,i)=>`<button type="button" data-i="${i}"><strong>${esc(d.name)}</strong><span>${esc(d.group)}</span></button>`).join(''):'<div class="item"><span>Sem resultados.</span></div>';box.classList.add('open');box.querySelectorAll('[data-i]').forEach(b=>b.onmousedown=e=>{e.preventDefault();select(matches[+b.dataset.i].name)})}
  function select(name){const input=document.getElementById('med4Search'),box=document.getElementById('med4Suggest');if(input)input.value=name;box?.classList.remove('open');render()}
  function install(){
    const host=document.getElementById('clin-drugs');if(!host||!document.getElementById('ivcDrugA'))return false;addStyles();all=records();
    const tab=[...document.querySelectorAll('#page-clinical > .tabs .tab')].find(t=>(t.getAttribute('onclick')||'').includes("'clin-drugs'"));if(tab)tab.textContent='INFO Medicação';
    const groups=[...new Set(all.map(x=>x.group))].sort((a,b)=>a.localeCompare(b,'pt'));
    host.innerHTML=`<div class="med4-shell"><div class="pagehead" style="margin-top:0"><div><h3>INFO Medicação</h3><p>Base alargada multi-via com medicação hospitalar e ambulatória relevante, incluindo toda a lista da Compatibilidade IV.</p></div><span class="badge good">${all.length} medicamentos</span></div><div class="card full"><div class="med4-tools"><div class="med4-search"><input id="med4Search" autocomplete="off" spellcheck="false" placeholder="Escreve o nome da medicação…"><div id="med4Suggest" class="med4-suggest"></div></div><label class="med4-group-select"><select id="med4Group"><option value="">Todos os grupos terapêuticos</option>${groups.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('')}</select></label></div><div class="med4-meta"><span class="badge">IV + oral + SC/IM + inalatória + tópica + outras vias</span><span class="badge">${groups.length} grupos</span><span class="badge">Pesquisa por nome, grupo ou mecanismo</span></div><div class="med4-sourcebar"><a href="${WHO}" target="_blank" rel="noopener">WHO EML 2025 ↗</a><a href="${INFARMED}" target="_blank" rel="noopener">INFARMED CHNM ↗</a></div></div><div id="med4Results"></div></div>`;
    const input=document.getElementById('med4Search'),box=document.getElementById('med4Suggest'),group=document.getElementById('med4Group');input.addEventListener('input',()=>{suggest();render()});input.addEventListener('focus',suggest);input.addEventListener('blur',()=>setTimeout(()=>box.classList.remove('open'),120));input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,matches.length-1)}else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0)}else if(e.key==='Enter'){e.preventDefault();if(active>=0&&matches[active])select(matches[active].name);else if(matches[0])select(matches[0].name)}else if(e.key==='Escape')box.classList.remove('open');box.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active',i===active))});group.addEventListener('change',()=>{suggest();render()});render();return true
  }
  let tries=0;const run=()=>{tries++;if(install()||tries>40)return;setTimeout(run,150)};run();
})();