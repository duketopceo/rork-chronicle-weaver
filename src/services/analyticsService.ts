/**
 * Chronicle Weaver - Analytics Service
 * 
 * Firebase Analytics integration for tracking user journey, conversions, and feature usage.
 * Provides comprehensive analytics for product insights and optimization.
 * 
 * Features:
 * - User journey tracking
 * - Conversion funnel analysis
 * - Feature usage metrics
 * - Custom event tracking
 * - User property management
 * - Privacy-compliant analytics
 * 
 * Last Updated: January 2025
 */

import { getAnalytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { app } from './firebaseUtils';

// Initialize Analytics only in browser environment
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

export interface UserProperties {
  subscription_tier?: string;
  user_type?: 'new' | 'returning' | 'premium';
  preferred_era?: string;
  preferred_theme?: string;
  total_games?: number;
  total_turns?: number;
}

class AnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;

  /**
   * Initialize analytics for a user
   */
  async initializeUser(userId: string, properties?: UserProperties) {
    try {
      if (!analytics) {
        console.warn('[Analytics] Analytics not available (SSR)');
        return;
      }
      this.userId = userId;
      setUserId(analytics, userId);
      
      if (properties) {
        await this.setUserProperties(properties);
      }
      
      this.isInitialized = true;
      console.log('[Analytics] User initialized:', userId);
    } catch (error) {
      console.error('[Analytics] Failed to initialize user:', error);
    }
  }

  /**
   * Set user properties for segmentation
   */
  async setUserProperties(properties: UserProperties) {
    try {
      if (!analytics) {
        console.warn('[Analytics] Analytics not available (SSR)');
        return;
      }
      setUserProperties(analytics, properties);
      console.log('[Analytics] User properties set:', properties);
    } catch (error) {
      console.error('[Analytics] Failed to set user properties:', error);
    }
  }

  /**
   * Track a custom event
   */
  async trackEvent(eventName: string, parameters?: Record<string, any>) {
    try {
      if (!analytics) {
        console.warn('[Analytics] Analytics not available (SSR)');
        return;
      }
      if (!this.isInitialized) {
        console.warn('[Analytics] Analytics not initialized');
        return;
      }

      logEvent(analytics, eventName, {
        timestamp: Date.now(),
        ...parameters,
      });
      
      console.log('[Analytics] Event tracked:', eventName, parameters);
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  // === USER JOURNEY TRACKING ===

  /**
   * Track user signup
   */
  async trackSignup(method: 'email' | 'google' | 'guest') {
    await this.trackEvent('sign_up', {
      method,
      user_type: 'new',
    });
  }

  /**
   * Track user signin
   */
  async trackSignin(method: 'email' | 'google' | 'guest') {
    await this.trackEvent('login', {
      method,
      user_type: 'returning',
    });
  }

  /**
   * Track game creation
   */
  async trackGameCreated(era: string, theme: string, characterName: string) {
    await this.trackEvent('game_created', {
      era,
      theme,
      character_name: characterName,
    });
  }

  /**
   * Track game start
   */
  async trackGameStarted(gameId: string, era: string, theme: string) {
    await this.trackEvent('game_started', {
      game_id: gameId,
      era,
      theme,
    });
  }

  /**
   * Track turn completion
   */
  async trackTurnCompleted(gameId: string, turnNumber: number, choiceType: 'predefined' | 'custom') {
    await this.trackEvent('turn_completed', {
      game_id: gameId,
      turn_number: turnNumber,
      choice_type: choiceType,
    });
  }

  /**
   * Track game save
   */
  async trackGameSaved(gameId: string, turnCount: number) {
    await this.trackEvent('game_saved', {
      game_id: gameId,
      turn_count: turnCount,
    });
  }

  /**
   * Track game load
   */
  async trackGameLoaded(gameId: string, turnCount: number) {
    await this.trackEvent('game_loaded', {
      game_id: gameId,
      turn_count: turnCount,
    });
  }

  // === CONVERSION TRACKING ===

  /**
   * Track subscription upgrade
   */
  async trackSubscriptionUpgrade(plan: 'premium' | 'master', source: string) {
    await this.trackEvent('purchase', {
      currency: 'USD',
      value: plan === 'premium' ? 9.99 : 19.99,
      plan,
      source,
    });
  }

  /**
   * Track checkout session start
   */
  async trackCheckoutStarted(plan: 'premium' | 'master') {
    await this.trackEvent('begin_checkout', {
      currency: 'USD',
      value: plan === 'premium' ? 9.99 : 19.99,
      plan,
    });
  }

  /**
   * Track checkout completion
   */
  async trackCheckoutCompleted(plan: 'premium' | 'master', sessionId: string) {
    await this.trackEvent('purchase', {
      currency: 'USD',
      value: plan === 'premium' ? 9.99 : 19.99,
      plan,
      transaction_id: sessionId,
    });
  }

  /**
   * Track billing portal access
   */
  async trackBillingPortalAccessed() {
    await this.trackEvent('billing_portal_accessed');
  }

  // === FEATURE USAGE TRACKING ===

  /**
   * Track AI usage
   */
  async trackAIUsage(gameId: string, turnNumber: number, responseTime: number) {
    await this.trackEvent('ai_usage', {
      game_id: gameId,
      turn_number: turnNumber,
      response_time: responseTime,
    });
  }

  /**
   * Track custom choice usage
   */
  async trackCustomChoice(gameId: string, turnNumber: number, choiceLength: number) {
    await this.trackEvent('custom_choice_used', {
      game_id: gameId,
      turn_number: turnNumber,
      choice_length: choiceLength,
    });
  }

  /**
   * Track memory creation
   */
  async trackMemoryCreated(gameId: string, memoryType: string) {
    await this.trackEvent('memory_created', {
      game_id: gameId,
      memory_type: memoryType,
    });
  }

  /**
   * Track lore discovery
   */
  async trackLoreDiscovered(gameId: string, loreType: string) {
    await this.trackEvent('lore_discovered', {
      game_id: gameId,
      lore_type: loreType,
    });
  }

  // === ERROR TRACKING ===

  /**
   * Track errors
   */
  async trackError(errorType: string, errorMessage: string, context?: Record<string, any>) {
    await this.trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      ...context,
    });
  }

  /**
   * Track API errors
   */
  async trackAPIError(endpoint: string, statusCode: number, errorMessage: string) {
    await this.trackEvent('api_error', {
      endpoint,
      status_code: statusCode,
      error_message: errorMessage,
    });
  }

  // === ENGAGEMENT TRACKING ===

  /**
   * Track screen views
   */
  async trackScreenView(screenName: string, screenClass?: string) {
    await this.trackEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass,
    });
  }

  /**
   * Track session duration
   */
  async trackSessionDuration(duration: number, gameCount: number, turnCount: number) {
    await this.trackEvent('session_end', {
      session_duration: duration,
      games_played: gameCount,
      turns_completed: turnCount,
    });
  }

  /**
   * Track user engagement
   */
  async trackEngagement(engagementType: 'high' | 'medium' | 'low', metrics: Record<string, number>) {
    await this.trackEvent('user_engagement', {
      engagement_type: engagementType,
      ...metrics,
    });
  }

  // === RETENTION TRACKING ===

  /**
   * Track user retention
   */
  async trackRetention(daysSinceFirstVisit: number, isActive: boolean) {
    await this.trackEvent('user_retention', {
      days_since_first_visit: daysSinceFirstVisit,
      is_active: isActive,
    });
  }

  /**
   * Track feature adoption
   */
  async trackFeatureAdoption(featureName: string, adoptionStage: 'discovered' | 'tried' | 'adopted') {
    await this.trackEvent('feature_adoption', {
      feature_name: featureName,
      adoption_stage: adoptionStage,
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export convenience functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) =>
  analyticsService.trackEvent(eventName, parameters);

export const trackScreenView = (screenName: string, screenClass?: string) =>
  analyticsService.trackScreenView(screenName, screenClass);

export const trackError = (errorType: string, errorMessage: string, context?: Record<string, any>) =>
  analyticsService.trackError(errorType, errorMessage, context);
