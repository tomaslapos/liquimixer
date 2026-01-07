// ============================================
// FIREBASE CLOUD MESSAGING - PUSH NOTIFIKACE
// Inicializace a správa FCM pro připomínky zrání
// ============================================

console.log('fcm.js: Loading Firebase Cloud Messaging...');

// Firebase konfigurace
// DŮLEŽITÉ: Tyto hodnoty musí být nahrazeny skutečnými z Firebase Console
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// VAPID klíč pro Web Push
// Získáte v Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = "YOUR_VAPID_KEY";

// Stav FCM
let fcmInitialized = false;
let fcmToken = null;
let messaging = null;

// Kontrola, zda jsou push notifikace podporovány
function isPushSupported() {
    return 'serviceWorker' in navigator && 
           'PushManager' in window &&
           'Notification' in window;
}

// Kontrola, zda má Firebase správnou konfiguraci (není placeholder)
function isFirebaseConfigured() {
    return FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" &&
           FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID" &&
           VAPID_KEY !== "YOUR_VAPID_KEY";
}

// Inicializace Firebase
async function initializeFirebase() {
    if (fcmInitialized) return true;
    
    if (!isPushSupported()) {
        console.warn('fcm.js: Push notifications not supported in this browser');
        return false;
    }
    
    if (!isFirebaseConfigured()) {
        console.warn('fcm.js: Firebase not configured. Push notifications disabled.');
        return false;
    }
    
    try {
        // Dynamicky načíst Firebase SDK
        if (typeof firebase === 'undefined') {
            console.log('fcm.js: Loading Firebase SDK...');
            await loadFirebaseSDK();
        }
        
        // Inicializovat Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        
        messaging = firebase.messaging();
        fcmInitialized = true;
        console.log('fcm.js: Firebase initialized successfully');
        
        // Nastavit handler pro příjem zpráv v popředí
        setupForegroundHandler();
        
        return true;
    } catch (error) {
        console.error('fcm.js: Error initializing Firebase:', error);
        return false;
    }
}

// Dynamické načtení Firebase SDK
function loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
        // Firebase App
        const appScript = document.createElement('script');
        appScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js';
        appScript.async = true;
        
        appScript.onload = () => {
            // Firebase Messaging
            const messagingScript = document.createElement('script');
            messagingScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js';
            messagingScript.async = true;
            
            messagingScript.onload = () => resolve();
            messagingScript.onerror = () => reject(new Error('Failed to load Firebase Messaging SDK'));
            
            document.head.appendChild(messagingScript);
        };
        
        appScript.onerror = () => reject(new Error('Failed to load Firebase App SDK'));
        document.head.appendChild(appScript);
    });
}

// Nastavit handler pro příjem zpráv v popředí
function setupForegroundHandler() {
    if (!messaging) return;
    
    messaging.onMessage((payload) => {
        console.log('fcm.js: Foreground message received:', payload);
        
        // Zobrazit notifikaci i když je aplikace v popředí
        const notificationTitle = payload.notification?.title || 'LiquiMixer';
        const notificationBody = payload.notification?.body || 'Máte novou zprávu';
        
        // Použít nativní Notification API
        if (Notification.permission === 'granted') {
            const notification = new Notification(notificationTitle, {
                body: notificationBody,
                icon: '/icons/icon-192.png',
                tag: payload.data?.tag || 'liquimixer-foreground',
                data: payload.data
            });
            
            notification.onclick = () => {
                window.focus();
                if (payload.data?.recipeId) {
                    viewRecipeDetail(payload.data.recipeId);
                }
                notification.close();
            };
        }
    });
}

// Požádat o povolení notifikací
async function requestNotificationPermission() {
    if (!isPushSupported()) {
        console.warn('fcm.js: Push notifications not supported');
        return 'unsupported';
    }
    
    const currentPermission = Notification.permission;
    
    if (currentPermission === 'granted') {
        return 'granted';
    }
    
    if (currentPermission === 'denied') {
        console.warn('fcm.js: Notification permission was denied');
        return 'denied';
    }
    
    // Požádat o povolení
    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch (error) {
        console.error('fcm.js: Error requesting notification permission:', error);
        return 'error';
    }
}

// Registrovat Firebase Messaging Service Worker
async function registerFcmServiceWorker() {
    if (!isPushSupported()) return null;
    
    try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/firebase-cloud-messaging-push-scope'
        });
        console.log('fcm.js: Firebase Messaging SW registered:', registration);
        return registration;
    } catch (error) {
        console.error('fcm.js: Error registering FCM SW:', error);
        return null;
    }
}

// Získat FCM token
async function getFcmToken() {
    if (fcmToken) return fcmToken;
    
    // Inicializovat Firebase pokud ještě není
    const initialized = await initializeFirebase();
    if (!initialized) return null;
    
    // Zkontrolovat oprávnění
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
        console.warn('fcm.js: Notification permission not granted');
        return null;
    }
    
    // Registrovat SW
    const swRegistration = await registerFcmServiceWorker();
    if (!swRegistration) return null;
    
    try {
        // Získat token
        fcmToken = await messaging.getToken({
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swRegistration
        });
        
        console.log('fcm.js: FCM token obtained:', fcmToken?.substring(0, 20) + '...');
        return fcmToken;
    } catch (error) {
        console.error('fcm.js: Error getting FCM token:', error);
        return null;
    }
}

// Uložit FCM token do databáze
async function saveFcmTokenToDatabase() {
    if (!window.Clerk || !window.Clerk.user) {
        console.warn('fcm.js: User not logged in, cannot save FCM token');
        return false;
    }
    
    const token = await getFcmToken();
    if (!token) return false;
    
    try {
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timestamp: new Date().toISOString()
        };
        
        const result = await window.LiquiMixerDB.saveFcmToken(
            window.Clerk.user.id,
            token,
            deviceInfo
        );
        
        if (result) {
            console.log('fcm.js: FCM token saved to database');
            return true;
        }
        return false;
    } catch (error) {
        console.error('fcm.js: Error saving FCM token to database:', error);
        return false;
    }
}

// Smazat FCM token
async function deleteFcmTokenFromDatabase() {
    if (!window.Clerk || !window.Clerk.user || !fcmToken) return false;
    
    try {
        const result = await window.LiquiMixerDB.deleteFcmToken(
            window.Clerk.user.id,
            fcmToken
        );
        
        if (result) {
            fcmToken = null;
            console.log('fcm.js: FCM token deleted from database');
            return true;
        }
        return false;
    } catch (error) {
        console.error('fcm.js: Error deleting FCM token:', error);
        return false;
    }
}

// Inicializovat push notifikace pro přihlášeného uživatele
async function initializePushNotifications() {
    if (!isPushSupported()) {
        console.log('fcm.js: Push notifications not supported');
        return false;
    }
    
    if (!isFirebaseConfigured()) {
        console.log('fcm.js: Firebase not configured, skipping push initialization');
        return false;
    }
    
    if (!window.Clerk || !window.Clerk.user) {
        console.log('fcm.js: User not logged in');
        return false;
    }
    
    // Pokud už má uživatel povolené notifikace, automaticky uložit token
    if (Notification.permission === 'granted') {
        return await saveFcmTokenToDatabase();
    }
    
    // Jinak počkat až uživatel povolí notifikace
    console.log('fcm.js: Waiting for notification permission...');
    return false;
}

// Zobrazit UI pro povolení notifikací
function showNotificationPermissionUI() {
    if (!isPushSupported()) {
        alert(t('notifications.not_supported', 'Váš prohlížeč nepodporuje push notifikace.'));
        return;
    }
    
    if (Notification.permission === 'granted') {
        alert(t('notifications.already_enabled', 'Notifikace jsou již povoleny.'));
        return;
    }
    
    if (Notification.permission === 'denied') {
        alert(t('notifications.blocked', 'Notifikace jsou zablokovány. Povolte je v nastavení prohlížeče.'));
        return;
    }
    
    // Zobrazit dialog pro povolení
    const message = t('notifications.enable_prompt', 
        'Chcete dostávat připomínky o vyzrálých liquidech? Povolte notifikace.');
    
    if (confirm(message)) {
        requestNotificationPermission().then(permission => {
            if (permission === 'granted') {
                saveFcmTokenToDatabase().then(saved => {
                    if (saved) {
                        alert(t('notifications.enabled', 'Notifikace byly povoleny!'));
                    }
                });
            }
        });
    }
}

// Export funkcí na window
window.FCM = {
    isPushSupported,
    isFirebaseConfigured,
    initializeFirebase,
    requestNotificationPermission,
    getFcmToken,
    saveFcmTokenToDatabase,
    deleteFcmTokenFromDatabase,
    initializePushNotifications,
    showNotificationPermissionUI
};

console.log('fcm.js: Firebase Cloud Messaging module loaded');

