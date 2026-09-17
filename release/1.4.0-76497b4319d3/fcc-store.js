/* Local vault. The passphrase and CryptoKey are never persisted. No plaintext fallback. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./fcc-core.js'));
  else {
    let storage;
    try { storage=root.localStorage; storage.getItem('fcc-app-vault-v2'); }
    catch(e){ storage={getItem:()=>null,setItem:()=>{throw new Error('Armazenamento bloqueado neste navegador. Nenhum dado foi guardado.');},removeItem:()=>{throw new Error('Armazenamento bloqueado.');}}; }
    root.FCCStore=factory(root.FCCCore)({storage,crypto:root.crypto,locks:root.navigator?.locks,emit:(type,detail)=>root.dispatchEvent(new CustomEvent(type,{detail}))});
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
 'use strict';
 const VAULT='fcc-app-vault-v2',PREVIOUS='fcc-app-vault-previous-v2',JOURNAL='fcc-app-vault-journal-v2';
 const PRIVATE={
  'fcc-master-user-data-v1':'Dados principais',
  'fcc-master-content-pack-v1':'Conteúdo importado',
  'fcc-master-expenses-v1':'Despesas, regras e recorrências',
  'fcc-clinical-material-notes-v1':'Notas de material',
  'fcc-clinical-case-stats-v2':'Progresso dos casos',
  'fcc-case-review-v1':'Revisão de competências',
  'fcc-personal-favorites-v1':'Favoritos pessoais',
  'fabio-command-center-v4':'Dados antigos v4',
  'fabio-command-center-v3':'Dados antigos v3',
  'fabio-command-center-v2':'Dados antigos v2'
 };
 const PUBLIC={
  'fcc-master-subcategory-order-v1':'Ordem das categorias',
  'fcc-master-theme-v1':'Tema',
  'fcc-theme-manual-until-v2':'Preferência de tema',
  'fcc-clinical-layout-compact-v1':'Preferência de organização',
  'fcc-ui-preferences-v2':'Página inicial e apresentação',
  'fcc-clinical-favorites-v1':'Favoritos e recentes clínicos'
 };
 const EPHEMERAL=new Set(['fcc-home-news-cache-v4','fcc-runtime-diagnostics-v1']);
 const known=k=>Object.hasOwn(PRIVATE,k)||Object.hasOwn(PUBLIC,k);
 const names=Object.keys({...PRIVATE,...PUBLIC});
 const USER='fcc-master-user-data-v1';
 const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
 function assertObject(v,label){if(!object(v))throw new Error('Estrutura inválida: '+label);}
 function assertArray(v,label){if(!Array.isArray(v))throw new Error('Lista inválida: '+label);}
 function scalarFields(row,label){for(const [k,v]of Object.entries(row))if(v!==null&&typeof v==='object'&&!['tags','pico'].includes(k))throw new Error('Campo composto não suportado em '+label+': '+k);}
 function validateExpenses(data){
  assertObject(data,'despesas');assertArray(data.expenses,'despesas');
  if(data.version!==undefined&&data.version!==1)throw new Error('Versão de despesas não suportada.');
  for(const key of ['merchantRules','budgets','recurring','settings','deletedPlans','skippedOccurrences'])if(key in data)assertObject(data[key],key);
  if('categories'in data&&(!Array.isArray(data.categories)||data.categories.some(x=>typeof x!=='string')))throw new Error('Categorias inválidas.');
  for(const row of data.expenses){assertObject(row,'movimento');scalarFields(row,'movimento');if(typeof row.amount!=='number'||!Number.isFinite(row.amount)||row.amount<0)throw new Error('Valor de despesa inválido.');if(!Core.validCivilDate(row.date))throw new Error('Data de despesa inválida.');if(typeof row.merchant!=='string'||!row.merchant.trim())throw new Error('Movimento sem comerciante.');}
  for(const [merchant,plan]of Object.entries(data.recurring||{})){
   assertObject(plan,'recorrência');scalarFields(plan,'recorrência');
   for(const date of ['startDate','activeFrom','pausedAt','cancelledAt','lastGenerated'])if(plan[date]&&!Core.validCivilDate(plan[date]))throw new Error('Data inválida na recorrência: '+merchant);
   if(plan.frequency&&!['daily','weekly','fortnightly','monthly','quarterly','yearly'].includes(plan.frequency))throw new Error('Frequência inválida.');
   if(plan.status&&!['active','paused','cancelled'].includes(plan.status))throw new Error('Estado de recorrência inválido.');
   for(const key of ['amount','lastAmount'])if(plan[key]!==undefined&&(typeof plan[key]!=='number'||!Number.isFinite(plan[key])||plan[key]<0))throw new Error('Valor de recorrência inválido.');
   if(plan.billingDay!==undefined&&(!Number.isInteger(plan.billingDay)||plan.billingDay<1||plan.billingDay>31))throw new Error('Dia de cobrança inválido.');
  }
  for(const value of Object.values(data.budgets||{}))if(typeof value!=='number'||!Number.isFinite(value)||value<0)throw new Error('Orçamento inválido.');
  for(const value of Object.values(data.merchantRules||{}))if(typeof value!=='string')throw new Error('Regra de comerciante inválida.');
 }
 function validateSnapshot(snapshot){
  Core.validateData(snapshot);
  const idFields=new Set(['id']);
  function safeIdentifiers(v){if(v&&typeof v==='object')for(const [k,x]of Object.entries(v)){if(idFields.has(k)&&typeof x==='string'&&!/^[\p{L}\p{N}_:./ -]{1,200}$/u.test(x))throw new Error('Identificador inválido na cópia.');if(x&&typeof x==='object')safeIdentifiers(x);}}

  if(snapshot?.schemaVersion!==2||!snapshot.records||typeof snapshot.records!=='object'||Array.isArray(snapshot.records))throw new Error('Formato de cópia não suportado.');
  for(const [key,value]of Object.entries(snapshot.records)){
   if(!known(key)||typeof value!=='string')throw new Error('Chave ou valor não suportado na cópia.');
   if(['fcc-clinical-material-notes-v1','fcc-master-theme-v1','fcc-clinical-layout-compact-v1'].includes(key))continue;
   const data=Core.parseJSON(value);safeIdentifiers(data);
   if(key===USER||key.startsWith('fabio-command-center-v')){
    if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Dados de utilizador inválidos.');
    for(const field of ['inventory','people','locations','nodes','telemetry','commsTests','maintenance','costs','mods','fuelRecords','vehicleDocs','research','presets','fluidRecords']){
     if(field in data&&(!Array.isArray(data[field])||data[field].some(x=>!x||typeof x!=='object'||Array.isArray(x))))throw new Error('Lista inválida: '+field);
    }
    for(const field of ['settings','vehicles','notes','checklistState','caseStats','meta'])if(field in data)assertObject(data[field],field);
    for(const value of Object.values(data.vehicles||{}))assertObject(value,'veículo');
    for(const value of Object.values(data.notes||{}))if(typeof value!=='string')throw new Error('Nota inválida.');
    for(const field of ['inventory','people','locations','nodes','telemetry','commsTests','maintenance','costs','mods','fuelRecords','vehicleDocs','research','presets','fluidRecords'])for(const row of data[field]||[])scalarFields(row,field);
    if(data.meta?.schemaVersion&&data.meta.schemaVersion>1)throw new Error('Esquema de dados mais recente do que esta aplicação.');
   }
   if(key==='fcc-personal-favorites-v1'){
    assertObject(data,'favoritos pessoais');assertArray(data.favorites,'favoritos pessoais');
    if(data.version!==1||data.favorites.length>100)throw new Error('Favoritos pessoais inválidos.');
    const ids=new Set();
    for(const item of data.favorites){
     assertObject(item,'favorito pessoal');
     if(!['expenses','emergency','comms','garage','research'].includes(item.page)||!['','em-notes'].includes(item.sub||'')||(item.sub==='em-notes'&&item.page!=='emergency')||(item.ref||'')!==''||typeof item.title!=='string'||item.title.length>160||Object.keys(item).some(k=>!['page','sub','ref','title'].includes(k)))throw new Error('Destino pessoal inválido.');
     const id=item.page+'/'+(item.sub||'');if(ids.has(id))throw new Error('Favorito pessoal repetido.');ids.add(id);
    }
   }
   if(key==='fcc-master-expenses-v1')validateExpenses(data);
   if(key==='fcc-master-content-pack-v1'){
    if(data?.type!=='fcc-content-pack'||data.schema!==1)throw new Error('Pacote de conteúdo inválido.');
    for(const field of ['sources','drugs','cases','capabilities'])if(field in data)assertArray(data[field],field);
    for(const field of ['sources','drugs','cases'])for(const row of data[field]||[])assertObject(row,field);
    if('checklists'in data){assertObject(data.checklists,'checklists');for(const rows of Object.values(data.checklists)){assertArray(rows,'checklist');if(rows.some(x=>!Array.isArray(x)||x.some(v=>typeof v!=='string')))throw new Error('Linha de checklist inválida.');}}
   }
   if(key==='fcc-master-subcategory-order-v1'){assertObject(data,'ordenação');if(Object.values(data).some(x=>!Array.isArray(x)||x.some(v=>typeof v!=='string')))throw new Error('Ordem de categorias inválida.');}
   if(['fcc-ui-preferences-v2','fcc-clinical-favorites-v1','fcc-theme-manual-until-v2','fcc-clinical-case-stats-v2','fcc-case-review-v1'].includes(key))assertObject(data,key);
  }
  return snapshot;
 }
 return function createStore({storage,crypto,locks=null,emit=()=>{}}){
  let key=null,kdf=null,records=Object.create(null),lastDisk=null,queue=Promise.resolve(),pending=0,lastError=null,conflict=false,revision=0,transactionBusy=false,migrationWarning='';
  const enc=new TextEncoder(),dec=new TextDecoder();
  const exclusive=fn=>locks?.request?locks.request('fcc-vault-write-v2',{mode:'exclusive'},fn):fn();
  const announce=(status,error='')=>emit('fcc-storage-status',{status,pending,error});
  const requireOpen=()=>{if(!key)throw new Error('Desbloqueia o cofre local.');if(conflict)throw new Error('Os dados foram alterados noutra janela. Guarda uma cópia antes de recarregar.');};
  function b64(a){let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s);}
  function bytes(s){if(typeof s!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(s)||s.length>20000000)throw new Error('Conteúdo cifrado inválido.');return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
  function secure(){if(!crypto?.subtle||!crypto?.getRandomValues)throw new Error('Cifragem indisponível neste navegador. Os dados originais não foram alterados.');}
  function random(n){return crypto.getRandomValues(new Uint8Array(n));}
  async function derive(pass,params){
   secure();
   if(typeof pass!=='string'||pass.length>1024)throw new Error('Frase-passe inválida.');
   if(params?.name!=='PBKDF2'||params.hash!=='SHA-256'||!Number.isInteger(params.iterations)||params.iterations<600000||params.iterations>2000000||bytes(params.salt).length!==16)throw new Error('Parâmetros de cifragem não suportados.');
   const material=await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveKey']);
   return crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(params.salt),iterations:params.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function seal(payload,secret=key,params=kdf,type='fcc-local-vault'){
   secure();if(!secret)throw new Error('Cofre bloqueado.');
   const iv=random(12),data=enc.encode(JSON.stringify(payload));
   const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(type+'|2'),tagLength:128},secret,data);
   return {type,version:2,kdf:{...params},cipher:'AES-GCM',iv:b64(iv),data:b64(new Uint8Array(encrypted))};
  }
  async function unseal(envelope,secret){
   if(!['fcc-local-vault','fcc-complete-backup'].includes(envelope?.type)||envelope.version!==2||envelope.cipher!=='AES-GCM'||bytes(envelope.iv).length!==12)throw new Error('Cópia cifrada não suportada.');
   try{
    const value=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(envelope.iv),additionalData:enc.encode(envelope.type+'|2'),tagLength:128},secret,bytes(envelope.data));
    return Core.parseJSON(dec.decode(value));
   }catch(e){throw new Error('Frase-passe incorreta ou cópia danificada. Nenhum dado foi substituído.');}
  }
  function publicRecords(){const out={};for(const k of Object.keys(PUBLIC)){const v=storage.getItem(k);if(v!==null)out[k]=v;}return out;}
  function snapshot(){requireOpen();return validateSnapshot({schemaVersion:2,records:{...records,...publicRecords()}});}
  function rollback(journal){
   if(journal.vault===null)storage.removeItem(VAULT);else storage.setItem(VAULT,journal.vault);
   for(const k of Object.keys(PUBLIC)){if(Object.hasOwn(journal.public,k))storage.setItem(k,journal.public[k]);else storage.removeItem(k);}
   storage.removeItem(JOURNAL);
  }
  // A interrupted import is rolled back before any module reads its data.
  const interrupted=storage.getItem(JOURNAL);
  if(interrupted){try{const j=Core.parseJSON(interrupted);if(j&&typeof j.public==='object'&&(typeof j.vault==='string'||j.vault===null))rollback(j);else throw new Error('journal');}catch(e){lastError=new Error('Recuperação pendente. Não são permitidas alterações até recuperar a cópia local.');}}
  async function commit(next){return exclusive(async()=>{
   requireOpen();
   if(storage.getItem(VAULT)!==lastDisk){conflict=true;throw new Error('Conflito com outra janela. Exporta a cópia em memória antes de recarregar.');}
   const envelope=await seal({schemaVersion:2,records:next,revision:revision+1,updatedAt:new Date().toISOString()});
   const serialized=JSON.stringify(envelope);
   if(storage.getItem(VAULT)!==lastDisk){conflict=true;throw new Error('Conflito com outra janela durante a gravação.');}
   storage.setItem(VAULT,serialized);lastDisk=serialized;revision++;
  });}
  function enqueue(next){
   pending++;announce('saving');
   const job=queue.catch(()=>{}).then(()=>commit(next)).then(()=>{lastError=null;}).catch(e=>{lastError=e;throw e;}).finally(()=>{pending--;announce(lastError?'error':pending?'saving':'saved',lastError?.message||'');});
   queue=job;job.catch(()=>{});return job;
  }
  async function flush(){await queue;if(lastError)throw lastError;}
  function getItem(k){
   if(Object.hasOwn(PRIVATE,k))return key?records[k]??null:null;
   if(Object.hasOwn(PUBLIC,k)||EPHEMERAL.has(k))return storage.getItem(k);
   return null;
  }
  function setItem(k,v){
   v=String(v);
   if(Object.hasOwn(PRIVATE,k)){requireOpen();if(transactionBusy)throw new Error('Importação em curso. Aguarda antes de editar.');validateSnapshot({schemaVersion:2,records:{[k]:v}});records[k]=v;return enqueue({...records});}
   if(Object.hasOwn(PUBLIC,k)||EPHEMERAL.has(k)){if(transactionBusy&&Object.hasOwn(PUBLIC,k))throw new Error('Importação em curso.');if(Object.hasOwn(PUBLIC,k))validateSnapshot({schemaVersion:2,records:{[k]:v}});storage.setItem(k,v);return Promise.resolve();}
   throw new Error('Chave fora do inventário de dados da aplicação.');
  }
  function removeItem(k){
   if(Object.hasOwn(PRIVATE,k)){requireOpen();if(transactionBusy)throw new Error('Importação em curso. Aguarda antes de editar.');delete records[k];return enqueue({...records});}
   if(Object.hasOwn(PUBLIC,k)||EPHEMERAL.has(k)){if(transactionBusy&&Object.hasOwn(PUBLIC,k))throw new Error('Importação em curso.');storage.removeItem(k);return Promise.resolve();}
   throw new Error('Chave fora do inventário de dados da aplicação.');
  }
  function cleanupLegacy(verified){
   migrationWarning='';
   for(const k of Object.keys(PRIVATE)){
    const raw=storage.getItem(k);if(raw===null)continue;
    if(!Object.hasOwn(verified,k)||raw!==verified[k]){migrationWarning='Existe uma cópia antiga diferente no navegador. Não foi apagada; requer revisão e exportação segura.';continue;}
    try{storage.removeItem(k);}catch{migrationWarning='A cifragem foi concluída, mas o navegador não permitiu remover todas as cópias antigas sem cifragem.';}
   }
   if(migrationWarning)emit('fcc-migration-warning',{message:migrationWarning});
  }
  async function create(pass){return exclusive(async()=>{
   secure();if(storage.getItem(VAULT))throw new Error('Já existe um cofre neste navegador. Desbloqueia-o; não será substituído.');
   if(lastError)throw lastError;
   if(typeof pass!=='string'||pass.length<14||pass.length>1024||/^\d+$/.test(pass)||new Set(pass).size<6)throw new Error('Usa uma frase-passe de pelo menos 14 caracteres, não apenas números.');
   const legacy={};for(const k of Object.keys(PRIVATE)){const v=storage.getItem(k);if(v!==null)legacy[k]=v;}
   validateSnapshot({schemaVersion:2,records:legacy});
   const params={name:'PBKDF2',hash:'SHA-256',iterations:600000,salt:b64(random(16))};
   const secret=await derive(pass,params),payload={schemaVersion:2,records:legacy,revision:1,updatedAt:new Date().toISOString()};
   const envelope=await seal(payload,secret,params),serialized=JSON.stringify(envelope);
   if(storage.getItem(VAULT))throw new Error('Foi criado um cofre noutra janela. Os dados originais não foram alterados.');
   storage.setItem(VAULT,serialized);
   const verified=await unseal(Core.parseJSON(storage.getItem(VAULT)),secret);
   if(JSON.stringify(verified.records)!==JSON.stringify(legacy))throw new Error('A migração não foi confirmada; os dados originais foram preservados.');
   key=secret;kdf=params;records={...legacy};lastDisk=serialized;revision=1;
   // Only remove original plaintext after durable write and authenticated read-back.
   cleanupLegacy(legacy);
   emit('fcc-vault-unlocked',{migrated:Object.keys(legacy).length});announce('saved');return true;
  });}
  async function unlock(pass){
   secure();if(pending||transactionBusy)throw new Error('Espera que a gravação atual termine.');if(lastError&&storage.getItem(JOURNAL))throw lastError;
   const raw=storage.getItem(VAULT);if(!raw)throw new Error('Ainda não existe um cofre local.');
   const envelope=Core.parseJSON(raw),secret=await derive(pass,envelope.kdf),payload=await unseal(envelope,secret);
   validateSnapshot(payload);
   key=secret;kdf=envelope.kdf;records=Object.fromEntries(Object.entries(payload.records).filter(([k])=>Object.hasOwn(PRIVATE,k)));lastDisk=raw;revision=payload.revision||0;conflict=false;lastError=null;
   cleanupLegacy(records);emit('fcc-vault-unlocked',{migrated:0});announce('saved');return true;
  }
  async function lock(){await flush();key=null;kdf=null;records=Object.create(null);emit('fcc-vault-locked',{});announce('locked');}
  async function exportBackup(){requireOpen();await flush();return seal({...snapshot(),exportedAt:new Date().toISOString(),appVersion:Core.VERSION,includes:names,excludes:['Notícias em cache','Logs técnicos','Páginas externas e ficheiros não guardados']},key,kdf,'fcc-complete-backup');}
  async function readBackup(envelope,pass){
   if(envelope?.type==='fcc-complete-backup'){
    const secret=await derive(pass,envelope.kdf);return validateSnapshot(await unseal(envelope,secret));
   }
   if(envelope?.type==='fcc-master-backup'&&envelope.schemaVersion===1){
    const restored={[USER]:JSON.stringify(envelope.data)};
    if(envelope.contentPack)restored['fcc-master-content-pack-v1']=JSON.stringify(envelope.contentPack);
    return {...validateSnapshot({schemaVersion:2,records:restored}),legacy:true};
   }
   throw new Error('Tipo ou versão de cópia não suportado.');
  }
  async function transaction(incoming,{merge=false}={}){
   requireOpen();if(transactionBusy)throw new Error('Já existe uma importação em curso.');transactionBusy=true;try{await flush();return await exclusive(async()=>{validateSnapshot(incoming);
   const next=merge?{...snapshot().records,...incoming.records}:{...incoming.records};
   validateSnapshot({schemaVersion:2,records:next});
   if(storage.getItem(VAULT)!==lastDisk)throw new Error('Conflito de dados noutra janela.');
   const journal={vault:lastDisk,public:publicRecords()},nextPrivate=Object.fromEntries(Object.entries(next).filter(([k])=>Object.hasOwn(PRIVATE,k)));
   const envelope=await seal({schemaVersion:2,records:nextPrivate,revision:revision+1,updatedAt:new Date().toISOString()}),serialized=JSON.stringify(envelope);
   if(storage.getItem(VAULT)!==lastDisk){conflict=true;throw new Error('Conflito com outra janela durante a importação.');}
   try{
    storage.setItem(JOURNAL,JSON.stringify(journal));
    storage.setItem(PREVIOUS,JSON.stringify(journal));
    storage.setItem(VAULT,serialized);
    for(const k of Object.keys(PUBLIC)){if(Object.hasOwn(next,k))storage.setItem(k,next[k]);else storage.removeItem(k);}
    storage.removeItem(JOURNAL);
   }catch(e){try{rollback(journal);}catch(recovery){lastError=new Error('Recuperação local pendente. Não feches esta janela sem guardar uma cópia.');}throw new Error('Importação não aplicada: '+(lastError?.message||e.message));}
   records={...nextPrivate};lastDisk=serialized;revision++;lastError=null;emit('fcc-data-replaced',{});announce('saved');return true;
  });}finally{transactionBusy=false;}}
  async function restorePrevious(){
   requireOpen();const j=Core.parseJSON(storage.getItem(PREVIOUS)||'null');if(!j?.vault)throw new Error('Sem ponto de recuperação.');
   const payload=await unseal(Core.parseJSON(j.vault),key);
   return transaction({schemaVersion:2,records:{...payload.records,...j.public}});
  }
  async function reset(scope){
   const data=snapshot();let selected;
   if(scope==='preferences')selected=Object.keys(PUBLIC);
   else if(scope==='expenses')selected=['fcc-master-expenses-v1'];
   else if(scope==='all')selected=names;
   else throw new Error('Âmbito de reposição desconhecido.');
   selected.forEach(k=>delete data.records[k]);await transaction(data);return selected;
  }
  function status(){return {configured:!!storage.getItem(VAULT),unlocked:!!key,pending:pending+(transactionBusy?1:0),migrationWarning,error:lastError?.message||'',conflict,hasPrevious:!!storage.getItem(PREVIOUS),legacyKeys:Object.keys(PRIVATE).filter(k=>storage.getItem(k)!==null).length};}
  function checkExternalChange(){if(key&&storage.getItem(VAULT)!==lastDisk){conflict=true;announce('error','Outra janela alterou o cofre. Exporta a cópia em memória antes de recarregar.');}}
  async function emergencyBackup(){if(!key)throw new Error('Cofre bloqueado.');return seal({...validateSnapshot({schemaVersion:2,records:{...records,...publicRecords()}}),exportedAt:new Date().toISOString(),recovery:true},key,kdf,'fcc-complete-backup');}
  return Object.freeze({getItem,setItem,removeItem,create,unlock,lock,flush,snapshot,exportBackup,readBackup,transaction,restorePrevious,reset,status,checkExternalChange,emergencyBackup,validateSnapshot,registry:{private:{...PRIVATE},public:{...PUBLIC}},keys:{vault:VAULT,previous:PREVIOUS,journal:JOURNAL}});
 };
});
