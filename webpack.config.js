/**
 * Webpack Configuration for Chronicle Weaver
 * 
 * This webpack configuration handles the build process for Chronicle Weaver's
 * web deployment. It compiles TypeScript, handles assets, and optimizes
 * the bundle for production deployment.
 * 
 * Key Features:
 * - TypeScript compilation with ts-loader
 * - Asset handling for images and stylesheets
 * - Production optimization for web deployment
 * - Module resolution for React Native Web compatibility
 * 
 * Build Target:
 * - Web deployment of the React Native Expo app
 * - Production-optimized bundle output
 * - Compatible with Chronicle Weaver's cross-platform architecture
 */

const path = require('path');

module.exports = {
  // === BUILD MODE CONFIGURATION ===
  mode: 'production', // Enables production optimizations (minification, tree-shaking)
  
  // === ENTRY POINT ===
  entry: './app/index.tsx', // Main application entry point for Chronicle Weaver
  
  // === OUTPUT CONFIGURATION ===
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory for built files
    filename: 'bundle.js',                 // Main bundle filename
  },
  
  // === MODULE RESOLUTION ===
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // File extensions to resolve automatically
  },
  
  // === LOADER CONFIGURATION ===
  module: {
    rules: [
      {
        // === TYPESCRIPT/TSX COMPILATION ===
        test: /\.tsx?$/,        // Match .ts and .tsx files
        use: 'ts-loader',       // Use TypeScript loader for compilation
        exclude: /node_modules/, // Skip node_modules for faster builds
      },
      {
        // === CSS STYLESHEET PROCESSING ===
        test: /\.css$/,                         // Match .css files
        use: ['style-loader', 'css-loader'],   // Load and inject CSS into DOM
      },
      {
        // === IMAGE ASSET HANDLING ===
        test: /\.(png|jpg|gif)$/,  // Match common image formats
        use: [
          {
            loader: 'file-loader',  // Handle file imports as assets
            options: {
              name: '[path][name].[ext]', // Preserve original file structure
            },
          },
        ],
      },
    ],
  },
};
