/**
 * GAME TYPES - Chronicle Weaver v2.0
 * 
 * Purpose: Core TypeScript type definitions for game mechanics
 * Features:
 * - Historical eras and time periods
 * - Character creation and progression
 * - Story choices and branching
 * - Game state management
 * - AI interaction configurations
 * 
 * Usage: Import specific types needed throughout the application
 * Example: import type { Character, GameState, Choice } from '@/types/game';
 */

// ============================================================================
// HISTORICAL ERAS AND TIME PERIODS
// ============================================================================

/**
 * Available historical eras for game settings
 */
export type GameEra = 
  | 'ancient'           // Ancient civilizations (3000 BCE - 500 CE)
  | 'medieval'          // Medieval period (500 - 1500 CE)
  | 'renaissance'       // Renaissance (1400 - 1600 CE)
  | 'early_modern'      // Early modern (1600 - 1800 CE)
  | 'industrial'        // Industrial revolution (1800 - 1900 CE)
  | 'modern'            // Modern era (1900 - 2000 CE)
  | 'contemporary';     // Contemporary (2000 CE - present)

/**
 * Detailed era information and configuration
 */
export interface EraConfig {
  id: GameEra;
  name: string;
  description: string;
  timeRange: string;
  availableRegions: string[];
  commonProfessions: string[];
  culturalElements: string[];
  technologicalLevel: 'primitive' | 'basic' | 'developing' | 'advanced' | 'modern';
  magicAvailable: boolean;
  difficultyModifier: number;
}

// ============================================================================
// CHARACTER SYSTEM
// ============================================================================

/**
 * Character attributes and stats
 */
export interface CharacterAttributes {
  strength: number;     // Physical power and combat ability
  intelligence: number; // Knowledge, reasoning, and problem-solving
  charisma: number;     // Social influence and persuasion
  wisdom: number;       // Intuition, perception, and life experience
  dexterity: number;    // Agility, reflexes, and fine motor skills
  constitution: number; // Health, endurance, and resilience
}

/**
 * Character background and social class
 */
export type CharacterBackground =
  | 'noble'        // Aristocracy, royalty, landed gentry
  | 'merchant'     // Traders, craftsmen, middle class
  | 'peasant'      // Farmers, laborers, common folk
  | 'clergy'       // Religious figures, monks, priests
  | 'scholar'      // Academics, scribes, intellectuals
  | 'warrior'      // Soldiers, knights, guards
  | 'outlaw'       // Criminals, rebels, outcasts
  | 'artisan'      // Skilled craftspeople, artists
  | 'nomad'        // Travelers, wanderers, traders
  | 'foreigner';   // Outsiders, immigrants, diplomats

/**
 * Complete character definition
 */
export interface Character {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  background: CharacterBackground;
  profession: string;
  attributes: CharacterAttributes;
  skills: string[];
  inventory: InventoryItem[];
  relationships: Relationship[];
  currentLocation: string;
  health: number;
  maxHealth: number;
  experience: number;
  level: number;
  traits: CharacterTrait[];
  biography: string;
  goals: string[];
  secrets: string[];
}

/**
 * Character personality traits and quirks
 */
export interface CharacterTrait {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  impact: 'minor' | 'moderate' | 'major';
}

/**
 * Inventory items and equipment
 */
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'tool' | 'consumable' | 'treasure' | 'document' | 'misc';
  value: number;
  weight: number;
  equipped: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  enchanted?: boolean;
  effects?: ItemEffect[];
}

/**
 * Item effects and magical properties
 */
export interface ItemEffect {
  type: 'attribute_bonus' | 'skill_bonus' | 'damage_bonus' | 'protection' | 'healing' | 'special';
  value: number;
  description: string;
  duration?: 'permanent' | 'temporary' | 'consumable';
}

/**
 * Character relationships with NPCs
 */
export interface Relationship {
  npcId: string;
  npcName: string;
  relationshipType: 'family' | 'friend' | 'ally' | 'neutral' | 'rival' | 'enemy' | 'romantic';
  intimacyLevel: number; // 0-100
  trustLevel: number;    // 0-100
  history: string[];
  currentStatus: 'active' | 'distant' | 'estranged' | 'deceased';
}

// ============================================================================
// STORY AND NARRATIVE SYSTEM
// ============================================================================

/**
 * Player choice in story progression
 */
export interface Choice {
  id: string;
  text: string;
  description?: string;
  consequences: string[];
  requirements?: ChoiceRequirement[];
  type: 'action' | 'dialogue' | 'thought' | 'skill_check' | 'attribute_check';
  difficulty?: 'trivial' | 'easy' | 'moderate' | 'hard' | 'extreme';
  timeLimit?: number; // seconds
  riskLevel: 'safe' | 'minor_risk' | 'moderate_risk' | 'dangerous' | 'deadly';
}

/**
 * Requirements for choice availability
 */
export interface ChoiceRequirement {
  type: 'attribute' | 'skill' | 'item' | 'relationship' | 'location' | 'previous_choice';
  target: string;
  value: number | string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
}

/**
 * Story segment or scene
 */
export interface StorySegment {
  id: string;
  title: string;
  content: string;
  location: string;
  timeOfDay: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'midnight';
  weather?: string;
  mood: 'tense' | 'peaceful' | 'exciting' | 'mysterious' | 'romantic' | 'scary' | 'hopeful' | 'melancholy';
  npcsPresent: string[];
  availableChoices: Choice[];
  outcomes: StoryOutcome[];
  timestamp: number;
}

/**
 * Results of player choices
 */
export interface StoryOutcome {
  choiceId: string;
  consequences: Consequence[];
  nextSegmentId?: string;
  storyBranchId?: string;
  experienceGained: number;
  relationshipChanges: RelationshipChange[];
  itemChanges: ItemChange[];
  attributeChanges: AttributeChange[];
}

/**
 * Story consequence types
 */
export interface Consequence {
  type: 'character_development' | 'relationship_change' | 'item_gain' | 'item_loss' | 'location_change' | 'plot_advancement' | 'reputation_change';
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  permanent: boolean;
}

/**
 * Relationship modifications
 */
export interface RelationshipChange {
  npcId: string;
  intimacyChange: number;
  trustChange: number;
  relationshipTypeChange?: string;
  reason: string;
}

/**
 * Inventory modifications
 */
export interface ItemChange {
  action: 'gain' | 'lose' | 'modify' | 'repair' | 'break';
  itemId: string;
  quantity?: number;
  newCondition?: string;
}

/**
 * Character attribute modifications
 */
export interface AttributeChange {
  attribute: keyof CharacterAttributes;
  change: number;
  reason: string;
  permanent: boolean;
}

// ============================================================================
// GAME STATE MANAGEMENT
// ============================================================================

/**
 * Overall game difficulty settings
 */
export type GameDifficulty = 'easy' | 'normal' | 'hard' | 'extreme';

/**
 * AI behavior and story style preferences
 */
export type AIStyle = 
  | 'balanced'     // Equal focus on all elements
  | 'action'       // Combat and adventure focused
  | 'diplomatic'   // Social interaction and politics
  | 'mysterious'   // Investigation and puzzles
  | 'romantic'     // Relationships and emotional depth
  | 'comedic'      // Humor and lighthearted content
  | 'dark'         // Serious and mature themes
  | 'educational'; // Historical accuracy and learning

/**
 * Starting scenario options
 */
export interface StartingScenario {
  id: string;
  name: string;
  description: string;
  era: GameEra;
  difficulty: GameDifficulty;
  estimatedDuration: 'short' | 'medium' | 'long' | 'epic';
  themes: string[];
  requiredBackgrounds?: CharacterBackground[];
  customizable: boolean;
}

/**
 * Complete game state
 */
export interface GameState {
  id: string;
  title: string;
  description: string;
  era: GameEra;
  difficulty: GameDifficulty;
  aiStyle: AIStyle;
  character: Character;
  currentStory: StorySegment;
  storyHistory: StorySegment[];
  choiceHistory: Choice[];
  currentLocation: string;
  gameTime: GameTime;
  reputation: Reputation;
  achievements: Achievement[];
  flags: GameFlag[];
  createdAt: number;
  lastPlayed: number;
  playtimeMinutes: number;
  isCompleted: boolean;
  saveVersion: string;
}

/**
 * In-game time tracking
 */
export interface GameTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  era: GameEra;
}

/**
 * Character reputation with factions
 */
export interface Reputation {
  overall: number; // -100 to 100
  factions: FactionReputation[];
}

/**
 * Reputation with specific groups
 */
export interface FactionReputation {
  factionId: string;
  factionName: string;
  reputation: number; // -100 to 100
  rank?: string;
  relationship: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
}

/**
 * Player achievements and milestones
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'story' | 'character' | 'exploration' | 'social' | 'combat' | 'collection' | 'time';
  difficulty: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: number;
  progress: number; // 0-100
  isSecret: boolean;
  rewards?: AchievementReward[];
}

/**
 * Achievement rewards
 */
export interface AchievementReward {
  type: 'experience' | 'item' | 'title' | 'ability' | 'cosmetic';
  value: string | number;
  description: string;
}

/**
 * Game flags for tracking story state
 */
export interface GameFlag {
  key: string;
  value: string | number | boolean;
  description: string;
  category: 'story' | 'character' | 'world' | 'system';
  permanent: boolean;
}

// ============================================================================
// AI AND CONTENT GENERATION
// ============================================================================

/**
 * AI service configuration
 */
export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
  style: AIStyle;
  contentFiltering: boolean;
  historicalAccuracy: number; // 0-100
  creativityLevel: number;    // 0-100
}

/**
 * AI generation request
 */
export interface AIRequest {
  type: 'story_continuation' | 'choice_generation' | 'character_interaction' | 'world_building';
  context: GameState;
  prompt: string;
  constraints: AIConstraint[];
  previousChoices: Choice[];
  targetLength: 'short' | 'medium' | 'long';
  tone: string;
}

/**
 * AI generation constraints
 */
export interface AIConstraint {
  type: 'content_rating' | 'historical_period' | 'character_consistency' | 'plot_relevance' | 'choice_count';
  value: string | number;
  strict: boolean;
}

/**
 * AI response structure
 */
export interface AIResponse {
  content: string;
  choices: Choice[];
  metadata: AIResponseMetadata;
  confidence: number; // 0-100
  flags: string[];
  processingTime: number;
}

/**
 * AI response metadata
 */
export interface AIResponseMetadata {
  model: string;
  tokensUsed: number;
  responseTime: number;
  contentRating: 'G' | 'PG' | 'PG-13' | 'R';
  historicalAccuracy: number;
  creativityScore: number;
  qualityScore: number;
}

// ============================================================================
// USER INTERFACE AND PREFERENCES
// ============================================================================

/**
 * User preferences and settings
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  animationsEnabled: boolean;
  soundEnabled: boolean;
  musicVolume: number; // 0-100
  effectsVolume: number; // 0-100
  autoSaveInterval: number; // minutes
  choiceTimeLimit: number; // seconds, 0 for unlimited
  contentRating: 'G' | 'PG' | 'PG-13' | 'R';
  languagePreference: string;
  accessibilityOptions: AccessibilityOptions;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityOptions {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  largeText: boolean;
  colorBlindSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  keyboardNavigation: boolean;
}

// ============================================================================
// MULTIPLAYER AND SOCIAL (Future Features)
// ============================================================================

/**
 * Shared story session (future feature)
 */
export interface SharedStory {
  id: string;
  title: string;
  hostUserId: string;
  participants: ParticipantInfo[];
  gameState: GameState;
  currentTurn: string; // user ID
  turnOrder: string[];
  isActive: boolean;
  createdAt: number;
  lastActivity: number;
}

/**
 * Multiplayer participant information
 */
export interface ParticipantInfo {
  userId: string;
  characterId: string;
  role: 'host' | 'player' | 'observer';
  isActive: boolean;
  lastSeen: number;
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

/**
 * Type guards for runtime type checking
 */
export const isGameEra = (value: string): value is GameEra => {
  return ['ancient', 'medieval', 'renaissance', 'early_modern', 'industrial', 'modern', 'contemporary'].includes(value);
};

export const isCharacterBackground = (value: string): value is CharacterBackground => {
  return ['noble', 'merchant', 'peasant', 'clergy', 'scholar', 'warrior', 'outlaw', 'artisan', 'nomad', 'foreigner'].includes(value);
};

export const isGameDifficulty = (value: string): value is GameDifficulty => {
  return ['easy', 'normal', 'hard', 'extreme'].includes(value);
};

export const isAIStyle = (value: string): value is AIStyle => {
  return ['balanced', 'action', 'diplomatic', 'mysterious', 'romantic', 'comedic', 'dark', 'educational'].includes(value);
};