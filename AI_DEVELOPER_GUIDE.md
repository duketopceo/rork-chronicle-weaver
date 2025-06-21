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

### Key Commands
```bash
# Development
npm start                    # Start development server
npm run build               # Build for production
npm run deploy              # Deploy to Firebase hosting

# Firebase
firebase deploy             # Manual deployment
firebase serve              # Local hosting preview

# Debug
# Use the UltraDebugPanel (Bug icon in dev mode)
```

---

## 🐛 Debug System (CRITICAL FOR DEVELOPMENT)

### UltraDebugPanel Features
**Location**: `components/UltraDebugPanel.tsx`

**Two Modes**:
1. **User Mode**: Simplified view showing app health, performance, and recent activity
2. **Developer Mode**: Full technical details with tabs for steps, errors, metrics, and system info

**Access**: 
- In development builds, tap the Bug icon (🐛) in the top-right corner
- Toggle between Simple/Advanced modes with the switch in the header

**Debug System** (`utils/debugSystem.ts`):
```typescript
// Log development steps
logStep('USER_ACTION', 'User navigated to game setup');
updateStep(stepId, 'success', 'Navigation completed');

// Log errors with context
logError(error, 'Game State Loading', 'critical');

// Track performance metrics
logPerformanceMetric('api_response_time', responseTime, 'ms');
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
- ✅ Automatic tax calculation
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
- Unlimited story generations
- All historical eras (100+ periods)
- Advanced character customization
- Multiple saved characters (up to 5)
- Priority AI response times

**Chronicle Master ($9.99/month):**
- All Premium features
- Custom historical scenarios
- Early access to new eras
- Multiplayer chronicles
- Advanced analytics and insights

### Firestore Collections

**Products Collection** (`products/`):
```typescript
{
  name: "Chronicle Weaver Premium",
  description: "Unlimited stories + all historical eras",
  active: true,
  prices: [{
    unit_amount: 499, // $4.99
    currency: "usd",
    type: "recurring",
    recurring: { interval: "month" }
  }],
  metadata: {
    gameFeatures: "unlimited_stories,all_eras,priority_ai"
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
