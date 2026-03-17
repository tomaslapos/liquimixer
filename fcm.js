// Firebase Cloud Messaging initialization for Liquimixer
// This file handles push notification setup and FCM token management

const firebaseConfig = {
    apiKey: "AIzaSyARRacfElsLSyVm2B3v1WohYgArLwerNEo",
    authDomain: "liquimixer.firebaseapp.com",
    projectId: "liquimixer",
    storageBucket: "liquimixer.firebasestorage.app",
    messagingSenderId: "729409229192",
    appId: "1:729409229192:web:0c0679dcd6b75de8416a3d"
};

let messaging = null;
let fcmToken = null;

// Initialize Firebase when SDK is loaded
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded yet');
        return false;
    }
    
    try {
        // Check if already initialized
        if (firebase.apps && firebase.apps.length > 0) {
            console.log('Firebase already initialized');
        } else {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized successfully');
        }
        
        // Initialize messaging
        if ('Notification' in window && firebase.messaging) {
            messaging = firebase.messaging();
            console.log('Firebase Messaging initialized');
            return true;
        } else {
            console.warn('Notifications not supported in this browser');
            return false;
        }
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Request notification permission and get FCM token
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return null;
    }
    
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('Notification permission granted');
            return await getFcmToken();
        } else if (permission === 'denied') {
            console.warn('Notification permission denied');
            return null;
        } else {
            console.log('Notification permission dismissed');
            return null;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return null;
    }
}

// Get FCM token
async function getFcmToken() {
    if (!messaging) {
        if (!initializeFirebase()) {
            return null;
        }
    }
    
    try {
        // Use existing sw.js registration (which now includes FCM handling)
        const registration = await navigator.serviceWorker.ready;
        console.log('Using existing Service Worker for FCM:', registration.scope);
        
        // Get FCM token
        const token = await messaging.getToken({
            vapidKey: getVapidKey(),
            serviceWorkerRegistration: registration
        });
        
        if (token) {
            console.log('FCM Token obtained:', token.substring(0, 20) + '...');
            fcmToken = token;
            
            // Save token to database if user is logged in
            await saveFcmTokenToDatabase(token);
            
            return token;
        } else {
            console.warn('No FCM token available');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}

// Get VAPID key from Firebase Console
// Project Settings > Cloud Messaging > Web Push certificates
function getVapidKey() {
    return 'BN6ijSxVtN4UQB0pMbKMdOlwHjiUNWNaVqNx6L1gWhjTYe0Cf9JdOJMTfmL3TOfvTrLE5mXdSK6X7SzY505NfGA';
}

// Save FCM token to Supabase database
async function saveFcmTokenToDatabase(token) {
    if (!token) { console.warn('saveFcmTokenToDatabase: no token'); return false; }
    
    // Check if user is logged in (using Clerk)
    if (typeof Clerk === 'undefined' || !Clerk.user) {
        console.log('User not logged in, skipping FCM token save');
        return false;
    }
    
    try {
        const clerkId = Clerk.user.id;
        console.log('saveFcmTokenToDatabase: clerk_id=' + clerkId + ', token=' + token.substring(0, 20) + '...');
        
        // Ensure Supabase JWT auth is set before saving (prevents RLS failures)
        if (window.LiquiMixerDB && window.LiquiMixerDB.setAuth) {
            const authResult = await window.LiquiMixerDB.setAuth();
            console.log('saveFcmTokenToDatabase: setAuth result=' + authResult);
            if (!authResult) {
                console.error('saveFcmTokenToDatabase: setAuth FAILED — RLS will block the upsert');
            }
        } else {
            console.error('saveFcmTokenToDatabase: LiquiMixerDB.setAuth NOT AVAILABLE');
        }
        
        // Get device info
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height
        };
        
        // Save to database using database.js function
        if (typeof window.database !== 'undefined' && window.database.saveFcmToken) {
            const result = await window.database.saveFcmToken(clerkId, token, deviceInfo);
            if (result.error) {
                console.error('FCM token save FAILED:', result.error?.message || result.error);
                return false;
            }
            if (!result.data) {
                console.error('FCM token save: NO ERROR but NO DATA returned — likely RLS policy blocking INSERT');
                return false;
            }
            console.log('FCM token saved to database OK, id=' + result.data?.id);
            return true;
        } else {
            console.error('saveFcmTokenToDatabase: window.database=' + typeof window.database + ', saveFcmToken=' + (window.database?.saveFcmToken ? 'yes' : 'NO'));
            return false;
        }
    } catch (error) {
        console.error('Error saving FCM token:', error);
        return false;
    }
}

// Handle foreground messages
function setupForegroundMessageHandler() {
    if (!messaging) return;
    
    messaging.onMessage((payload) => {
        console.log('Foreground message received:', payload);
        
        // Data-only messages: title/body in payload.data (not payload.notification)
        const notificationTitle = payload.data?.title || payload.notification?.title || 'LiquiMixer';
        const notificationOptions = {
            body: payload.data?.body || payload.notification?.body || '',
            icon: '/icons/icon-192.png',
            badge: '/icons/badge-96.png',
            tag: 'liquimixer-notification',
            data: payload.data
        };
        
        // Show notification via Service Worker (more reliable than new Notification())
        if (Notification.permission === 'granted' && navigator.serviceWorker?.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(notificationTitle, notificationOptions);
            });
        } else if (Notification.permission === 'granted') {
            new Notification(notificationTitle, notificationOptions);
        }
    });
}

// Delete FCM token (for logout)
async function deleteFcmToken() {
    if (!messaging || !fcmToken) return;
    
    try {
        await messaging.deleteToken();
        
        // Also delete from database
        if (typeof Clerk !== 'undefined' && Clerk.user) {
            const clerkId = Clerk.user.id;
            if (typeof window.database !== 'undefined' && window.database.deleteFcmToken) {
                await window.database.deleteFcmToken(clerkId, fcmToken);
            }
        }
        
        fcmToken = null;
        console.log('FCM token deleted');
    } catch (error) {
        console.error('Error deleting FCM token:', error);
    }
}

// Check if notifications are supported and enabled
function areNotificationsEnabled() {
    return 'Notification' in window && Notification.permission === 'granted';
}

// Get current notification permission status
function getNotificationPermissionStatus() {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission; // 'granted', 'denied', or 'default'
}

// Initialize FCM when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('[FCM-DIAG] DOMContentLoaded, Notification.permission=' + (('Notification' in window) ? Notification.permission : 'NOT_SUPPORTED'));
    // Wait for Firebase SDK to load
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined') {
            clearInterval(checkFirebase);
            console.log('[FCM-DIAG] Firebase SDK loaded');
            initializeFirebase();
            setupForegroundMessageHandler();
            
            // Auto-register FCM token for logged-in users
            const waitForClerk = setInterval(() => {
                if (typeof Clerk !== 'undefined' && Clerk.loaded) {
                    clearInterval(waitForClerk);
                    console.log('[FCM-DIAG] Clerk loaded, user=' + (Clerk.user ? Clerk.user.id : 'null') + ', permission=' + Notification.permission);
                    
                    // If user is already logged in, register token
                    if (Clerk.user) {
                        if (Notification.permission === 'granted') {
                            console.log('[FCM-DIAG] Calling getFcmToken (auto-register on load)');
                            getFcmToken().then(t => console.log('[FCM-DIAG] getFcmToken result:', t ? t.substring(0, 20) + '...' : 'NULL')).catch(e => console.error('[FCM-DIAG] getFcmToken error:', e));
                        } else {
                            console.log('[FCM-DIAG] SKIPPING auto-register: permission=' + Notification.permission);
                        }
                    } else {
                        console.log('[FCM-DIAG] SKIPPING: no Clerk user');
                    }
                    
                    // Listen for sign-in/sign-out (debounced to prevent infinite loop)
                    let fcmListenerDebounce = null;
                    let lastFcmListenerUserId = Clerk.user?.id || null;
                    Clerk.addListener(({ user }) => {
                        const newUserId = user?.id || null;
                        // Only act on actual user change (sign-in/sign-out), not token refreshes
                        if (newUserId === lastFcmListenerUserId) return;
                        lastFcmListenerUserId = newUserId;
                        console.log('[FCM-DIAG] Clerk listener fired (user changed), user=' + (user ? user.id : 'null') + ', permission=' + Notification.permission);
                        if (user && Notification.permission === 'granted') {
                            if (fcmListenerDebounce) clearTimeout(fcmListenerDebounce);
                            fcmListenerDebounce = setTimeout(() => getFcmToken(), 1000);
                        }
                    });
                }
            }, 200);
            
            // Timeout Clerk check after 15 seconds
            setTimeout(() => clearInterval(waitForClerk), 15000);
        }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkFirebase);
    }, 10000);
    
    // Refresh FCM token when Service Worker updates (new SW invalidates old token)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'SW_UPDATED') {
                console.log('SW updated to', event.data.version, '— refreshing FCM token');
                if (typeof Clerk !== 'undefined' && Clerk.user && Notification.permission === 'granted') {
                    // Small delay to let new SW fully activate
                    setTimeout(() => getFcmToken(), 2000);
                }
            }
        });
    }
});

// Export functions for use in other scripts
window.fcm = {
    requestPermission: requestNotificationPermission,
    getToken: getFcmToken,
    deleteToken: deleteFcmToken,
    areEnabled: areNotificationsEnabled,
    getPermissionStatus: getNotificationPermissionStatus,
    getCurrentToken: () => fcmToken
};

