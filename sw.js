const C="lareleve-v13";
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(
    ["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"])));
  self.skipWaiting();
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch",e=>{
  const req=e.request;
  const isPage = req.mode==="navigate" || req.url.endsWith("/index.html") || req.url.endsWith("/");
  if (isPage){
    // réseau d'abord : les joueurs reçoivent toujours la dernière version ;
    // en cas d'absence de réseau, on sert la copie hors-ligne
    e.respondWith(
      fetch(req).then(r=>{
        const cp=r.clone();
        caches.open(C).then(c=>c.put(req,cp));
        return r;
      }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match("./index.html")))
    );
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req)));
});
