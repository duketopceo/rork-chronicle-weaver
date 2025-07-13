/**
 * Metro Configuration for Chronicle Weaver
 * 
<<<<<<< HEAD
 * Enhanced configuration to ensure proper ES module handling for both
 * development and production builds, resolving import.meta syntax issues.
 * 
 * Key Features:
 * - Enhanced resolver configuration for cross-platform compatibility
 * - Web-specific platform extensions
 * - Node modules support for web deployment
 * - Custom transformer to handle import.meta syntax in all modes
 * - Development-specific optimizations
=======
 * This configuration ensures proper ES module handling for web builds,
 * resolving the import.meta syntax issues that were preventing the
 * React app from loading in the browser.
 * 
 * Key Features:
 * - Proper resolver configuration for cross-platform compatibility
 * - Web-specific platform extensions
 * - Node modules support for web deployment
 * - Custom transformer to handle import.meta syntax issues
>>>>>>> cbd5f1e4b7ac2735596c3d51f791e58f1c628502
 * 
 * @format
 */

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support
  isCSSEnabled: true,
});

// Enable symlinks for better development experience
config.resolver.symlinks = false;

// Add web-specific platform extensions for better resolution
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

<<<<<<< HEAD
// Enhanced transformer configuration for all modes (dev and production)
=======
// Configure web-specific transformations to handle import.meta
>>>>>>> cbd5f1e4b7ac2735596c3d51f791e58f1c628502
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

<<<<<<< HEAD
// Enhanced resolver configuration
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'tsx'];
=======
// Add custom transformer to handle import.meta syntax
config.transformer.babelTransformerPath = require.resolve('./metro-transformer.js');
>>>>>>> cbd5f1e4b7ac2735596c3d51f791e58f1c628502

module.exports = config;
