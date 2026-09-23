"""Apply the bounded medication audit of 2026-09-23. Not a full clinical validation.
Only explicit record/field amendments are made. Historical values remain in the
amendment ledger and git. Re-running is deterministic; unexpected edits fail closed.
"""
from pathlib import Path
import json, hashlib, re, sys
ROOT = Path(__file__).resolve().parents[1]
DATE = '2026-09-23'
LEDGER = ROOT/'data/medication-corrections-20260923.json'
EMC = 'https://www.medicines.org.uk/emc/product/'
LEV = 'https://journals.sagepub.com/doi/10.1177/0018578719893376'
PARA = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3887589/'
EMA = 'https://www.ema.europa.eu/en/documents/product-information/keppra-epar-product-information_en.pdf'
def load(p): return json.loads((ROOT/p).read_text())
def save(p, x): (ROOT/p).write_text(json.dumps(x, ensure_ascii=False, separators=(',', ':'))+'\n')
def digest(p): return hashlib.sha256((ROOT/p).read_bytes()).hexdigest()

def data_amendments():
    ledger = load('data/medication-corrections-20260923.json') if LEDGER.exists() else {'date': DATE, 'scope': 'Correções pontuais e contenção de ambiguidades; revisão clínica integral pendente.', 'changes': []}
    entries = {x['key']: x for x in ledger['changes']}
    def amend(obj, field, new, record, module, ids, source='', mode='Correção documentada'):
        key = '|'.join([module, str(record), field])
        old = obj.get(field)
        if key in entries:
            previous = entries[key]
            if old not in (previous['before'], previous['after']):
                raise ValueError('Conflicting subsequent edit: '+key)
        elif old != new:
            entries[key] = {'key': key, 'module': module, 'record': record, 'field': field, 'before': old, 'after': new, 'findings': ids, 'source': source, 'action': mode}
        obj[field] = new
    meds = load('data/medications.json')
    assert len(meds) == 923 and len({x['n'] for x in meds}) == 923
    byname = {x['n']: x for x in meds}
    fixes = [
      ('Alopurinol','hepatic','Na insuficiência hepática, utilizar doses reduzidas e realizar testes periódicos da função hepática no início do tratamento. O SmPC consultado não fornece uma tabela numérica de redução. Confirmar o produto utilizado.','A017','14132','4.2 e 4.4'),
      ('Leflunomida','renal','O SmPC de Leflunomide medac não recomenda ajuste na insuficiência renal ligeira. A insuficiência renal moderada a grave é uma contraindicação, por experiência clínica insuficiente; não a tratar apenas como uma precaução.','A018','5243','4.2 e 4.3'),
      ('Metildopa','hepatic','Contraindicada em doença hepática ativa e em história de lesão hepática associada a metildopa. Avaliar função hepática e leucograma total/diferencial antes do tratamento e periodicamente nas primeiras 6–12 semanas, ou perante febre inexplicada. Suspender perante febre, alteração hepática ou icterícia; se relacionadas com metildopa, não reintroduzir.','A019','100084','4.3 e 4.4'),
      ('Isotretinoína oral','hepatic','A insuficiência hepática é uma contraindicação no SmPC de isotretinoína oral consultado. Não substituir esta restrição por uma indicação genérica de monitorização ou por redução empírica da dose.','A020','10555','4.3 e 5.2'),
      ('Febuxostate','hepatic','O SmPC de febuxostate 80 mg distingue a gravidade da insuficiência hepática: na ligeira indica 80 mg para a indicação de gota; na moderada a informação é limitada; na grave (Child-Pugh C) eficácia e segurança não foram estudadas. Não existe aqui uma regra universal de ausência de ajuste.','A021','11858','4.2')
    ]
    for name, field, text, aid, product, section in fixes:
        r = byname[name]
        url = EMC+product+'/smpc'
        amend(r, field, text, name, 'Medicação', aid, url)
        r.setdefault('auditCorrections', {})[field] = {'date':DATE, 'finding':aid, 'source':url, 'section':section, 'scope':'Apenas este campo; RCM do produto local a confirmar.'}
    r=byname['Tiamazol']
    for field in ('src','sourceRegulatory'):
        if '13015' in str(r.get(field,'')) or ('Medicação|Tiamazol|'+field) in entries:
            amend(r,field,'Referência regulamentar direta de tiamazol por confirmar; a ligação anterior identificava carbimazol.', 'Tiamazol','Medicação','A016',EMC+'13015/smpc','Ligação incorreta retirada; fonte direta pendente')
    for r in meds:
        r['reviewScope'] = 'Revisão clínica integral pendente. Só os campos identificados em auditCorrections receberam a correção pontual indicada. Texto genérico ou campo vazio não demonstra ausência de risco.'
        if 'legacyReviewMetadata' not in r:
            r['legacyReviewMetadata'] = {k:r[k] for k in ('validationStatus','confidenceLevel','humanReview') if k in r}
        r['validationStatus']='Revisão integral pendente; consultar âmbito das correções'
        r['confidenceLevel']='Não atribuída por esta correção'
    save('data/medications.json', meds)

    ds=load('data/dilutionSource.json'); rows={r['row']:r for r in ds['records']}
    affected=set()
    def d(row, field, new, ids, source='', mode='Contenção: instrução não utilizável até confirmação'):
        r=rows[row];affected.add(r['drug'])
        amend(r,field,new,'HBA linha '+str(row),'Diluições',ids,source,mode)
        r['auditReview']='Alterações pontuais em '+DATE+'; os restantes campos do documento de 2018 não foram revalidados.'
    hold='Instrução histórica suspensa: apresentação/fabricante ou condições insuficientemente identificados. Confirmar RCM e preparação institucional antes de utilizar.'
    # A001: dimensional typo; do not silently select a manufacturer for reconstitution.
    d(483,'administration','Correção de unidade: concentrações de 20–250 microgramas/mL; 50 microgramas/mL no adulto no SmPC de referência para perfusão manual. O intervalo TCI desse SmPC é distinto (20–50 microgramas/mL). Não utilizar valores em mg/mL nem os interpretar como volumes de diluente.','A001',EMC+'795/smpc','Unidade corrigida; âmbito do SmPC identificado')
    for row in (482,483):
        d(row,'reconstitution_volume','Volume histórico de 5 mL retirado por discrepância. Confirmar o fabricante. No SmPC Aspen de referência, o frasco de 1 mg é reconstituído com 1 mL para 1 mg/mL; não transferir automaticamente para outro produto.','A045',EMC+'795/smpc')
        d(row,'stability_reconstituted',hold,'A045',EMC+'795/smpc')
    d(483,'dilution_volume','Volume final a calcular a partir da quantidade total e da concentração prescrita; o intervalo de concentração acima não é um intervalo de mL.','A001; A045',EMC+'795/smpc')
    for field in ('diluent','dilution_volume','stability_diluted'):
        d(473,field,hold,'A002; A003',EMC+'11294/smpc')
    d(473,'administration','A apresentação identificada contém 20 mg/mL (2%). Não aplicar a referência de 10 mg/mL (1%). Administração e eventual diluição dependem do RCM exato; a instrução histórica conflitante foi suspensa.','A002; A003',EMC+'11294/smpc')
    d(473,'observations','Prazos e material do sistema dependem do produto. Não foi atribuída validade de 6 ou 12 horas sem identificação do fabricante deste registo.','A003',EMC+'11294/smpc')
    d(504,'dilution_volume','Exemplo retirado: 0,005 mg/mL equivale a 5 microgramas/mL, mas o exemplo utilizava 50 microgramas/mL. É necessário identificar qual apresentação e volume final eram pretendidos.','A004',mode='Exemplo incoerente retirado; cálculo não escolhido')
    d(504,'stability_diluted',hold,'A004')
    for field in ('diluent','dilution_volume','stability_diluted'):
        d(21,field,None,'A007')
    d(21,'administration','Registo histórico intracardíaco retirado de utilização. Esta ficha não fornece instruções para essa via; seguir o algoritmo e o protocolo de ressuscitação aplicáveis.','A007')
    d(432,'dilution_volume','Referência histórica a preparação para bólus suspensa por ambiguidade. Não utilizar este texto para calcular ou administrar um bólus de nitroprussiato. Confirmar preparação de perfusão no RCM/protocolo.','A008')
    d(83,'route','Perfusão IV — manutenção anestésica, não bólus de intubação','A009',mode='Contexto e unidade de tempo clarificados')
    for row in (83,84):
        d(row,'administration','Taxas históricas de perfusão contínua de manutenção anestésica: anestesia IV, 0,3–0,6 mg/kg/h; anestesia inalatória, 0,3–0,4 mg/kg/h. Não são doses de bólus ou de intubação. Confirmar regime e produto.','A009',mode='Contexto de perfusão clarificado; valores históricos não revalidados')
    for field in ('dilution_volume','administration'):
        d(433,field,'Preparação e equivalência de débito suspensas: faltam quantidade total de noradrenalina base e volume final inequívocos. Calcular o débito apenas com a concentração real da preparação prescrita.','A010')
    d(141,'administration','Equivalência histórica entre g/10–15 minutos e mg/kg/h retirada: sem peso e indicação não existe conversão única. Não utilizar o intervalo como velocidade universal; confirmar indicação e protocolo do produto.','A011',mode='Igualdade dimensional indevida retirada')
    d(331,'observations',hold+' O texto anterior confundia temperatura e prazo após abertura; não foi convertido por suposição em dias.','A013')
    for row in (332,333,334):
        d(row,'observations','Não assumir que insulinas da mesma marca são misturáveis. Confirmar insulinas, formulação, recipiente e dispositivo exatos no RCM. A instrução histórica genérica de mistura e manipulação foi retirada.','A014')
    d(333,'administration','Utilização IM não confirmada para esta apresentação: a instrução histórica não deve ser utilizada até verificação do RCM exato.','A014')
    for field in ('stability_diluted','observations'):
        d(338,field,'Intervalos históricos de reservatório e conjunto de perfusão suspensos: são componentes diferentes. Seguir os limites específicos da insulina, do reservatório e do sistema efetivamente utilizados.','A015')
    for field in ('diluent','dilution_volume','stability_diluted'):
        d(447,field,None,'A046',EMC+'2241/smpc')
    d(447,'reconstitution_solvent','Apresentação do registo não identificada: confirmar RCM. Referência Protium IV 40 mg: reconstituição com NaCl 0,9%; glucose 5% só é opção de diluição posterior, não de reconstituição.','A046',EMC+'2241/smpc','Etapas distinguidas; referência Protium explicitada')
    d(447,'reconstitution_volume','Referência Protium IV 40 mg: 10 mL de NaCl 0,9%. Não transferir automaticamente para outro fabricante.','A046',EMC+'2241/smpc')
    d(447,'stability_reconstituted','Referência Protium: utilização microbiológica imediata; estabilidade físico-química 12 horas a 25 °C após reconstituição ou reconstituição/diluição. O prazo histórico de 24 horas no frigorífico não foi confirmado para este registo.','A046',EMC+'2241/smpc')
    save('data/dilutionSource.json',ds)
    extracts=load('data/dilutions.json')
    for x in extracts:
        if x.get('name') in affected:
            linked=[r for r in ds['records'] if r['drug']==x['name']]
            x['text']=' | '.join(str(r.get(k)) for r in linked for k in ('drug','route','reconstitution_solvent','reconstitution_volume','stability_reconstituted','diluent','dilution_volume','stability_diluted','administration','observations') if r.get(k))
    save('data/dilutions.json',extracts)
    inst=load('data/institutional.json')
    for r in inst['antibiotics']['records']:
        if r['drug']=='Vancomicina' and 'contínua' in r['route']:
            amend(r,'dilution','Preparação histórica com intervalos independentes de quantidade/volume suspensa: não combinar livremente 1000–2000 mg com 250–500 mL. O próprio registo limita a concentração a 5 mg/mL. Confirmar a quantidade e o volume final emparelhados para a apresentação Hikma e protocolo aplicável.',r.get('id',r['route']),'Antibióticos','A012',mode='Ambiguidade de preparação contida; prazo do produto não validado')
    for r in inst['stability']['records']:
        if str(r.get('code'))=='100004597' and 'keppra' in r.get('brand','').lower():
            amend(r,'stability','7 meses após a primeira abertura — Keppra 100 mg/mL solução oral',r['code'],'Estabilidade','A044',EMA)
            amend(r,'observations','Atualização pontual pela informação EMA, secções 6.3–6.4: manter no frasco original protegido da luz e respeitar a validade da embalagem. Não é estabilidade de perfusão IV. Não prolongar automaticamente prazos já atribuídos a frascos abertos; confirmar embalagem e procedimento institucional.',r['code'],'Estabilidade','A044',EMA)
            r['auditSource']=EMA
    save('data/institutional.json',inst)
    basepath=ROOT/'data/baseline-before-medication-20260923.json'
    if not basepath.exists():basepath.write_bytes((ROOT/'data/baseline-integrity.json').read_bytes())
    baseline=load('data/baseline-integrity.json')
    for name in ('medications.json','dilutionSource.json','dilutions.json'):
        baseline[name]=digest('data/'+name)
    save('data/baseline-integrity.json',baseline)
    ledger['changes']=sorted(entries.values(),key=lambda x:x['key'])
    ledger['metadataPolicy']={'records':923,'clinicalValidation':'Pendente; flags históricas preservadas em legacyReviewMetadata', 'institutionalApproval':'Não atribuída'}
    ledger['amendedDataHashes']={k:digest('data/'+k) for k in ('medications.json','dilutionSource.json','dilutions.json','institutional.json')}
    save('data/medication-corrections-20260923.json',ledger)
    print('Bounded medication amendments:',len(ledger['changes']))

def replace_file(path,old,new):
    p=ROOT/path;s=p.read_text()
    if new in s:return
    if s.count(old)!=1:raise ValueError('Unexpected source for '+path+' / '+old[:90])
    p.write_text(s.replace(old,new,1))

def install():
    replace_file('scripts/build-clinical-data.cjs',"const C=require('../fcc-core.js')", "require('child_process').execFileSync('python3',['scripts/apply-medication-corrections-20260923.py'],{stdio:'inherit'});\nconst C=require('../fcc-core.js')")
    replace_file('fcc-medications.js',"const values=[record.sourceRegulatory,record.sourceClinical,record.src]", "const values=[record.sourceRegulatory,record.sourceClinical,record.src,...Object.values(record.auditCorrections||{}).map(x=>x.source)]")
    replace_file('fcc-medications.js','<p>Dados consolidados da versão publicada em 16/09/2026. Esta atualização é de engenharia e não constitui uma nova revisão clínica individual das 923 fichas.</p>', '<p>Catálogo preservado com correções pontuais de 23/09/2026. Não constitui revisão clínica integral das 923 fichas.</p><p>${esc(record.reviewScope||"Revisão integral pendente.")}</p>${Object.entries(record.auditCorrections||{}).map(([field,x])=>`<p><b>Campo corrigido: ${esc(FIELDS.find(f=>f[0]===field)?.[1]||field)}</b> · ${esc(x.finding)} · secções ${esc(x.section)} · ${esc(x.date)}.</p>`).join(\'\')}')
    replace_file('medication-stability-cuf-v1.js','const terms=termsFor(name);if(!terms.length)return[];', """const n=fold(name);
    const rejected=r=>{
      const d=fold(r.designation),b=fold(r.brand);
      if(n==='amoxicilina/acido clavulanico oral')return d.startsWith('amoxicilina oral')&&!d.includes('clavulan');
      if(n==='budesonida/formoterol')return d.startsWith('budesonida ')&&!d.includes('formoterol');
      if(n==='tramadol/paracetamol')return d.startsWith('tramadol oral')&&!d.includes('paracetamol');
      if(n==='loratadina')return d.startsWith('desloratadina')||b.startsWith('aerius');
      if(n==='fenilefrina')return d.startsWith('etilfenilefrina')||b.startsWith('effortil');
      if(n==='azitromicina iv'||n==='paracetamol iv')return /oral|sol or|susp or/.test(d+' '+fold(r.form));
      return false;
    };
    const terms=termsFor(name);if(!terms.length)return[];""")
    replace_file('medication-stability-cuf-v1.js',"return terms.some(t=>hay.startsWith(t)||hay.includes(' '+t)||hay.includes(t+' '));","return !rejected(r)&&terms.some(t=>hay.startsWith(t)||hay.includes(' '+t)||hay.includes(t+' '));")
    replace_file('medication-stability-cuf-v1.js','Códigos e estabilidade são específicos da apresentação/produto abaixo; não extrapolar para outra forma farmacêutica.','Associação documental, não validação individual do prazo. Confirmar marca, concentração, recipiente e RCM; estabilidade físico-química não demonstra segurança microbiológica. As 12 associações incoerentes identificadas na auditoria foram retiradas.')
    replace_file('medication-stability-cuf-v1.js',"${r.observations?`<div class=\"cuf-stab-obs\"><small>Observações</small>${esc(r.observations)}</div>`:''}","${r.observations?`<div class=\"cuf-stab-obs\"><small>Observações</small>${esc(r.observations)}${r.auditSource?`<br><a href=\"${esc(r.auditSource)}\" target=\"_blank\" rel=\"noopener\">Fonte da correção pontual: EMA</a>`:''}</div>`:''}")
    p=ROOT/'dilutions-document-db-v4.js';s=p.read_text()
    if 'function currentStandard(drug,route)' not in s:
        start=s.index('  function currentStandard(drug){');end=s.index('\n  function groupRecords',start)
        s=s[:start]+'''  function currentStandard(drug,route){
    const d=fold(drug), r=fold(route||'');
    if(d.includes('+')||!r.includes('perfus')||!r.includes('iv'))return null;
    for(const [name,value] of Object.entries(CURRENT_STANDARD)){
      const n=fold(name),pos=d.indexOf(n);
      if(pos<0 || (pos>0&&!['brometo de ','cloridrato de '].includes(d.slice(0,pos))))continue;
      const tail=d.slice(pos+n.length);
      if(tail && !/^[ \\d]/.test(tail))continue;
      if(n==='propofol'&&/20\\s*mg\\s*\\/\\s*ml/.test(d))return {name,value:'20 mg/mL (2%): confirmar RCM; não utilizar a referência de 10 mg/mL'};
      return {name,value};
    }
    return null;
  }
''' + s[end:]
        s=s.replace('function routeBlock(r){','function routeBlock(r){\n    const std=currentStandard(r.drug,r.route);')
        s=s.replace('${hasRecon?`<div class="ccd-doc-grid">','${std?`<div class="ccd-ashp"><small>Referência de concentração apenas para esta via; confirmar produto e protocolo</small><b>${esc(std.value)}</b></div>`:\'\'}${hasRecon?`<div class="ccd-doc-grid">',1)
        s=s.replace('currentStandard(x.drug)||x.routes.some','x.routes.some(r=>currentStandard(x.drug,r.route))||x.routes.some')
        start=s.index('${std?`<div class="ccd-ashp"><span>Concentração standard atual')
        end=s.index('<details class="ccd-doc-details">',start)
        s=s[:start]+s[end:]
        s=s.replace('const std=currentStandard(x.drug),routeNames=', 'const routeNames=')
        p.write_text(s)
    replace_file('iv-compatibility.js',"${n>=3?'<span class=\"badge good\">Triangulação 3 fontes</span>':'<span class=\"badge warn\">Validado em 2 fontes</span>'}",'<span class="badge warn">Número de ligações não equivale a validação clínica</span>')
    replace_file('iv-compatibility.js',"add('Dexmedetomidina','Furosemida','compatible','Compatível a 4 mcg/mL + 10 mg/mL'", "add('Dexmedetomidina','Furosemida','conditional','Condições e apresentação por confirmar'")
    replace_file('iv-compatibility.js',"'Há suporte específico para dexmedetomidina 4 mcg/mL com furosemida 10 mg/mL.'", "'A classificação automática como compatível foi retirada: é necessária confirmação da formulação, diluente e condições da fonte específica.'")
    replace_file('iv-compatibility.js','A regra do módulo é não atribuir uma cor clínica sem pelo menos duas referências verificadas.','O número de ligações não determina a validade do resultado. É necessário suporte específico para o par e as condições de administração.')
    p=ROOT/'iv-source-evidence.js';s=p.read_text()
    if '      let s=state;' in s:
        start=s.index('      let s=state;');end=s.index('      const key=id||',start)
        s=s[:start]+"      const s='unknown'; // No per-source attribution without a claim-specific verified record.\n"+s[end:]
    s=s.replace('Nenhuma das fontes atualmente integradas nesta app tem uma classificação apresentada para este par. Isto não equivale a incompatibilidade.','As ligações apresentadas não foram classificadas individualmente nesta versão. O resultado documental do par não é atribuído automaticamente a cada fonte; confirmar o estudo e as condições. Isto não equivale a incompatibilidade.')
    s=s.replace('new MutationObserver(()=>{if(busy)return;busy=true;',"new MutationObserver(mutations=>{if(busy||mutations.every(m=>m.target.closest?.('.ivsrc-panel')||[...m.addedNodes,...m.removedNodes].every(n=>n.nodeType===1&&n.classList.contains('ivsrc-panel'))))return;busy=true;")
    p.write_text(s)
    replace_file('iv-catalogue.js','const uniq=[...new Set(Object.values(CATEGORIES).flat())];',"CATEGORIES['Regras documentais existentes']=['Verapamil','Vecurónio'];\n  const uniq=[...new Set(Object.values(CATEGORIES).flat())];")
    replace_file('iv-compatibility-ui-v2.js','Compatibilidade publicada apenas dentro dos limites descritos na revisão; confirmar a concentração exata antes da coadministração.','Classificação pendente: a concentração, o diluente e as condições do estudo primário não estão integralmente confirmados. Não utilizar o resultado como autorização para coadministração.')
    p=ROOT/'iv-compatibility-expanded-v3.js';s=p.read_text()
    if '// AUDIT-20260923' not in s:
        pos=s.index('  function meta(status)')
        end=s.index('  function markup',pos)
        scoped='''  // AUDIT-20260923: bounded corrections, not universal compatibility certification.
  const doses={'Cisatracúrio':'1 mg/mL','Dexmedetomidina':'4 microgramas/mL','Propofol':'10 mg/mL','Vancomicina':'5 mg/mL','Vasopressina':'1 unidade/mL'};
  for(const [name,dose] of Object.entries(doses)){
    const d=DB[key('Levetiracetam',name)];d.status='conditional';d.title='Compatibilidade física apenas nas condições do ensaio';
    d.conditions=`Levetiracetam 5 mg/mL em NaCl 0,9% + ${name} ${dose}; mistura 1:1, simulação em frasco de vidro, observação até 30 minutos. Confirmar formulações.`;
    d.note='Resultado físico do estudo, não prova de estabilidade química nem prazo de conservação.';d.url='''+json.dumps(LEV)+''';
  }
  Object.assign(DB[key('Levetiracetam','Piperacilina/tazobactam')],{status:'conditional',title:'O resultado muda com a concentração',conditions:'Levetiracetam 5 mg/mL em NaCl 0,9%: compatibilidade física com piperacilina/tazobactam 33,75 mg/mL; incompatibilidade física com 45 mg/mL. Mistura 1:1, frasco de vidro, observação até 30 minutos.',note:'Não apresentar este par como universalmente compatível. Outras condições não são classificadas.',url:'''+json.dumps(LEV)+'''});
  Object.assign(DB[key('Levetiracetam','Noradrenalina')],{status:'conditional',title:'Resultado suspenso por dúvida nas unidades da fonte',conditions:'As unidades de noradrenalina no resumo publicado exigem confirmação no texto integral ou com os autores. Não foi feita conversão por suposição.',note:'Sem autorização de coadministração com base neste registo enquanto a dúvida não for esclarecida.',url:'''+json.dumps(LEV)+'''});
  const paradoses={'Ceftriaxona':'40 mg/mL','Clindamicina':'10 mg/mL','Fentanilo':'50 microgramas/mL','Hidrocortisona':'125 mg/mL','Midazolam':'5 mg/mL','Morfina':'15 mg/mL','Piperacilina/tazobactam':'100 mg/mL totais (89 + 11 mg/mL)','Vancomicina':'5 mg/mL','Aciclovir':'5 mg/mL','Diazepam':'5 mg/mL'};
  const physicalOnly=new Set(['Clindamicina','Fentanilo','Hidrocortisona','Midazolam','Morfina']);
  for(const [name,dose] of Object.entries(paradoses)){
    const d=DB[key('Paracetamol',name)];
    d.conditions=`Paracetamol 10 mg/mL + ${name} ${dose}; 1:1 em seringa de polipropileno, observação até 4 horas. Condições transcritas da auditoria v2; confirmar formulações do ensaio.`;
    if(d.status==='compatible')d.status='conditional';
    if(physicalOnly.has(name)){d.title='Compatibilidade física no ensaio';d.note='Esta associação não foi avaliada quimicamente: retirada a afirmação de compatibilidade química. Não estabelece conservação prolongada.';}
    d.url='''+json.dumps(PARA)+''';
  }
  for(const d of Object.values(DB))if(d.status==='compatible'){d.status='conditional';d.note+=' Condições completas e equivalência do produto local por confirmar; não é uma validação automática de uso.';}
  function meta(status){
    if(status==='incompatible')return {ico:'×',lab:'INCOMPATÍVEL NAS CONDIÇÕES INDICADAS',cls:'ivc-bad',action:'Não partilhar o Y-site nestas condições. Não extrapolar para outras formulações.'};
    return {ico:'!',lab:'CONDICIONADA / REVER CONDIÇÕES',cls:'ivc-warn',action:'Confirmar concentração, diluente, formulação e condições antes de qualquer coadministração.'};
  }
'''
        s=s[:pos]+scoped+s[end:]
        s=s.replace("const current=fold(out.textContent);if(!current.includes('sem consenso')", "if(out.querySelector('[data-iv-audit-result]'))return;\n    const current=fold(out.textContent);if(!current.includes('sem consenso')")
        s=s.replace('<div class="ivc-result ${m.cls}">','<div class="ivc-result ${m.cls}" data-iv-audit-result="20260923">')
        s=s.replace('  function ensureOptions(select){',"  window.FCCIVExpandedAudit={get:(a,b)=>DB[key(a,b)],count:Object.keys(DB).length};\n  function ensureOptions(select){")
        p.write_text(s)
    data_amendments()

if __name__=='__main__':
    if '--install' in sys.argv:install()
    else:data_amendments()
