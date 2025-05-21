let ws = null;

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

function connectWebSocket() {
    if (ws) {
        ws.close();
    }

    const protocol = self.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${self.location.host}/ws`;

    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'update') {
                self.registration.showNotification('bakeMAnia', {
                    body: data.message,
                    icon: '/web-app-manifest-192x192.png',
                    badge: '/web-app-manifest-192x192.png',
                    vibrate: [200, 100, 200],
                    requireInteraction: true,
                    actions: [
                        {
                            action: 'open',
                            title: 'Otwórz'
                        }
                    ]
                });
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    ws.onclose = () => {
        setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
    };
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                if (clientList.length > 0) {
                    clientList[0].focus();
                } else {
                    clients.openWindow('/');
                }
            })
        );
    }
});

connectWebSocket(); 