self.addEventListener('install', (event) => {
    self.skipWaiting();  // Wymusza natychmiastową aktywację nowego service workera
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim()); // Przejęcie kontroli nad klientami natychmiast
});

// Sprawdzanie nowego service workera w trakcie działania
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting(); // Przełączanie na nowego SW
    }
});