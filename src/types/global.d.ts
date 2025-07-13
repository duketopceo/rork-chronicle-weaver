/**
 * Global Type Declarations
 * 
 * Global TypeScript declarations for modules, environments, and external libraries.
 * 
 * Purpose: Provides type safety for global objects and external dependencies.
 * 
 * References:
 * - File: src/types/global.d.ts
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

export type ChronicleDebugState = {
  callCount: number;
  apiCallHistory: ApiCall[];
  performanceMetrics?: {
    timestamp: number;
    memoryUsage: number;
    renderTime: number;
    apiLatency: number;
    frameRate: number;
    networkStatus: string;
    batteryLevel: number;
  };
  systemInfo?: {
    os: string;
    version: string;
  };
  lastPrompt?: string;
  lastResponse?: ApiResponse;
  lastRawResponse?: string;
  lastError?: ApiError;
  lastApiCall?: ApiCall;
};

declare global {
  var __CHRONICLE_DEBUG__: ChronicleDebugState;

  // Google Analytics gtag function
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: {
        cookie_domain?: string;
        cookie_flags?: string;
        anonymize_ip?: boolean;
        allow_google_signals?: boolean;
        allow_ad_personalization_signals?: boolean;
        [key: string]: any;
      }
    ) => void;
  }
}

export type ApiCompletion<T = unknown> = {
  completion?: string;
  data?: T;
  [key: string]: unknown;
};

export {};
