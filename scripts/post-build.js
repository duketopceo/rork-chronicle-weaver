#!/usr/bin/env node

/**
 * Post-Build Script for Chronicle Weaver
 * 
 * This script runs after the build process to optimize the production bundle
 * for deployment to chronicleweaver.com
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

console.log('🚀 Post-build optimization starting...');

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Dist directory not found. Build may have failed.');
  process.exit(1);
}

try {
  // Copy custom index.html if it exists
  const customIndex = path.join(PUBLIC_DIR, 'index.html');
  const distIndex = path.join(DIST_DIR, 'index.html');
  
  if (fs.existsSync(customIndex)) {
    console.log('📄 Copying custom index.html...');
    fs.copyFileSync(customIndex, distIndex);
  }

  // Add cache headers configuration for Firebase hosting
  const firebaseJson = path.join(__dirname, '..', 'firebase.json');
  if (!fs.existsSync(firebaseJson)) {
    console.log('🔥 Creating Firebase hosting configuration...');
    const firebaseConfig = {
      hosting: {
        public: "dist",
        ignore: [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        rewrites: [
          {
            source: "**",
            destination: "/index.html"
          }
        ],
        headers: [
          {
            source: "**/*.@(js|css)",
            headers: [
              {
                key: "Cache-Control",
                value: "max-age=31536000"
              }
            ]
          },
          {
            source: "**/*.@(png|jpg|jpeg|gif|svg|webp)",
            headers: [
              {
                key: "Cache-Control",
                value: "max-age=31536000"
              }
            ]
          }
        ]
      }
    };
    
    fs.writeFileSync(firebaseJson, JSON.stringify(firebaseConfig, null, 2));
  }

  // Create a build info file
  const buildInfo = {
    buildTime: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: 'production',
    domain: 'chronicleweaver.com',
    commit: process.env.GITHUB_SHA || 'local',
    branch: process.env.GITHUB_REF_NAME || 'main'
  };

  fs.writeFileSync(
    path.join(DIST_DIR, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );

  console.log('✅ Post-build optimization completed successfully!');
  console.log(`📦 Build ready for deployment to chronicleweaver.com`);
  console.log(`🕒 Build time: ${buildInfo.buildTime}`);

} catch (error) {
  console.error('❌ Post-build optimization failed:', error);
  process.exit(1);
}
