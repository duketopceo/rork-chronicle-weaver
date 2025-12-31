/**
 * Game Type Definitions for Chronicle Weaver
 *
 * This file contains all TypeScript interfaces and types used throughout
 * the Chronicle Weaver historical RPG game. It defines the data structures
 * for game mechanics, character progression, world systems, and narrative elements.
 */

import { z } from "zod";

/** Represents a choice available to the player in a game segment. */
export type GameChoice = {
  id: string; // Unique identifier for the choice
  text: string; // The text description of the choice
  consequence?: string; // Optional hint about the consequence
  type?: "action" | "diplomacy" | "stealth" | "knowledge"; // Type of choice
};

/** Represents a segment of the game narrative. */
export type GameSegment = {
  id: string; // Unique identifier for the segment
  text: string; // The narrative text content
  choices: GameChoice[]; // List of choices available to the player
  imageUrl?: string; // Optional URL for an accompanying image
  audioUrl?: string; // Optional URL for background audio
  consequences?: string[]; // Consequences of the previous choice
  isEnding?: boolean; // Whether this segment concludes the story
};

/** Character statistics and attributes. */
export type CharacterStats = {
  health: number; // Current health points (0-100)
  strength: number; // Physical power and combat ability
  intelligence: number; // Knowledge, reasoning, and magic potential
  charisma: number; // Social influence and leadership
  resources?: number; // Wealth or resource points
  reputation?: number; // Reputation score
  influence?: number; // Political and social influence
  knowledge?: number; // Learned knowledge and wisdom
  effects?: Record<string, number>; // Stat modifiers
};

/** Represents an item in the character's inventory. */
export type InventoryItem = {
  id: string; // Unique item identifier
  name: string; // Item name
  description: string; // Item description
  quantity: number; // Number of items held
  type: "weapon" | "armor" | "consumable" | "quest" | "misc"; // Item category
  effects?: Record<string, number>; // Stat modifiers
};

/** Represents a relationship with an NPC or faction. */
export type Relationship = {
  targetId: string; // ID of the NPC or faction
  name: string; // Name of the NPC or faction
  value: number; // Relationship score (-100 to 100)
  status: "hostile" | "neutral" | "friendly" | "allied"; // Relationship tier
};

/** Represents the player character. */
export type Character = {
  id: string; // Unique character identifier
  name: string; // Character's name
  stats: CharacterStats; // Character's statistics
  inventory: InventoryItem[]; // Items carried by the character
  relationships: Relationship[]; // Character's relationships with NPCs/factions
  skills: string[]; // List of learned skills or abilities
  background: string; // Character's backstory
  portraitUrl?: string; // URL to character portrait
  archetype?: string; // Optional character archetype/class
  backstory?: string; // Optional detailed backstory
};

/** Represents a political faction in the game world. */
export type PoliticalFaction = {
  id: string; // Unique faction identifier
  name: string; // Faction name
  influence: number; // Faction's power level
  stance: string; // Faction's political stance or ideology
  relations: number; // Player's standing with the faction
};

/** Economic system state. */
export type EconomicSystem = {
  currency: string; // Name of the currency
  marketPrices: Record<string, number>; // Current prices of goods
  tradeRoutes: string[]; // Active trade routes
  playerWealth?: number; // Optional player wealth
  economicEvents?: any[]; // Optional economic events
};

/** War system state. */
export type WarSystem = {
  activeConflicts: string[]; // List of ongoing wars
  armySize: number; // Player's military strength
  morale: number; // Army morale
  playerRole?: string; // Optional role of player in war
  battleExperience?: number; // Optional battle experience
};

/** World systems state container. */
export type WorldSystems = {
  politics: PoliticalFaction[]; // List of political factions
  economics: EconomicSystem; // Economic state
  war: WarSystem; // Military state
  magic?: {
    manaLevel: number;
    knownSpells: string[];
  };
  activeEvents?: any[]; // Optional active world events
};

/** The complete game state. */
export type GameState = {
  id: string; // Unique game session identifier
  userId: string; // ID of the player
  character: Character; // The player character
  currentSegment: GameSegment | null; // The current narrative segment (nullable during initialization)
  pastSegments: GameSegment[]; // History of previous segments
  turnCount: number; // Total turns played
  era: string; // Historical era setting
  theme: string; // Narrative theme
  worldSystems: WorldSystems; // State of world mechanics
  memories: Memory[]; // Player's memory log
  lore: LoreEntry[]; // Unlocked lore entries
  battle?: BattleState; // Active battle state
  lastSaved: number; // Timestamp of last save
  isGameOver: boolean; // Whether the game has ended
};

/** Represents a battle state for combat encounters. */
export type BattleState = {
  isActive: boolean; // Whether a battle is currently in progress
  enemyName?: string; // Name of the opponent
  enemyHealth?: number; // Opponent's health
  turn: number; // Current battle turn
  log: string[]; // Combat log
};

/** Represents a lore entry in the game's encyclopedia. */
export type LoreEntry = {
  id: string; // Unique lore identifier
  title: string; // Title of the entry
  content: string; // Detailed lore content
  category: "person" | "location" | "event" | "item" | "concept"; // Lore category
  unlocked: boolean; // Whether the player has discovered this lore
};

/** Represents a memory or past event in the chronicle. */
export type Memory = {
  id: string; // Unique memory identifier
  segmentId: string; // ID of the associated game segment
  title?: string; // Brief title of the memory
  summary: string; // Brief summary of the event
  description?: string; // Detailed description
  choiceMade: string; // The choice the player made
  consequence: string; // The outcome of that choice
  timestamp: number; // When the event occurred
  importance: "low" | "medium" | "high"; // Narrative weight of the event
};

/** Message structure for the Kronos AI assistant. */
export type ChronosMessage = {
  id: string; // Unique message identifier
  message: string; // The message content
  timestamp: number; // When the message was sent
  response?: string; // AI response to the message
  status: "pending" | "answered" | "failed"; // Status of the message
};

/** Initial setup state for creating a new game. */
export type GameSetupState = {
  era: string; // Selected historical era
  theme: string; // Selected narrative theme
  difficulty: "easy" | "normal" | "hard"; // Selected difficulty
  characterName: string; // Player's chosen name
  characterArchetype?: string; // Player's chosen class/role
  generateBackstory?: boolean; // Whether to generate a backstory
  customEra?: string; // Custom era if not using preset
  customTheme?: string; // Custom theme if not using preset
};

/** Performance metrics for debug panel */
export type PerformanceMetrics = {
  timestamp: number; // Time of the metric record
  memoryUsage: number; // Memory usage in MB
  renderTime: number; // Render time in ms
  apiLatency: number; // API call latency in ms
  frameRate: number; // Frame rate in FPS
  networkStatus: string; // Network status (e.g., "online", "offline")
  batteryLevel: number; // Battery level in percentage
  cpuUsage?: number; // CPU usage in percentage
  diskUsage?: number; // Disk usage in percentage
  networkLatency?: number; // Network latency in ms
};

/** Enhanced debug information */
export type DebugInfo = {
  lastApiCall?: any; // Data from the last API call
  lastResponse?: any; // Data from the last API response
  lastError?: any; // Last error object, if any
  callCount: number; // Total number of API calls made
  lastPrompt?: string; // Last prompt sent to the AI
  lastRawResponse?: string; // Last raw response from the AI
  apiCallHistory: any[]; // History of API calls
  performanceMetrics?: PerformanceMetrics; // Latest performance metrics
  systemInfo?: {
    platform: string; // Platform type (e.g., "web", "mobile")
    version: string; // App version
    deviceType: string; // Device type (e.g., "desktop", "tablet", "phone")
    screenDimensions: { width: number; height: number }; // Screen dimensions
    orientation: string; // Screen orientation (e.g., "portrait", "landscape")
    isDebug: boolean; // Whether the app is in debug mode
  };
  cpuUsage?: number; // CPU usage at the time of logging
  networkLatency?: number; // Network latency at the time of logging
};

/** User account types for future subscription system */
export type UserAccount = {
  id: string; // Unique user identifier
  email: string; // User's email address
  displayName: string; // User's display name
  subscriptionStatus: "free" | "premium"; // Subscription status
  subscriptionExpiry?: number; // Expiry date of the subscription
  turnsUsed: number; // Number of turns used by the player
  maxTurns: number; // Maximum number of turns (10 for free, unlimited for premium)
  createdAt: number; // When the account was created
  lastActiveAt: number; // When the user was last active
};

/** Subscription Plan Interface */
export type SubscriptionPlan = {
  id: string; // Unique plan identifier
  name: string; // Name of the subscription plan
  price: number; // Price of the plan
  currency: string; // Currency used for the price
  features: string[]; // List of features included in the plan
  maxTurns: number; // Maximum number of turns allowed
  stripePriceId?: string; // Stripe price ID for payment processing
};