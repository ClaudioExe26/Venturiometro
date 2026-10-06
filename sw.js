// Service worker del Venturiómetro.
// La página se pide siempre primero a la red (para ver la última versión subida a GitHub);
// si no hay conexión, se abre la copia guardada. Los datos de Firebase no se guardan aquí:
// siempre se leen en línea.
const CACHE = 'venturiometro-v4'; // cambia la versión para renovar íconos guardados
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return; // Firebase, fuentes y librerías: directo a la red

  e.respondWith(
    fetch(req)
      .then(resp => {
        if(resp.ok){ const copia = resp.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
        return resp;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
