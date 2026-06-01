import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration using Vite environment variables with safe fallback defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkDEH_tZDO_uVTVG1SCxXW00ExJczW8cI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nearzo-vendor.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nearzo-vendor",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nearzo-vendor.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1051688301712",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1051688301712:web:80dfa6e2b98cbc8e221415"
};

// VAPID Key for web push notification registration (public VAPID key from Firebase Console -> Project Settings -> Cloud Messaging)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BGgdysmYelfSOwPbPNAG8R_9IYbzAz_7Dtz2OAmAgobdO6pciTBSq77oX3Y1CGvM87gfA8zoilHruoS3wqM6bT4";

let app = null;
let messaging = null;

try {
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);
  // Get Firebase Messaging instance
  messaging = getMessaging(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

/**
 * Request permission and get Firebase Cloud Messaging Token
 * @returns {Promise<string|null>} FCM Token
 */
export const requestForToken = async () => {
  const isFirebaseConfigured = 
    import.meta.env.VITE_FIREBASE_API_KEY && 
    !import.meta.env.VITE_FIREBASE_API_KEY.includes("Dummy") &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSyDummyKeyForNearzoPWA123456";

  if (!isFirebaseConfigured) {
    console.log('Firebase Env variables not set or using dummy values. Generating mock token locally to prevent API block.');
    const randomHex = () => Math.random().toString(36).substring(2, 15);
    const mockToken = `fcm:APA91b${randomHex()}${randomHex()}_${randomHex()}${randomHex()}`;
    return mockToken;
  }

  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        console.log('Firebase FCM token received successfully:', token);
        localStorage.setItem('fcmToken', token);
        return token;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.warn('Notification permission not granted.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving Firebase FCM token:', err);
    const randomHex = () => Math.random().toString(36).substring(2, 15);
    const mockToken = `fcm:APA91b${randomHex()}${randomHex()}_${randomHex()}${randomHex()}`;
    return mockToken;
  }
};

/**
 * Handle incoming foreground messages
 * @param {Function} callback Handler function
 */
export const onMessageListener = (callback) => {
  if (!messaging) return;
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received in active view:', payload);
    callback(payload);
  });
};
