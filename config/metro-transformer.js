/**
 * Metro Transformer for Chronicle Weaver
 * 
 * Enhanced transformer to handle import.meta syntax issues in all platforms.
 * This transformer replaces import.meta.env with process.env and removes
 * any other import.meta usage to ensure compatibility with non-ES module environments.
 * 
 * Fixes the "import.meta may only appear in a module" error that was
 * preventing the React app from loading in browsers and development mode.
 */

const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  // Apply transformations for both web and development modes
  if (options && (options.platform === 'web' || options.dev)) {
    // More aggressive replacement patterns
    src = src.replace(/import\.meta\.env/g, 'process.env');
    src = src.replace(/import\.meta\.url/g, '"file://"');
    src = src.replace(/import\.meta\.resolve/g, 'require.resolve');
    src = src.replace(/\bimport\.meta\b/g, '({})');
    
    // Log transformations for debugging (only in dev mode)
    if (options.dev && src.includes('import.meta')) {
      console.log(`[Metro Transformer] Found import.meta in ${filename}`);
    }
  }

  return upstreamTransformer.transform({ src, filename, options });
};
