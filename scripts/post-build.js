/**
 * Post-Build Script for Chronicle Weaver
 * 
 * This script runs after the production build to optimize the generated index.html
 * for better module loading and compatibility.
 * 
 * Purpose: Adds type="module" to script tags for ES module compatibility.
 * 
 * References:
 * - File: scripts/post-build.js
 * - Part of Chronicle Weaver build pipeline
 * - Called automatically by npm run build:production
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

fs.readFile(indexPath, 'utf8', (err, html) => {
  if (err) {
    console.error('Error reading index.html:', err);
    return;
  }
  // Add type="module" to all script tags that have a src attribute and are not already modules
  const modifiedHtml = html.replace(/<script\s+src="([^"]*)"([^>]*)><\/script>/g, '<script type="module" src="$1"$2></script>');

  fs.writeFile(indexPath, modifiedHtml, 'utf8', (err) => {
    if (err) {
      console.error('Error writing modified index.html:', err);
      return;
    }
    console.log('Successfully added type="module" to script tags in index.html');
  });
});
