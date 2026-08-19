const CACHE='fcc-master-1.0.29';
const CORE=['./','./index.html','./styles.css','./app.js','./navigation-hub.js','./theme-switcher.js','./navigation-core.js','./perfusion-reference.js','./critical-care-dilutions-v2.js','./dilutions-ux-v3.js','./family-security.js','./clinical-material.js','./iv-compatibility.js','./iv-catalogue.js','./iv-compatibility-ui-v2.js','./iv-source-evidence.js','./clinical-restructure.js','./drug-reference-v2.js','./medication-info-v3.js','./medication-info-v4.js','./medication-info-ux-v5.js','./medication-brands-v1.js','./ecg-photo-assist.js','./ecg-image-analyzer-v2.js','./ecg-image-analyzer-v3.js','./clinical-legacy-shims.js','./category-organizer.js','./expense-recurring-engine.js','./expense-center.js','./expense-recurring-ui.js','./theme-audit-fixes.js','./search-enhancer.js','./subtab-navigation-fix.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./content-pack.json','./build-info.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))).then(()=>self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin) return;
  const networkFirst=async()=>{
    try{
      const resp=await fetch(e.request,{cache:'no-store'});
      if(resp&&resp.status===200){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
      return resp;
    }catch(err){
      const cached=await caches.match(e.request);
      if(cached) return cached;
      if(e.request.mode==='navigate') return caches.match('./index.html');
      return Response.error();
    }
  };
  const cacheFirst=async()=>{
    const cached=await caches.match(e.request);if(cached)return cached;
    try{const resp=await fetch(e.request);if(resp&&resp.status===200){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return resp;}catch(err){return Response.error();}
  };
  if(e.request.mode==='navigate'||/\.(?:html|js|css|json|webmanifest)$/.test(u.pathname)) e.respondWith(networkFirst());
  else e.respondWith(cacheFirst());
});