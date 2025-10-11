/**
 * Metro Configuration for Chronicle Weaver v2.0
 * 
 * Purpose: Configures Metro bundler for React Native/Expo web builds
 * Key Features:
 * - CSS support for NativeWind/Tailwind
 * - Web platform support
 * - Optimized for large bundles with AI content
 * - Source map generation for debugging
 */

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS support for NativeWind
  isCSSEnabled: true,
});

// Add web platform support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Increase memory limit for large AI content bundles
config.maxWorkers = 2;

// Configure transformer for better performance
config.transformer = {
  ...config.transformer,
  // Enable source maps for debugging
  enableBabelRCLookup: false,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
  },
};

// Configure resolver for better module resolution
config.resolver = {
  ...config.resolver,
  alias: {
    '@': './src',
    '@/components': './src/components',
    '@/screens': './src/app',
    '@/store': './src/store',
    '@/services': './src/services',
    '@/types': './src/types',
    '@/utils': './src/utils',
    '@/hooks': './src/hooks',
    '@/constants': './src/constants',
    '@/assets': './assets',
  },
};

// Apply NativeWind configuration
module.exports = withNativeWind(config, {
  input: './src/styles/global.css',
});