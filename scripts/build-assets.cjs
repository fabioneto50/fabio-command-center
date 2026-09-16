/* Deterministic versioned assets: prevents a legacy worker returning old code for new URLs. */
'use strict';const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm');let acorn;try{acorn=require('acorn');}catch{acorn=require('internal/deps/acorn/acorn/dist/acorn');}
const root=path.resolve(__dirname,'..');process.chdir(root);const read=p=>fs.readFileSync(p,'utf8'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const loader=read('navigation-hub.js'),tree=acorn.parse(loader,{ecmaVersion:'latest'});let node;function visit(n){if(!n||typeof n!=='object')return;if(n.type==='VariableDeclarator'&&n.id?.name==='definitions')node=n.init;for(const x of Object.values(n))if(Array.isArray(x))x.forEach(visit);else if(x&&typeof x==='object')visit(x);}visit(tree);if(!node)throw Error('Missing module manifest');const definitions=vm.runInNewContext('('+loader.slice(node.start,node.end)+')',{}, {timeout:1000});
const source=new Set(['styles.css','fcc-ui.css','fcc-design.css','fcc-core.js','fcc-store.js','fcc-ui.js','fcc-clinical-ui.js','app.js','navigation-hub.js','wound-images-curated-v1.json']);
for(const d of Object.values(definitions))for(const name of [...(d.scripts||[]),...(d.data||[])])source.add(name);
const normalized=read('index.html').replace(/release\/1\.4\.0-[a-f0-9]{12}\//g,'').replace(/\?v=1\.4\.0/g,'');
const build='1.4.0-'+hash([...source].sort().map(p=>p+'\n'+read(p)).join('\n')+'\n'+normalized+'\n'+read('service-worker.template.js')).slice(0,12),dir='release/'+build;
// Keep immutable previous releases for open tabs and deferred updates. Prune only by a separately audited retention policy.
for(const name of source){const dest=dir+'/'+name;fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(name,dest);}
let html=normalized.replace(/(<script src=")([^"?]+\.js)(")/g,(_,a,b,c)=>a+dir+'/'+b+c).replace(/(<link rel="stylesheet" href=")([^"?]+\.css)(")/g,(_,a,b,c)=>a+dir+'/'+b+c);
fs.writeFileSync('index.html',html);
const moduleFiles=name=>{const d=definitions[name];if(!d)throw Error('Unknown module '+name);return [...new Set([...(d.scripts||[]),...(d.data||[]),...(d.deps||[]).flatMap(moduleFiles)])].map(p=>p.startsWith('release/')?p:p);};
const prefix=files=>files.map(p=>dir+'/'+p),core=[...prefix(['styles.css','fcc-ui.css','fcc-design.css','fcc-core.js','fcc-store.js','fcc-ui.js','fcc-clinical-ui.js','app.js','navigation-hub.js',...moduleFiles('shell'),...moduleFiles('home')]),'index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon.svg'];
const imageFiles=fs.readdirSync('assets/wound-images/user-final').map(x=>'assets/wound-images/user-final/'+x);
const packages={core:{label:'Base da aplicação',files:[...new Set(core)]},clinical:{label:'Clínica completa e pesquisa',files:[...new Set(prefix(['clinical','institution','perfusion','medication','safety','compatibility','cases','ecg','search'].flatMap(moduleFiles)))]},dressings:{label:'Pensos e 46 imagens',files:[...new Set([...prefix(moduleFiles('dressings')),...imageFiles])]},personal:{label:'Ferramentas pessoais',files:[...new Set(prefix(['personal','expenses','research','material'].flatMap(moduleFiles)))]}};
const all=[...new Set(Object.values(packages).flatMap(p=>p.files))],assets={};for(const name of all){const b=fs.readFileSync(name);assets[name]={sha256:hash(b),bytes:b.byteLength};}
fs.writeFileSync('asset-manifest.json',JSON.stringify({version:'1.4.0',build,assets,packages},null,2));fs.writeFileSync('service-worker.js',read('service-worker.template.js').replace('__FCC_BUILD__',build));
const info=JSON.parse(read('build-info.json'));info.assetBuild=build;info.resourceCount=all.length;fs.writeFileSync('build-info.json',JSON.stringify(info,null,2));
console.log(JSON.stringify({build,assets:all.length,bytes:all.reduce((n,p)=>n+assets[p].bytes,0),packages:Object.fromEntries(Object.entries(packages).map(([k,p])=>[k,p.files.length]))}));
