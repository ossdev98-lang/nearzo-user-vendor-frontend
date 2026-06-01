// Import Firebase Scripts inside the service worker (compat version)
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: We use fallback/dummy credentials that get read at runtime, or fallback gracefully.
const firebaseConfig = {
  apiKey: "AIzaSyCkDEH_tZDO_uVTVG1SCxXW00ExJczW8cI",
  authDomain: "nearzo-vendor.firebaseapp.com",
  projectId: "nearzo-vendor",
  storageBucket: "nearzo-vendor.firebasestorage.app",
  messagingSenderId: "1051688301712",
  appId: "1:1051688301712:web:80dfa6e2b98cbc8e221415",
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Nearzo PWA';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
