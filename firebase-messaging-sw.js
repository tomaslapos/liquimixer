// Firebase Messaging Service Worker
// Zpracovává push notifikace v pozadí

// Import Firebase SDK pro Service Worker
// POZNÁMKA: Nahraďte verzi SDK podle potřeby
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase konfigurace
// DŮLEŽITÉ: Tato konfigurace musí být nahrazena skutečnými hodnotami z Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Inicializace Firebase
firebase.initializeApp(firebaseConfig);

// Inicializace Firebase Messaging
const messaging = firebase.messaging();

// Zpracování push notifikací v pozadí (když je aplikace minimalizovaná nebo zavřená)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    
    const notificationTitle = payload.notification?.title || 'LiquiMixer';
    const notificationOptions = {
        body: payload.notification?.body || 'Máte novou zprávu',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        tag: payload.data?.tag || 'liquimixer-notification',
        data: payload.data,
        vibrate: [200, 100, 200],
        actions: [
            {
                action: 'open',
                title: 'Otevřít'
            },
            {
                action: 'close',
                title: 'Zavřít'
            }
        ]
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Zpracování kliknutí na notifikaci
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    // Otevřít aplikaci nebo přejít na detail receptu
    const recipeId = event.notification.data?.recipeId;
    let targetUrl = '/';
    
    if (recipeId) {
        targetUrl = `/?viewRecipe=${recipeId}`;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Pokud je již otevřené okno, zaměřit se na něj
                for (const client of clientList) {
                    if (client.url.includes('liquimixer') && 'focus' in client) {
                        return client.focus().then(() => {
                            if (recipeId) {
                                client.postMessage({
                                    type: 'OPEN_RECIPE',
                                    recipeId: recipeId
                                });
                            }
                        });
                    }
                }
                // Jinak otevřít nové okno
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            })
    );
});

console.log('[firebase-messaging-sw.js] Firebase Messaging SW loaded');

