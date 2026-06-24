// Import Firebase Scripts inside the service worker (compat version)
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: We use fallback/dummy credentials that get read at runtime, or fallback gracefully.
const firebaseConfig = {
  apiKey: "AIzaSyCO1g3dVmUwqJCumVBSMBMJqhFtapH1Cto",
  authDomain: "nearzo-47944.firebaseapp.com",
  projectId: "nearzo-47944",
  storageBucket: "nearzo-47944.firebasestorage.app",
  messagingSenderId: "131416876589",
  appId: "1:131416876589:web:8cb179b67accc695fb7aa4",
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
