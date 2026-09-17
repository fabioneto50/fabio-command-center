/* Regression tests exercise the production core, vault and recurring engine. Synthetic data only. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
const require=createRequire(import.meta.url),C=require('../fcc-core.js'),storeFactory=require('../fcc-store.js');
const root=path.resolve(import.meta.dirname,'..'),P='uma frase sintética longa 2026',USER='fcc-master-user-data-v1',EXP='fcc-master-expenses-v1';
class MemoryStorage{
 map=new Map();fail=null;
 getItem(k){return this.map.has(k)?this.map.get(k):null;}
 setItem(k,v){if(this.fail?.(k,v))throw new Error('QuotaExceededError (synthetic)');this.map.set(k,String(v));}
 removeItem(k){if(this.fail?.(k,null))throw new Error('Storage deletion blocked (synthetic)');this.map.delete(k);}
}
const make=(storage=new MemoryStorage())=>{let events=[];return {s:storeFactory({storage,crypto:webcrypto,emit:(t,d)=>events.push([t,d])}),storage,events};};
const input={amount:'8',amountUnit:'mg',volume:'50',weight:'70',doseUnit:'mcgkgmin',value:'0.1'};
const near=(a,b)=>assert.ok(Math.abs(a-b)<Math.max(1e-8,Math.abs(b)*1e-10),`${a} != ${b}`);
for(const [direction,value,expected] of [['doseToRate','0.1',2.625],['rateToDose',2.625,.1]])test(`CLI01 ${direction} canonical arithmetic`,()=>near(C.infusion({...input,value},direction).value,expected));
for(const dir of ['doseToRate','rateToDose']){
 for(const [amountUnit,doseUnit] of [['mg','uih'],['mcg','uikgh'],['UI','mcgkgmin'],['UI','mgkgh']])test(`CLI01 ${dir} rejects ${amountUnit}/${doseUnit}`,()=>assert.throws(()=>C.infusion({...input,amountUnit,doseUnit},dir),/incompatíveis/));
 for(const [field,value]of [['amount',''],['volume',''],['value',''],['weight',''],['weight',0],['weight',-70],['amount',0],['volume',0],['value',-1],['amount','Infinity'],['volume','NaN'],['amount','1e400'],['amountUnit','IU'],['doseUnit','unknown']])test(`CLI02 ${dir} rejects ${field}=${value}`,()=>assert.throws(()=>C.infusion({...input,[field]:value},dir)));
 test(`CLI02 ${dir} explicit zero accepted`,()=>assert.equal(C.infusion({...input,value:0},dir).value,0));
}
for(const doseUnit of Object.keys(C.UNITS))test(`CLI01 round trip ${doseUnit}`,()=>{const options={...input,doseUnit,amountUnit:C.UNITS[doseUnit].family==='UI'?'UI':'mg',value:.23};const rate=C.infusion(options,'doseToRate').value;near(C.infusion({...options,value:rate},'rateToDose').value,.23);});
for(const unit of ['mg','mcg','g'])test(`CLI01 mass unit ${unit}`,()=>near(C.infusion({...input,amount:{mg:8,mcg:8000,g:.008}[unit],amountUnit:unit},'doseToRate').value,2.625));
test('CLI02 comma decimal',()=>near(C.infusion({...input,value:'0,1'},'doseToRate').value,2.625));
for(const s of ['1,000.50','1.000,50','12 300','true','<svg>','0x10'])test('CLI02 ambiguous number '+s,()=>assert.throws(()=>C.number(s,'value')));
test('CLI03 blank sepsis cannot be all clear',()=>{const s=C.sepsis({});assert.equal(s.complete,false);assert.equal(s.missing.length,6);assert.ok(s.alerts.some(a=>a.title.startsWith('Dados insuficientes')));});
test('CLI03 urine zero separate from missing',()=>{assert.ok(C.sepsis({urine:0}).alerts.some(a=>a.title==='Diurese zero introduzida'));assert.ok(!C.sepsis({}).alerts.some(a=>a.title==='Diurese zero introduzida'));});
for(const value of [-1,'NaN','Infinity','x'])test('CLI03 invalid urine '+value,()=>assert.throws(()=>C.sepsis({urine:value})));
test('CLI03 complete with no alerts is qualified',()=>{const s=C.sepsis({weight:70,age:55,map:80,lactate:1,urine:1,crt:2,shock:'no'});assert.equal(s.complete,true);assert.match(s.alerts[0].text,/não exclui/);});
test('DAT04 Lisbon civil day at midnight in summer',()=>assert.equal(C.civilDate('2026-09-15T23:30:00Z'),'2026-09-16'));
test('DAT04 Lisbon civil day in winter',()=>assert.equal(C.civilDate('2026-01-15T23:30:00Z'),'2026-01-15'));
for(const date of ['2024-02-29','2026-09-16','2026-01-31'])test('DAT04 valid '+date,()=>assert.equal(C.validCivilDate(date),true));
for(const date of ['2025-02-29','2026-02-31','2026-13-01','2026-00-01','today'])test('DAT04 rejects '+date,()=>assert.equal(C.validCivilDate(date),false));
for(const json of ['{"__proto__":{"polluted":1}}','{"nested":{"constructor":1}}'])test('SEC02 prototype keys rejected '+json,()=>assert.throws(()=>C.parseJSON(json)));
test('DAT02 oversized JSON rejected',()=>assert.throws(()=>C.parseJSON(' '.repeat(12000001))));
const data={version:1,people:[{id:'p-1',name:'SYNTHETIC SECRET',contact:'000000000'}],notes:{general:'synthetic private note'},vehicles:{africa:{km:42},polaris:{usage:''}},meta:{schemaVersion:1}};
const exp={version:1,expenses:[{id:'e-1',merchant:'Synthetic merchant',amount:12,date:'2026-09-01'}],recurring:{},budgets:{},merchantRules:{},categories:['Outros'],settings:{currency:'EUR'}};
test('SEC02 migration, encryption, lock and wrong passphrase preserve data',async()=>{
 const {s,storage}=make();storage.setItem(USER,JSON.stringify(data));storage.setItem(EXP,JSON.stringify(exp));storage.setItem('foreign-app','KEEP');
 assert.equal(s.getItem(USER),null);await s.create(P);assert.equal(storage.getItem(USER),null);assert.equal(storage.getItem(EXP),null);
 const encrypted=storage.getItem(s.keys.vault);assert.ok(!encrypted.includes('SYNTHETIC SECRET'));assert.equal(JSON.parse(s.getItem(USER)).people[0].name,'SYNTHETIC SECRET');
 await s.lock();assert.equal(s.getItem(USER),null);assert.throws(()=>s.setItem(USER,'{}'),/Desbloqueia/);await assert.rejects(s.unlock('wrong'),/incorreta/);assert.equal(storage.getItem(s.keys.vault),encrypted);
 await s.unlock(P);assert.deepEqual(JSON.parse(s.getItem(EXP)),exp);assert.equal(storage.getItem('foreign-app'),'KEEP');
});
test('SEC02 setup rejects weak passphrase without losing legacy',async()=>{const {s,storage}=make();storage.setItem(USER,JSON.stringify(data));await assert.rejects(s.create('12345678901234'));assert.equal(storage.getItem(s.keys.vault),null);assert.equal(storage.getItem(USER),JSON.stringify(data));});
test('SEC02 migration quota failure preserves original bytes',async()=>{const {s,storage}=make();storage.setItem(USER,JSON.stringify(data));storage.fail=k=>k===s.keys.vault;await assert.rejects(s.create(P));assert.equal(s.status().unlocked,false);assert.equal(storage.getItem(USER),JSON.stringify(data));});
test('SEC02 migration cleanup failure warns and recovers on unlock',async()=>{const {s,storage}=make();storage.setItem(USER,JSON.stringify(data));storage.fail=(k,v)=>k===USER&&v===null;await s.create(P);assert.match(s.status().migrationWarning,/cópias antigas/);assert.equal(storage.getItem(USER),JSON.stringify(data));storage.fail=null;await s.lock();await s.unlock(P);assert.equal(storage.getItem(USER),null);});
test('DAT01 full backup round trip all modules into clean vault',async()=>{
 const {s}=make();await s.create(P);await s.setItem(USER,JSON.stringify(data));await s.setItem(EXP,JSON.stringify(exp));await s.setItem('fcc-clinical-material-notes-v1','MATERIAL SYNTHETIC');await s.setItem('fcc-case-review-v1',JSON.stringify({foo:{correct:1,total:2}}));await s.setItem('fcc-ui-preferences-v2',JSON.stringify({home:'clinical',compact:true}));await s.setItem('fcc-master-subcategory-order-v1',JSON.stringify({clinical:['clin-cases','clin-drugs']}));
 const before=s.snapshot(),backup=await s.exportBackup();assert.equal(backup.type,'fcc-complete-backup');assert.ok(!JSON.stringify(backup).includes('SYNTHETIC'));
 const other=make().s;await other.create('another long synthetic phrase');await other.transaction(await other.readBackup(backup,P));assert.deepEqual(other.snapshot(),before);
 const damaged={...backup,data:backup.data.slice(0,-8)+'AAAAAAAA'};await assert.rejects(other.readBackup(damaged,P));assert.deepEqual(other.snapshot(),before);
});
test('DAT02 import preview has no mutations, replacement and undo verified',async()=>{const{s}=make();await s.create(P);await s.setItem(USER,JSON.stringify(data));await s.setItem(EXP,JSON.stringify(exp));const before=s.snapshot();const snap=await s.readBackup({type:'fcc-master-backup',schemaVersion:1,data:{...data,people:[]}},'');assert.deepEqual(s.snapshot(),before);await s.transaction(snap,{merge:true});assert.equal(JSON.parse(s.getItem(USER)).people.length,0);assert.deepEqual(JSON.parse(s.getItem(EXP)),exp);await s.restorePrevious();assert.deepEqual(s.snapshot(),before);});
test('DAT02 failed import rolls back atomically',async()=>{const {s,storage}=make();await s.create(P);await s.setItem(USER,JSON.stringify(data));const before=s.snapshot(),raw=storage.getItem(s.keys.vault);let once=true;storage.fail=(k,v)=>{if(k==='fcc-ui-preferences-v2'&&v!==null&&once){once=false;return true;}return false;};const snap={schemaVersion:2,records:{[USER]:'{}','fcc-ui-preferences-v2':'{"compact":true}'}};await assert.rejects(s.transaction(snap));assert.equal(storage.getItem(s.keys.vault),raw);assert.deepEqual(s.snapshot(),before);assert.equal(storage.getItem(s.keys.journal),null);});
test('DAT02 interrupted import journal recovered before read',async()=>{const {s,storage}=make();await s.create(P);await s.setItem(USER,JSON.stringify(data));const raw=storage.getItem(s.keys.vault);storage.setItem(s.keys.journal,JSON.stringify({vault:raw,public:{}}));storage.setItem(s.keys.vault,'interrupted-write');const recovered=make(storage).s;await recovered.unlock(P);assert.deepEqual(JSON.parse(recovered.getItem(USER)),data);assert.equal(storage.getItem(s.keys.journal),null);});
test('DAT03 scoped reset and undo never touches other apps',async()=>{const {s,storage}=make();await s.create(P);await s.setItem(USER,JSON.stringify(data));await s.setItem(EXP,JSON.stringify(exp));storage.setItem('other','KEEP');const before=s.snapshot();await s.reset('expenses');assert.equal(s.getItem(EXP),null);assert.equal(s.getItem(USER),before.records[USER]);await s.restorePrevious();assert.deepEqual(s.snapshot(),before);await s.reset('all');assert.deepEqual(Object.keys(s.snapshot().records),[]);assert.equal(storage.getItem('other'),'KEEP');await s.restorePrevious();assert.deepEqual(s.snapshot(),before);});
test('SEC04 concurrent window conflict cannot silently overwrite',async()=>{const {s,storage}=make();await s.create(P);const other=make(storage).s;await other.unlock(P);await s.setItem(USER,JSON.stringify(data));await assert.rejects(other.setItem(USER,'{}'),/Conflito/);assert.equal(other.status().conflict,true);const emergency=await other.emergencyBackup();assert.equal(emergency.type,'fcc-complete-backup');await s.lock();await s.unlock(P);assert.deepEqual(JSON.parse(s.getItem(USER)),data);});
test('DAT02 transaction excludes concurrent edits',async()=>{const {s}=make();await s.create(P);const tr=s.transaction({schemaVersion:2,records:{[USER]:JSON.stringify(data)}});assert.throws(()=>s.setItem(USER,'{}'),/Importação/);await tr;assert.deepEqual(JSON.parse(s.getItem(USER)),data);});
for(const [key,value]of [[USER,{vehicles:null}],[USER,{people:{}}],[USER,{people:[null]}],[USER,{people:[{id:"x' onclick='bad"}]}],[USER,{notes:{general:{}}}],[EXP,{expenses:[{merchant:'A',amount:'12',date:'2026-09-16'}]}],[EXP,{expenses:[],budgets:null}],[EXP,{expenses:[],recurring:{a:{startDate:'2026-02-31'}}}],['fcc-master-content-pack-v1',{type:'fcc-content-pack',schema:1,sources:null}],['fcc-master-subcategory-order-v1',{clinical:'x'}]])test('DAT02 rejects malformed '+key+' '+JSON.stringify(value),()=>assert.throws(()=>make().s.validateSnapshot({schemaVersion:2,records:{[key]:JSON.stringify(value)}})));
test('DAT02 registry disallows arbitrary storage key',()=>assert.throws(()=>make().s.validateSnapshot({schemaVersion:2,records:{'unrelated-app':'{}'}})));
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'data/medications.json'))),bank=JSON.parse(fs.readFileSync(path.join(root,'data/cases.json')));
test('PER03 canonical records preserved: 923, 276 replacements, unique stable IDs',()=>{assert.equal(catalogue.length,923);assert.equal(catalogue.filter(x=>x.med1114).length,276);assert.equal(new Set(catalogue.map(x=>C.fold(x.n).replace(/[^a-z0-9]+/g,'-'))).size,923);});
test('BUS04 exactly 200 variants; objective-aware sample no duplicates',()=>{assert.equal(bank.length,200);const sample=C.sampleCases(bank,10);assert.equal(sample.length,10);assert.equal(new Set(sample.map(C.objective)).size,10);});
for(let i=0;i<10;i++)test('BUS04 answer identity survives shuffled choices '+i,()=>{for(const c of bank){const shuffled=C.shuffleCase(c);assert.equal(shuffled.choices[shuffled.correct],c.choices[c.correct]);assert.equal(shuffled.choiceIds[shuffled.correct],c.id+':'+c.correct);}});
test('CLI04 recovered source has 66 route records, 31 names and all 8 pages',()=>{const data=JSON.parse(fs.readFileSync(path.join(root,'data/antibiotics-recovered.json')));const rows=data.rows||data.records;assert.equal(rows.length,66);assert.equal(new Set(rows.map(x=>x.drug)).size,31);assert.equal(new Set(rows.map(x=>x.page)).size,8);});
function recurring(){const rows=new Map(),window={dispatchEvent(){}};const ctx={window,FCCCore:C,FCCStore:{status:()=>({unlocked:true}),getItem:k=>rows.get(k)||null,setItem:(k,v)=>{rows.set(k,v);return Promise.resolve();}},Date,console,queueMicrotask:()=>{},CustomEvent:class{},setTimeout:()=>{}};vm.runInNewContext(fs.readFileSync(path.join(root,'expense-recurring-engine.js'),'utf8'),ctx);return {E:window.FCCRecurringEngine,rows};}
const plan={id:'rec-synthetic',merchant:'Synthetic monthly',frequency:'monthly',billingDay:31,startDate:'2024-01-31',activeFrom:'2024-01-31',amount:10,status:'active'};
test('DAT04 month end and leap year recurrence',()=>{const{E}=recurring();assert.deepEqual(Array.from(E.occurrences(plan,'2024-03-31')),['2024-01-31','2024-02-29','2024-03-31']);});
test('DAT04 yearly leap date clamped',()=>{const{E}=recurring();assert.deepEqual(Array.from(E.occurrences({...plan,frequency:'yearly',billingDay:29,startDate:'2024-02-29',activeFrom:'2024-02-29'},'2026-03-01')),['2024-02-29','2025-02-28','2026-02-28']);});
for(const status of ['paused','cancelled'])test('DAT04 stopped plans generate nothing '+status,()=>{const{E}=recurring();assert.equal(E.occurrences({...plan,status},'2026-09-16').length,0);});
test('DAT04 deleted plan not resurrected by old expense',()=>{const{E}=recurring();const state={expenses:[{id:'1',merchant:'Synthetic monthly',amount:10,date:'2024-01-31',recurring:true}],recurring:{'Synthetic monthly':plan}};E.write(state);E.removePlan('Synthetic monthly');E.processDue();assert.equal(Object.keys(E.read().recurring).length,0);});
test('DAT04 processing is idempotent and skipped occurrence stays deleted',()=>{const{E}=recurring();const start=E.today(),p={...plan,startDate:start,activeFrom:start,billingDay:Number(start.slice(-2))};E.write({expenses:[],recurring:{[p.merchant]:p}});assert.equal(E.processDue(),1);assert.equal(E.processDue(),0);const first=E.read().expenses[0];E.removeMovement(first.id);assert.equal(E.processDue(),0);assert.equal(E.read().expenses.length,0);});
test('QA01 displayed self diagnostics call same production functions',()=>assert.ok(C.selfTests().every(x=>x.pass)));

// Ordinary editor writes must obey the same schema as restored backups.
test('DAT02 invalid ordinary private write cannot poison the vault',async()=>{const{s,storage}=make();await s.create(P);await s.setItem(USER,JSON.stringify(data));const raw=storage.getItem(s.keys.vault),before=s.getItem(USER);assert.throws(()=>s.setItem(USER,'{"people":"invalid"}'),/Lista inválida/);assert.equal(s.getItem(USER),before);assert.equal(storage.getItem(s.keys.vault),raw);await s.lock();await s.unlock(P);assert.deepEqual(JSON.parse(s.getItem(USER)),data);});
test('DAT02 malformed public preference cannot poison a complete backup',async()=>{const{s,storage}=make();await s.create(P);assert.throws(()=>s.setItem('fcc-ui-preferences-v2','[]'),/Estrutura inválida/);assert.equal(storage.getItem('fcc-ui-preferences-v2'),null);assert.equal((await s.exportBackup()).type,'fcc-complete-backup');});

// Library personal favorites: encrypted storage and strict destinations.

const PERSONAL_FAV='fcc-personal-favorites-v1';
const personalFav={version:1,favorites:[{page:'expenses',sub:'',ref:'',title:'Despesas'},{page:'emergency',sub:'em-notes',ref:'',title:'Notas'}]};
test('LIB01 personal favorites are private and survive complete backup restore',async()=>{
 const {s,storage}=make();await s.create(P);await s.setItem(PERSONAL_FAV,JSON.stringify(personalFav));
 assert.equal(storage.getItem(PERSONAL_FAV),null);assert.ok(!storage.getItem(s.keys.vault).includes('Despesas'));
 const backup=await s.exportBackup();await s.lock();assert.equal(s.getItem(PERSONAL_FAV),null);await s.unlock(P);
 assert.deepEqual(JSON.parse(s.getItem(PERSONAL_FAV)),personalFav);
 const target=make();await target.s.create(P+' destino');const snapshot=await target.s.readBackup(backup,P);await target.s.transaction(snapshot);
 assert.deepEqual(JSON.parse(target.s.getItem(PERSONAL_FAV)),personalFav);assert.equal(target.storage.getItem(PERSONAL_FAV),null);
});
for(const bad of [
 {version:2,favorites:[]}, {version:1,favorites:'no'},
 {version:1,favorites:[{page:'clinical',sub:'clin-drugs',title:'Wrong scope'}]},
 {version:1,favorites:[{page:'expenses',sub:'em-notes',title:'Wrong route'}]},
 {version:1,favorites:[{page:'expenses',title:'No data',notes:'must not be here'}]},
 {version:1,favorites:[personalFav.favorites[0],personalFav.favorites[0]]}
])test('LIB02 reject malformed private favorites '+JSON.stringify(bad),()=>assert.throws(()=>make().s.validateSnapshot({schemaVersion:2,records:{[PERSONAL_FAV]:JSON.stringify(bad)}})));

