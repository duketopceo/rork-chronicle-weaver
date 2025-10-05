import { initializeApp, getApp, getApps, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration using environment variables
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase app with error handling
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] ✅ Firebase app initialized successfully');
  } catch (error) {
    console.error('[Firebase] ❌ Failed to initialize Firebase app:', error);
    // Rethrow to prevent app from starting with broken Firebase
    throw error;
  }
} else {
  app = getApp();
  console.log('[Firebase] ✅ Using existing Firebase app');
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };