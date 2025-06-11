import { z } from "zod";

export type GameChoice = {
  id: string;
  text: string;
  consequences?: string;
};

export type GameSegment = {
  id: string;
  text: string;
  choices: GameChoice[];
  customChoiceEnabled?: boolean;
};

export type CharacterStats = {
  influence: number;
  knowledge: number;
  resources: number;
  reputation: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  value: number;
  category: "weapon" | "tool" | "currency" | "document" | "consumable" | "valuable" | "other";
  weight?: number;
  rarity?: "common" | "uncommon" | "rare" | "legendary";
  condition?: "poor" | "fair" | "good" | "excellent";
};

export type Character = {
  name: string;
  archetype: string;
  backstory: string;
  stats: CharacterStats;
  inventory: InventoryItem[];
  skills: string[];
  relationships: Relationship[];
  reputation: { [faction: string]: number };
};

export type Relationship = {
  id: string;
  name: string;
  relationship: string;
  trust: number; // -10 to 10
  influence: number; // 0 to 10
  lastInteraction: string;
  location?: string;
  occupation?: string;
};

export type PoliticalFaction = {
  id: string;
  name: string;
  description: string;
  power: number; // 0 to 10
  playerStanding: number; // -10 to 10
  goals: string[];
  currentEvents: string[];
  leaders: string[];
  territory?: string;
  allies?: string[];
  enemies?: string[];
};

export type EconomicSystem = {
  currency: string;
  playerWealth: number;
  marketPrices: { [item: string]: number };
  tradeRoutes: string[];
  economicEvents: string[];
  creditRating?: number;
  bankAccounts?: { [bank: string]: number };
  investments?: { [investment: string]: number };
  debts?: { [creditor: string]: number };
  merchantGuilds?: string[];
  tradingLicenses?: string[];
};

export type WarSystem = {
  activeConflicts: string[];
  playerRole: string;
  militaryRank?: string;
  battleExperience: number;
  currentCampaign?: string;
  currentBattle?: BattleState;
  militaryUnits?: string[];
  equipment?: string[];
  strategicPositions?: string[];
};

export type BattleState = {
  id: string;
  name: string;
  description: string;
  playerRole: string;
  currentPhase: "preparation" | "engagement" | "climax" | "resolution";
  turnCount: number;
  playerActions: string[];
  battleOutcome?: "victory" | "defeat" | "stalemate";
  casualties?: number;
  rewards?: string[];
};

export type LoreEntry = {
  id: string;
  title: string;
  content: string;
  discovered: boolean;
  category: "historical" | "character" | "location" | "event" | "politics" | "economics" | "war" | "culture" | "technology";
  importance?: "low" | "medium" | "high" | "critical";
};

export type Memory = {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  category?: "choice" | "event" | "discovery" | "relationship" | "battle" | "economic" | "political";
  impact?: "minor" | "moderate" | "major" | "pivotal";
};

export type WorldSystems = {
  politics: PoliticalFaction[];
  economics: EconomicSystem;
  war: WarSystem;
  activeEvents: string[];
  culturalEvents?: string[];
  technologicalProgress?: string[];
  naturalEvents?: string[];
};

export type GameState = {
  id: string;
  era: string;
  theme: string;
  difficulty: number; // 0 (hyper realism) to 1 (fantasy)
  character: Character;
  worldSystems: WorldSystems;
  currentSegment: GameSegment | null;
  pastSegments: GameSegment[];
  memories: Memory[];
  lore: LoreEntry[];
  turnCount: number;
  createdAt: number;
  updatedAt: number;
};

export type GameSetupState = {
  era: string;
  theme: string;
  difficulty: number; // 0 (hyper realism) to 1 (fantasy)
  characterName: string;
  generateBackstory: boolean;
  setupStep: "era" | "theme" | "character" | "complete";
  customEra?: string;
  customTheme?: string;
};

export type ChronosMessage = {
  id: string;
  message: string;
  response?: string;
  timestamp: number;
  resolved: boolean;
};

// Performance metrics for debug panel
export type PerformanceMetrics = {
  timestamp: number;
  memoryUsage: number;
  renderTime: number;
  apiLatency: number;
  frameRate: number;
  networkStatus: string;
  batteryLevel: number;
  cpuUsage?: number;
  diskUsage?: number;
  networkLatency?: number;
};

// Enhanced debug information
export type DebugInfo = {
  lastApiCall?: any;
  lastResponse?: any;
  lastError?: any;
  callCount: number;
  lastPrompt?: string;
  lastRawResponse?: string;
  apiCallHistory: any[];
  performanceMetrics?: PerformanceMetrics;
  systemInfo?: {
    platform: string;
    version: string;
    deviceType: string;
    screenDimensions: { width: number; height: number };
    orientation: string;
    isDebug: boolean;
  };
};

// User account types for future subscription system
export type UserAccount = {
  id: string;
  email: string;
  displayName: string;
  subscriptionStatus: "free" | "premium";
  subscriptionExpiry?: number;
  turnsUsed: number;
  maxTurns: number; // 10 for free, unlimited for premium
  createdAt: number;
  lastActiveAt: number;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number; // $20 for premium
  currency: string;
  features: string[];
  maxTurns: number;
  stripePriceId?: string;
};