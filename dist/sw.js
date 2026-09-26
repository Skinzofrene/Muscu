// Increment this version on EVERY deployment that changes a cached file.
const CACHE='muscu-'+new URL(self.registration.scope).pathname+'-v6-2-ux-polished';
const PREFIX='muscu-'+new URL(self.registration.scope).pathname+'-';
const SHELL=['./','./index.html','./style.css?v=6.2.3','./app.js?v=6.2.3','./engine.js','./scheduler.js','./flexibility.js','./timer-sounds.js','./program.js','./technique.js','./technical-catalog.js','./visual-catalog.js','./visual-catalog.json','./storage.js','./stats.js','./objectives.js','./objective-planner.js','./manifest.webmanifest','./icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./assets/flexibility/pages/page-01.webp','./assets/flexibility/pages/page-02.webp','./assets/flexibility/pages/page-03.webp','./assets/flexibility/pages/page-04.webp','./assets/flexibility/pages/page-05.webp','./assets/flexibility/pages/page-06.webp','./assets/flexibility/pages/page-07.webp','./assets/flexibility/pages/page-08.webp','./assets/flexibility/pages/page-09.webp','./assets/flexibility/pages/page-10.webp'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE),response=await fetch('./visual-catalog.json'),catalog=await response.json(),visualAssets=[...new Set(Object.values(catalog.catalog).flatMap(item=>item.frames||[]))];await cache.addAll([...SHELL,...visualAssets]);})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(event.request.mode==='navigate')return (await cache.match('./index.html'))||fetch(event.request);
    const cached=await cache.match(event.request);if(cached)return cached;const response=await fetch(event.request);if(response.ok)cache.put(event.request,response.clone());return response;
  })());
});
