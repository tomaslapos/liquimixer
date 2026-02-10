// Firebase Messaging Service Worker for Liquimixer
// This handles background push notifications

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyARRacfElsLSyVm2B3v1WohYgArLwerNEo",
    authDomain: "liquimixer.firebaseapp.com",
    projectId: "liquimixer",
    storageBucket: "liquimixer.firebasestorage.app",
    messagingSenderId: "729409229192",
    appId: "1:729409229192:web:0c0679dcd6b75de8416a3d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    
    // Extract notification data
    const notificationTitle = payload.notification?.title || 'Liquimixer';
    const notificationOptions = {
        body: payload.notification?.body || 'Máte novou zprávu',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'liquimixer-maturity-reminder',
        data: payload.data || {},
        actions: [
            {
                action: 'open',
                title: 'Otevřít aplikaci'
            },
            {
                action: 'dismiss',
                title: 'Zavřít'
            }
        ],
        requireInteraction: true, // Keep notification visible until user interacts
        vibrate: [200, 100, 200] // Vibration pattern for mobile
    };
    
    // Show the notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);
    
    event.notification.close();
    
    // Handle action buttons
    if (event.action === 'dismiss') {
        return;
    }
    
    // Open the app or focus existing window
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if app is already open
                for (let client of windowClients) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        // Navigate to specific page if needed
                        if (event.notification.data?.recipeId) {
                            client.postMessage({
                                type: 'OPEN_RECIPE',
                                recipeId: event.notification.data.recipeId
                            });
                        }
                        return;
                    }
                }
                // Open new window if not already open
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Handle notification close (user dismissed without clicking)
self.addEventListener('notificationclose', (event) => {
    console.log('[firebase-messaging-sw.js] Notification closed:', event);
});

// Service Worker installation
self.addEventListener('install', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker installed');
    self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker activated');
    event.waitUntil(clients.claim());
});





