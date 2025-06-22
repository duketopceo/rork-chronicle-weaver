import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAppCheck, getToken, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, Auth, User, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Validate environment variables
const validateEnvVars = () => {
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  console.log('[Firebase] 🔍 Environment variables check:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`[Firebase] ${varName}: ${value ? `${value.substring(0, 10)}...` : 'MISSING'}`);
  });
  
  if (missing.length > 0) {
    console.error('[Firebase] ❌ Missing environment variables:', missing);
    console.log('[Firebase] Available env vars:', Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_')));
    return false;
  }

  console.log('[Firebase] ✅ All required environment variables found');
  return true;
};

// Backup configuration for production (fallback)
const productionConfig = {
  apiKey: "AIzaSyAPzTeKMayMR6ksUsmdW6nIX-dypgxQbe0",
  authDomain: "chronicle-weaver-460713.firebaseapp.com",
  projectId: "chronicle-weaver-460713",
  storageBucket: "chronicle-weaver-460713.appspot.com",
  messagingSenderId: "927289740022",
  appId: "1:927289740022:web:bcb19bdbcce16cb9227ad7",
  measurementId: "G-ENMCNZZZTJ"
};

// Check if environment variables are available
const hasEnvVars = validateEnvVars();

// Firebase configuration - use env vars if available, otherwise use hardcoded production config
const firebaseConfig = hasEnvVars ? {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
} : productionConfig;

console.log('[Firebase] 🔥 Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'MISSING'
});

// Initialize Firebase app
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log('[Firebase] ✅ Firebase app initialized successfully');
} catch (error) {
  console.error('[Firebase] ❌ Failed to initialize Firebase app:', error);
  throw error;
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db = getFirestore(app);

// Initialize AppCheck instance with error handling
let appCheckInstance;
try {
  appCheckInstance = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LeUcBMpAAAAAOG9QwQw7Qw7Qw7Qw7Qw7Qw7Qw7Q'), // <-- Replace with your actual reCAPTCHA v3 key
    isTokenAutoRefreshEnabled: true,
  });
  console.log('[Firebase] ✅ AppCheck initialized successfully');
} catch (error) {
  console.warn('[Firebase] ⚠️ AppCheck initialization failed (continuing without it):', error);
  // Continue without AppCheck - it's not critical for basic functionality
}

/**
 * Authentication Helper Functions
 */

// Sign in anonymously for guest users
export const signInAsGuest = async (): Promise<User | null> => {
  try {
    const result = await signInAnonymously(auth);
    console.log('User signed in anonymously:', result.user.uid);
    return result.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in with email:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

// Create new account with email and password
export const createAccount = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('New account created:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

// Sign out current user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Listen to authentication state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Helper function to call Firebase Functions securely.
 * @param functionName - The name of the Firebase Function to call.
 * @param payload - The payload to send to the function.
 * @returns The response from the Firebase Function.
 */
export async function fetchFromFirebaseFunction(functionName: string, payload: any): Promise<any> {
  try {
    // Retrieve the App Check token
    const appCheckToken = await getToken(appCheckInstance);
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User is not authenticated.");
    }

    const idToken = await user.getIdToken();

    // Use the correct region and project ID for your Firebase Functions endpoint
    const response = await fetch(`https://us-central1-chronicle-weaver-460713.cloudfunctions.net/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
        "X-Firebase-AppCheck": appCheckToken.token,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firebase Function call failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling Firebase Function:", error);
    throw error;
  }
}
