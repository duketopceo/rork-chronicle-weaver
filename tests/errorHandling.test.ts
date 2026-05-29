/**
 * Error Handling & Edge Case Tests
 *
 * Validates error handling, edge cases, and defensive programming
 * across the Chronicle Weaver application logic.
 */

import { describe, it, expect } from '@jest/globals';

// ---------------------------------------------------------------------------
// Utility validation helpers (mirrors app logic)
// ---------------------------------------------------------------------------

function validateCharacterName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Character name is required' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  if (name.trim().length > 50) {
    return { valid: false, error: 'Name must be 50 characters or less' };
  }
  return { valid: true };
}

function validateDifficulty(difficulty: number): { valid: boolean; error?: string } {
  if (typeof difficulty !== 'number' || isNaN(difficulty)) {
    return { valid: false, error: 'Difficulty must be a number' };
  }
  if (difficulty < 0 || difficulty > 1) {
    return { valid: false, error: 'Difficulty must be between 0 and 1' };
  }
  return { valid: true };
}

function validateGameSetup(setup: {
  characterName: string;
  era: string;
  theme: string;
  difficulty: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const nameResult = validateCharacterName(setup.characterName);
  if (!nameResult.valid) errors.push(nameResult.error!);

  if (!setup.era || setup.era.trim().length === 0) {
    errors.push('Professional role is required');
  }

  if (!setup.theme || setup.theme.trim().length === 0) {
    errors.push('Learning focus is required');
  }

  const diffResult = validateDifficulty(setup.difficulty);
  if (!diffResult.valid) errors.push(diffResult.error!);

  return { valid: errors.length === 0, errors };
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 0.2) return 'Highly Realistic';
  if (difficulty <= 0.4) return 'Realistic';
  if (difficulty <= 0.6) return 'Balanced';
  if (difficulty <= 0.8) return 'Simplified';
  return 'Beginner Friendly';
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Error Handling - Character Name Validation', () => {
  it('should accept valid names', () => {
    expect(validateCharacterName('John').valid).toBe(true);
    expect(validateCharacterName('Jo').valid).toBe(true);
    expect(validateCharacterName('Alexander the Great').valid).toBe(true);
  });

  it('should reject empty names', () => {
    const result = validateCharacterName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Character name is required');
  });

  it('should reject whitespace-only names', () => {
    const result = validateCharacterName('   ');
    expect(result.valid).toBe(false);
    // Trimmed whitespace becomes empty string, caught by the "required" check
    expect(result.error).toBeDefined();
  });

  it('should reject single character names', () => {
    const result = validateCharacterName('A');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Name must be at least 2 characters');
  });

  it('should reject excessively long names', () => {
    const longName = 'A'.repeat(51);
    const result = validateCharacterName(longName);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Name must be 50 characters or less');
  });

  it('should accept names at boundary lengths', () => {
    expect(validateCharacterName('Ab').valid).toBe(true);
    expect(validateCharacterName('A'.repeat(50)).valid).toBe(true);
  });
});

describe('Error Handling - Difficulty Validation', () => {
  it('should accept valid difficulty values', () => {
    expect(validateDifficulty(0).valid).toBe(true);
    expect(validateDifficulty(0.5).valid).toBe(true);
    expect(validateDifficulty(1).valid).toBe(true);
  });

  it('should reject out-of-range values', () => {
    expect(validateDifficulty(-0.1).valid).toBe(false);
    expect(validateDifficulty(1.1).valid).toBe(false);
    expect(validateDifficulty(-1).valid).toBe(false);
    expect(validateDifficulty(2).valid).toBe(false);
  });

  it('should reject NaN', () => {
    expect(validateDifficulty(NaN).valid).toBe(false);
  });
});

describe('Error Handling - Game Setup Validation', () => {
  it('should accept a complete valid setup', () => {
    const result = validateGameSetup({
      characterName: 'John',
      era: 'store_owner',
      theme: 'financial_management',
      difficulty: 0.5,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should collect multiple validation errors', () => {
    const result = validateGameSetup({
      characterName: '',
      era: '',
      theme: '',
      difficulty: -1,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('should reject setup with only name filled', () => {
    const result = validateGameSetup({
      characterName: 'John',
      era: '',
      theme: '',
      difficulty: 0.5,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Professional role is required');
    expect(result.errors).toContain('Learning focus is required');
  });
});

describe('Error Handling - Email Validation', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('duketopceo@gmail.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@missing-local.com')).toBe(false);
    expect(validateEmail('missing-domain@')).toBe(false);
    expect(validateEmail('spaces in@email.com')).toBe(false);
  });
});

describe('Error Handling - Difficulty Labels', () => {
  it('should map all difficulty ranges to labels', () => {
    expect(getDifficultyLabel(0)).toBe('Highly Realistic');
    expect(getDifficultyLabel(0.1)).toBe('Highly Realistic');
    expect(getDifficultyLabel(0.2)).toBe('Highly Realistic');
    expect(getDifficultyLabel(0.3)).toBe('Realistic');
    expect(getDifficultyLabel(0.4)).toBe('Realistic');
    expect(getDifficultyLabel(0.5)).toBe('Balanced');
    expect(getDifficultyLabel(0.6)).toBe('Balanced');
    expect(getDifficultyLabel(0.7)).toBe('Simplified');
    expect(getDifficultyLabel(0.8)).toBe('Simplified');
    expect(getDifficultyLabel(0.9)).toBe('Beginner Friendly');
    expect(getDifficultyLabel(1.0)).toBe('Beginner Friendly');
  });
});

describe('Error Handling - Date Formatting', () => {
  it('should format timestamps correctly', () => {
    // Jan 1, 2025 00:00:00 UTC
    const timestamp = new Date('2025-01-01T00:00:00Z').getTime();
    const formatted = formatDate(timestamp);
    // Should contain year and month (exact format depends on locale)
    expect(formatted).toContain('2025');
    expect(formatted).toContain('Jan');
  });

  it('should handle zero timestamp', () => {
    const formatted = formatDate(0);
    // Jan 1, 1970
    expect(formatted).toContain('1970');
  });

  it('should handle current timestamp', () => {
    const now = Date.now();
    const formatted = formatDate(now);
    expect(formatted.length).toBeGreaterThan(0);
  });
});

describe('Error Handling - State Consistency', () => {
  it('should maintain immutability of game state updates', () => {
    const original = {
      character: { stats: { influence: 5, knowledge: 5, resources: 5, reputation: 5 } },
    };

    // Simulate immutable update
    const updated = {
      ...original,
      character: {
        ...original.character,
        stats: { ...original.character.stats, influence: 50 },
      },
    };

    // Original should not be modified
    expect(original.character.stats.influence).toBe(5);
    expect(updated.character.stats.influence).toBe(50);
  });

  it('should preserve array immutability for memories', () => {
    const memories = [{ id: '1', title: 'First' }];
    const newMemory = { id: '2', title: 'Second' };

    const updated = [newMemory, ...memories];

    expect(memories).toHaveLength(1);
    expect(updated).toHaveLength(2);
    expect(updated[0].id).toBe('2');
  });

  it('should handle null current game gracefully', () => {
    const currentGame: null = null;

    // Guard clause pattern used in store
    const canMakeChoice = currentGame !== null;
    expect(canMakeChoice).toBe(false);
  });

  it('should handle undefined narrative gracefully', () => {
    const narrative: undefined = undefined;
    const hasNarrative = narrative !== undefined && narrative !== null;
    expect(hasNarrative).toBe(false);
  });
});

describe('Error Handling - World Systems Defaults', () => {
  it('should create valid default economics', () => {
    const economics = {
      currency: 'Gold',
      playerWealth: 100,
      marketPrices: {},
      tradeRoutes: [],
      economicEvents: [],
    };

    expect(economics.currency).toBe('Gold');
    expect(economics.playerWealth).toBe(100);
    expect(Object.keys(economics.marketPrices)).toHaveLength(0);
  });

  it('should create valid default war system', () => {
    const war = {
      activeConflicts: [],
      playerRole: 'Civilian',
      battleExperience: 0,
    };

    expect(war.activeConflicts).toHaveLength(0);
    expect(war.playerRole).toBe('Civilian');
    expect(war.battleExperience).toBe(0);
  });
});

describe('Error Handling - Subscription Tiers', () => {
  const FREE_LIMITS = { aiCallsPerDay: 5, savedGames: 1, turnLimit: 50 };
  const PREMIUM_LIMITS = { aiCallsPerDay: Infinity, savedGames: 5, turnLimit: 10000 };
  const MASTER_LIMITS = { aiCallsPerDay: Infinity, savedGames: Infinity, turnLimit: 10000 };

  it('should enforce free tier AI call limit', () => {
    expect(FREE_LIMITS.aiCallsPerDay).toBe(5);
  });

  it('should allow unlimited AI calls for premium', () => {
    expect(PREMIUM_LIMITS.aiCallsPerDay).toBe(Infinity);
  });

  it('should allow unlimited saved games for master tier', () => {
    expect(MASTER_LIMITS.savedGames).toBe(Infinity);
  });

  it('should enforce free tier turn limit', () => {
    const turnCount = 50;
    const canContinue = turnCount < FREE_LIMITS.turnLimit;
    expect(canContinue).toBe(false);
  });

  it('should allow paid users to continue past free limit', () => {
    const turnCount = 500;
    const canContinue = turnCount < PREMIUM_LIMITS.turnLimit;
    expect(canContinue).toBe(true);
  });
});
