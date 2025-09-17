# Chronicle Weaver Development Instructions

**ALWAYS follow these instructions first. Only fallback to additional search and context gathering if the information here is incomplete or found to be in error.**

Chronicle Weaver is a historical role-playing game built with React Native, Expo Router, and TypeScript, deployed as a web application on Firebase Hosting at chronicleweaver.com. The application features AI-powered narrative generation, comprehensive state management with Zustand, and tRPC for type-safe API communication.

## 🚀 Essential Setup & Build Commands

**CRITICAL: Set timeouts of 60+ minutes for builds and 30+ minutes for installations. NEVER CANCEL long-running operations.**

### Bootstrap Environment (First Time Setup)
```bash
# Install Node.js 18+ (verified working with 20.x)
# Download from: https://nodejs.org/
node --version  # Should show v20.x or higher

# Install Bun package manager
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
export PATH="$HOME/.bun/bin:$PATH"
bun --version  # Should show 1.2.x or higher

# Install Firebase CLI globally
npm install -g firebase-tools
firebase --version

# Navigate to project and install dependencies
cd /path/to/rork-chronicle-weaver
npm install  # Takes 2-5 minutes, use npm not bun for stability
```

### Core Build & Development Commands
```bash
# Development server (web version)
npm run start-web          # Starts development server on localhost:8081
                           # NEVER CANCEL: Takes 2-5 minutes to start
                           # Set timeout to 10+ minutes

# Production build - MOST IMPORTANT COMMAND  
npm run build:production   # FIRST BUILD: Takes 30-45 minutes - NEVER CANCEL
                           # SUBSEQUENT BUILDS: Takes 5-10 seconds when cached
                           # Set timeout to 60+ minutes for first build
                           # Creates optimized build in ./dist folder

# Quick development commands
npm run type-check         # TypeScript validation - takes 1-2 minutes
npm run lint              # ESLint code checking - takes 30 seconds  
npm run test              # Jest tests - currently no tests configured

# Firebase deployment (requires authentication)
npm run deploy            # Build + deploy to Firebase hosting
firebase serve --only hosting  # Local preview of production build
```

## ⚠️ CRITICAL TIMING & NEVER CANCEL WARNINGS

**These operations take significant time. DO NOT cancel them:**

- `npm run build:production`: **FIRST BUILD: 30-45 minutes** - Set timeout to 60+ minutes
- `npm run build:production`: **SUBSEQUENT BUILDS: 5-10 seconds** when cached  
- `npm install`: **2-5 minutes** - Set timeout to 10+ minutes  
- `npm run start-web`: **2-5 minutes to start** - Set timeout to 10+ minutes
- `npm run type-check`: **1-2 minutes** - Set timeout to 5+ minutes

**If a command appears to hang, wait at least the full timeout period before considering alternatives.**

## 🧪 Manual Validation Requirements

**ALWAYS test functionality after making changes by running complete user scenarios:**

### Required Validation Steps After Changes
1. **Build Verification**: `npm run build:production` - MUST complete successfully
2. **Type Check**: `npm run type-check` - Review any errors (some in archive folder are expected)
3. **Lint Check**: `npm run lint` - Should complete with warnings only, no errors
4. **Development Server**: `npm run start-web` - Should start and serve on localhost:8081

### Manual Testing Scenarios
**After making changes, ALWAYS test at least one complete end-to-end scenario:**

1. **Build Validation**: Verify `dist/` folder contains all files (index.html, favicon.ico, assets/, _expo/)
2. **Home Screen Navigation**: Load application → verify home screen displays → test navigation to game sections
3. **Game Setup Flow**: Navigate to game setup → create character → verify state persistence  
4. **Gameplay Interface**: Enter gameplay mode → test choice interactions → verify story progression
5. **State Management**: Make choices → navigate between screens → verify game state persists

**Local Testing**: Use `firebase serve --only hosting` or `npx serve dist` to test built application locally before deployment.

**Note**: TypeScript errors in the `archive/` folder are expected and do not affect production build.

## 📁 Key Project Structure & Navigation

### Essential Directories
```
src/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Home screen  
│   └── game/              # Game-specific screens
├── components/            # Reusable UI components
├── store/                 # Zustand state management
│   └── gameStore.ts      # Main game state store
├── services/             # API and external service integration
├── types/                # TypeScript type definitions
│   └── game.ts           # Core game types
└── utils/                # Utility functions

docs/                     # Comprehensive documentation
├── development/          # Development guides
├── FIREBASE_DEPLOYMENT_PLAN.md
└── DEPLOYMENT_CHECKLIST.md
```

### Key Configuration Files
- `package.json` - Project dependencies and scripts
- `app.json` - Expo application configuration  
- `firebase.json` - Firebase hosting configuration (auto-generated)
- `tsconfig.json` - TypeScript compiler settings
- `.env.example` - Environment variables template

## 🔧 Working Effectively

### State Management
- **Store Location**: `src/store/gameStore.ts` - Zustand-based game state
- **Always check**: Game state changes after modifying components
- **Key Pattern**: Use `useGameStore()` hook in components

### API Integration  
- **tRPC Setup**: `src/lib/trpc.ts` - Type-safe API client
- **Backend**: Uses Hono framework with tRPC server integration
- **Always verify**: API calls work after interface changes

### Type Safety
- **Strict TypeScript**: All code must pass type checking
- **Key Types**: Defined in `src/types/game.ts`
- **Important**: Archive folder has expected TypeScript errors - ignore those

### Environment Configuration
- **Development**: Copy `.env.example` to `.env` and configure
- **Required Variables**: Firebase configuration keys
- **Never commit**: Actual environment files with secrets

## 🚨 Common Issues & Solutions

### Build Failures
```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules/.cache .expo
npm install
npm run build:production
```

### TypeScript Errors
- **Expected**: Errors in `archive/` folder - these don't affect builds
- **Action Required**: Only fix errors in `src/` folder
- **Command**: `npm run type-check` to identify issues

### Development Server Issues
```bash
# Clear Expo cache and restart
npm run start-web -- --clear-cache
# OR manually clear
rm -rf .expo node_modules/.cache
npm run start-web
```

**Important**: In CI environments, Metro runs in CI mode with reloads disabled. This is normal behavior. If networking is disabled, dependency validation will use local bundle maps, which may cause warnings but won't prevent operation.

### Firebase CLI Issues
```bash
# Reinstall Firebase CLI
npm uninstall -g firebase-tools
npm install -g firebase-tools
firebase login
```

## 🎯 Pre-Commit Checklist

**ALWAYS run before committing changes:**

1. ✅ `npm run type-check` - Must pass with 0 errors in `src/` folder
2. ✅ `npm run lint` - Must complete (warnings OK, errors not OK)  
3. ✅ `npm run build:production` - Must complete successfully
4. ✅ Test one complete user scenario manually
5. ✅ Verify no secrets or environment files are committed

**Note**: The command `node scripts/error-scanner.js` mentioned in some documentation does not exist in this repository.

## 📊 Performance & Timing Expectations

| Command | Expected Time | Timeout Setting |
|---------|---------------|-----------------|
| `npm install` | 2-5 minutes | 10+ minutes |
| `npm run start-web` | 2-5 minutes | 10+ minutes |
| `npm run type-check` | 1-2 minutes | 5+ minutes |
| `npm run lint` | 30 seconds | 2+ minutes |
| `npm run build:production` (first) | **30-45 minutes** | **60+ minutes** |
| `npm run build:production` (cached) | **5-10 seconds** | **5+ minutes** |
| `npm run test` | Instant (no tests) | 2+ minutes |

**REMEMBER: Chronicle Weaver builds are INTENTIONALLY SLOW due to comprehensive optimization. This is normal behavior.**

## 🏗️ Architecture Notes

- **Framework**: React Native with Expo Router for web deployment
- **State**: Zustand for game state, React Query for server state
- **API**: tRPC for type-safe client-server communication  
- **Deployment**: Firebase Hosting with automatic CI/CD via GitHub Actions
- **Styling**: NativeWind (Tailwind for React Native)
- **Backend**: Hono lightweight framework with tRPC integration

**Key Principle**: Always maintain type safety and test manually after changes. The build system is slow but thorough - respect the timing requirements.**