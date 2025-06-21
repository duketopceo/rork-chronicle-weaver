# 🚀 Chronicle Weaver Firebase Hosting Deployment Plan

## Complete Step-by-Step Guide to Deploy on Firebase Hosting with Custom Domain

**Target Domain**: chronicleweaver.com  
**Project**: Chronicle Weaver - Historical RPG with AI-powered narrative  
**Author**: Rork <duketopceo@gmail.com>  
**Date**: June 18, 2025

---

## 📋 Prerequisites Checklist

### Required Tools & Accounts
- [ ] **Node.js** (v18+ recommended) - For package management and build tools
- [ ] **Bun** - Primary package manager for this project
- [ ] **Firebase CLI** - For deployment and hosting management
- [ ] **Git** - For version control and GitHub integration
- [ ] **Google Account** - For Firebase Console access
- [ ] **Domain** - chronicleweaver.com (purchased and accessible)

### Firebase Project Setup
- [ ] **Firebase Project Created** in Firebase Console
- [ ] **Firebase Project ID** noted and configured
- [ ] **Billing Account** linked (required for custom domains)
- [ ] **Firebase Hosting** enabled for the project

---

## 🔧 Phase 1: Environment Setup

### Step 1.1: Install Required Tools

```powershell
# Install Node.js (if not already installed)
# Download from: https://nodejs.org/en/download/
# Verify installation
node --version
npm --version

# Install Bun (if not already installed)
# Download from: https://bun.sh/docs/installation
# Verify installation
bun --version

# Install Firebase CLI globally
npm install -g firebase-tools
# OR using Bun
bun install -g firebase-tools

# Verify Firebase CLI installation
firebase --version

# Install Git (if not already installed)
# Download from: https://git-scm.com/download/win
git --version
```

### Step 1.2: Verify Project Dependencies

```powershell
# Navigate to project directory
cd "c:\Users\kimba\Documents\Current rork app\rork-chronicle-weaver"

# Install all project dependencies
bun install

# Verify critical dependencies
bun list | findstr expo
bun list | findstr firebase
bun list | findstr webpack
```

---

## 🔐 Phase 2: Firebase Authentication & Project Setup

### Step 2.1: Login to Firebase

```powershell
# Login to Firebase (opens browser for authentication)
firebase login

# Verify login
firebase projects:list
```

### Step 2.2: Initialize Firebase Project (if not already done)

```powershell
# Initialize Firebase in project directory
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# - Use existing project or create new one
# - Public directory: dist
# - Single-page app: Yes
# - Set up automatic builds: No (we'll do manual builds)
```

### Step 2.3: Configure Firebase Project

```powershell
# Set the Firebase project (replace with your project ID)
firebase use --add

# Create .firebaserc if it doesn't exist
# This file should contain your Firebase project ID
```

**Expected .firebaserc content:**
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

---

## 🏗️ Phase 3: Build Configuration & Testing

### Step 3.1: Environment Variables Setup

Create and configure `.env.local`:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# OpenAI Configuration (for AI features)
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_DEBUG=false
```

### Step 3.2: Test Build Process

```powershell
# Clean previous builds
bun run prebuild

# Test Expo web build
bun run build:web

# Test Webpack build
bun run build:webpack

# Test complete production build
bun run build:production

# Verify dist folder was created and contains files
ls dist
```

### Step 3.3: Test Local Firebase Serve

```powershell
# Serve locally to test Firebase hosting configuration
firebase serve --only hosting

# Should be available at: http://localhost:5000
# Test all routes and functionality
```

---

## 🚀 Phase 4: Initial Deployment

### Step 4.1: Deploy to Firebase Hosting

```powershell
# Deploy to Firebase Hosting
bun run deploy

# OR manually:
firebase deploy --only hosting

# Note the provided URL (e.g., https://your-project.firebaseapp.com)
```

### Step 4.2: Verify Initial Deployment

```powershell
# Open the deployed site
firebase open hosting:site

# Test all major functionality:
# - Homepage loads correctly
# - Navigation works
# - Game screens function
# - AI integration works (if configured)
# - No console errors
```

---

## 🌐 Phase 5: Custom Domain Setup (chronicleweaver.com)

### Step 5.1: Add Custom Domain in Firebase Console

1. **Open Firebase Console**: https://console.firebase.google.com
2. **Navigate to Hosting** section
3. **Click "Add custom domain"**
4. **Enter domain**: `chronicleweaver.com`
5. **Add www subdomain**: `www.chronicleweaver.com` (recommended)

### Step 5.2: DNS Configuration

**You'll need to add these DNS records to your domain registrar:**

```
# For chronicleweaver.com
Type: A
Name: @ (or leave blank)
Value: [Firebase IP addresses provided by Firebase]

# For www.chronicleweaver.com  
Type: CNAME
Name: www
Value: [Firebase hosting domain provided]

# Example Firebase IPs (these will be provided by Firebase):
151.101.1.195
151.101.65.195
```

### Step 5.3: SSL Certificate Setup

Firebase automatically provides SSL certificates for custom domains:
- **Certificate provisioning**: Automatic via Let's Encrypt
- **HTTPS redirect**: Enabled by default
- **Certificate renewal**: Automatic

---

## 🔄 Phase 6: CI/CD Setup (GitHub Actions)

### Step 6.1: GitHub Repository Setup

```powershell
# Ensure all files are committed
git add .
git commit -m "feat: Complete Firebase deployment preparation"

# Push to GitHub
git push origin main
```

### Step 6.2: Firebase Service Account for CI/CD

1. **Go to Firebase Console** → Project Settings → Service Accounts
2. **Generate new private key** for GitHub Actions
3. **Add Firebase token to GitHub Secrets**:
   - Go to GitHub repository → Settings → Secrets and Variables → Actions
   - Add secret: `FIREBASE_SERVICE_ACCOUNT` (paste the JSON content)

### Step 6.3: GitHub Actions Workflow

The workflow is already configured in `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - name: Install dependencies
        run: bun install
      - name: Build project
        run: bun run build:production
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-firebase-project-id
```

---

## 📊 Phase 7: Performance Optimization

### Step 7.1: Bundle Analysis

```powershell
# Analyze bundle size
bun run build:webpack -- --analyze

# Review webpack-bundle-analyzer output
# Optimize large dependencies if needed
```

### Step 7.2: Firebase Hosting Headers

Update `firebase.json` with performance headers:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

## 🧪 Phase 8: Testing & Validation

### Step 8.1: Pre-deployment Testing

```powershell
# Run all tests
bun run test

# Type checking
bun run type-check

# Linting
bun run lint

# Build verification
bun run build:production

# Local serving test
firebase serve --only hosting
```

### Step 8.2: Post-deployment Testing

**Automated Tests:**
- [ ] Homepage loads within 3 seconds
- [ ] All navigation links work
- [ ] Game functionality works
- [ ] AI integration responds
- [ ] Mobile responsiveness
- [ ] PWA features (if enabled)

**Manual Testing:**
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Test all game features
- [ ] Verify HTTPS certificate
- [ ] Check console for errors

---

## 🔍 Phase 9: Monitoring & Analytics

### Step 9.1: Firebase Analytics Setup

```powershell
# Install Firebase Analytics (if not already installed)
bun add firebase

# Configure in app/_layout.tsx (already done)
# Analytics will automatically track page views and user engagement
```

### Step 9.2: Performance Monitoring

1. **Enable Firebase Performance Monitoring** in Firebase Console
2. **Add performance monitoring SDK** (already included)
3. **Monitor Core Web Vitals**
4. **Set up alerts** for performance degradation

---

## 🚨 Phase 10: Troubleshooting Guide

### Common Issues & Solutions

**Build Failures:**
```powershell
# Clear cache and reinstall
rm -rf node_modules bun.lockb dist
bun install
bun run build:production
```

**Firebase Deployment Errors:**
```powershell
# Check Firebase project configuration
firebase projects:list
firebase use your-project-id

# Re-authenticate if needed
firebase logout
firebase login
```

**Custom Domain Issues:**
- Verify DNS records are correctly configured
- Wait 24-48 hours for DNS propagation
- Check domain registrar settings
- Ensure billing is enabled on Firebase project

**Performance Issues:**
- Check bundle size with webpack-bundle-analyzer
- Optimize images and assets
- Enable gzip compression in Firebase hosting
- Use CDN for static assets

---

## 📝 Phase 11: Deployment Checklist

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Firebase project setup and authenticated
- [ ] Dependencies installed and tested
- [ ] Build process tested locally
- [ ] Local Firebase serve tested
- [ ] Git repository up to date

### Deployment Checklist
- [ ] Production build successful
- [ ] Firebase deployment successful
- [ ] Default domain accessible
- [ ] Custom domain configured
- [ ] DNS records added
- [ ] SSL certificate active
- [ ] All routes working
- [ ] Performance optimized

### Post-deployment Checklist
- [ ] Full functionality testing
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Performance monitoring setup
- [ ] Analytics tracking verified
- [ ] CI/CD pipeline tested
- [ ] Documentation updated

---

## 🎯 Execution Commands Summary

```powershell
# Complete deployment in one go:

# 1. Setup and install
bun install
firebase login

# 2. Build and test
bun run build:production
firebase serve --only hosting

# 3. Deploy
bun run deploy

# 4. Configure custom domain in Firebase Console
# 5. Update DNS records
# 6. Test and verify
```

---

## 📞 Support & Resources

**Firebase Documentation:**
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Custom Domain Setup](https://firebase.google.com/docs/hosting/custom-domain)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

**Project Resources:**
- **Repository**: https://github.com/your-username/chronicle-weaver
- **Developer**: Rork <duketopceo@gmail.com>
- **Domain**: chronicleweaver.com

**Emergency Contacts:**
- **Primary Developer**: duketopceo@gmail.com
- **Firebase Support**: https://firebase.google.com/support

---

*This deployment plan is comprehensive and designed to handle all aspects of getting Chronicle Weaver live on Firebase Hosting with a custom domain. Follow each phase carefully and test thoroughly at each step.*
