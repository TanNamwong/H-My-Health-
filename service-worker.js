// H My Health — offline-first app shell with user-approved in-place updates.
const CACHE_NAME = 'h-my-health-v13-1';
const APP_ROOT = new URL('./', self.registration.scope);
const CORE_PATHS = [
 './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-192.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon-64.png','./icon.svg','./developer-character.png',
 './guide-home.png','./guide-profile.png','./guide-entry.png','./guide-reportView.png','./guide-history.png','./guide-settings.png','./guide-appointments.png','./guide-emergency.png','./guide-medication.png','./guide-developer.png',
 './guide-home.svg','./guide-profile.svg','./guide-entry.svg','./guide-reportView.svg',
 './guide-history.svg','./guide-settings.svg','./guide-appointments.svg',
 './guide-emergency.svg','./guide-medication.svg','./guide-developer.svg'
];
self.addEventListener('install', event => {
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const REQUIRED=['./','./index.html','./manifest.webmanifest'];
  for(const path of CORE_PATHS){const url=new URL(path,APP_ROOT);const must=REQUIRED.includes(path);try{const response=await fetch(url,{cache:'reload'});if(response.ok)await cache.put(url,response.clone());else if(must)throw new Error('required file failed: '+path);}catch(e){if(must)throw e; /* optional files: keep what is already cached */}}
  // First install activates immediately; later versions wait for user approval.
  if(!self.registration.active) await self.skipWaiting();
 })());
});
self.addEventListener('message', event => { if(event.data==='SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', event => {
 event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('h-my-health-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();})());
});
self.addEventListener('fetch', event => {
 const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==APP_ROOT.origin||!url.pathname.startsWith(APP_ROOT.pathname))return; if(url.pathname.endsWith('/version.json'))return; // always go to the network for version checks
 event.respondWith((async()=>{const cache=await caches.open(CACHE_NAME);const cached=await cache.match(req,{ignoreSearch:req.mode==='navigate'});if(cached)return cached;try{const response=await fetch(req);if(response&&response.ok)cache.put(req,response.clone());return response;}catch(e){if(req.mode==='navigate'){const fallback=await cache.match(new URL('./index.html',APP_ROOT));if(fallback)return fallback;}return new Response('ออฟไลน์: ไฟล์นี้ยังไม่อยู่ในแคช กรุณาเชื่อมต่ออินเทอร์เน็ตเพื่อโหลดครั้งแรก',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());
});
