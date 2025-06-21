import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAppCheck, getToken, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, Auth, User, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db = getFirestore(app);

// Initialize AppCheck instance
const appCheckInstance = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LeUcBMpAAAAAOG9QwQw7Qw7Qw7Qw7Qw7Qw7Qw7Q'), // <-- Replace with your actual reCAPTCHA v3 key
  isTokenAutoRefreshEnabled: true,
});

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
