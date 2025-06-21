/**
 * Metro Configuration for Chronicle Weaver
 * 
 * This configuration ensures proper ES module handling for web builds,
 * resolving the import.meta syntax issues that were preventing the
 * React app from loading in the browser.
 * 
 * Key Features:
 * - Proper resolver configuration for cross-platform compatibility
 * - Web-specific platform extensions
 * - Node modules support for web deployment
 * - Custom transformer to handle import.meta syntax issues
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

// Configure web-specific transformations to handle import.meta
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

// Add custom transformer to handle import.meta syntax
config.transformer.babelTransformerPath = require.resolve('./metro-transformer.js');

module.exports = config;
