# AI Developer Onboarding Guide
## Chronicle Weaver - Historical RPG App

### 🚀 Quick Start for AI Coders

This file provides comprehensive context for any AI developer working on Chronicle Weaver. Read this first to understand the project architecture, current state, and development workflow.

## 🔒 MANDATORY AI DEVELOPMENT PARAMETERS

**⚠️ CRITICAL: These parameters are NON-NEGOTIABLE. Every AI must follow these rules.**

### 1. VERIFICATION PROTOCOL - MANDATORY AFTER EVERY CHANGE
```bash
# Run this script EVERY TIME you make ANY change
node scripts/ai-verification.js
```

### 2. CORE DEVELOPMENT PARAMETERS (DO NOT DEVIATE)
- **Header Comments**: EVERY file must have a comprehensive header comment
- **TypeScript Strict**: NO `any` types allowed (use proper interfaces)
- **Error Handling**: EVERY async operation must have try-catch blocks
- **File Structure**: Follow established patterns, do NOT reorganize without verification
- **Code Style**: Use existing ESLint config, do NOT modify rules
- **Testing**: Run type-check and build after EVERY change
- **Documentation**: Update relevant docs when changing functionality

### 3. CHANGE VERIFICATION CHECKLIST (MANDATORY)
After making ANY change, you MUST:
1. ✅ Run `npm run type-check` - MUST pass with 0 errors
2. ✅ Run `node scripts/error-scanner.js` - Review all findings
3. ✅ Run `npm run build:production` - MUST complete successfully
4. ✅ Verify header comments are intact and accurate
5. ✅ Check that no critical functionality was broken
6. ✅ Update documentation if interfaces/APIs changed

### 4. FORBIDDEN ACTIONS
- ❌ NEVER remove or modify existing header comments
- ❌ NEVER change the auto-debugger configuration without verification
- ❌ NEVER modify package.json dependencies without explicit need
- ❌ NEVER reorganize file structure without running consolidate script
- ❌ NEVER ignore TypeScript errors or ESLint critical errors
- ❌ NEVER deploy without running full verification protocol

---

## 📱 Project Overview

**Chronicle Weaver** is a historical RPG mobile/web app where players create characters in any historical era and navigate through AI-generated narrative adventures. Built with React Native/Expo for cross-platform deployment.

### Key Features
- **Any Historical Era**: Ancient Egypt to Modern Day
- **AI-Powered Narratives**: Dynamic story generation
- **Custom Character Creation**: Multiple archetypes and backgrounds  
- **Choice-Driven Gameplay**: Player decisions shape the story
- **Memory System**: Characters remember past events
- **Political Systems**: Navigate complex historical politics

---

## 🏗️ Architecture & Tech Stack

### Core Technologies
- **Frontend**: React Native + Expo Router
- **State Management**: Zustand (`store/gameStore.ts`)
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **AI Service**: Custom AI service for narrative generation
- **Build Tool**: Bun (package manager)
- **Deployment**: Firebase Hosting + Custom Domain
- **Debug System**: Custom debug logging with UltraDebugPanel

### Project Structure
```
app/                     # Expo Router pages
├── _layout.tsx         # Root layout with error boundaries
├── index.tsx           # Home screen with UltraDebugPanel
└── game/               # Game-specific screens
    ├── setup.tsx       # Character creation
    ├── play.tsx        # Main gameplay
    ├── chronos.tsx     # Timeline view
    └── ...

components/             # Reusable UI components
├── UltraDebugPanel.tsx # Advanced debug interface (USER + DEV modes)
├── ErrorBoundary.tsx   # Comprehensive error handling
├── Button.tsx          # Custom button component
└── ...

utils/
├── debugSystem.ts      # Debug logging and monitoring
└── dateUtils.ts        # Historical date utilities

store/
└── gameStore.ts        # Zustand game state management

services/
├── aiService.ts        # AI narrative generation
└── firebaseUtils.ts    # Firebase integration
```

---

## 🛠️ Development Workflow

### Getting Started
1. **Install Dependencies**: `bun install`
2. **Start Dev Server**: `npm start` (uses port 8082 if 8081 busy)  
3. **View in Browser**: Open the provided local URL
4. **Deploy**: `npm run deploy` (builds and deploys to Firebase)
5. **Test Build**: `npm run build:production` for production testing

### Key Commands
```bash
# Development (Updated June 21, 2025)
npx expo start --web -c     # Start with cleared cache (recommended after fixes)
npm run build               # Build for production  
npm run build:production     # Clean production build
npm run deploy              # Deploy to Firebase hosting
npm run type-check          # TypeScript validation
npm run lint                # Code linting
npm run test                # Run Jest tests

# Firebase
firebase deploy             # Manual deployment
firebase serve              # Local hosting preview

# Debug
# Enhanced debugging capabilities:
# - UltraDebugPanel accessible via home screen OR error boundary
# - Comprehensive error logging with stack traces
# - Real-time performance monitoring
# - API call inspection and retry mechanisms
# CI/CD: GitHub Actions runs automatically on push to main
```

---

## 🐛 Debug System (CRITICAL FOR DEVELOPMENT)

### UltraDebugPanel
**Location**: `components/UltraDebugPanel.tsx`  
**Access**: Available through home screen debug button OR error boundary fallback

#### **Enhanced Error Handling (June 21, 2025)**
The application now features robust error handling that ensures debug access even during startup failures:

**ErrorBoundary Integration**:
- Wraps entire application in `app/_layout.tsx`
- Catches any React component errors during rendering
- Displays user-friendly error screen with debug panel access
- Provides retry mechanism and error reporting capabilities

**Debug Panel Access Methods**:
1. **Normal Operation**: Bug icon on home screen (development mode)
2. **Error State**: "Show Debug Panel" button on error boundary screen
3. **Startup Failures**: Debug panel accessible even if main app fails to load

**Critical Debugging Features**:
- Step-by-step initialization logging
- Real-time performance metrics
- Error tracking with stack traces
- API call history and response monitoring
- Game state inspection and manipulation
- Browser/device compatibility information

#### **TypeScript and Build Issues Resolution**
**Common Issues Fixed**:
- `import.meta` syntax errors → Metro transformer handles all occurrences
- Path alias resolution → Use relative imports for type safety
- Missing dependencies → `babel-plugin-module-resolver` installed
- Color constants → Updated to match actual color palette properties

---

## 🛠️ Error Handling and Recovery (NEW SECTION)

### Enhanced Error Boundary System
Chronicle Weaver implements a multi-layered error handling approach:

**Primary Error Boundary**: 
- Located in `components/ErrorBoundary.tsx`
- Catches React component errors during rendering
- Displays informative error screen with recovery options
- Integrates UltraDebugPanel for immediate debugging access

**Error Recovery Flow**:
1. Error occurs during app initialization or runtime
2. ErrorBoundary catches the error and logs details
3. User sees friendly error screen with error ID
4. "Reload Application" button attempts recovery
5. "Show Debug Panel" provides detailed diagnostics
6. Debug panel shows step-by-step logs and error context

**Debug Panel Features**:
- **Initialization Steps**: Track app startup progress
- **Performance Metrics**: Monitor render times and memory usage
- **Error Logs**: Complete stack traces and error context
- **API Monitoring**: Track AI service calls and responses
- **State Inspection**: View and modify game state in real-time
- **Browser Info**: Device and browser compatibility details

### Import and Build Issue Resolution
**Metro Transformer Configuration**:
- Handles `import.meta` syntax for web compatibility
- Strips ES module syntax that breaks in browser environments
- Located in `config/metro-transformer.js`

**TypeScript Configuration**:
- Removed invalid `expo/tsconfig.base` extends
- Uses standard TypeScript configuration for better compatibility
- Path aliases may cause issues - prefer relative imports

**Common Solutions**:
```bash
# Clear all caches if encountering import issues
npx expo start --web -c
rm -rf node_modules/.cache
npm install
```

---

## 🐛 Error Handling

### ErrorBoundary System
**Location**: `components/ErrorBoundary.tsx`

- Catches React component errors
- Provides user-friendly error UI
- Logs detailed error information for developers
- Includes retry functionality
- Integrates with external error services (TODO: Sentry/Crashlytics)

**Usage**: Wrap components in `<ErrorBoundary>` in `app/_layout.tsx`

---

## 🎮 Game State Management

### Zustand Store (`store/gameStore.ts`)
```typescript
interface GameState {
  currentGame: Game | null;
  gameSetup: GameSetup | null;
  isLoading: boolean;
  error: string | null;
}
```

**Key Actions**:
- `createNewGame()`: Initialize new game session
- `updateGameState()`: Update current game progress
- `resetSetup()`: Clear setup data for new game
- `saveProgress()`: Persist game state

---

## 🔥 Firebase Integration

### Services Used
- **Authentication**: User accounts and sessions
- **Firestore**: Game save data and user progress
- **Hosting**: Static web app deployment
- **Functions**: Server-side AI processing (optional)
- **Identity Platform**: Enhanced authentication features

### Firebase Identity Platform Configuration
**Project**: `chronicle-weaver-460713`  
**API Key**: `AIzaSyAPzTeKMayMR6ksUsmdW6nIX-dypgxQbe0`  
**Auth Domain**: `chronicle-weaver-460713.firebaseapp.com`

**Web Integration Snippet**:
```html
<script src="https://www.gstatic.com/firebasejs/8.0/firebase.js"></script>
<script>
  var config = {
    apiKey: "AIzaSyAPzTeKMayMR6ksUsmdW6nIX-dypgxQbe0",
    authDomain: "chronicle-weaver-460713.firebaseapp.com",
  };
  firebase.initializeApp(config);
</script>
```

**React Native/Expo Configuration**:
```typescript
// services/firebaseUtils.ts
const firebaseConfig = {
  apiKey: "AIzaSyAPzTeKMayMR6ksUsmdW6nIX-dypgxQbe0",
  authDomain: "chronicle-weaver-460713.firebaseapp.com",
  projectId: "chronicle-weaver-460713",
  storageBucket: "chronicle-weaver-460713.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

**Authentication Features Available**:
- Email/Password authentication
- Google Sign-In integration
- Anonymous authentication for guest users
- Custom claims for subscription tiers
- Multi-factor authentication support

**Implementation Status**:
- ✅ Identity Platform configured and active
- ✅ Authentication domain verified
- ✅ API keys generated and secured
- ✅ **NEW**: Authentication flow integrated in app components
- ✅ **NEW**: User state management connected to game store
- ✅ **NEW**: Auth panel available on home screen (User icon)
- ✅ **NEW**: Authentication state monitoring in debug panel
- 🔄 **Next**: Connect authentication to subscription management
- 🔄 **Next**: Add protected routes for authenticated users

**Authentication Components Implemented**:
- `components/AuthPanel.tsx`: Complete sign in/sign up interface
- Email/password authentication with account creation
- Anonymous guest user support
- Authentication state persistence in game store
- Real-time auth state monitoring in `app/_layout.tsx`
- User authentication display in debug panel

**Usage in Game Store**:
```typescript
// Authentication state in gameStore
user: {
  uid: string | null;
  email: string | null;
  isAnonymous: boolean;
  isAuthenticated: boolean;
} | null;
```

**Available on Home Screen**:
- **User Icon**: Access authentication panel (sign in/sign up/guest mode)
- **Star Icon**: Access subscription management panel
- **Bug Icon**: Access debug panel (dev mode only)

**Configuration**:
- Environment variables in `.env.local`
- Firebase config in `firebase.json`
- Service initialization in `services/firebaseUtils.ts`

---

## 🤖 AI Service Integration

### AI Narrative Generation
**Location**: `services/aiService.ts`

**Key Functions**:
- `generateNarrative()`: Create story content based on character and context
- `generateChoices()`: Provide player decision options
- `generateCharacterResponse()`: NPCs react to player actions

**Configuration**:
- API endpoint via `EXPO_PUBLIC_AI_SERVICE_URL`
- Includes error handling and retry logic
- Integrates with debug system for monitoring

---

## � SECURITY & PRODUCTION READINESS

### ⚠️ SENSITIVE INFORMATION - REVIEW BEFORE PRODUCTION

**This section contains sensitive information that should be reviewed and potentially removed before public documentation:**

1. **Live Stripe Publishable Key**: Currently documented above - consider if this should remain in documentation
2. **Webhook Endpoint URLs**: Production endpoints are documented - verify this is acceptable for public docs
3. **Firebase Project Details**: Contains specific project IDs and region information
4. **API Endpoints**: Live service URLs are documented

**Pre-Production Security Checklist:**
- [x] ✅ Stripe account verified and TOS accepted
- [x] ✅ Live webhook endpoints configured and active
- [x] ✅ Firebase security rules configured for production
- [x] ✅ All environment variables secured in Firebase Functions
- [ ] Review all API keys and tokens in documentation
- [ ] Verify client-side subscription gating implementation
- [ ] Remove or encrypt any sensitive configuration details from public docs
- [ ] Audit all third-party integrations and permissions
- [ ] Test live payment flow with real test customers
- [ ] Set up production monitoring and alerting

**Production Environment Variables:**
```bash
# These should be configured securely in production
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_... # Server-side only, never in client
FIREBASE_PRIVATE_KEY=... # Server-side only
WEBHOOK_SIGNING_SECRET=whsec_... # Server-side only
```

**Security Best Practices:**
- All secret keys stored in Firebase Functions secure config
- Webhook signatures always verified
- Client-side only receives publishable keys
- All API endpoints use authentication
- Firestore security rules restrict data access

---

## �💳 Stripe Payments Integration

### Firebase Extension Setup
**Extension**: `firestore-stripe-payments`  
**Status**: Configured and Active  
**Location**: `us-west3` (Salt Lake City)  

### Webhook Configuration
**Destination ID**: Auto-generated by Stripe  
**Endpoint URL**: `https://us-west3-chronicle-weaver-460713.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents`  
**API Version**: `2025-05-28.basil`  
**Description**: Firebase Extension webhook endpoint for Chronicle Weaver historical RPG app. Processes subscription events, payment updates, and customer lifecycle management for premium game features  
**Events Monitored**: 9 production events for subscription management  
**Live Events**: `customer.created`, `customer.deleted`, `customer.subscription.created`, `customer.subscription.deleted`, `customer.subscription.resumed`, `customer.subscription.updated`, `customer.updated`, `invoice.created`, `invoice.deleted`  
**Signing Secret**: Configured securely in Firebase Extension (not documented for security)

### Stripe API Keys

**Test Mode Publishable Key**: `pk_test_51RcIWOQQQjXmsI6Z8aYrHsyFCq1Q3HANnT1p7ZvdLfX5K0Wi0GKsZrfXcfm0RayOlg7sMtGE4cBKXWhWQ2C8mnFI00bdeovOOg`  
**Live Publishable Key**: `pk_live_51RcIWDKQPUAXyKwA0HsqhnQ0MrCgjB16PQaUULbcZv30XT1HTftHkb2vv22GBelvWtqhooRLyiCz2f8LLKZpoh2n00ceb02Gar`  
**Secret Keys**: Configured securely in Firebase Extension (restricted access)

### Account Capabilities (Production Active)
**Payment Methods Enabled**:
- ✅ Card payments (Visa, Mastercard, Amex, etc.)
- ✅ Digital wallets (Apple Pay, Google Pay, Link)
- ✅ Bank transfers (ACH, SEPA)
- ✅ Buy now, pay later (Klarna, Afterpay)
- ✅ Regional methods (Alipay, WeChat Pay, etc.)
- ✅ Subscription billing and invoicing
- ✅ International payments
- ✅ Tax reporting (US 1099-K, 1099-MISC)

**Business Features**:
- ✅ Automatic tax calculation (enabled)
- ✅ Corporate cards and fund management
- ✅ Multi-party payments and transfers
- ✅ Advanced fraud detection

### Subscription Tiers

**Free Tier (Default):**
- 5 story generations per day
- Basic historical eras (Ancient, Medieval, Renaissance)
- Standard character archetypes
- Single saved character

**Premium Tier ($4.99/month):**
- **Pricing Model**: Recurring, Monthly
- **Tax Behavior**: Auto (tax included in price)
- **Lookup Key**: `premium_monthly`
- Unlimited story generations
- All historical eras (100+ periods)
- Advanced character customization
- Multiple saved characters (up to 5)
- Priority AI response times

**Chronicle Master ($9.99/month):**
- **Pricing Model**: Recurring, Monthly
- **Tax Behavior**: Auto (tax included in price)
- **Lookup Key**: `master_monthly`
- All Premium features
- Custom historical scenarios
- Early access to new eras
- Multiplayer chronicles
- Advanced analytics and insights

**One-Time Purchase Options** (Future):
- **Pricing Model**: One-off charges
- Historical era packs
- Character customization bundles
- Premium themes and content

### Firestore Collections

**Products Collection** (`products/`):
```typescript
{
  name: "Chronicle Weaver Premium",
  description: "Unlimited stories + all historical eras",
  active: true,
  prices: [{
    id: "price_premium_monthly",
    lookup_key: "premium_monthly",
    unit_amount: 499, // $4.99
    currency: "usd",
    type: "recurring",
    recurring: { interval: "month" },
    tax_behavior: "inclusive" // Tax included in price
  }],
  metadata: {
    gameFeatures: "unlimited_stories,all_eras,priority_ai"
  }
},
{
  name: "Chronicle Weaver Master",
  description: "All premium features + custom scenarios",
  active: true,
  prices: [{
    id: "price_master_monthly", 
    lookup_key: "master_monthly",
    unit_amount: 999, // $9.99
    currency: "usd",
    type: "recurring",
    recurring: { interval: "month" },
    tax_behavior: "inclusive" // Tax included in price
  }],
  metadata: {
    gameFeatures: "unlimited_stories,all_eras,priority_ai,custom_scenarios,multiplayer"
  }
}
```

**Customers Collection** (`customers/`):
```typescript
{
  stripeId: "cus_...",
  email: "user@example.com",
  subscriptionStatus: "active" | "canceled" | "past_due",
  subscriptionTier: "free" | "premium" | "master",
  subscriptions: [{
    id: "sub_...",
    status: "active",
    current_period_end: timestamp,
    items: [...]
  }]
}
```

### Game State Integration

The subscription status automatically updates the game store:

```typescript
// store/gameStore.ts
interface GameState {
  // ...existing code...
  user: {
    subscriptionStatus: 'free' | 'premium' | 'master';
    features: {
      unlimitedStories: boolean;
      allHistoricalEras: boolean;
      priorityAI: boolean;
      customScenarios: boolean;
      multipleCharacters: boolean;
    };
    usage: {
      storiesGenerated: number;
      dailyLimit: number;
      resetTime: Date;
    };
  };
}
```

### Feature Gating Implementation

**Components to Create:**
- `components/SubscriptionGate.tsx` - Wrapper component for premium features
- `components/UpgradePrompt.tsx` - Encourages subscription upgrades
- `components/BillingPanel.tsx` - Manage subscription (customer portal)
- `components/UsageIndicator.tsx` - Shows daily story usage for free users

**Example Usage:**
```typescript
<SubscriptionGate requiredTier="premium" feature="unlimited_stories">
  <AdvancedCharacterCustomization />
</SubscriptionGate>
```

### Webhook Event Handling

The Firebase Extension automatically handles these events:
- `customer.subscription.created` - Unlock premium features
- `customer.subscription.updated` - Update subscription tier
- `customer.subscription.deleted` - Revert to free tier
- `invoice.payment_succeeded` - Confirm payment and maintain access
- `invoice.payment_failed` - Handle payment failures gracefully

### Debug Integration

Stripe events are logged in the UltraDebugPanel:

```typescript
// Debug logs for subscription events
debugSystem.logStep('STRIPE_WEBHOOK', 'Subscription updated to premium');
debugSystem.logStep('GAME_FEATURES', 'Unlimited stories unlocked');
debugSystem.logPerformanceMetric('webhook_processing_time', 150, 'ms');
```

### Testing Subscription Flow

**Development Testing:**
1. Use Stripe test mode with test cards
2. Monitor webhook delivery in Stripe dashboard
3. Check UltraDebugPanel for real-time event processing
4. Verify Firestore updates in Firebase console
5. Test feature gating in the app

**Stripe CLI Testing:**
```bash
# 1. Install and authenticate Stripe CLI
stripe login

# 2. Test webhook events with sample data
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed

# 3. Listen to webhook events locally (for development)
stripe listen --forward-to localhost:3000/webhook
```

**Test Cards:**
- `4242424242424242` - Successful payments
- `4000000000000002` - Declined payments
- `4000000000000341` - Requires authentication

### Production Monitoring

**Webhook Performance** (Live Production Status):
- **Status**: Live and Active (configured June 20, 2025)
- **Event Deliveries**: Ready to receive production events
- **Monitoring**: 9 core subscription and customer lifecycle events
- **Response Time**: To be measured in production
- **Success Rate**: Will be monitored via Stripe dashboard

**Monitoring Tools:**
- Stripe Dashboard webhook logs
- Firebase Functions logs
- UltraDebugPanel subscription events
- Firebase Analytics for conversion tracking

### Verifying Webhook Integration

**Check Webhook Status:**
```bash
# Test webhook endpoint directly
curl -X POST https://us-west3-chronicle-weaver-460713.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=timestamp,v1=signature" \
  -d '{"type":"customer.subscription.created"}'
```

**Firebase Functions Logs:**
```bash
# Monitor webhook processing in real-time
firebase functions:log --only ext-firestore-stripe-payments-handleWebhookEvents
```

**Implementation Priority:**
1. **✅ COMPLETED**: Live Stripe webhook integration and API keys configured
2. **Phase 1**: Create billing components and upgrade prompts
3. **Phase 2**: Implement usage tracking for free tier
4. **Phase 3**: Add subscription analytics to UltraDebugPanel

**Production Status** (June 20, 2025):
- ✅ Live Stripe account configured and verified
- ✅ Stripe Terms of Service accepted (June 20, 2025, 10:23 PM)
- ✅ Account capabilities activated and operational
- ✅ Automatic tax calculation enabled (`automatic_tax[enabled]=true`)
- ✅ Production webhook endpoint active
- ✅ Firebase Extension deployed and operational
- 🔄 **Next**: Implement subscription gating components
- 🔄 **Next**: Test live payment processing with test customers

**Stripe Account Status**:
- **Account Verification**: Complete (`details_submitted: true`)
- **TOS Acceptance**: Confirmed (timestamp: 1750479822)
- **IP Address**: 66.219.220.250 (verified)
- **User Agent**: Firefox 139.0 on Windows 10
- **Capabilities**: All payment methods enabled (13+ capabilities active)
- **Requirements**: All onboarding requirements satisfied

---

## 🔒 MANDATORY VERIFICATION WORKFLOW

### STEP-BY-STEP VERIFICATION (REQUIRED AFTER EVERY CHANGE)

**⚠️ ANY AI THAT SKIPS THESE STEPS VIOLATES PROTOCOL**

```bash
# 1. IMMEDIATE VERIFICATION (run after ANY change)
node scripts/ai-verification.js

# 2. TYPE CHECK (must pass with 0 errors)
npm run type-check

# 3. ERROR SCAN (review all findings)  
node scripts/error-scanner.js

# 4. BUILD TEST (must complete successfully)
npm run build:production
```

### LINE-BY-LINE CHECKING PARAMETERS

**EVERY AI MUST:**
1. **Read existing code BEFORE making changes** - Use `read_file` tool first
2. **Verify imports and exports** - Check all dependencies are correct
3. **Maintain header comments** - Never modify existing header structure
4. **Preserve error handling** - Keep all try-catch blocks intact
5. **Validate TypeScript types** - No `any` types, proper interfaces only
6. **Check file references** - Ensure all file paths are correct
7. **Test functionality** - Verify changes don't break existing features

### CRITICAL FILE PROTECTION

**NEVER MODIFY WITHOUT EXPLICIT INSTRUCTION:**
- `.vscode/launch.json` (auto-debugger configuration)
- `package.json` (dependencies and scripts)
- `tsconfig.json` (TypeScript configuration)
- `scripts/error-scanner.js` (error detection system)
- `scripts/ai-verification.js` (this verification system)

### ERROR ESCALATION PROTOCOL

**IF VERIFICATION FAILS:**
1. **STOP IMMEDIATELY** - Do not proceed with other changes
2. **IDENTIFY ROOT CAUSE** - Read error messages carefully
3. **FIX SYSTEMATICALLY** - Address one issue at a time
4. **RE-VERIFY** - Run full verification again
5. **DOCUMENT FIXES** - Update relevant documentation

---

## 🎯 Project Goals & Vision

**Chronicle Weaver** aims to be the definitive historical RPG experience, allowing players to explore any era through AI-generated narratives. The app combines educational value with engaging gameplay, making history accessible and interactive.

**Development Philosophy**:
- User experience first
- Robust error handling
- Comprehensive debugging
- Cross-platform compatibility
- Scalable architecture

---

*This guide provides the foundation for any AI developer to quickly understand and contribute to Chronicle Weaver. The UltraDebugPanel and comprehensive error handling make development and troubleshooting straightforward.*
