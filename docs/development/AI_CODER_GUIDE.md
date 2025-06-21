# AI Coder Guide - Chronicle Weaver

> **Quick Start Guide for AI Assistants**  
> This document helps any AI coder get up to speed instantly with the Chronicle Weaver project.

## 🎯 Project Overview

**Chronicle Weaver** is a historical RPG web/mobile app where users create characters in any historical era and make choices that shape their story. Think "Choose Your Own Adventure" meets historical simulation.

**Live URL:** https://chronicleweaver.com  
**Tech Stack:** React Native (Expo), TypeScript, Firebase, AI-powered narrative generation

---

## 🚀 Quick Setup Commands

```bash
# Navigate to project
cd "c:\Users\kimba\Documents\Current rork app\rork-chronicle-weaver"

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to Firebase
npm run deploy
```

---

## 📁 Critical File Locations

### Core App Structure
- **`app/`** - Main app screens (Expo Router file-based routing)
  - `index.tsx` - Home screen with UltraDebugPanel integration
  - `_layout.tsx` - Root layout with ErrorBoundary
  - `game/` - All game-related screens (setup, play, chronos, etc.)

### Components
- **`components/UltraDebugPanel.tsx`** - Combined user/dev debug interface
- **`components/ErrorBoundary.tsx`** - Comprehensive error handling
- **`utils/debugSystem.ts`** - Advanced debugging utilities
- **`store/gameStore.ts`** - Zustand state management
- **`services/aiService.ts`** - AI narrative generation

### Configuration
- **`firebase.json`** - Firebase hosting/deployment config
- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`.env.local`** - Environment variables (not in git)

---

## 🧠 Key Architecture Patterns

### 1. Error Handling Strategy
```tsx
// Every component wrapped in ErrorBoundary
<ErrorBoundary onError={customHandler}>
  <YourComponent />
</ErrorBoundary>

// Debug logging throughout
debugSystem.logStep('component-name', 'success', 'Description');
```

### 2. State Management (Zustand)
```tsx
// Simple, predictable state
const { currentGame, updateGame } = useGameStore();
```

### 3. Debug System Integration
```tsx
// UltraDebugPanel has dual modes
- User Mode: Simple app health monitoring
- Developer Mode: Deep technical analysis
```

---

## 🛠 Development Best Practices

### Error Handling
- **Always** wrap new components in ErrorBoundary
- Use `debugSystem.logStep()` for tracking operations
- Add null checks for all dynamic data
- Test error scenarios explicitly

### TypeScript Usage
- Strict type checking enabled
- Interfaces defined in `types/`
- No `any` types unless absolutely necessary
- Props interfaces for all components

### Debugging
- UltraDebugPanel accessible via bug icon (dev mode only)
- Toggle between user/developer views
- Real-time monitoring of app health
- Export debug data for analysis

---

## 🚨 Common Issues & Solutions

### Loading Screen Problems
**Symptom:** Blank screen on startup  
**Solution:** Check `public/index.html` and `dist/index.html` for loading screen quotes

### React Version Conflicts
**Symptom:** Build errors  
**Solution:** Using React 19.1.0 - ensure all deps are compatible

### Firebase Deployment
**Symptom:** Assets not deploying  
**Solution:** Check `firebase.json` ignore patterns, run `npm run build` first

### Cross-Platform Issues
**Symptom:** Platform-specific crashes  
**Solution:** Use Platform.OS checks, especially for web vs native APIs

---

## 🔧 Debug Panel Guide

### Access
1. Development mode only (`__DEV__`)
2. Tap bug icon in top-right corner
3. Toggle between User/Developer modes

### User Mode Features
- App health status
- Game progress tracking
- Performance overview
- Recent activity feed

### Developer Mode Features
- Detailed error logs with stack traces
- Performance metrics and thresholds
- System information
- Step-by-step operation tracking
- Export/import debug data

---

## 📊 Game Flow Architecture

```
Home Screen (index.tsx)
    ↓
Game Setup (game/setup.tsx)
    ↓
Character Creation
    ↓
Main Gameplay (game/play.tsx)
    ↓
Story Generation (aiService.ts)
    ↓
Choice Selection
    ↓
State Update (gameStore.ts)
```

---

## 🌐 Deployment Pipeline

1. **Development:** Local server on port 8082
2. **Build:** `npm run build` → `dist/` folder
3. **Deploy:** `npm run deploy` → Firebase Hosting
4. **Custom Domain:** chronicleweaver.com (configured in Firebase)

---

## 🔍 Current Status (June 2025)

### ✅ Completed
- Fixed all major TypeScript/React errors
- Implemented comprehensive error boundaries
- Created UltraDebugPanel with dual user/dev modes
- Deployed to production with custom domain
- Enhanced loading screen with historical quotes
- Integrated advanced debug system

### 🚧 In Progress
- Performance optimizations
- Mobile app store preparation
- Additional AI narrative features

### 📋 Next Priorities
- User authentication system
- Save/load game functionality
- Multiplayer features
- Enhanced character customization

---

## 💡 AI Assistant Tips

### When Debugging
1. Check UltraDebugPanel first - it shows real-time app state
2. Look for error patterns in the debug logs
3. Test on both web and mobile platforms
4. Use the ErrorBoundary system for graceful degradation

### When Adding Features
1. Follow the existing TypeScript patterns
2. Add debug logging for all major operations
3. Wrap components in ErrorBoundary
4. Test error scenarios explicitly
5. Update this guide if adding major new patterns

### When Fixing Issues
1. Check WORK_HISTORY_DIARY.md for context
2. Use the debug system to track your changes
3. Test both user and developer debug views
4. Document any new patterns or solutions

---

## 📚 Key Dependencies

- **React Native:** 0.80.0 (cross-platform UI)
- **Expo:** 53.0.11 (development framework)
- **TypeScript:** Strict mode enabled
- **Zustand:** State management
- **Firebase:** Backend services
- **Lucide React Native:** Icons
- **Linear Gradient:** UI effects

---

## 🆘 Emergency Procedures

### If App Won't Start
1. Check terminal for dependency conflicts
2. Run `npm install` to update packages
3. Clear cache: `npx expo start -c`
4. Check `.env.local` file exists

### If Build Fails
1. Check TypeScript errors first
2. Verify all imports are correct
3. Test locally before deploying
4. Check Firebase project configuration

### If Debug Panel Crashes
1. Check browser console for errors
2. Verify debugSystem.ts is working
3. Test with fresh debug data
4. Check UltraDebugPanel component state

---

*This guide is living documentation - update it as the project evolves!*
