const CACHE='fcc-master-1.3.2-fastboot-2';
const CORE=[
 './','./index.html','./styles.css','./app.js','./navigation-hub.js',
 './runtime-core-v1.js','./runtime-diagnostics-v1.js','./theme-switcher.js','./theme-auto-v2.js',
 './global-typography-v1.js','./theme-audit-fixes.js','./home-public-shell-v1.js','./personal-security-v1.js',
 './search-enhancer.js','./navigation-core.js','./personal-hub-v1.js','./subtab-navigation-fix.js',
 './iv-compatibility.js','./clinical-material.js','./clinical-restructure.js','./wound-dressings-v1.js','./category-organizer-v2.js'
];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);for(const url of CORE){try{const r=await fetch(url,{cache:'reload'});if(r?.ok)await cache.put(url,r.clone())}catch(e){}}await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('fcc-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;const u=new URL(event.request.url);if(u.origin!==location.origin)return;
 const networkFirst=async()=>{try{const r=await fetch(event.request,{cache:'no-store'});if(r?.ok){const c=await caches.open(CACHE);c.put(event.request,r.clone()).catch(()=>{})}return r}catch(e){const cached=await caches.match(event.request,{ignoreSearch:true});if(cached)return cached;if(event.request.mode==='navigate')return (await caches.match('./index.html',{ignoreSearch:true}))||Response.error();return Response.error()}};
 if(event.request.mode==='navigate'||/\.(?:html|js|css|json|webmanifest)$/.test(u.pathname))event.respondWith(networkFirst());
});
