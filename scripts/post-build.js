/**
 * Post-Build Script for Chronicle Weaver
 * 
 * This script fixes the import.meta syntax issues in the Expo-generated
 * JavaScript bundle that prevent the React app from loading.
 * 
 * Key Features:
 * - Replaces import.meta.env with process.env for browser compatibility
 * - Updates HTML script tag to use type="module" for ES module support
 * - Ensures proper module loading for deployment
 * 
 * Run after: npm run build:web
 * Purpose: Fix ES module compatibility issues for web deployment
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Post-build: Fixing import.meta syntax issues...');

// Find all JavaScript files in the dist/_expo/static/js/web directory
const jsFiles = glob.sync('dist/_expo/static/js/web/*.js');

if (jsFiles.length === 0) {
  console.error('❌ No JavaScript files found in dist/_expo/static/js/web/');
  process.exit(1);
}

let fixedFiles = 0;

jsFiles.forEach(filePath => {
  console.log(`📝 Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Count occurrences before replacement
  const importMetaCount = (content.match(/import\.meta\.env/g) || []).length;
  
  if (importMetaCount > 0) {
    console.log(`   Found ${importMetaCount} import.meta.env occurrences`);
    
    // Replace import.meta.env with process.env for browser compatibility
    // This maintains the same functionality but uses CommonJS-compatible syntax
    content = content.replace(/import\.meta\.env/g, 'process.env');
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    fixedFiles++;
    
    console.log(`   ✅ Fixed import.meta syntax in ${path.basename(filePath)}`);
  } else {
    console.log(`   ℹ️  No import.meta syntax found in ${path.basename(filePath)}`);
  }
});

// Fix the HTML file to load the script as an ES module
const htmlPath = 'dist/index.html';
if (fs.existsSync(htmlPath)) {
  console.log(`📝 Processing: ${htmlPath}`);
  
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Replace defer with type="module" for proper ES module loading
  const originalHtml = htmlContent;
  htmlContent = htmlContent.replace(
    /(<script[^>]+)(\s+defer)([^>]*>)/g,
    '$1 type="module"$3'
  );
  
  if (htmlContent !== originalHtml) {
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(`   ✅ Updated script tag to use type="module"`);
  } else {
    console.log(`   ℹ️  Script tag already properly configured`);
  }
} else {
  console.warn(`⚠️  HTML file not found: ${htmlPath}`);
}

console.log(`\n🎉 Post-build completed! Fixed ${fixedFiles} JavaScript files.`);
console.log('📦 Ready for deployment!');
