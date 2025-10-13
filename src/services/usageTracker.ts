/**
 * Chronicle Weaver - Usage Tracker Service
 * 
 * Tracks user API usage for free tier limits and billing purposes.
 * Provides real-time usage monitoring, limit enforcement, and upgrade prompts.
 * 
 * Features:
 * - Track AI calls per user per day
 * - Display remaining turns for free users
 * - Block gameplay when limit reached
 * - Show upgrade prompt on limit
 * - Reset daily counters at midnight UTC
 * - Cache usage data locally for performance
 * 
 * Last Updated: January 2025
 */

import { useGameStore } from '../store/gameStore';
import { stripeService } from './stripeService';

export interface UsageData {
  aiCalls: number;
  gameSaves: number;
  featureAccess: number;
  dailyLimit: number;
  resetTime: Date;
  tier: 'free' | 'premium' | 'master';
}

export interface UsageAlert {
  type: 'warning' | 'limit_reached' | 'upgrade_prompt';
  message: string;
  remaining?: number;
  resetTime?: Date;
}

class UsageTracker {
  private cache = new Map<string, UsageData>();
  private alertCallbacks: ((alert: UsageAlert) => void)[] = [];
  private resetInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupDailyReset();
  }

  /**
   * Track usage for a specific action
   */
  async trackUsage(action: 'ai_call' | 'game_save' | 'feature_access', metadata?: any): Promise<boolean> {
    try {
      const userId = useGameStore.getState().user?.uid;
      if (!userId) {
        console.warn('No user ID for usage tracking');
        return false;
      }

      // Get current usage data
      const usage = await this.getUsageData(userId);
      
      // Check if action is allowed
      if (!this.canPerformAction(action, usage)) {
        this.showAlert({
          type: 'limit_reached',
          message: this.getLimitMessage(action, usage),
          remaining: 0,
          resetTime: usage.resetTime,
        });
        return false;
      }

      // Update usage count
      const newUsage = { ...usage };
      switch (action) {
        case 'ai_call':
          newUsage.aiCalls += 1;
          break;
        case 'game_save':
          newUsage.gameSaves += 1;
          break;
        case 'feature_access':
          newUsage.featureAccess += 1;
          break;
      }

      // Update cache
      this.cache.set(userId, newUsage);

      // Update server
      await stripeService.updateUsage(action, metadata);

      // Check if approaching limit
      this.checkApproachingLimit(action, newUsage);

      return true;

    } catch (error) {
      console.error('Error tracking usage:', error);
      return false;
    }
  }

  /**
   * Get current usage data for user
   */
  async getUsageData(userId: string): Promise<UsageData> {
    try {
      // Check cache first
      const cached = this.cache.get(userId);
      if (cached && this.isCacheValid(cached)) {
        return cached;
      }

      // Get from server
      const subscriptionStatus = await stripeService.getSubscriptionStatus();
      
      const usage: UsageData = {
        aiCalls: 0, // TODO: Get from server
        gameSaves: 0,
        featureAccess: 0,
        dailyLimit: this.getDailyLimit(subscriptionStatus.tier),
        resetTime: this.getResetTime(),
        tier: subscriptionStatus.tier,
      };

      // Update cache
      this.cache.set(userId, usage);

      return usage;

    } catch (error) {
      console.error('Error getting usage data:', error);
      return this.getDefaultUsage();
    }
  }

  /**
   * Check if user can perform action
   */
  canPerformAction(action: string, usage: UsageData): boolean {
    const limits = this.getActionLimits(usage.tier);
    const actionLimit = limits[action as keyof typeof limits] || 0;
    const currentUsage = this.getCurrentUsage(action, usage);

    return currentUsage < actionLimit;
  }

  /**
   * Get remaining usage for action
   */
  getRemainingUsage(action: string, usage: UsageData): number {
    const limits = this.getActionLimits(usage.tier);
    const actionLimit = limits[action as keyof typeof limits] || 0;
    const currentUsage = this.getCurrentUsage(action, usage);

    return Math.max(0, actionLimit - currentUsage);
  }

  /**
   * Check if approaching limit and show warning
   */
  private checkApproachingLimit(action: string, usage: UsageData): void {
    const limits = this.getActionLimits(usage.tier);
    const actionLimit = limits[action as keyof typeof limits] || 0;
    const currentUsage = this.getCurrentUsage(action, usage);
    const remaining = actionLimit - currentUsage;

    if (remaining <= 1 && usage.tier === 'free') {
      this.showAlert({
        type: 'warning',
        message: `You have ${remaining} ${action} remaining today. Consider upgrading to Premium for unlimited access.`,
        remaining,
        resetTime: usage.resetTime,
      });
    }
  }

  /**
   * Show usage alert
   */
  private showAlert(alert: UsageAlert): void {
    this.alertCallbacks.forEach(callback => callback(alert));
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: UsageAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get action limits for subscription tier
   */
  private getActionLimits(tier: string): Record<string, number> {
    switch (tier) {
      case 'premium':
        return { ai_call: 1000, game_save: 1000, feature_access: 1000 };
      case 'master':
        return { ai_call: 10000, game_save: 10000, feature_access: 10000 };
      case 'free':
      default:
        return { ai_call: 5, game_save: 10, feature_access: 3 };
    }
  }

  /**
   * Get current usage for action
   */
  private getCurrentUsage(action: string, usage: UsageData): number {
    switch (action) {
      case 'ai_call':
        return usage.aiCalls;
      case 'game_save':
        return usage.gameSaves;
      case 'feature_access':
        return usage.featureAccess;
      default:
        return 0;
    }
  }

  /**
   * Get daily limit for subscription tier
   */
  private getDailyLimit(tier: string): number {
    switch (tier) {
      case 'premium':
        return 1000;
      case 'master':
        return 10000;
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
   * Get limit message for action
   */
  private getLimitMessage(action: string, usage: UsageData): string {
    if (usage.tier === 'free') {
      return `You've reached your daily limit for ${action}. Upgrade to Premium for unlimited access.`;
    }
    return `Usage limit reached for ${action}.`;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(usage: UsageData): boolean {
    const now = new Date();
    return now < usage.resetTime;
  }

  /**
   * Get default usage data
   */
  private getDefaultUsage(): UsageData {
    return {
      aiCalls: 0,
      gameSaves: 0,
      featureAccess: 0,
      dailyLimit: 5,
      resetTime: this.getResetTime(),
      tier: 'free',
    };
  }

  /**
   * Setup daily reset timer
   */
  private setupDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilReset = tomorrow.getTime() - now.getTime();

    this.resetInterval = setTimeout(() => {
      this.clearCache();
      this.setupDailyReset(); // Setup next reset
    }, msUntilReset);
  }

  /**
   * Clear usage cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get usage statistics
   */
  getStats(): { cacheSize: number; users: string[] } {
    return {
      cacheSize: this.cache.size,
      users: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.resetInterval) {
      clearTimeout(this.resetInterval);
    }
    this.clearCache();
    this.alertCallbacks = [];
  }
}

// Export singleton instance
export const usageTracker = new UsageTracker();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    usageTracker.destroy();
  });
}
