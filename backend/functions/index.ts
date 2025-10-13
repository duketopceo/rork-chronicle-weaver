/**
 * Chronicle Weaver - Firebase Functions Entry Point
 * 
 * Main entry point for Firebase Cloud Functions.
 * Exports the Hono server and tRPC API for deployment.
 * 
 * Functions:
 * - api: Main API server with tRPC routes
 * - aiHandler: AI processing service
 * - stripeWebhooks: Stripe webhook handler
 * 
 * Last Updated: January 2025
 */

import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
initializeApp();

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  memory: '2GiB',
  timeoutSeconds: 540,
  region: 'us-central1',
});

// Import the Hono server
import { api } from './hono';

// Import AI handler
import aiHandler from './ai-handler';

// === MAIN API FUNCTION ===
// Exports the Hono server as a Firebase Function
export const api = onRequest({
  memory: '2GiB',
  timeoutSeconds: 540,
  cors: true,
}, api);

// === AI HANDLER FUNCTION ===
// Dedicated function for AI processing
export const aiHandler = onRequest({
  memory: '2GiB',
  timeoutSeconds: 540,
  cors: true,
}, aiHandler);

// === STRIPE WEBHOOK FUNCTION ===
// Handles Stripe webhook events for subscription updates
export const stripeWebhooks = onRequest({
  memory: '1GiB',
  timeoutSeconds: 60,
  cors: true,
}, async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send('Webhook signature verification failed');
    }

    const db = getFirestore();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutCompleted(session, db);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription, db);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription, db);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice, db);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice, db);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

// === WEBHOOK HANDLERS ===

async function handleCheckoutCompleted(session: any, db: any) {
  try {
    const userId = session.metadata.userId;
    const subscriptionId = session.subscription;

    if (!userId || !subscriptionId) {
      console.error('Missing userId or subscriptionId in checkout session');
      return;
    }

    // Update user subscription status
    await db.collection('users').doc(userId).update({
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
      stripeCustomerId: session.customer,
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd: new Date(session.current_period_end * 1000),
      lastUpdated: new Date(),
    });

    console.log(`Subscription activated for user ${userId}`);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handleSubscriptionUpdate(subscription: any, db: any) {
  try {
    const customerId = subscription.customer;
    
    // Find user by Stripe customer ID
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', customerId)
      .get();

    if (usersSnapshot.empty) {
      console.error(`No user found for customer ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    // Determine subscription tier
    let tier = 'free';
    if (subscription.status === 'active') {
      const priceId = subscription.items.data[0].price.id;
      if (priceId.includes('premium')) {
        tier = 'premium';
      } else if (priceId.includes('master')) {
        tier = 'master';
      }
    }

    // Update user subscription
    await db.collection('users').doc(userId).update({
      subscriptionTier: tier,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      lastUpdated: new Date(),
    });

    console.log(`Subscription updated for user ${userId}: ${tier}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any, db: any) {
  try {
    const customerId = subscription.customer;
    
    // Find user by Stripe customer ID
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', customerId)
      .get();

    if (usersSnapshot.empty) {
      console.error(`No user found for customer ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    // Downgrade to free tier
    await db.collection('users').doc(userId).update({
      subscriptionTier: 'free',
      subscriptionStatus: 'canceled',
      currentPeriodEnd: null,
      lastUpdated: new Date(),
    });

    console.log(`Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice: any, db: any) {
  try {
    const customerId = invoice.customer;
    
    // Find user by Stripe customer ID
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', customerId)
      .get();

    if (usersSnapshot.empty) {
      console.error(`No user found for customer ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    // Update payment status
    await db.collection('users').doc(userId).update({
      lastPaymentDate: new Date(),
      paymentStatus: 'succeeded',
      lastUpdated: new Date(),
    });

    console.log(`Payment succeeded for user ${userId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice: any, db: any) {
  try {
    const customerId = invoice.customer;
    
    // Find user by Stripe customer ID
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', customerId)
      .get();

    if (usersSnapshot.empty) {
      console.error(`No user found for customer ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    // Update payment status
    await db.collection('users').doc(userId).update({
      paymentStatus: 'failed',
      lastPaymentAttempt: new Date(),
      lastUpdated: new Date(),
    });

    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// === USAGE TRACKING TRIGGERS ===
// Automatically reset daily usage at midnight UTC
export const resetDailyUsage = onDocumentCreated(
  'users/{userId}/usage/{date}',
  async (event) => {
    const db = getFirestore();
    const userId = event.params.userId;
    const date = event.params.date;
    
    // Check if this is a new day
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      // Initialize usage for new day
      await db.collection('users').doc(userId)
        .collection('usage').doc(today).set({
          aiCalls: 0,
          gameSaves: 0,
          featureAccess: 0,
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        });
    }
  }
);

// === GAME CLEANUP TRIGGERS ===
// Clean up old games and turns for inactive users
export const cleanupOldGames = onDocumentUpdated(
  'users/{userId}',
  async (event) => {
    const db = getFirestore();
    const userId = event.params.userId;
    const userData = event.data.after.data();
    
    // Only cleanup for free users with old games
    if (userData.subscriptionTier === 'free') {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
      
      // Find old games
      const oldGamesSnapshot = await db.collection('games')
        .where('userId', '==', userId)
        .where('lastPlayedAt', '<', cutoffDate)
        .get();
      
      // Delete old games and their subcollections
      const batch = db.batch();
      oldGamesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        // Also delete turns and memories subcollections
        // (This would need to be done in a separate function due to Firestore limitations)
      });
      
      await batch.commit();
      console.log(`Cleaned up ${oldGamesSnapshot.docs.length} old games for user ${userId}`);
    }
  }
);


