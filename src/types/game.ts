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

/**
 * Game Choice Interface
 * 
 * Represents a player decision point in the narrative.
 * Each choice can have immediate or delayed consequences.
 */
export type GameChoice = {
  id: string;           // Unique identifier for tracking choice history
  text: string;         // Display text for the player option
  consequences?: string; // Optional preview of potential outcomes
};

/**
 * Game Segment Interface
 * 
 * Represents a single narrative moment or scene in the game.
 * Contains story text and available player choices.
 */
export type GameSegment = {
  id: string;                    // Unique segment identifier
  text: string;                  // Narrative text describing the current situation
  choices: GameChoice[];         // Available player choices
  customChoiceEnabled?: boolean; // Whether players can input custom responses
};

/**
 * Character Statistics Interface
 * 
 * Core character attributes that affect gameplay and story outcomes.
 * These stats evolve based on player choices and actions.
 */
export type CharacterStats = {
  influence: number;   // Political and social power (0-100)
  knowledge: number;   // Learning and intellectual prowess (0-100)
  resources: number;   // Material wealth and economic power (0-100)
  reputation: number;  // General standing in society (0-100)
};

/**
 * Inventory Item Interface
 * 
 * Represents physical objects the character can possess.
 * Items have gameplay effects and narrative significance.
 */
export type InventoryItem = {
  id: string;              // Unique item identifier
  name: string;            // Display name for the item
  description: string;     // Detailed item description
  quantity: number;        // How many of this item the character has
  value: number;          // Economic worth in the game world
  // Item categorization for gameplay mechanics
  category: "weapon" | "tool" | "currency" | "document" | "consumable" | "valuable" | "other";
  weight?: number;        // Physical weight (affects carrying capacity)
  rarity?: "common" | "uncommon" | "rare" | "legendary"; // Item rarity level
  condition?: "poor" | "fair" | "good" | "excellent";    // Item condition
};

/**
 * Character Interface
 * 
 * Complete character definition including stats, inventory,
 * social connections, and background information.
 */
export type Character = {
  name: string;                                    // Character's chosen name
  archetype: string;                              // Character class/role (e.g., "Noble", "Merchant")
  backstory: string;                              // Character's background story
  stats: CharacterStats;                          // Core character attributes
  inventory: InventoryItem[];                     // Character's possessions
  skills: string[];                               // Learned abilities and talents
  relationships: Relationship[];                  // Social connections
  reputation: { [faction: string]: number };     // Standing with different groups
};

/**
 * Relationship Interface
 * 
 * Represents the character's connection with NPCs and factions.
 * Trust levels affect available choices and story outcomes.
 */
export type Relationship = {
  id: string;          // Unique relationship identifier
  name: string;        // Name of the person or group
  relationship: string; // Type of relationship (e.g., "ally", "rival", "mentor")
  trust: number;       // Trust level from -10 (enemy) to 10 (loyal ally)
  influence: number;   // Influence level (0-10)
  lastInteraction: string; // Timestamp of the last interaction
  location?: string;   // Optional location of the relationship
  occupation?: string;  // Optional occupation of the relationship
};

/**
 * Political Faction Interface
 * 
 * Defines the various political groups in the game world.
 * Factions have goals, power dynamics, and relationships with the player.
 */
export type PoliticalFaction = {
  id: string;          // Unique faction identifier
  name: string;        // Faction name
  description: string; // Faction description and ideology
  power: number;      // Faction power level (0-10)
  playerStanding: number; // Player's standing with the faction (-10 to 10)
  goals: string[];     // List of faction goals and objectives
  currentEvents: string[]; // Ongoing events related to the faction
  leaders: string[];   // Key leaders within the faction
  territory?: string;  // Controlled territory
  allies?: string[];   // Allied factions
  enemies?: string[];  // Enemy factions
};

/**
 * Economic System Interface
 * 
 * Models the game's economic mechanics including currency,
 * market prices, trade, and player wealth.
 */
export type EconomicSystem = {
  currency: string;                  // Currency type used in the game
  playerWealth: number;              // Player's current wealth
  marketPrices: { [item: string]: number }; // Current market prices for items
  tradeRoutes: string[];            // Established trade routes
  economicEvents: string[];         // Recent economic events
  creditRating?: number;            // Player's credit rating
  bankAccounts?: { [bank: string]: number }; // Player's bank accounts
  investments?: { [investment: string]: number }; // Player's investments
  debts?: { [creditor: string]: number }; // Player's debts
  merchantGuilds?: string[];        // Merchant guilds the player is part of
  tradingLicenses?: string[];       // Licenses for trading
};

/**
 * War System Interface
 * 
 * Represents the military aspects of the game including active conflicts,
 * player role in the military, and battle details.
 */
export type WarSystem = {
  activeConflicts: string[];       // List of active conflicts
  playerRole: string;              // Player's role in the military
  militaryRank?: string;           // Player's military rank
  battleExperience: number;        // Player's experience in battles
  currentCampaign?: string;        // Ongoing campaign
  currentBattle?: BattleState;     // Current battle details
  militaryUnits?: string[];        // Player's military units
  equipment?: string[];            // Player's equipment
  strategicPositions?: string[];   // Strategic positions held by the player
};

/**
 * Battle State Interface
 * 
 * Details the state of a battle including phases, player actions,
 * and outcomes.
 */
export type BattleState = {
  id: string;          // Unique battle identifier
  name: string;        // Name of the battle or conflict
  description: string; // Description of the battle
  playerRole: string;  // Player's role in the battle
  currentPhase: "preparation" | "engagement" | "climax" | "resolution"; // Current phase of the battle
  turnCount: number;   // Number of turns elapsed
  playerActions: string[]; // Actions taken by the player
  battleOutcome?: "victory" | "defeat" | "stalemate"; // Outcome of the battle
  casualties?: number;  // Number of casualties
  rewards?: string[];   // Rewards for participation in the battle
};

/**
 * Lore Entry Interface
 * 
 * Represents historical and narrative entries in the game world.
 * Lore entries provide context and background to the player.
 */
export type LoreEntry = {
  id: string;          // Unique lore identifier
  title: string;      // Title of the lore entry
  content: string;    // Detailed content of the lore entry
  discovered: boolean; // Whether the lore entry has been discovered by the player
  category: "historical" | "character" | "location" | "event" | "politics" | "economics" | "war" | "culture" | "technology"; // Category of the lore entry
  importance?: "low" | "medium" | "high" | "critical"; // Importance level of the lore entry
};

/**
 * Memory Interface
 * 
 * Tracks significant events and choices in the player's history.
 * Memories impact future interactions and story development.
 */
export type Memory = {
  id: string;          // Unique memory identifier
  title: string;      // Title of the memory
  description: string; // Description of the memory
  timestamp: number;   // When the memory was created
  category?: "choice" | "event" | "discovery" | "relationship" | "battle" | "economic" | "political"; // Category of the memory
  impact?: "minor" | "moderate" | "major" | "pivotal"; // Impact level of the memory
};

/**
 * World Systems Interface
 * 
 * Encapsulates the various systems that make up the game world:
 * politics, economics, war, and active events.
 */
export type WorldSystems = {
  politics: PoliticalFaction[];   // List of political factions
  economics: EconomicSystem;      // Economic system details
  war: WarSystem;                // War system details
  activeEvents: string[];        // Currently active events in the world
  culturalEvents?: string[];     // Cultural events
  technologicalProgress?: string[]; // Technological advancements
  naturalEvents?: string[];      // Natural events (e.g., disasters)
};

/**
 * Game State Interface
 * 
 * Represents the overall state of the game including the current
 * segment, player character, world systems, and progression history.
 */
export type GameState = {
  id: string;          // Unique game state identifier
  era: string;        // Current era or time period
  theme: string;      // Theme of the current game session
  difficulty: number; // Difficulty level (0 = hyper realism, 1 = fantasy)
  character: Character;  // Player character details
  worldSystems: WorldSystems; // Current world systems state
  currentSegment: GameSegment | null; // The segment the player is currently in
  pastSegments: GameSegment[]; // History of segments the player has completed
  memories: Memory[];   // List of memories
  lore: LoreEntry[];    // List of lore entries
  turnCount: number;    // Number of turns taken
  createdAt: number;    // When the game was created
  updatedAt: number;    // When the game was last updated
};

/**
 * Game Setup State Interface
 * 
 * Initial setup state for a new game including era, theme,
 * difficulty, and character name.
 */
export type GameSetupState = {
  era: string;        // Selected era for the game
  theme: string;      // Selected theme for the game
  difficulty: number; // Difficulty level (0 = hyper realism, 1 = fantasy)
  characterName: string; // Name of the player character
  generateBackstory: boolean; // Whether to auto-generate a backstory
  setupStep: "era" | "theme" | "character" | "complete"; // Current setup step
  customEra?: string;  // Custom era string, if any
  customTheme?: string; // Custom theme string, if any
};

/**
 * Chronos Message Interface
 * 
 * Represents messages and responses in the AI narrative generation system.
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