/**
 * Metro Transformer for Chronicle Weaver
 * 
 * Custom transformer to handle import.meta syntax issues in web builds.
 * This transformer replaces import.meta.env with process.env to ensure
 * compatibility with non-ES module environments.
 * 
 * Fixes the "import.meta may only appear in a module" error that was
 * preventing the React app from loading in browsers.
 */

const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  // Transform import.meta.env to process.env for web compatibility
  // Apply this transformation to all files, including node_modules
  if (options && options.platform === 'web') {
    src = src.replace(/import\.meta\.env/g, 'process.env');
  }
  
  return upstreamTransformer.transform({ src, filename, options });
};
