/**
 * Babel Transpilation Configuration
 * 
 * Babel JavaScript transpilation and transformation configuration.
 * 
 * Purpose: Configures JavaScript/TypeScript transpilation rules.
 * 
 * References:
 * - File: babel.config.js
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          unstable_transformImportMeta: true, // Enable import.meta polyfill for compatibility
        },
      ],
    ],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./src",
          },
        },
      ],
      "react-native-web",
    ],
  };
};

