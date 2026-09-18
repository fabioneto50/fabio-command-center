/* Generated with a build-specific manifest. Caches only declared public static resources. */
'use strict';
const BUILD='1.4.0-b4eb9101ad0d',VERSION='1.4.0',BASE=new URL('./',self.location.href),PREFIX='fcc-v2-'+BASE.pathname.replace(/[^a-z0-9]/gi,'_')+'-',CORE=PREFIX+BUILD+'-core';
const MANIFEST_URL=new URL('asset-manifest.json?build='+BUILD,BASE).href;
let manifestMemory=null;
const abs=path=>new URL(path,BASE).href;
async function manifest(){if(manifestMemory)return manifestMemory;const cache=await caches.open(CORE),stored=await cache.match(abs('asset-manifest.json'));if(stored){manifestMemory=await stored.json();return manifestMemory;}const r=await fetch(MANIFEST_URL,{cache:'no-store'});if(!r.ok)throw Error('Manifesto indisponível');const m=await r.json();if(m.build!==BUILD)throw Error('Versão de manifesto diferente da versão do worker');manifestMemory=m;return m;}
async function timedFetch(url,timeout=10000){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeout);try{return await fetch(url,{cache:'no-store',signal:ctrl.signal});}finally{clearTimeout(timer);}}
async function verified(path,m){const entry=m.assets[path];if(!entry)throw Error('Recurso não autorizado');const r=await timedFetch(abs(path)+'?fcc-build='+BUILD);if(!r.ok||r.type==='opaque')throw Error('Recurso indisponível: '+path);const buffer=await r.arrayBuffer();if(buffer.byteLength!==entry.bytes)throw Error('Tamanho incorreto: '+path);const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(x=>x.toString(16).padStart(2,'0')).join('');if(hash!==entry.sha256)throw Error('Integridade incorreta: '+path);const headers=new Headers(r.headers);headers.delete('Content-Encoding');headers.delete('Content-Length');headers.set('Content-Length',String(buffer.byteLength));return new Response(buffer,{status:200,headers});}
async function complete(name,paths,cacheName,m,port){const cache=await caches.open(cacheName);try{let done=0;for(const path of paths){if(!await cache.match(abs(path)))await cache.put(abs(path),await verified(path,m));done++;port?.postMessage({progress:done,total:paths.length});}await cache.put(abs('__fcc_complete__'),new Response(JSON.stringify({build:BUILD,name,files:paths.length,preparedAt:new Date().toISOString()}),{headers:{'Content-Type':'application/json'}}));return true;}catch(e){await caches.delete(cacheName);throw e;}}
self.addEventListener('install',event=>event.waitUntil((async()=>{const m=await manifest();await complete('core',m.packages.core.files,CORE,m);const cache=await caches.open(CORE);await cache.put(abs('asset-manifest.json'),new Response(JSON.stringify(m),{headers:{'Content-Type':'application/json'}}));})()));
// No skipWaiting here. No automatic deletion of the last working caches.
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
const offline=()=>new Response('Recurso indisponível offline. Prepara o pacote completo nas Definições quando houver ligação.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-FCC-Offline':'1'}});
async function cached(path,m){for(const [name,p]of Object.entries(m.packages)){if(name!=='core'&&!p.files.includes(path))continue;const c=await caches.open(name==='core'?CORE:PREFIX+BUILD+'-'+name);if(name!=='core'&&!await c.match(abs('__fcc_complete__')))continue;const r=await c.match(abs(path));if(r)return r;}return null;}
async function resource(path){try{const m=await manifest(),saved=await cached(path,m);if(saved)return saved;const r=await verified(path,m);const c=await caches.open(CORE);await c.put(abs(path),r.clone());return r;}catch{return offline();}}
// Other open tabs may still run the previous release after one tab accepts an update.
// Serve only assets declared and verified in that release, never a cross-version substitute.
async function previousResource(path,build,request){
 try{
  const oldCore=await caches.open(PREFIX+build+'-core'),savedManifest=await oldCore.match(abs('asset-manifest.json'));
  if(savedManifest){const m=await savedManifest.json();if(m.build===build&&Object.hasOwn(m.assets,path)){
   for(const name of Object.keys(m.packages)){const cache=await caches.open(PREFIX+build+'-'+name);if(name!=='core'&&!await cache.match(abs('__fcc_complete__')))continue;const saved=await cache.match(abs(path));if(saved)return saved;}
  }}
  return await timedFetch(request.url);
 }catch{return offline();}
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 let path=url.pathname.slice(BASE.pathname.length);if(!path||path==='index.html')path='index.html';
 // Dynamic feeds, user requests, external APIs and unknown query parameters are not cached.
 if([...url.searchParams.keys()].some(k=>k!=='v')||url.searchParams.has('v')&&url.searchParams.get('v')!==VERSION)return;
 const old=path.match(/^release\/(1\.4\.0-[a-f0-9]{12})\//);
 if(old&&old[1]!==BUILD){event.respondWith(previousResource(path,old[1],event.request));return;}
 if(path==='index.html'||path==='manifest.webmanifest'||path.startsWith('release/'+BUILD+'/')||path.startsWith('assets/wound-images/user-final/')||/^icon-(192|512)\.png$/.test(path)||path==='icon.svg'||path==='wound-images-curated-v1.json')event.respondWith(resource(path));
});
let packageQueue=Promise.resolve();
self.addEventListener('message',event=>{
 const port=event.ports?.[0],message=event.data||{};
 if(message.type==='ACTIVATE_UPDATE'){event.waitUntil(self.skipWaiting());return;}
 const run=async()=>{if(message.expectedBuild&&message.expectedBuild!==BUILD)throw Error('Outra versão foi ativada. Guarda o trabalho e recarrega a página antes de preparar pacotes offline.');const m=await manifest();if(message.type==='STATUS'){const packages={};for(const [name,p]of Object.entries(m.packages)){const c=await caches.open(name==='core'?CORE:PREFIX+BUILD+'-'+name);const marker=await c.match(abs('__fcc_complete__'));let ok=!!marker;if(ok)for(const path of p.files)if(!await c.match(abs(path))){ok=false;break;}packages[name]={label:p.label,complete:ok,files:p.files.length,bytes:p.files.reduce((n,path)=>n+m.assets[path].bytes,0)};}return {build:BUILD,packages,manifest:{version:VERSION,build:BUILD}};}if(message.type==='CACHE_PACKAGE'){const name=message.package;if(!Object.hasOwn(m.packages,name)||name==='core')throw Error('Pacote não suportado');await complete(name,m.packages[name].files,PREFIX+BUILD+'-'+name,m,port);return {ok:true,package:name};}throw Error('Mensagem desconhecida');};
 const result=message.type==='CACHE_PACKAGE'?(packageQueue=packageQueue.catch(()=>{}).then(run)):run();event.waitUntil(result.then(data=>port?.postMessage(data)).catch(e=>port?.postMessage({error:e.message||'Operação offline falhou'})));
});
