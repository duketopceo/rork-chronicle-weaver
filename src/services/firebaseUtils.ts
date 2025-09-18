import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAppCheck, getToken, ReCaptchaV3Provider } from "firebase/app-check";
import { 
  getAuth, 
  Auth, 
  User, 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration with hardcoded values
const firebaseConfig = {
  apiKey: "AIzaSyAPzTeKMayMR6ksUsmdW6nIX-dypgxQbe0",
  authDomain: "chronicle-weaver-460713.firebaseapp.com",
  databaseURL: "https://chronicle-weaver-460713-default-rtdb.firebaseio.com",
  projectId: "chronicle-weaver-460713",
  storageBucket: "chronicle-weaver-460713.appspot.com",
  messagingSenderId: "927289740022",
  appId: "1:927289740022:web:bcb19bdbcce16cb9227ad7",
  measurementId: "G-ENMCNZZZTJ"
};

console.log('[Firebase] 🔥 Initializing Firebase with hardcoded configuration');

// Initialize Firebase app with error handling
let app;
try {
  // Check if Firebase app is already initialized
  const existingApp = getApps()[0];
  if (existingApp) {
    app = existingApp;
    console.log('[Firebase] ✅ Using existing Firebase app');
  } else {
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] ✅ Firebase app initialized successfully');
  }
} catch (error) {
  console.error('[Firebase] ❌ Failed to initialize Firebase app:', error);
  // Rethrow to prevent app from starting with broken Firebase
  throw error;
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db = getFirestore(app);

// Initialize AppCheck instance with error handling
let appCheckInstance;
try {
  // Temporarily disable AppCheck to prevent initialization issues
  // appCheckInstance = initializeAppCheck(app, {
  //   provider: new ReCaptchaV3Provider('6LeUcBMpAAAAAOG9QwQw7Qw7Qw7Qw7Qw7Qw7Qw7Q'), // <-- Replace with your actual reCAPTCHA v3 key
  //   isTokenAutoRefreshEnabled: true,
  // });
  console.log('[Firebase] ⚠️ AppCheck temporarily disabled for development');
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
    console.log('[Firebase] 👋 User signed out successfully');
  } catch (error) {
    console.error('[Firebase] ❌ Error signing out:', error);
    throw error;
  }
};

// Google Authentication
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const provider = new GoogleAuthProvider();
    // Add any additional scopes you need
    provider.addScope('profile');
    provider.addScope('email');
    
    // Sign in with redirect on mobile, popup on web
    if (window.innerWidth < 768) {
      await signInWithRedirect(auth, provider);
      // Handle the redirect result in your auth state change handler
      return null;
    } else {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    }
  } catch (error) {
    console.error('[Firebase] ❌ Google sign in failed:', error);
    throw error;
  }
};

// Handle redirect result (for mobile)
export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log('[Firebase] 🔄 Redirect sign-in successful');
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('[Firebase] ❌ Error handling redirect result:', error);
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
    // Skip App Check token if appCheckInstance is not available
    let appCheckToken = null;
    if (appCheckInstance) {
      appCheckToken = await getToken(appCheckInstance);
    }
    
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User is not authenticated.");
    }

    const idToken = await user.getIdToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`,
    };

    // Only add App Check header if token is available
    if (appCheckToken) {
      headers["X-Firebase-AppCheck"] = appCheckToken.token;
    }

    // Use the correct region and project ID for your Firebase Functions endpoint
    const response = await fetch(`https://us-central1-chronicle-weaver-460713.cloudfunctions.net/${functionName}`, {
      method: "POST",
      headers,
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
