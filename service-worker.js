const CACHE='fcc-master-1.0.3';
const ASSETS=['./','./index.html','./styles.css','./app.js','./navigation-hub.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./content-pack.json','./build-info.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))).then(()=>self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(resp=>{
    if(resp&&resp.status===200&&resp.type==='basic'){
      const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));
    }
    return resp;
  }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});
