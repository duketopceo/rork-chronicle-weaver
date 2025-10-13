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
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
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
const authInstance = getAuth(app);
export const auth = authInstance;
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

// === COMPLETE AUTHENTICATION FUNCTIONS ===

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('[Auth] ✅ Signed in with email:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error('[Auth] ❌ Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Create new account with email and password
 */
export async function createAccount(email: string, password: string): Promise<User | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('[Auth] ✅ Account created:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error('[Auth] ❌ Account creation error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign in as guest/anonymous user
 */
export async function signInAsGuest(): Promise<User | null> {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('[Auth] ✅ Signed in as guest');
    return userCredential.user;
  } catch (error: any) {
    console.error('[Auth] ❌ Guest sign in error:', error);
    throw new Error('Failed to sign in as guest. Please try again.');
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    console.log('[Auth] ✅ User signed out');
  } catch (error: any) {
    console.error('[Auth] ❌ Sign out error:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('[Auth] ✅ Password reset email sent to:', email);
  } catch (error: any) {
    console.error('[Auth] ❌ Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(profileData: { displayName?: string; photoURL?: string }): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    await updateProfile(auth.currentUser, profileData);
    console.log('[Auth] ✅ User profile updated');
  } catch (error: any) {
    console.error('[Auth] ❌ Profile update error:', error);
    throw new Error('Failed to update profile. Please try again.');
  }
}

/**
 * Update user email
 */
export async function updateUserEmail(newEmail: string, password: string): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    // Re-authenticate user before updating email
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    await updateEmail(auth.currentUser, newEmail);
    console.log('[Auth] ✅ User email updated to:', newEmail);
  } catch (error: any) {
    console.error('[Auth] ❌ Email update error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    // Re-authenticate user before updating password
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    await updatePassword(auth.currentUser, newPassword);
    console.log('[Auth] ✅ User password updated');
  } catch (error: any) {
    console.error('[Auth] ❌ Password update error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Get user-friendly error messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/requires-recent-login':
      return 'Please sign in again to complete this action';
    default:
      return 'Authentication failed. Please try again';
  }
}
