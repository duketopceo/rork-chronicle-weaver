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

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Global test setup
global.__DEV__ = true;
