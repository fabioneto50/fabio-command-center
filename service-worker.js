const CACHE='fcc-master-1.3.2-clinical-recovery-3';
const CORE=[
 './','./index.html','./styles.css','./app.js','./navigation-hub.js',
 './runtime-core-v1.js','./fcc-content-core-v1.js','./fcc-content-config-v1.js','./runtime-diagnostics-v1.js','./theme-switcher.js','./theme-auto-v2.js',
 './global-typography-v1.js','./theme-audit-fixes.js','./home-public-shell-v1.js','./personal-security-v1.js',
 './search-enhancer.js','./navigation-core.js','./personal-hub-v1.js','./subtab-navigation-fix.js',
 './iv-compatibility.js','./clinical-material.js','./clinical-restructure.js','./wound-dressings-v1.js','./category-organizer-v2.js',
 './wound-dressings-local-data-v1.js','./wound-dressings-order-v1.js','./wound-dressings-images-v2.js','./wound-dressings-media-model-v1.js','./wound-images-curated-v1.json'
];
const offlineResponse=request=>{
 const accepts=request.headers.get('accept')||'';
 const headers=new Headers({'Cache-Control':'no-store','X-FCC-Offline':'1'});
 if(accepts.includes('application/json')){headers.set('Content-Type','application/json; charset=utf-8');return new Response('{"offline":true}',{status:503,statusText:'Offline',headers})}
 headers.set('Content-Type',accepts.includes('text/html')?'text/html; charset=utf-8':'text/plain; charset=utf-8');
 return new Response(accepts.includes('text/html')?'<!doctype html><meta charset="utf-8"><title>Offline</title><p>Conteúdo temporariamente indisponível offline.</p>':'Offline',{status:503,statusText:'Offline',headers});
};
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);for(const url of CORE){try{const r=await fetch(url,{cache:'reload'});if(r?.ok)await cache.put(url,r.clone())}catch(e){}}await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('fcc-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const u=new URL(event.request.url);
 if(u.origin!==location.origin)return;
 const networkFirst=async()=>{
  try{
   const r=await fetch(event.request,{cache:'no-store'});
   if(r?.ok){const c=await caches.open(CACHE);c.put(event.request,r.clone()).catch(()=>{})}
   return r;
  }catch(e){
   try{
    const cached=await caches.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    if(event.request.mode==='navigate'){
     const shell=await caches.match('./index.html',{ignoreSearch:true});
     if(shell)return shell;
    }
   }catch(cacheError){}
   return offlineResponse(event.request);
  }
 };
 if(event.request.mode==='navigate'||/\.(?:html|js|css|json|webmanifest|avif|webp|png|jpe?g)$/.test(u.pathname))event.respondWith(networkFirst());
});
