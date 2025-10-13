/**
 * Chronicle Weaver - tRPC Context Creation
 * 
 * Creates the tRPC context for each request, providing access to:
 * - Firebase Admin SDK (Firestore, Auth)
 * - Authenticated user information
 * - Database connection
 * - Request metadata
 * 
 * Last Updated: January 2025
 */

import { initTRPC } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const auth = getAuth();

export interface Context {
  user: {
    uid: string;
    email: string | null;
    isAnonymous: boolean;
  } | null;
  db: FirebaseFirestore.Firestore;
  auth: any;
  req: Request;
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  try {
    // Extract authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        db,
        auth,
        req,
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify the Firebase ID token
      const decodedToken = await auth.verifyIdToken(token);
      
      return {
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email || null,
          isAnonymous: decodedToken.firebase.sign_in_provider === 'anonymous',
        },
        db,
        auth,
        req,
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return {
        user: null,
        db,
        auth,
        req,
      };
    }
  } catch (error) {
    console.error('Error creating context:', error);
    return {
      user: null,
      db,
      auth,
      req,
    };
  }
}