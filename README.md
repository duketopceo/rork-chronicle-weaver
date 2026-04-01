# Chronicle Weaver
*A Historical Role-Playing Game*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-chronicleweaver.com-blue)](https://chronicleweaver.com)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#deployment)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79-blue)](https://reactnative.dev/)

An open-source historical RPG with AI-powered storytelling, deployed at [chronicleweaver.com](https://chronicleweaver.com)

## 🏛️ Project Overview

Chronicle Weaver is an immersive historical role-playing game built with React Native and Expo. Players create characters and embark on narrative adventures across different historical eras, making choices that shape their story and impact the world around them.

## ✨ Key Features

- **Multiple Historical Eras**: Play in Ancient Rome, Medieval Europe, Renaissance Italy, Wild West, Victorian London, and more
- **Dynamic Storytelling**: AI-powered narrative generation creates unique stories based on your choices
- **Character Development**: Build your character with stats like Influence, Knowledge, Resources, and Reputation
- **Rich Inventory System**: Collect weapons, tools, documents, and valuable items throughout your journey
- **Relationship Management**: Build trust and relationships with NPCs and factions
- **World Systems**: Navigate complex political, economic, and social systems
- **Cross-Platform**: Available on iOS, Android, and Web

## 🏗️ Technical Architecture

### Frontend
- **React Native + Expo**: Cross-platform mobile development
- **Expo Router**: File-based routing system for navigation
- **Zustand**: Lightweight state management
- **NativeWind**: Tailwind CSS for React Native styling
- **TypeScript**: Type-safe development

### Backend Infrastructure
- **Firebase Hosting**: Web deployment and CDN
- **Firebase App Hosting**: Backend API services (configured but not implemented)
- **Hono**: Lightweight web framework (ready for implementation)
- **tRPC**: End-to-end type-safe APIs (structure defined)
- **Firebase**: Authentication and data persistence
- **Zod**: Schema validation

### UI/UX
- **Lucide Icons**: Consistent iconography
- **Linear Gradients**: Rich visual backgrounds
- **Haptic Feedback**: Enhanced mobile experience
- **Responsive Design**: Optimized for all screen sizes

## 📁 Current Project Structure

### 🚨 Empty/Placeholder Files Status
**The following files exist but are empty or minimal placeholders:**
- ❌ `backend/functions/hono.ts` - **EMPTY** - Main Hono server not implemented
- ⚠️ `backend/trpc/routes/example/hi/route.ts` - Only example route, no real functionality
- ⚠️ Several game screens have basic structure but need full implementation

```
Chronicle Weaver/
├── 📱 src/app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx               # ✅ Root layout with providers & error boundaries
│   ├── index.tsx                 # ✅ Home screen with era selection
│   ├── +not-found.tsx            # ✅ 404 error page
│   └── game/                     # Game-specific screens
│       ├── setup.tsx             # ✅ Character & world setup (fully functional)
│       ├── play.tsx              # ✅ Main gameplay interface (fully functional)
│       ├── character.tsx         # ✅ Character stats & inventory management
│       ├── memories.tsx          # ✅ Player's story history viewer
│       ├── lore.tsx              # ⚠️ World lore browser (basic implementation)
│       ├── systems.tsx           # ⚠️ Game systems overview (basic implementation)
│       ├── chronos.tsx           # ⚠️ Time management (basic implementation)
│       └── kronos.tsx            # ⚠️ Advanced time mechanics (basic implementation)
│
├── 🧩 src/components/             # Reusable UI components
│   ├── AuthPanel.tsx             # ✅ Firebase authentication
│   ├── BillingPanel.tsx          # ⚠️ Subscription management (basic structure)
│   ├── Button.tsx                # ✅ Custom styled button
│   ├── ChoiceButton.tsx          # ✅ Interactive story choice buttons
│   ├── CustomChoiceInput.tsx     # ✅ Custom choice input field
│   ├── CustomSlider.tsx          # ✅ Settings slider component
│   ├── DebugPanel.tsx            # ✅ Development debugging interface
│   ├── EnhancedDebugPanel.tsx    # ✅ Advanced debugging tools
│   ├── UltraDebugPanel.tsx       # ✅ Complete debugging interface
│   ├── ErrorBoundary.tsx         # ✅ React error boundary
│   ├── MemoryList.tsx            # ✅ Story memory management
│   ├── NarrativeText.tsx         # ✅ Animated story text display
│   ├── StatsBar.tsx              # ✅ Character stats visualization
│   ├── SubscriptionGate.tsx      # ⚠️ Premium feature gating (basic)
│   ├── SubscriptionPanel.tsx     # ⚠️ Subscription UI (basic)
│   ├── TextInput.tsx             # ✅ Styled text input component
│   ├── UpgradePrompt.tsx         # ⚠️ Premium upgrade prompts (basic)
│   └── UsageIndicator.tsx        # ⚠️ API usage display (basic)
│
├── 🗄️ src/store/                  # Zustand state management
│   └── gameStore.ts              # ✅ Complete game state management
│
├── 📐 src/types/                  # TypeScript definitions
│   ├── game.ts                   # ✅ Complete game type definitions
│   └── global.d.ts               # ✅ Global type declarations
│
├── 🔧 src/services/               # External service integrations
│   ├── aiService.ts              # ✅ AI narrative generation (OpenAI integration)
│   └── firebaseUtils.ts          # ✅ Firebase helper functions
│
├── 🏗️ backend/                    # Server-side code (MOSTLY EMPTY)
│   ├── functions/
│   │   └── hono.ts               # ❌ EMPTY - Main server setup needed
│   └── trpc/                     # tRPC API structure
│       ├── app-router.ts         # ⚠️ Basic router setup
│       ├── create-context.ts     # ⚠️ Basic context creation
│       └── routes/example/hi/
│           └── route.ts          # ⚠️ Example route only
│
├── 🎨 src/constants/              # App-wide constants
│   └── colors.ts                 # ✅ Complete color theme
│
├── 🛠️ src/utils/                  # Utility functions
│   ├── dateUtils.ts              # ✅ Date/time helpers
│   ├── debugSystem.ts            # ✅ Advanced debugging utilities
│   └── errorLogger.ts            # ✅ Error logging system
│
├── 🎯 src/lib/                    # Library configurations
│   └── trpc.ts                   # ✅ tRPC client setup
│
├── 🖼️ assets/images/              # Static assets
│   ├── adaptive-icon.png         # ✅ App adaptive icon
│   ├── favicon.png               # ✅ Web favicon
│   ├── icon.png                  # ✅ App icon
│   └── splash-icon.png           # ✅ Splash screen icon
│
├── 🌐 public/                     # Web assets
│   └── index.html                # ✅ Web entry point with browser extension fixes
│
├── 🧪 tests/                      # Test files
│   └── app.test.ts               # ⚠️ Basic test structure (needs expansion)
│
├── ⚙️ config/                     # Configuration files
│   ├── app.json                  # ✅ Expo app configuration
│   ├── babel.config.js           # ✅ Babel configuration
│   ├── expo-env.d.ts             # ✅ Expo TypeScript definitions
│   ├── eslint.config.js          # ✅ ESLint configuration
│   ├── firebase.json             # ✅ Firebase hosting configuration
│   ├── jest.config.js            # ✅ Jest testing configuration
│   ├── jest.setup.js             # ✅ Jest setup file
│   ├── metro.config.js           # ✅ Metro bundler configuration
│   ├── metro-transformer.js      # ✅ Metro transformer
│   ├── tsconfig.json             # ✅ TypeScript configuration
│   └── webpack.config.js         # ✅ Webpack configuration
│
├── 📚 docs/                       # Comprehensive documentation
│   ├── AI_DEVELOPER_GUIDE.md     # ✅ Complete development guide
│   ├── APP_CONFIG_DOCS.md        # ✅ Configuration documentation
│   ├── CODE_DOCUMENTATION.md     # ✅ Code structure documentation
│   ├── DEPLOYMENT_CHECKLIST.md   # ✅ Deployment procedures
│   ├── FIREBASE_DEPLOYMENT_PLAN.md # ✅ Firebase deployment guide
│   ├── FIREBASE_DOCS.md          # ✅ Firebase integration docs
│   ├── PACKAGE_DOCS.md           # ✅ Package management docs
│   ├── PROJECT_CONTEXT.md        # ✅ Project context & goals
│   ├── TSCONFIG_DOCS.md          # ✅ TypeScript configuration docs
│   ├── WORK_HISTORY_DIARY.md     # ✅ Development history log
│   ├── CONTACT.md                # ✅ Contact information
│   └── security.md               # ✅ Security guidelines
│
├── 🔧 scripts/                    # Build & deployment scripts
│   └── post-build.js             # ✅ Post-build processing
│
└── 📋 Root Configuration Files
    ├── package.json              # ✅ Dependencies & scripts
    ├── package-lock.json         # ✅ Dependency lock file (recently fixed)
    ├── README.md                 # ✅ This file
    ├── .env.example              # ✅ Environment variables template
    ├── .env.local                # 🔒 Local development environment
    ├── .env.production           # 🔒 Production environment
    ├── .firebaserc               # ✅ Firebase project configuration
    ├── .eslintrc.json            # ✅ ESLint configuration
    ├── .prettierrc               # ✅ Prettier code formatting
    └── bun.lock                  # ✅ Bun package manager lock
```

## 🚨 Critical Development Guidelines - NO MORE PLACEHOLDERS

### Empty/Placeholder Files Status
**The following files exist but are empty or minimal placeholders:**
- ❌ `backend/functions/hono.ts` - **EMPTY** - Main Hono server not implemented
- ⚠️ `backend/trpc/routes/example/hi/route.ts` - Only example route, no real functionality
- ⚠️ Several game screens have basic structure but need full implementation

### 🚨 IMPORTANT RULE: **NO MORE PLACEHOLDER FILES**
**Do not add any more placeholder files or "TODO" comments.** Either:
- ✅ Implement functionality properly with real code
- ❌ Leave it out entirely until ready to implement

### Current Implementation Status:
- ✅ **Fully Working**: Character creation, AI storytelling, game state, Firebase auth, web deployment
- ⚠️ **Partially Working**: Some game screens, lore browser, time systems (functional but basic)  
- ❌ **Not Implemented**: Backend server, advanced tRPC routes, mobile deployment

## 🎮 Game Flow & Implementation Status

1. **Home Screen**: ✅ Introduction and era selection (fully implemented)
2. **Setup**: ✅ Choose historical era, themes, and create character (fully functional)  
3. **Gameplay**: ✅ Navigate through story segments making choices (AI-powered)
4. **Character Management**: ✅ View stats, inventory, and relationships
5. **Memory System**: ✅ Review past decisions and their consequences
6. **Lore Discovery**: ⚠️ Learn about historical world and systems (basic implementation)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Bun package manager
- Expo CLI
- Firebase project (for authentication and data)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd rork-chronicle-weaver

# Install dependencies
bun install

# Start development server
bun run start

# For web development
bun run start-web
```

### Environment Setup
1. Copy `.env.example` to `.env` and configure your values
2. Set up Firebase project and add credentials to `.env`
3. Configure AI service integration (optional)
4. Update any custom domain settings

## 🔧 Development

### Key Development Commands
- `bun run start`: Start mobile development server
- `bun run start-web`: Start web development server  
- `bun run start-web-dev`: Start with debug logging

### Code Organization
- Use TypeScript throughout for type safety
- Follow Expo Router file-based routing conventions
- Maintain type definitions in `/types` directory
- Keep components pure and reusable
- Use Zustand for state management
- Validate all data with Zod schemas

## 📱 Platform Support

- **iOS**: Native iOS app via Expo
- **Android**: Native Android app via Expo
- **Web**: Progressive web app via Expo web

## 🔐 Security & Privacy

**Important Security Notes:**
- Never commit `.env` files to version control
- All API keys and sensitive data should be in environment variables
- Firebase configuration uses environment variables for security
- See `docs/security.md` for detailed security considerations

**Environment Variables Required:**
- Firebase configuration (API keys, project ID, etc.)
- AI service credentials (if using external AI)
- Custom domain settings

## � Deployment

### Automated Deployment
- Automated deploys occur on push to main via GitHub Actions
- Preview deployments are created for pull requests
- Only chronicleweaver.com is supported as the production domain

### Manual Deployment
For local deployment:
```bash
# Build the production version
npm run build:chronicleweaver

# Deploy to Firebase hosting
firebase deploy
```

### Available Build Commands
- `npm run build`: Standard web build
- `npm run build:chronicleweaver`: Production build for chronicleweaver.com
- `npm run deploy`: Build and deploy to production
- `npm run deploy:preview`: Deploy to preview channel

### Preview Channels
Create preview deployments for testing:
```bash
firebase hosting:channel:deploy preview_name
```

### Environment Configuration
- Production environment uses `.env.production`
- Staging and development use `.env.local`
- Never commit actual environment files
- Use GitHub Secrets for CI/CD environment variables

## �📄 License

MIT License - Open source project

---

## AI-Assisted Development

This project uses AI-assisted development tools including [Cursor](https://cursor.com), [Claude Code](https://claude.ai), and [GitHub Copilot](https://github.com/features/copilot). All AI-generated code is reviewed by the maintainer before merge. See `AGENTS.md` for AI agent rules and constraints.
