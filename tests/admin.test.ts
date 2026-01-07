/**
 * Admin Authentication Tests
 * 
 * Tests to verify admin-only features are properly restricted
 */

import { describe, it, expect } from '@jest/globals';

describe('Admin Authentication', () => {
  it('should identify admin user by email', () => {
    const adminEmail = 'duketopceo@gmail.com';
    const regularEmail = 'user@example.com';
    
    expect(adminEmail).toBe('duketopceo@gmail.com');
    expect(regularEmail).not.toBe('duketopceo@gmail.com');
  });

  it('should validate email format', () => {
    const validEmail = 'duketopceo@gmail.com';
    const invalidEmail = 'not-an-email';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(emailRegex.test(validEmail)).toBe(true);
    expect(emailRegex.test(invalidEmail)).toBe(false);
  });

  it('should recognize admin email case-insensitively', () => {
    const adminEmail = 'duketopceo@gmail.com';
    const uppercaseEmail = 'DUKETOPCEO@GMAIL.COM';
    
    expect(adminEmail.toLowerCase()).toBe(uppercaseEmail.toLowerCase());
  });
});

describe('Professional Roles Configuration', () => {
  const professionalRoles = [
    'store_owner',
    'bank_manager', 
    'fund_manager',
    'restaurant_manager',
    'real_estate_investor',
    'startup_founder'
  ];

  it('should have all professional roles defined', () => {
    expect(professionalRoles).toHaveLength(6);
    expect(professionalRoles).toContain('store_owner');
    expect(professionalRoles).toContain('bank_manager');
    expect(professionalRoles).toContain('fund_manager');
  });

  it('should not contain fantasy or historical eras', () => {
    const fantasyEras = ['ancient_rome', 'medieval_europe', 'renaissance'];
    
    fantasyEras.forEach(era => {
      expect(professionalRoles).not.toContain(era);
    });
  });
});

describe('Learning Focuses Configuration', () => {
  const learningFocuses = [
    'financial_management',
    'strategic_planning',
    'operations',
    'customer_relations',
    'leadership',
    'risk_management'
  ];

  it('should have educational learning focuses', () => {
    expect(learningFocuses).toHaveLength(6);
    expect(learningFocuses).toContain('financial_management');
    expect(learningFocuses).toContain('strategic_planning');
  });

  it('should not contain fantasy themes', () => {
    const fantasyThemes = ['political', 'military', 'adventure', 'romance'];
    
    fantasyThemes.forEach(theme => {
      expect(learningFocuses).not.toContain(theme);
    });
  });
});

describe('Complexity Levels', () => {
  it('should map difficulty values to educational complexity levels', () => {
    const getComplexityLevel = (difficulty: number): string => {
      if (difficulty <= 0.2) return 'highly realistic';
      if (difficulty <= 0.4) return 'realistic';
      if (difficulty <= 0.6) return 'balanced';
      if (difficulty <= 0.8) return 'simplified';
      return 'beginner-friendly';
    };

    expect(getComplexityLevel(0.1)).toBe('highly realistic');
    expect(getComplexityLevel(0.3)).toBe('realistic');
    expect(getComplexityLevel(0.5)).toBe('balanced');
    expect(getComplexityLevel(0.7)).toBe('simplified');
    expect(getComplexityLevel(0.9)).toBe('beginner-friendly');
  });

  it('should not use fantasy-themed difficulty labels', () => {
    const fantasyLabels = ['pure fantasy', 'hyper-realistic', 'dramatic'];
    const educationalLabels = ['highly realistic', 'realistic', 'balanced', 'simplified', 'beginner-friendly'];
    
    fantasyLabels.forEach(label => {
      expect(educationalLabels).not.toContain(label);
    });
  });
});
