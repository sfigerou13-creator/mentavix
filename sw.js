/* Mentavix — service worker : cache + rappels quotidiens */
const CACHE='mentavix-v5';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./manifest.json','./icon-192.png'])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(r=>{
      const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return r;
    }).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html')))
  );
});
/* Rappel quotidien (Android/Chrome, app installée) */
self.addEventListener('periodicsync',e=>{
  if(e.tag==='mentavix-reminder'){
    e.waitUntil(self.registration.showNotification('Mentavix',{
      body:'Votre séance du jour vous attend — 5 minutes pour votre cerveau.',
      icon:'icon-192.png', badge:'icon-192.png', tag:'mentavix-daily'
    }));
  }
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(list=>{
    for(const c of list){ if('focus' in c) return c.focus(); }
    return clients.openWindow('./');
  }));
});
