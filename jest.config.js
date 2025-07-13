/**
 * Jest Testing Configuration
 * 
 * Jest test framework configuration and testing environment setup.
 * 
 * Purpose: Configures unit testing environment and test execution.
 * 
 * References:
 * - File: jest.config.js
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'store/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
