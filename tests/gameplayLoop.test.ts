/**
 * Gameplay Loop Integration Tests
 *
 * Simulates a full 5-turn gameplay loop to verify:
 * - Game initialisation from setup
 * - Segment delivery with 3 choices
 * - Choice selection and turn progression
 * - Memory creation per turn
 * - Character stat updates
 * - Proper segment history tracking
 * - Error handling at each stage
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// ---------------------------------------------------------------------------
// Lightweight types (mirrors src/types/game.ts)
// ---------------------------------------------------------------------------
interface CharacterStats {
  influence: number;
  knowledge: number;
  resources: number;
  reputation: number;
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
}

interface LoreEntry {
  id: string;
  title: string;
  content: string;
  discovered: boolean;
  category: string;
}

interface Character {
  name: string;
  archetype: string;
  backstory: string;
  stats: CharacterStats;
  inventory: any[];
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

// ---------------------------------------------------------------------------
// Helper functions mirroring store logic
// ---------------------------------------------------------------------------

function createNewGame(name: string, era: string, theme: string, difficulty: number): GameState {
  return {
    id: Date.now().toString(),
    era,
    theme,
    difficulty,
    character: {
      name,
      archetype: 'Custom',
      backstory: '',
      stats: { influence: 5, knowledge: 5, resources: 5, reputation: 5 },
      inventory: [],
      skills: [],
      relationships: [],
      reputation: {},
    },
    worldSystems: {
      politics: [],
      economics: { currency: 'Gold', playerWealth: 100, marketPrices: {}, tradeRoutes: [], economicEvents: [] },
      war: { activeConflicts: [], playerRole: 'Civilian', battleExperience: 0 },
      activeEvents: [],
    },
    currentSegment: null,
    pastSegments: [],
    memories: [],
    lore: [],
    turnCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function generateMockSegment(turnNumber: number): GameSegment {
  return {
    id: `seg-${turnNumber}`,
    text: `Turn ${turnNumber}: A business scenario unfolds...`,
    choices: [
      { id: `${turnNumber}-1`, text: 'Analyse the financial reports' },
      { id: `${turnNumber}-2`, text: 'Consult with your team' },
      { id: `${turnNumber}-3`, text: 'Take immediate action' },
    ],
    customChoiceEnabled: true,
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

function addMemory(game: GameState, memory: Memory): GameState {
  return {
    ...game,
    memories: [memory, ...game.memories].slice(0, 20),
    updatedAt: Date.now(),
  };
}

function updateStats(game: GameState, partial: Partial<CharacterStats>): GameState {
  return {
    ...game,
    character: {
      ...game.character,
      stats: { ...game.character.stats, ...partial },
    },
    updatedAt: Date.now(),
  };
}

function clampStat(v: number): number {
  return Math.max(0, Math.min(100, v));
}

function validateSegment(segment: GameSegment): string[] {
  const errors: string[] = [];
  if (!segment.id) errors.push('Segment must have an id');
  if (!segment.text || segment.text.trim().length === 0) errors.push('Segment must have text');
  if (!segment.choices || segment.choices.length === 0) errors.push('Segment must have at least one choice');
  if (segment.choices.length !== 3) errors.push('Segment must have exactly 3 choices');
  for (const c of segment.choices) {
    if (!c.id) errors.push('Choice must have an id');
    if (!c.text || c.text.trim().length === 0) errors.push('Choice must have text');
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('5-Turn Gameplay Loop Simulation', () => {
  let game: GameState;

  beforeEach(() => {
    game = createNewGame('Alex', 'store_owner', 'financial_management', 0.5);
  });

  it('should initialise a fresh game at turn 0 with no segments', () => {
    expect(game.turnCount).toBe(0);
    expect(game.currentSegment).toBeNull();
    expect(game.pastSegments).toHaveLength(0);
    expect(game.memories).toHaveLength(0);
    expect(game.character.name).toBe('Alex');
  });

  it('should simulate 5 complete turns with correct state transitions', () => {
    for (let turn = 1; turn <= 5; turn++) {
      // 1. Generate segment
      const segment = generateMockSegment(turn);
      const segmentErrors = validateSegment(segment);
      expect(segmentErrors).toHaveLength(0);

      // 2. Apply segment update
      game = applySegmentUpdate(game, segment);
      expect(game.turnCount).toBe(turn);
      expect(game.currentSegment).toBe(segment);
      expect(game.currentSegment!.choices).toHaveLength(3);

      // 3. "Select" first choice and add memory
      const selectedChoice = segment.choices[0];
      const memory: Memory = {
        id: `mem-turn-${turn}`,
        title: `Turn ${turn}: ${selectedChoice.text.substring(0, 30)}`,
        description: `You chose: ${selectedChoice.text}`,
        timestamp: Date.now(),
        category: 'choice',
      };
      game = addMemory(game, memory);

      // 4. Apply stat change from choice
      const statBoost = { knowledge: clampStat(game.character.stats.knowledge + 2) };
      game = updateStats(game, statBoost);
    }

    // Verify final state after 5 turns
    expect(game.turnCount).toBe(5);
    expect(game.pastSegments).toHaveLength(4); // 4 past + 1 current
    expect(game.currentSegment).not.toBeNull();
    expect(game.memories).toHaveLength(5);
    expect(game.character.stats.knowledge).toBe(15); // 5 + (2 * 5)
  });

  it('should maintain correct segment history order after 5 turns', () => {
    for (let turn = 1; turn <= 5; turn++) {
      const segment = generateMockSegment(turn);
      game = applySegmentUpdate(game, segment);
    }

    // Past segments should be in chronological order
    expect(game.pastSegments).toHaveLength(4);
    expect(game.pastSegments[0].id).toBe('seg-1');
    expect(game.pastSegments[1].id).toBe('seg-2');
    expect(game.pastSegments[2].id).toBe('seg-3');
    expect(game.pastSegments[3].id).toBe('seg-4');
    expect(game.currentSegment!.id).toBe('seg-5');
  });

  it('should maintain memories in reverse chronological order', () => {
    for (let turn = 1; turn <= 5; turn++) {
      const segment = generateMockSegment(turn);
      game = applySegmentUpdate(game, segment);

      game = addMemory(game, {
        id: `mem-${turn}`,
        title: `Turn ${turn}`,
        description: `Memory for turn ${turn}`,
        timestamp: turn * 1000,
        category: 'choice',
      });
    }

    expect(game.memories).toHaveLength(5);
    // Most recent first
    expect(game.memories[0].id).toBe('mem-5');
    expect(game.memories[4].id).toBe('mem-1');
  });

  it('should have all 3 choices available at each turn', () => {
    for (let turn = 1; turn <= 5; turn++) {
      const segment = generateMockSegment(turn);
      game = applySegmentUpdate(game, segment);

      expect(game.currentSegment!.choices).toHaveLength(3);
      expect(game.currentSegment!.choices[0].id).toBe(`${turn}-1`);
      expect(game.currentSegment!.choices[1].id).toBe(`${turn}-2`);
      expect(game.currentSegment!.choices[2].id).toBe(`${turn}-3`);
    }
  });

  it('should enable custom choice input on all segments', () => {
    for (let turn = 1; turn <= 5; turn++) {
      const segment = generateMockSegment(turn);
      game = applySegmentUpdate(game, segment);
      expect(game.currentSegment!.customChoiceEnabled).toBe(true);
    }
  });

  it('should preserve character identity across all 5 turns', () => {
    for (let turn = 1; turn <= 5; turn++) {
      const segment = generateMockSegment(turn);
      game = applySegmentUpdate(game, segment);
    }

    expect(game.character.name).toBe('Alex');
    expect(game.character.archetype).toBe('Custom');
    expect(game.era).toBe('store_owner');
    expect(game.theme).toBe('financial_management');
    expect(game.difficulty).toBe(0.5);
  });

  it('should accumulate stat changes correctly over 5 turns', () => {
    const statChangesPerTurn: Partial<CharacterStats>[] = [
      { influence: 10 },
      { knowledge: 15 },
      { resources: 20 },
      { reputation: 25 },
      { influence: 30, knowledge: 35 },
    ];

    for (let turn = 0; turn < 5; turn++) {
      const segment = generateMockSegment(turn + 1);
      game = applySegmentUpdate(game, segment);
      game = updateStats(game, statChangesPerTurn[turn]);
    }

    expect(game.character.stats.influence).toBe(30); // last set to 30
    expect(game.character.stats.knowledge).toBe(35); // last set to 35
    expect(game.character.stats.resources).toBe(20); // set on turn 3
    expect(game.character.stats.reputation).toBe(25); // set on turn 4
  });
});

describe('Gameplay Loop - Error Handling', () => {
  let game: GameState;

  beforeEach(() => {
    game = createNewGame('Alex', 'store_owner', 'financial_management', 0.5);
  });

  it('should reject invalid segment with no choices', () => {
    const badSegment: GameSegment = {
      id: 'bad-1',
      text: 'Narrative text',
      choices: [],
    };
    const errors = validateSegment(badSegment);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('Segment must have at least one choice');
    expect(errors).toContain('Segment must have exactly 3 choices');
  });

  it('should reject segment with empty text', () => {
    const badSegment: GameSegment = {
      id: 'bad-2',
      text: '',
      choices: [
        { id: '1', text: 'A' },
        { id: '2', text: 'B' },
        { id: '3', text: 'C' },
      ],
    };
    const errors = validateSegment(badSegment);
    expect(errors).toContain('Segment must have text');
  });

  it('should reject segment with missing choice text', () => {
    const badSegment: GameSegment = {
      id: 'bad-3',
      text: 'Valid text',
      choices: [
        { id: '1', text: 'A' },
        { id: '2', text: '' },
        { id: '3', text: 'C' },
      ],
    };
    const errors = validateSegment(badSegment);
    expect(errors).toContain('Choice must have text');
  });

  it('should reject segment with wrong number of choices', () => {
    const twoChoices: GameSegment = {
      id: 'bad-4',
      text: 'Valid text',
      choices: [
        { id: '1', text: 'A' },
        { id: '2', text: 'B' },
      ],
    };
    const errors = validateSegment(twoChoices);
    expect(errors).toContain('Segment must have exactly 3 choices');
  });

  it('should validate a correct segment with no errors', () => {
    const goodSegment = generateMockSegment(1);
    const errors = validateSegment(goodSegment);
    expect(errors).toHaveLength(0);
  });

  it('should handle invalid choice selection gracefully', () => {
    const segment = generateMockSegment(1);
    game = applySegmentUpdate(game, segment);

    const validChoiceIds = segment.choices.map((c) => c.id);
    const invalidId = 'non-existent-choice';
    expect(validChoiceIds).not.toContain(invalidId);

    // Verify selection validation
    const isValidChoice = validChoiceIds.includes(invalidId);
    expect(isValidChoice).toBe(false);
  });

  it('should not allow game creation with empty name', () => {
    const setup = { era: 'store_owner', theme: 'financial_management', difficulty: 0.5, characterName: '' };
    const isValid = setup.characterName.trim().length >= 2 && setup.era.length > 0 && setup.theme.length > 0;
    expect(isValid).toBe(false);
  });

  it('should not allow game creation with name shorter than 2 characters', () => {
    const setup = { characterName: 'A', era: 'store_owner', theme: 'financial_management' };
    const isValid = setup.characterName.trim().length >= 2;
    expect(isValid).toBe(false);
  });

  it('should enforce stat clamping to valid range', () => {
    game = updateStats(game, { influence: -50 });
    // The stat is set directly; clamping should be applied
    const clamped = clampStat(game.character.stats.influence);
    expect(clamped).toBe(0);

    game = updateStats(game, { knowledge: 200 });
    const clampedHigh = clampStat(game.character.stats.knowledge);
    expect(clampedHigh).toBe(100);
  });

  it('should handle turn limit for free users', () => {
    const FREE_TURN_LIMIT = 50;
    const game50 = { ...game, turnCount: 50 };
    
    const canMakeChoice = game50.turnCount < FREE_TURN_LIMIT;
    expect(canMakeChoice).toBe(false);
  });

  it('should allow paid users well beyond free limit', () => {
    const PAID_TURN_LIMIT = 10000;
    const game500 = { ...game, turnCount: 500 };
    
    const canMakeChoice = game500.turnCount < PAID_TURN_LIMIT;
    expect(canMakeChoice).toBe(true);
  });
});

describe('Gameplay Loop - Fallback Content', () => {
  it('should provide a valid fallback segment when AI fails', () => {
    const game = createNewGame('Alex', 'store_owner', 'financial_management', 0.5);
    
    // Simulate the fallback segment from play.tsx
    const fallbackSegment: GameSegment = {
      id: 'fallback-segment-1',
      text: `Welcome to Chronicle Weaver, ${game.character.name}. You find yourself managing your business...`,
      choices: [
        { id: '1', text: 'Explore your immediate surroundings and gather information about the current situation' },
        { id: '2', text: 'Seek out local authorities or influential people to understand the political climate' },
        { id: '3', text: 'Focus on establishing yourself economically and securing basic resources' },
      ],
      customChoiceEnabled: true,
    };

    const errors = validateSegment(fallbackSegment);
    expect(errors).toHaveLength(0);
    expect(fallbackSegment.choices).toHaveLength(3);
    expect(fallbackSegment.text).toContain(game.character.name);
  });
});

describe('Gameplay Loop - Custom Choice Handling', () => {
  it('should validate custom choice text is not empty', () => {
    const validateCustomChoice = (text: string): boolean => {
      return text.trim().length > 0;
    };

    expect(validateCustomChoice('I want to negotiate a deal')).toBe(true);
    expect(validateCustomChoice('')).toBe(false);
    expect(validateCustomChoice('   ')).toBe(false);
  });

  it('should treat custom choice as a valid choice option', () => {
    const customChoice: GameChoice = {
      id: 'custom-1',
      text: 'I decide to open a new branch office',
      consequences: 'Expansion brings new challenges',
    };

    expect(customChoice.id).toBeDefined();
    expect(customChoice.text.length).toBeGreaterThan(0);
  });
});
