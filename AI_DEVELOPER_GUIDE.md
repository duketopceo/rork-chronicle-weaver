# AI Developer Onboarding Guide
## Chronicle Weaver - Historical RPG App

### 🚀 Quick Start for AI Coders

This file provides comprehensive context for any AI developer working on Chronicle Weaver. Read this first to understand the project architecture, current state, and development workflow.

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
# Development
npm start                    # Start development server
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
# Use the UltraDebugPanel (Bug icon in dev mode)
# CI/CD: GitHub Actions runs automatically on push to main
```

---

## 🐛 Debug System (CRITICAL FOR DEVELOPMENT)

### UltraDebugPanel
**Location**: `components/UltraDebugPanel.tsx`  
**Activation**: Tap the Bug icon in the top-right corner (dev mode only).  
**Features**:
- **User Mode**: Simplified view for beta testers to report bugs.
- **Dev Mode**: Advanced view with state inspection, performance metrics, and system logs.

### Early Debug Console ⭐ NEW!
**Location**: Built into `dist/index.html` loading screen  
**Purpose**: Captures all `console.log`, `console.warn`, and `console.error` calls *before* the main React application loads. This is critical for debugging initial load errors, script failures, or race conditions.
**How it Works**: A small script intercepts console methods and displays them in a simple, color-coded overlay. It ensures no log is missed during the app's bootstrap phase.

**What You'll See**:
```
[12:34:56] 🐛 Chronicle Debug Console initialized
[12:34:56] 🔍 Capturing all console output...
[12:34:57] ✅ Firebase initialized successfully
[12:34:57] ℹ️ Analytics disabled on Firebase subdomain to prevent cookie issues
[12:34:58] 🔍 RootLayout component mounting...
[12:34:58] ✅ React app detected! Loading successful.
```

**Benefits**:
- **Debug Early Issues**: See exactly what happens during app startup
- **Monitor Firebase**: Track Firebase and Analytics initialization in real-time  
- **Catch Errors**: Spot problems before React debug tools are available
- **Production Debugging**: Works on live deployments for troubleshooting

### 💡 **NEW: React App Loading Solution**
**Problem**: The React app would not reliably load after the initial `index.html` loading screen, causing the app to hang.

**Solution**:
1.  **Improved Detection**: The loading screen's JavaScript was updated to more robustly detect when React takes over the DOM. Instead of checking for child elements, it now looks for the *absence* of the loading screen's specific HTML elements.
2.  **Fade-Out Transition**: A CSS fade-out animation was added to the loading screen. When the React app is detected, the `fade-out` class is applied, providing a smooth visual transition from the loading screen to the main application.
3.  **DOM Cleanup**: After the fade-out transition completes, the loading screen's HTML is removed from the DOM to prevent any interference with the React app.
4.  **Signal from React**: The React app now dispatches a custom event (`react-mounted`) when it has successfully mounted. The loading screen listens for this event as a definitive signal to begin the transition.

**File Modified**: `dist/index.html`

### 🔐 **NEW: Content Security Policy (CSP) for Production**

**Problem**: The production application was encountering `Minified React error #185` and `gtag function not available` errors. These were caused by a strict default Content Security Policy that blocked scripts from Google Analytics and other necessary third-party services.

**Solution**:
1.  **Implemented CSP**: A `Content-Security-Policy` header was added to `firebase.json`.
2.  **Allowed Sources**: The policy explicitly permits scripts and connections from:
    *   `'self'` (the application's own origin)
    *   Google Analytics (`https://www.google-analytics.com`, `https://www.googletagmanager.com`)
    *   Google Fonts & Static Content (`https://www.gstatic.com`)
    *   Firebase services (`https://*.firebaseio.com`, `https://*.googleapis.com`)
3.  **Inline Scripts**: `'unsafe-inline'` was included for styles and scripts as required by the current build configuration. This should be reviewed in the future for an even stricter policy.

**Result**: This change resolves the React and `gtag` errors, allowing the application to load correctly in a production environment while maintaining a strong security posture.

**File Modified**: `firebase.json`

---

## 💳 Subscription & Monetization (Stripe Integration)

This section details the integration of Stripe for managing user subscriptions and premium features.

### Core Components
- `components/SubscriptionGate.tsx`: Wraps premium features and displays an `UpgradePrompt` if the user lacks access.
- `components/UpgradePrompt.tsx`: A UI component that encourages users to upgrade their plan.
- `components/BillingPanel.tsx`: Shows the user their current plan, status, and billing cycle via the Stripe Customer Portal.
- `components/UsageIndicator.tsx`: Tracks usage quotas for free-tier users (e.g., turn limits).
- `components/SubscriptionPanel.tsx`: A new UI panel on the home screen that combines the `BillingPanel`, `UsageIndicator`, and `UpgradePrompt`.

### State Management (`store/gameStore.ts`)
The `gameStore` now includes a `subscription` state object:
```typescript
subscription: {
  plan: string;
  status: string;
  current_period_end?: number;
} | null;
```
- This state is updated via the `setSubscription` action, which should be called after fetching the user's subscription status from your backend.

### Protecting Premium Features
To restrict a feature to subscribers, wrap it with the `SubscriptionGate` component:
```tsx
import SubscriptionGate from '@/components/SubscriptionGate';

<SubscriptionGate feature="unlimited-saves">
  <SaveGameButton />
</SubscriptionGate>
```

---

## 🚨 Error Handling

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
