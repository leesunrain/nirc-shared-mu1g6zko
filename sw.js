const CACHE='carb-loading-meal-select-v5';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k!==CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  const isNav=e.request.mode==='navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if(isNav){
    e.respondWith((async()=>{
      try{
        const fresh=await fetch(e.request,{cache:'no-store'});
        const c=await caches.open(CACHE); c.put('./index.html',fresh.clone());
        return fresh;
      }catch(err){ return (await caches.match('./index.html')) || Response.error(); }
    })());
    return;
  }
  e.respondWith((async()=>{
    try{
      const fresh=await fetch(e.request,{cache:'no-store'});
      const c=await caches.open(CACHE); c.put(e.request,fresh.clone());
      return fresh;
    }catch(err){ return (await caches.match(e.request)) || Response.error(); }
  })());
});
