/**
 * Babel Configuration for Chronicle Weaver v2.0
 * 
 * Purpose: Configures Babel transpilation for React Native/Expo
 * Key Features:
 * - Expo preset for React Native compatibility
 * - Module resolver for clean imports using @ syntax
 * - React Native Reanimated plugin for animations
 * - Optimized for both development and production
 */

module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      // Expo preset includes React Native and web support
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }]
    ],
    plugins: [
      // Module resolver for clean imports
      [
        'module-resolver',
        {
          root: ['./src'],
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
        },
      ],
      // React Native Reanimated plugin (must be last)
      'react-native-reanimated/plugin',
    ],
  };
};