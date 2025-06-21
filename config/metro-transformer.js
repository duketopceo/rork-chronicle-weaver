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
  if (options && options.platform === 'web') {
    // Replace import.meta.env -> process.env for web compatibility
    src = src.replace(/import\.meta\.env/g, 'process.env');
    // Replace any remaining import.meta occurrences to avoid syntax errors
    src = src.replace(/\bimport\.meta\b/g, '{}');
  }

  return upstreamTransformer.transform({ src, filename, options });
};
