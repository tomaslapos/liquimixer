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
        // Register service worker first
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
        
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
    if (!token) return false;
    
    // Check if user is logged in (using Clerk)
    if (typeof Clerk === 'undefined' || !Clerk.user) {
        console.log('User not logged in, skipping FCM token save');
        return false;
    }
    
    try {
        const clerkId = Clerk.user.id;
        
        // Get device info
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height
        };
        
        // Save to database using database.js function
        if (typeof window.LiquiMixerDB !== 'undefined' && window.LiquiMixerDB.saveFcmToken) {
            await window.LiquiMixerDB.saveFcmToken(clerkId, token, deviceInfo);
            console.log('FCM token saved to database');
            return true;
        } else {
            console.warn('LiquiMixerDB module not available');
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
        
        // Show notification manually for foreground messages
        const notificationTitle = payload.notification?.title || 'Liquimixer';
        const notificationOptions = {
            body: payload.notification?.body || '',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'liquimixer-notification',
            data: payload.data
        };
        
        // Show notification
        if (Notification.permission === 'granted') {
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
            if (typeof window.LiquiMixerDB !== 'undefined' && window.LiquiMixerDB.deleteFcmToken) {
                await window.LiquiMixerDB.deleteFcmToken(clerkId, fcmToken);
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
    // Wait for Firebase SDK to load
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined') {
            clearInterval(checkFirebase);
            initializeFirebase();
            setupForegroundMessageHandler();
            
            // Auto-request permission if user is logged in
            if (typeof Clerk !== 'undefined') {
                Clerk.addListener(({ user }) => {
                    if (user && Notification.permission === 'default') {
                        // Optionally auto-request, or wait for user action
                        // requestNotificationPermission();
                    }
                });
            }
        }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkFirebase);
    }, 10000);
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

