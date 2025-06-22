/**
 * Metro Configuration for Chronicle Weaver
 * 
 * Enhanced configuration to ensure proper ES module handling for both
 * development and production builds, resolving import.meta syntax issues.
 * 
 * Key Features:
 * - Enhanced resolver configuration for cross-platform compatibility
 * - Web-specific platform extensions
 * - Node modules support for web deployment
 * - Custom transformer to handle import.meta syntax in all modes
 * - Development-specific optimizations
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

// Enhanced transformer configuration for all modes (dev and production)
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

// Apply custom transformer to handle import.meta syntax in all modes
config.transformer.babelTransformerPath = require.resolve('./metro-transformer.js');

// Enhanced resolver configuration
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'tsx'];

module.exports = config;
