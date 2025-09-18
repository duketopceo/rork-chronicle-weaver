/**
 * Minimal Jest config for unit tests that avoids loading Expo/React Native.
 */
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  // Only look for tests inside the tests/ directory
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.(ts|tsx|js)'],
  // Ensure Babel does NOT read the project's babel.config.js (Expo preset)
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
      },
    ],
  },
  // Do not execute any RN/Expo setup files
  setupFiles: [],
  setupFilesAfterEnv: [],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Keep coverage limited to the tests folder for this minimal config
  collectCoverageFrom: ['tests/**/*.{ts,tsx,js,jsx}'],
  // Avoid traversing into src/ which may import Expo/React Native
  testPathIgnorePatterns: ['/node_modules/'],
};
