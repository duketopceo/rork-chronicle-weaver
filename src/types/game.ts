/**
 * Game Type Definitions for Chronicle Weaver
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the Chronicle Weaver historical RPG game. It defines the data structures
 * for game mechanics, character progression, world systems, and narrative elements.
 * 
 * Key Type Categories:
 * - Game Flow: Choices, segments, and narrative structure
 * - Character System: Stats, inventory, skills, and relationships
 * - World Mechanics: Political factions, economic systems, time periods
 * - Memory System: Player history and consequence tracking
 * - AI Integration: Narrative generation and response handling
 * 
 * Uses Zod for runtime validation and type safety across client/server boundaries.
 */

import { z } from "zod";

 */
export type ChronosMessage = {
  id: string;          // Unique message identifier
  message: string;    // The message content
  timestamp: number;   // When the message was sent
  response?: string;  // AI response to the message
  status: "pending" | "answered" | "failed"; // Status of the message
};

/**
 * Performance metrics for debug panel
 */
export type PerformanceMetrics = {
  timestamp: number;  // Time of the metric record
  memoryUsage: number; // Memory usage in MB
  renderTime: number;  // Render time in ms
  apiLatency: number;  // API call latency in ms
  frameRate: number;   // Frame rate in FPS
  networkStatus: string; // Network status (e.g., "online", "offline")
  batteryLevel: number; // Battery level in percentage
  cpuUsage?: number;   // CPU usage in percentage
  diskUsage?: number;  // Disk usage in percentage
  networkLatency?: number; // Network latency in ms
};

/**
 * Enhanced debug information
 */
export type DebugInfo = {
  lastApiCall?: any;  // Data from the last API call
  lastResponse?: any; // Data from the last API response
  lastError?: any;    // Last error object, if any
  callCount: number;   // Total number of API calls made
  lastPrompt?: string; // Last prompt sent to the AI
  lastRawResponse?: string; // Last raw response from the AI
  apiCallHistory: any[]; // History of API calls
  performanceMetrics?: PerformanceMetrics; // Latest performance metrics
  systemInfo?: {
    platform: string;    // Platform type (e.g., "web", "mobile")
    version: string;     // App version
    deviceType: string;  // Device type (e.g., "desktop", "tablet", "phone")
    screenDimensions: { width: number; height: number }; // Screen dimensions
    orientation: string;  // Screen orientation (e.g., "portrait", "landscape")
    isDebug: boolean;    // Whether the app is in debug mode
  };
  cpuUsage?: number;   // CPU usage at the time of logging
  networkLatency?: number; // Network latency at the time of logging
};

/**
 * User account types for future subscription system
 */
export type UserAccount = {
  id: string;          // Unique user identifier
  email: string;      // User's email address
  displayName: string; // User's display name
  subscriptionStatus: "free" | "premium"; // Subscription status
  subscriptionExpiry?: number; // Expiry date of the subscription
  turnsUsed: number;    // Number of turns used by the player
  maxTurns: number;    // Maximum number of turns (10 for free, unlimited for premium)
  createdAt: number;    // When the account was created
  lastActiveAt: number; // When the account was last active
};

/**
 * Subscription Plan Interface
 * 
 * Defines the available subscription plans for users.
 */
export type SubscriptionPlan = {
  id: string;          // Unique plan identifier
  name: string;        // Name of the subscription plan
  price: number;      // Price of the plan
  currency: string;    // Currency used for the price
  features: string[];  // List of features included in the plan
  maxTurns: number;    // Maximum number of turns allowed
  stripePriceId?: string; // Stripe price ID for payment processing
};