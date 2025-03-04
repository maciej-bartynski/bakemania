// sw.addEventListener("install", event => {
//     event.waitUntil(
//         caches.open("v1").then(cache => {
//             return cache.addAll([
//                 "/",
//                 "/index.html",
//                 "/src/index.css"
//             ]);
//         })
//     );
//     console.log("Service Worker zainstalowany.");
// });

// sw.addEventListener("fetch", event => {
//     event.respondWith(
//         caches.match(event.request).then(response => {
//             return response || fetch(event.request);
//         })
//     );
// });

self.addEventListener("activate", event => {
    console.log("Service Worker aktywowany.");
});

self.addEventListener('push', function (event) {

    const receivedText = event.data.text();

    const { type, amount } = JSON.parse(receivedText);

    // let options = {
    //     body: event.data.text(),
    //     icon: '/icon.png',
    //     badge: '/badge.png'
    // };

    // event.waitUntil(
    //     self.registration.showNotification('Nowa notyfikacja', { type, amount })
    // );

    event.waitUntil(
        self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
                client.postMessage({ type, amount });
            });
        })
    )
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
