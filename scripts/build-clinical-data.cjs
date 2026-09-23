/* Derive runtime data from preserved public source records. No private user state is read. */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),vm=require('vm');let acorn;try{acorn=require('acorn')}catch{acorn=require('internal/deps/acorn/acorn/dist/acorn')}
process.chdir(path.resolve(__dirname,'..'));
const read=p=>fs.readFileSync(p,'utf8'),write=(p,s)=>fs.writeFileSync(p,s);
function decode(files,pattern){let b64='';for(const file of files){const m=read(file).match(pattern);if(!m)throw Error('Missing data: '+file);b64+=m[1]}return JSON.parse(zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8'))}
const files=fs.readdirSync('.'),antibiotics=JSON.parse(read('data/antibiotics-recovered.json'));
if(antibiotics.records.length!==66)throw Error('Incomplete antibiotic transcription');
const stability=decode(files.filter(x=>/^cuf-inf1030-chunk-\d+\.js$/.test(x)).sort(),/\.push\('([^']+)'\)/),high=decode(files.filter(x=>/^cuf-imp1636-chunk-\d+\.js$/.test(x)).sort(),/\.push\("([^"]+)"\)/);
write('data/institutional.json',JSON.stringify({antibiotics,stability}));write('data/high-alert.json',JSON.stringify(high));
function constant(file,name){const text=read(file),ast=acorn.parse(text,{ecmaVersion:'latest'});let found;function walk(n){if(!n||typeof n!=='object')return;if(n.type==='VariableDeclarator'&&n.id?.name===name)found=n.init;for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v)}walk(ast);if(!found)throw Error('Missing '+name);return vm.runInNewContext('('+text.slice(found.start,found.end)+')',Object.create(null),{timeout:1000})}
const brands=constant('medication-brands-v1.js','BRANDS');write('data/brand-names.json',JSON.stringify(brands));write('data/case-sources.json',JSON.stringify(constant('clinical-cases-bank-v2.js','SOURCES')));
require('child_process').execFileSync('python3',['scripts/apply-medication-corrections-20260923.py'],{stdio:'inherit'});
const C=require('../fcc-core.js'),records=JSON.parse(read('data/medications.json')),cases=JSON.parse(read('data/cases.json')),dressings=JSON.parse(read('data/dressings.json')),index=[];
for(const r of records)index.push({title:r.n,text:[r.g,r.q,r.use,r.pd,r.routeVariant].filter(Boolean).join(' '),type:'Medicação',page:'clinical',sub:'clin-drugs',ref:'m-'+C.fold(r.n).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')});
for(const [name,values]of Object.entries(brands)){const r=index.find(x=>C.fold(x.title)===C.fold(name));if(r)r.text+=' '+values.join(' ')}
for(const c of cases)index.push({title:c.topic+' · '+c.subtopic+' · variante '+c.variant,text:c.text,type:'Caso clínico',page:'clinical',sub:'clin-cases',ref:c.id});
for(const d of dressings)index.push({title:d.name,text:[d.indication,d.components,...(d.tags||[]),'aposito apositos pensos material'].join(' '),type:'Apósitos',page:'clinical',sub:'clin-dressings',ref:''});
for(const d of JSON.parse(read('data/dilutions.json')))if(d.name)index.push({title:d.name,text:d.text,type:'Diluição',page:'clinical',sub:'clin-perf',ref:''});
for(const name of JSON.parse(read('data/ivNames.json')))index.push({title:name,text:'compatibilidade intravenosa y site',type:'Compatibilidade IV',page:'clinical',sub:'clin-ivcompat',ref:''});
write('data/search-index.json',JSON.stringify(index));console.log('Canonical runtime data generated: '+index.length+' public search entries.');
