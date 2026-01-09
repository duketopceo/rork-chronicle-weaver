/**
 * Chronicle Weaver - Stripe Service
 * 
 * Handles Stripe payment processing, subscription management, and billing operations.
 * Provides secure client-side integration with Stripe Elements and server-side webhook handling.
 * 
 * Features:
 * - Stripe Checkout session creation
 * - Customer portal access
 * - Subscription status management
 * - Payment method updates
 * - Usage tracking and billing
 * 
 * Last Updated: January 2025
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { trpcVanillaClient } from '../lib/trpc';
import { useGameStore } from '../store/gameStore';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null>;

if (STRIPE_PUBLISHABLE_KEY) {
  stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
} else {
  console.warn('Stripe publishable key not found');
  stripePromise = Promise.resolve(null);
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'master';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  usage: {
    aiCalls: number;
    gameSaves: number;
    dailyLimit: number;
    resetTime: Date;
  };
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

class StripeService {
  private stripe: Stripe | null = null;

  /**
   * Initialize Stripe
   */
  async initialize(): Promise<void> {
    if (!this.stripe) {
      this.stripe = await stripePromise;
    }
  }

  /**
   * Create Stripe checkout session for subscription
   */
  async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession> {
    try {
      await this.initialize();
      
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      // Call backend to create checkout session
      const result = await trpcVanillaClient.billing.createCheckoutSession.mutate({
        priceId,
        successUrl,
        cancelUrl,
      });

      if (!result.success) {
        throw new Error('Failed to create checkout session');
      }

      return {
        sessionId: result.sessionId,
        url: result.url,
      };

    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<void> {
    try {
      const session = await this.createCheckoutSession(priceId, successUrl, cancelUrl);
      
      // Redirect to Stripe checkout
      window.location.href = session.url;

    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  /**
   * Create customer portal session
   */
  async createPortalSession(returnUrl: string): Promise<string> {
    try {
      const result = await trpcVanillaClient.billing.createPortalSession.mutate({
        returnUrl,
      });

      if (!result.success) {
        throw new Error('Failed to create portal session');
      }

      return result.url;

    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  /**
   * Redirect to customer portal
   */
  async redirectToPortal(returnUrl: string): Promise<void> {
    try {
      const portalUrl = await this.createPortalSession(returnUrl);
      window.location.href = portalUrl;

    } catch (error) {
      console.error('Error redirecting to portal:', error);
      throw error;
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const result = await trpcVanillaClient.billing.getSubscriptionStatus.query();
      
      return {
        tier: result.tier as 'free' | 'premium' | 'master',
        status: result.status as 'active' | 'canceled' | 'past_due' | 'incomplete',
        currentPeriodEnd: result.currentPeriodEnd ? new Date(result.currentPeriodEnd * 1000) : null,
        cancelAtPeriodEnd: false, // TODO: Get from subscription data
        usage: {
          aiCalls: 0, // TODO: Get from usage tracking
          gameSaves: 0,
          dailyLimit: this.getDailyLimit(result.tier),
          resetTime: this.getResetTime(),
        },
      };

    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        tier: 'free',
        status: 'incomplete',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        usage: {
          aiCalls: 0,
          gameSaves: 0,
          dailyLimit: 5,
          resetTime: this.getResetTime(),
        },
      };
    }
  }

  /**
   * Update usage tracking
   */
  async updateUsage(action: 'ai_call' | 'game_save' | 'feature_access', metadata?: any): Promise<void> {
    try {
      await trpcVanillaClient.billing.updateUsage.mutate({
        action,
        metadata,
      });

    } catch (error) {
      console.error('Error updating usage:', error);
      // Don't throw - usage tracking should be non-blocking
    }
  }

  /**
   * Get subscription tiers
   */
  getSubscriptionTiers(): SubscriptionTier[] {
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: [
          '5 story turns per day',
          'Basic historical eras',
          'Single saved game',
          'Standard AI quality',
        ],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 4.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Unlimited story turns',
          'All historical eras (100+)',
          '5 saved games',
          'Priority AI processing',
          'No ads',
        ],
        popular: true,
      },
      {
        id: 'master',
        name: 'Chronicle Master',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'All Premium features',
          'Custom historical scenarios',
          'Advanced character customization',
          'Early access to new features',
          '20 saved games',
        ],
      },
    ];
  }

  /**
   * Get daily limit for subscription tier
   */
  private getDailyLimit(tier: string): number {
    switch (tier) {
      case 'premium':
      case 'master':
        return 1000; // Effectively unlimited
      case 'free':
      default:
        return 5;
    }
  }

  /**
   * Get reset time for daily limits
   */
  private getResetTime(): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Check if user can perform action based on subscription
   */
  canPerformAction(action: string, currentUsage: number, tier: string): boolean {
    const limits = {
      free: { ai_calls: 5, game_saves: 10 },
      premium: { ai_calls: 1000, game_saves: 1000 },
      master: { ai_calls: 10000, game_saves: 10000 },
    };

    const tierLimits = limits[tier as keyof typeof limits] || limits.free;
    const actionLimit = tierLimits[action as keyof typeof tierLimits] || 0;

    return currentUsage < actionLimit;
  }

  /**
   * Get upgrade prompt message
   */
  getUpgradeMessage(tier: string, action: string): string {
    if (tier === 'free') {
      return `You've reached your daily limit for ${action}. Upgrade to Premium for unlimited access.`;
    }
    return '';
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(sessionId: string): Promise<void> {
    try {
      // The webhook will handle the subscription update
      // This is just for UI feedback
      console.log('Payment successful:', sessionId);
      
      // Refresh subscription status
      const status = await this.getSubscriptionStatus();
      
      // Update store
      useGameStore.getState().setSubscription({
        plan: status.tier,
        status: status.status,
        current_period_end: status.currentPeriodEnd?.getTime() / 1000,
      });

    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  /**
   * Handle payment cancellation
   */
  async handlePaymentCancellation(): Promise<void> {
    console.log('Payment cancelled by user');
    // No action needed - user can try again
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Initialize on module load
stripeService.initialize().catch(console.error);

