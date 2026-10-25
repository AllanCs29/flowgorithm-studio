/* Flowgorithm Studio - PWA offline completa. Solo se almacenan archivos publicos,
   nunca el progreso ni los proyectos personales (que permanecen en localStorage). */
const CACHE='flowstudio-shell-v14';
const ROOT_ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const scope=self.registration.scope;
const entry=new URL('./index.html',scope).href;
const normalized=url=>new URL(url,scope).href;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ROOT_ASSETS.map(normalized))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('flowstudio-shell-')&&key!==CACHE).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin) return;
  if(request.mode==='navigate'){
    // El HTML y el JS pertenecen a la misma version previamente precargada.
    event.respondWith(caches.open(CACHE).then(cache=>cache.match(entry)).then(saved=>saved||fetch(request)));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const saved=await cache.match(request);
    if(saved)return saved;
    // Recursos no precargados siguen disponibles con conexion.
    return fetch(request);
  }));
});
