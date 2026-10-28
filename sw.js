/* Only public offline resources are cached. Finance/auth/API responses are never cached. */
const CACHE='copia-public-pwa-v2';
const ROOT=new URL('./',self.location.href);
const OFFLINE=new URL('offline.html',ROOT).href;
const PUBLIC=['offline.html','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'].map(p=>new URL(p,ROOT).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PUBLIC))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('copia-public-pwa-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const r=event.request,url=new URL(r.url);
 if(url.pathname.includes('/__/auth/'))return;
 if(r.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 // Navigation always goes to the network. Never store pages that contain account/session data.
 if(r.mode==='navigate'){event.respondWith(fetch(r).catch(async()=>await caches.match(OFFLINE)||Response.error()));return;}
 if(PUBLIC.includes(url.href))event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(r))||fetch(r)));
});
