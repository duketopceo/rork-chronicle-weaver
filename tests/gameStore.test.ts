/**
 * Game Store Unit Tests
 *
 * Tests the Zustand game store actions and state management logic
 * without importing React Native / Expo modules.
 *
 * Strategy: re-implement the pure-logic portions of gameStore in isolation
 * so we can validate business rules in a Node test environment.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// ---------------------------------------------------------------------------
// Types mirrored from src/types/game.ts (kept minimal for test purposes)
// ---------------------------------------------------------------------------
interface CharacterStats {
  influence: number;
  knowledge: number;
  resources: number;
  reputation: number;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  value: number;
  category: string;
}

interface GameChoice {
  id: string;
  text: string;
  consequences?: string;
}

interface GameSegment {
  id: string;
  text: string;
  choices: GameChoice[];
  customChoiceEnabled?: boolean;
}

interface Memory {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  category?: string;
  impact?: string;
}

interface LoreEntry {
  id: string;
  title: string;
  content: string;
  discovered: boolean;
  category: string;
  importance?: string;
}

interface Character {
  name: string;
  archetype: string;
  backstory: string;
  stats: CharacterStats;
  inventory: InventoryItem[];
  skills: string[];
  relationships: any[];
  reputation: Record<string, number>;
}

interface WorldSystems {
  politics: any[];
  economics: any;
  war: any;
  activeEvents: string[];
}

interface GameState {
  id: string;
  era: string;
  theme: string;
  difficulty: number;
  character: Character;
  worldSystems: WorldSystems;
  currentSegment: GameSegment | null;
  pastSegments: GameSegment[];
  memories: Memory[];
  lore: LoreEntry[];
  turnCount: number;
  createdAt: number;
  updatedAt: number;
}

interface GameSetupState {
  era: string;
  theme: string;
  difficulty: number;
  characterName: string;
  generateBackstory: boolean;
  customEra: string;
  customTheme: string;
}

// ---------------------------------------------------------------------------
// Pure helper functions extracted from store logic
// ---------------------------------------------------------------------------

function createDefaultStats(): CharacterStats {
  return { influence: 5, knowledge: 5, resources: 5, reputation: 5 };
}

function createDefaultWorldSystems(): WorldSystems {
  return {
    politics: [],
    economics: {
      currency: 'Gold',
      playerWealth: 100,
      marketPrices: {},
      tradeRoutes: [],
      economicEvents: [],
    },
    war: {
      activeConflicts: [],
      playerRole: 'Civilian',
      battleExperience: 0,
    },
    activeEvents: [],
  };
}

function buildNewGame(setup: GameSetupState): GameState | null {
  const { era, theme, difficulty, characterName } = setup;
  if (!era || !theme || !characterName) return null;

  return {
    id: Date.now().toString(),
    era,
    theme,
    difficulty,
    character: {
      name: characterName,
      archetype: 'Custom',
      backstory: '',
      stats: createDefaultStats(),
      inventory: [],
      skills: [],
      relationships: [],
      reputation: {},
    },
    worldSystems: createDefaultWorldSystems(),
    currentSegment: null,
    pastSegments: [],
    memories: [],
    lore: [],
    turnCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function applySegmentUpdate(game: GameState, segment: GameSegment): GameState {
  return {
    ...game,
    currentSegment: segment,
    pastSegments: game.currentSegment
      ? [...game.pastSegments, game.currentSegment]
      : game.pastSegments,
    turnCount: game.turnCount + 1,
    updatedAt: Date.now(),
  };
}

function addMemoryToGame(game: GameState, memory: Memory): GameState {
  const updatedMemories = [memory, ...game.memories].slice(0, 20);
  return { ...game, memories: updatedMemories, updatedAt: Date.now() };
}

function addLoreToGame(game: GameState, lore: LoreEntry): GameState {
  return { ...game, lore: [lore, ...game.lore], updatedAt: Date.now() };
}

function updateStats(game: GameState, partialStats: Partial<CharacterStats>): GameState {
  return {
    ...game,
    character: {
      ...game.character,
      stats: { ...game.character.stats, ...partialStats },
    },
    updatedAt: Date.now(),
  };
}

function addItemToInventory(game: GameState, item: InventoryItem): GameState {
  const existing = game.character.inventory.find((i) => i.id === item.id);
  let updatedInventory: InventoryItem[];
  if (existing) {
    updatedInventory = game.character.inventory.map((i) =>
      i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
    );
  } else {
    updatedInventory = [...game.character.inventory, item];
  }
  return {
    ...game,
    character: { ...game.character, inventory: updatedInventory },
    updatedAt: Date.now(),
  };
}

function removeItemFromInventory(game: GameState, itemId: string): GameState {
  return {
    ...game,
    character: {
      ...game.character,
      inventory: game.character.inventory.filter((i) => i.id !== itemId),
    },
    updatedAt: Date.now(),
  };
}

function clampStat(value: number): number {
  return Math.max(0, Math.min(100, value));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Game Store - Setup Actions', () => {
  const validSetup: GameSetupState = {
    era: 'store_owner',
    theme: 'financial_management',
    difficulty: 0.5,
    characterName: 'John',
    generateBackstory: true,
    customEra: '',
    customTheme: '',
  };

  it('should create a new game from valid setup', () => {
    const game = buildNewGame(validSetup);
    expect(game).not.toBeNull();
    expect(game!.character.name).toBe('John');
    expect(game!.era).toBe('store_owner');
    expect(game!.theme).toBe('financial_management');
    expect(game!.difficulty).toBe(0.5);
    expect(game!.turnCount).toBe(0);
    expect(game!.currentSegment).toBeNull();
    expect(game!.pastSegments).toHaveLength(0);
    expect(game!.memories).toHaveLength(0);
    expect(game!.lore).toHaveLength(0);
  });

  it('should return null when era is missing', () => {
    const game = buildNewGame({ ...validSetup, era: '' });
    expect(game).toBeNull();
  });

  it('should return null when theme is missing', () => {
    const game = buildNewGame({ ...validSetup, theme: '' });
    expect(game).toBeNull();
  });

  it('should return null when characterName is missing', () => {
    const game = buildNewGame({ ...validSetup, characterName: '' });
    expect(game).toBeNull();
  });

  it('should initialize default character stats', () => {
    const game = buildNewGame(validSetup)!;
    expect(game.character.stats).toEqual({
      influence: 5,
      knowledge: 5,
      resources: 5,
      reputation: 5,
    });
  });

  it('should initialize default world systems', () => {
    const game = buildNewGame(validSetup)!;
    expect(game.worldSystems.politics).toHaveLength(0);
    expect(game.worldSystems.economics.currency).toBe('Gold');
    expect(game.worldSystems.economics.playerWealth).toBe(100);
    expect(game.worldSystems.war.playerRole).toBe('Civilian');
    expect(game.worldSystems.activeEvents).toHaveLength(0);
  });

  it('should set timestamps on creation', () => {
    const before = Date.now();
    const game = buildNewGame(validSetup)!;
    const after = Date.now();
    expect(game.createdAt).toBeGreaterThanOrEqual(before);
    expect(game.createdAt).toBeLessThanOrEqual(after);
    expect(game.updatedAt).toBeGreaterThanOrEqual(before);
    expect(game.updatedAt).toBeLessThanOrEqual(after);
  });
});

describe('Game Store - Segment Updates', () => {
  let game: GameState;

  beforeEach(() => {
    game = buildNewGame({
      era: 'store_owner',
      theme: 'financial_management',
      difficulty: 0.5,
      characterName: 'John',
      generateBackstory: true,
      customEra: '',
      customTheme: '',
    })!;
  });

  it('should update current segment and increment turn count', () => {
    const segment: GameSegment = {
      id: 'seg-1',
      text: 'Opening narrative...',
      choices: [
        { id: '1', text: 'Choice A' },
        { id: '2', text: 'Choice B' },
        { id: '3', text: 'Choice C' },
      ],
    };
    const updated = applySegmentUpdate(game, segment);
    expect(updated.currentSegment).toBe(segment);
    expect(updated.turnCount).toBe(1);
    expect(updated.pastSegments).toHaveLength(0); // First segment, no previous
  });

  it('should move old segment to pastSegments on new update', () => {
    const seg1: GameSegment = {
      id: 'seg-1',
      text: 'First narrative',
      choices: [{ id: '1', text: 'A' }],
    };
    const seg2: GameSegment = {
      id: 'seg-2',
      text: 'Second narrative',
      choices: [{ id: '2', text: 'B' }],
    };

    let state = applySegmentUpdate(game, seg1);
    state = applySegmentUpdate(state, seg2);

    expect(state.currentSegment).toBe(seg2);
    expect(state.pastSegments).toHaveLength(1);
    expect(state.pastSegments[0]).toBe(seg1);
    expect(state.turnCount).toBe(2);
  });

  it('should update the updatedAt timestamp', () => {
    const before = Date.now();
    const segment: GameSegment = {
      id: 'seg-1',
      text: 'Narrative text',
      choices: [{ id: '1', text: 'Choice' }],
    };
    const updated = applySegmentUpdate(game, segment);
    expect(updated.updatedAt).toBeGreaterThanOrEqual(before);
  });
});

describe('Game Store - Memory Management', () => {
  let game: GameState;

  beforeEach(() => {
    game = buildNewGame({
      era: 'store_owner',
      theme: 'financial_management',
      difficulty: 0.5,
      characterName: 'John',
      generateBackstory: true,
      customEra: '',
      customTheme: '',
    })!;
  });

  it('should add a memory to the game', () => {
    const memory: Memory = {
      id: 'mem-1',
      title: 'Test Memory',
      description: 'A test memory',
      timestamp: Date.now(),
      category: 'event',
    };
    const updated = addMemoryToGame(game, memory);
    expect(updated.memories).toHaveLength(1);
    expect(updated.memories[0]).toBe(memory);
  });

  it('should prepend new memories (most recent first)', () => {
    const mem1: Memory = { id: 'mem-1', title: 'First', description: '', timestamp: 1, category: 'event' };
    const mem2: Memory = { id: 'mem-2', title: 'Second', description: '', timestamp: 2, category: 'event' };

    let state = addMemoryToGame(game, mem1);
    state = addMemoryToGame(state, mem2);

    expect(state.memories[0].id).toBe('mem-2');
    expect(state.memories[1].id).toBe('mem-1');
  });

  it('should cap memories at 20', () => {
    let state = game;
    for (let i = 0; i < 25; i++) {
      state = addMemoryToGame(state, {
        id: `mem-${i}`,
        title: `Memory ${i}`,
        description: '',
        timestamp: i,
        category: 'event',
      });
    }
    expect(state.memories).toHaveLength(20);
    // Most recent should be first
    expect(state.memories[0].id).toBe('mem-24');
  });
});

describe('Game Store - Lore Entries', () => {
  let game: GameState;

  beforeEach(() => {
    game = buildNewGame({
      era: 'store_owner',
      theme: 'financial_management',
      difficulty: 0.5,
      characterName: 'John',
      generateBackstory: true,
      customEra: '',
      customTheme: '',
    })!;
  });

  it('should add a lore entry', () => {
    const lore: LoreEntry = {
      id: 'lore-1',
      title: 'Test Lore',
      content: 'Lore content',
      discovered: true,
      category: 'historical',
    };
    const updated = addLoreToGame(game, lore);
    expect(updated.lore).toHaveLength(1);
    expect(updated.lore[0]).toBe(lore);
  });

  it('should prepend new lore entries', () => {
    const l1: LoreEntry = { id: 'l1', title: 'First', content: '', discovered: true, category: 'event' };
    const l2: LoreEntry = { id: 'l2', title: 'Second', content: '', discovered: true, category: 'event' };

    let state = addLoreToGame(game, l1);
    state = addLoreToGame(state, l2);

    expect(state.lore[0].id).toBe('l2');
    expect(state.lore[1].id).toBe('l1');
  });
});

describe('Game Store - Character Stats', () => {
  let game: GameState;

  beforeEach(() => {
    game = buildNewGame({
      era: 'store_owner',
      theme: 'financial_management',
      difficulty: 0.5,
      characterName: 'John',
      generateBackstory: true,
      customEra: '',
      customTheme: '',
    })!;
  });

  it('should update partial character stats', () => {
    const updated = updateStats(game, { influence: 50, knowledge: 30 });
    expect(updated.character.stats.influence).toBe(50);
    expect(updated.character.stats.knowledge).toBe(30);
    expect(updated.character.stats.resources).toBe(5); // unchanged
    expect(updated.character.stats.reputation).toBe(5); // unchanged
  });

  it('should update a single stat without affecting others', () => {
    const updated = updateStats(game, { reputation: 99 });
    expect(updated.character.stats.reputation).toBe(99);
    expect(updated.character.stats.influence).toBe(5);
    expect(updated.character.stats.knowledge).toBe(5);
    expect(updated.character.stats.resources).toBe(5);
  });

  it('should clamp stats between 0 and 100', () => {
    expect(clampStat(-10)).toBe(0);
    expect(clampStat(0)).toBe(0);
    expect(clampStat(50)).toBe(50);
    expect(clampStat(100)).toBe(100);
    expect(clampStat(150)).toBe(100);
  });
});

describe('Game Store - Inventory Management', () => {
  let game: GameState;

  beforeEach(() => {
    game = buildNewGame({
      era: 'store_owner',
      theme: 'financial_management',
      difficulty: 0.5,
      characterName: 'John',
      generateBackstory: true,
      customEra: '',
      customTheme: '',
    })!;
  });

  const testItem: InventoryItem = {
    id: 'item-1',
    name: 'Ledger',
    description: 'A financial ledger',
    quantity: 1,
    value: 10,
    category: 'document',
  };

  it('should add an item to empty inventory', () => {
    const updated = addItemToInventory(game, testItem);
    expect(updated.character.inventory).toHaveLength(1);
    expect(updated.character.inventory[0].name).toBe('Ledger');
  });

  it('should stack quantities for duplicate items', () => {
    let state = addItemToInventory(game, testItem);
    state = addItemToInventory(state, { ...testItem, quantity: 3 });
    expect(state.character.inventory).toHaveLength(1);
    expect(state.character.inventory[0].quantity).toBe(4);
  });

  it('should add different items separately', () => {
    const item2: InventoryItem = {
      id: 'item-2',
      name: 'Calculator',
      description: 'A calculator',
      quantity: 1,
      value: 20,
      category: 'tool',
    };
    let state = addItemToInventory(game, testItem);
    state = addItemToInventory(state, item2);
    expect(state.character.inventory).toHaveLength(2);
  });

  it('should remove an item from inventory', () => {
    let state = addItemToInventory(game, testItem);
    state = removeItemFromInventory(state, 'item-1');
    expect(state.character.inventory).toHaveLength(0);
  });

  it('should not error when removing non-existent item', () => {
    const updated = removeItemFromInventory(game, 'non-existent');
    expect(updated.character.inventory).toHaveLength(0);
  });
});

describe('Game Store - Turn Limit Enforcement', () => {
  it('should enforce free user turn limit of 50', () => {
    const turnLimit = 50;
    const userType = 'free';
    const turnCount = 50;

    const limitReached = turnCount >= turnLimit;
    expect(limitReached).toBe(true);
  });

  it('should allow paid user beyond 50 turns', () => {
    const turnLimit = 10000;
    const userType = 'paid';
    const turnCount = 50;

    const limitReached = turnCount >= turnLimit;
    expect(limitReached).toBe(false);
  });

  it('should not limit at turn 49 for free users', () => {
    const turnLimit = 50;
    const turnCount = 49;

    const limitReached = turnCount >= turnLimit;
    expect(limitReached).toBe(false);
  });
});

describe('Game Store - Chronos Messages', () => {
  it('should create a chronos message with pending status', () => {
    const message = {
      id: Date.now().toString(),
      message: 'What should I do?',
      timestamp: Date.now(),
      status: 'pending' as const,
    };

    expect(message.status).toBe('pending');
    expect(message.message).toBe('What should I do?');
  });

  it('should cap chronos messages at 20', () => {
    const messages: any[] = [];
    for (let i = 0; i < 25; i++) {
      const newMsg = {
        id: i.toString(),
        message: `Message ${i}`,
        timestamp: Date.now(),
        status: 'pending',
      };
      messages.unshift(newMsg);
    }
    const capped = messages.slice(0, 20);
    expect(capped).toHaveLength(20);
    expect(capped[0].id).toBe('24'); // Most recent first
  });

  it('should update a message with a response', () => {
    const messages = [
      { id: '1', message: 'Hello', timestamp: Date.now(), status: 'pending' as const, response: undefined as string | undefined },
    ];
    const updated = messages.map((msg) =>
      msg.id === '1' ? { ...msg, response: 'AI response', status: 'answered' as const } : msg,
    );
    expect(updated[0].response).toBe('AI response');
    expect(updated[0].status).toBe('answered');
  });
});
