// Increment this version on EVERY deployment that changes a cached file.
const CACHE='muscu-'+new URL(self.registration.scope).pathname+'-v2.1-text-only-1';
const PREFIX='muscu-'+new URL(self.registration.scope).pathname+'-';
const SHELL=['./','./index.html','./style.css','./app.js','./engine.js','./program.js','./technique.js','./storage.js','./stats.js','./manifest.webmanifest','./icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(SHELL);})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(event.request.mode==='navigate')return (await cache.match('./index.html'))||fetch(event.request);
    const cached=await cache.match(event.request);if(cached)return cached;return fetch(event.request);
  })());
});
