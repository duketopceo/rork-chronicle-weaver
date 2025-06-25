/**
 * Jest Test Setup Configuration for Chronicle Weaver
 * 
 * This file configures the Jest testing environment with necessary mocks
 * for React Native, Firebase, and other external dependencies.
 * 
 * Purpose: Provides a clean testing environment with proper mocks.
 * 
 * References:
 * - File: config/jest.setup.js
 * - Part of Chronicle Weaver test configuration
 * - Referenced by jest.config.js
 */

// Jest setup file for Chronicle Weaver
import 'react-native-gesture-handler/jestSetup';

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(true)),
}));

// Mock Expo modules
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  Stack: ({ children }) => children,
}));

// Global test setup
global.__DEV__ = true;
