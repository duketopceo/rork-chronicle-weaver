#!/usr/bin/env node

/**
 * Post-Build Script for Chronicle Weaver
 * 
 * This script automatically fixes ES module compatibility issues after
 * the Expo web build process. It ensures the React app loads correctly
 * in browsers by:
 * 
 * 1. Replacing import.meta.env with process.env in the generated bundle
 * 2. Updating HTML script tags to use type="module"
 * 3. Validating the build output
 * 
 * Usage: node scripts/post-build-fix.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');

console.log('🔧 Running post-build fixes...');

// 1. Fix import.meta syntax in JavaScript bundles
function fixImportMetaInBundle() {
  const jsPattern = path.join(DIST_DIR, '_expo/static/js/web/*.js');
  const jsFiles = glob.sync(jsPattern);
  
  console.log(`📦 Found ${jsFiles.length} JavaScript bundle(s) to fix`);
  
  jsFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalSize = content.length;
      
      // Replace import.meta.env with process.env
      content = content.replace(/import\.meta\.env/g, 'process.env');
      
      if (content.length !== originalSize) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed import.meta syntax in ${path.basename(filePath)}`);
      } else {
        console.log(`ℹ️  No import.meta found in ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });
}

// 2. Fix HTML script tags to use type="module"
function fixHTMLScriptTags() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error(`❌ HTML file not found: ${HTML_FILE}`);
    return;
  }
  
  try {
    let html = fs.readFileSync(HTML_FILE, 'utf8');
    
    // Replace defer with type="module" in script tags
    const originalHtml = html;
    html = html.replace(
      /<script\s+src="([^"]*\/entry-[^"]*\.js)"\s+defer>/g,
      '<script src="$1" type="module">'
    );
    
    if (html !== originalHtml) {
      fs.writeFileSync(HTML_FILE, html, 'utf8');
      console.log('✅ Updated HTML script tags to use type="module"');
    } else {
      console.log('ℹ️  HTML script tags already correct');
    }
  } catch (error) {
    console.error(`❌ Error processing HTML file:`, error.message);
  }
}

// 3. Validate build output
function validateBuild() {
  console.log('🔍 Validating build output...');
  
  // Check if HTML file exists
  if (fs.existsSync(HTML_FILE)) {
    console.log('✅ HTML file exists');
  } else {
    console.error('❌ HTML file missing');
    return false;
  }
  
  // Check if JavaScript bundles exist
  const jsPattern = path.join(DIST_DIR, '_expo/static/js/web/*.js');
  const jsFiles = glob.sync(jsPattern);
  
  if (jsFiles.length > 0) {
    console.log(`✅ Found ${jsFiles.length} JavaScript bundle(s)`);
  } else {
    console.error('❌ No JavaScript bundles found');
    return false;
  }
  
  // Check for import.meta in bundles
  let hasImportMeta = false;
  jsFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('import.meta')) {
      console.warn(`⚠️  import.meta syntax still found in ${path.basename(filePath)}`);
      hasImportMeta = true;
    }
  });
  
  if (!hasImportMeta) {
    console.log('✅ No import.meta syntax found in bundles');
  }
  
  return true;
}

// Main execution
try {
  fixImportMetaInBundle();
  fixHTMLScriptTags();
  
  if (validateBuild()) {
    console.log('🎉 Post-build fixes completed successfully!');
    process.exit(0);
  } else {
    console.error('❌ Post-build validation failed');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Post-build script failed:', error.message);
  process.exit(1);
}
