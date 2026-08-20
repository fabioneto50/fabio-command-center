const CACHE='fcc-master-recovery-1.2.6';
const CORE=['./','./index.html','./styles.css','./app.js','./navigation-hub.js','./subtab-navigation-fix.js','./navigation-stability-v1.js','./category-organizer-v2.js'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const url of CORE){
      try{
        const response=await fetch(url,{cache:'reload'});
        if(response&&response.ok)await cache.put(url,response.clone());
      }catch(err){
        console.warn('FCC recovery precache failed',url,err);
      }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('fcc-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;

  const networkFirst=async()=>{
    try{
      const response=await fetch(event.request,{cache:'no-store'});
      if(response&&response.ok){
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone()).catch(()=>{});
      }
      return response;
    }catch(err){
      const cached=await caches.match(event.request);
      if(cached)return cached;
      if(event.request.mode==='navigate'){
        const fallback=await caches.match('./index.html');
        if(fallback)return fallback;
      }
      return Response.error();
    }
  };

  if(event.request.mode==='navigate'||/\.(?:html|js|css|json|webmanifest)$/.test(url.pathname)){
    event.respondWith(networkFirst());
  }
});
