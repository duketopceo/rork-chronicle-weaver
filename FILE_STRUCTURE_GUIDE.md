# Chronicle Weaver v2.0 - Complete File Structure Documentation

## 📁 Project Overview
This document outlines the complete file structure for Chronicle Weaver v2.0, a React Native/Expo web application for AI-powered historical role-playing games.

---

## 🏗️ Root Directory Structure

```
chronicle-weaver/
├── 📁 src/                     # Main source code
├── 📁 assets/                  # Static assets (images, fonts, sounds)
├── 📁 docs/                    # Documentation
├── 📁 tests/                   # Test files
├── 📁 .github/                 # GitHub workflows and templates
├── 📄 package.json            # Dependencies and scripts
├── 📄 app.json                # Expo configuration
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 babel.config.js         # Babel transpilation config
├── 📄 metro.config.js         # Metro bundler config
├── 📄 firebase.json           # Firebase hosting config
├── 📄 .firebaserc            # Firebase project config
├── 📄 .env.example           # Environment variables template
├── 📄 .gitignore             # Git ignore rules
└── 📄 README.md              # Project documentation
```

---

## 📱 Source Code Structure (`src/`)

### 🎯 App Screens (`src/app/`)
**Purpose**: Expo Router file-based routing screens

```
src/app/
├── 📄 _layout.tsx             # Root layout with providers
├── 📄 index.tsx               # Home/landing screen
├── 📄 +not-found.tsx          # 404 error page
├── 📁 auth/                   # Authentication screens
│   ├── 📄 _layout.tsx         # Auth layout wrapper
│   ├── 📄 index.tsx           # Login/signup selection
│   ├── 📄 login.tsx           # Email/password login
│   ├── 📄 signup.tsx          # User registration
│   ├── 📄 forgot-password.tsx # Password reset
│   └── 📄 verify-email.tsx    # Email verification
├── 📁 game/                   # Game-related screens
│   ├── 📄 _layout.tsx         # Game layout wrapper
│   ├── 📄 index.tsx           # Game hub/dashboard
│   ├── 📄 setup.tsx           # New game creation
│   ├── 📄 play.tsx            # Main gameplay interface
│   ├── 📄 continue.tsx        # Continue existing game
│   ├── 📄 library.tsx         # Saved games library
│   ├── 📄 character.tsx       # Character sheet view
│   ├── 📄 inventory.tsx       # Inventory management
│   ├── 📄 history.tsx         # Story/choice history
│   └── 📄 achievements.tsx    # Player achievements
└── 📁 settings/               # Settings and preferences
    ├── 📄 _layout.tsx         # Settings layout
    ├── 📄 index.tsx           # Main settings menu
    ├── 📄 profile.tsx         # User profile management
    ├── 📄 preferences.tsx     # Game preferences
    ├── 📄 ai-settings.tsx     # AI behavior configuration
    ├── 📄 subscription.tsx    # Billing/subscription
    └── 📄 about.tsx           # App info and credits
```

### 🧩 Components (`src/components/`)
**Purpose**: Reusable UI components organized by category

```
src/components/
├── 📁 ui/                     # Basic UI components
│   ├── 📄 Button.tsx          # Button variants and styles
│   ├── 📄 Card.tsx            # Card container component
│   ├── 📄 Modal.tsx           # Modal/overlay component
│   ├── 📄 TextInput.tsx       # Text input with validation
│   ├── 📄 Select.tsx          # Dropdown selection
│   ├── 📄 Slider.tsx          # Range slider component
│   ├── 📄 Switch.tsx          # Toggle switch
│   ├── 📄 Badge.tsx           # Status badges
│   ├── 📄 LoadingSpinner.tsx  # Loading animations
│   ├── 📄 ProgressBar.tsx     # Progress indicators
│   ├── 📄 Tooltip.tsx         # Hover/touch tooltips
│   └── 📄 Typography.tsx      # Text styling components
├── 📁 layout/                 # Layout and structure components
│   ├── 📄 ErrorBoundary.tsx   # React error boundary
│   ├── 📄 Header.tsx          # App header/navigation
│   ├── 📄 Footer.tsx          # App footer
│   ├── 📄 Sidebar.tsx         # Side navigation
│   ├── 📄 WelcomeMessage.tsx  # User greeting component
│   └── 📄 SafeAreaView.tsx    # Safe area wrapper
├── 📁 game/                   # Game-specific components
│   ├── 📄 NarrativeDisplay.tsx        # Story text display
│   ├── 📄 ChoiceSelector.tsx          # Choice button interface
│   ├── 📄 CharacterStats.tsx          # Character stats bar
│   ├── 📄 CharacterCreator.tsx        # Character creation form
│   ├── 📄 EraSelector.tsx             # Historical era picker
│   ├── 📄 ScenarioSelector.tsx        # Starting scenario picker
│   ├── 📄 DifficultySelector.tsx      # Game difficulty options
│   ├── 📄 AIStyleSelector.tsx         # AI behavior settings
│   ├── 📄 InventoryPanel.tsx          # Inventory management
│   ├── 📄 GameMenu.tsx                # In-game menu overlay
│   ├── 📄 RecentGamesList.tsx         # Recent games display
│   ├── 📄 SaveGameCard.tsx            # Saved game preview
│   ├── 📄 StoryHistoryList.tsx        # Choice/story history
│   ├── 📄 AchievementBadge.tsx        # Achievement display
│   └── 📄 GameProgressBar.tsx         # Story progress indicator
├── 📁 auth/                   # Authentication components
│   ├── 📄 LoginForm.tsx       # Email/password login
│   ├── 📄 SignupForm.tsx      # User registration form
│   ├── 📄 SocialAuthButtons.tsx # Google/Apple login
│   ├── 📄 PasswordReset.tsx   # Password reset flow
│   └── 📄 AuthGuard.tsx       # Protected route wrapper
└── 📁 providers/              # React context providers
    ├── 📄 ThemeProvider.tsx   # Dark/light theme context
    ├── 📄 AuthProvider.tsx    # Authentication context
    ├── 📄 GameStateProvider.tsx # Game state context
    └── 📄 NotificationProvider.tsx # Push notifications
```

### 🎣 Custom Hooks (`src/hooks/`)
**Purpose**: Reusable logic and state management hooks

```
src/hooks/
├── 📄 useAuth.tsx             # Authentication state and methods
├── 📄 useGame.tsx             # Game state management
├── 📄 useAIService.tsx        # AI API interactions
├── 📄 useFirebase.tsx         # Firebase operations
├── 📄 useTheme.tsx            # Theme switching logic
├── 📄 useLocalStorage.tsx     # Local storage management
├── 📄 useNetworkStatus.tsx    # Network connectivity
├── 📄 useKeyboard.tsx         # Keyboard visibility
├── 📄 useDebounce.tsx         # Input debouncing
├── 📄 usePrevious.tsx         # Previous value tracking
├── 📄 useInterval.tsx         # Interval timer management
└── 📄 useAsync.tsx            # Async operation handling
```

### 🗄️ State Management (`src/store/`)
**Purpose**: Zustand stores for global state management

```
src/store/
├── 📄 authStore.ts            # User authentication state
├── 📄 gameStore.ts            # Active game state and actions
├── 📄 settingsStore.ts        # User preferences and settings
├── 📄 aiStore.ts              # AI service configuration
├── 📄 themeStore.ts           # Theme and appearance settings
├── 📄 notificationStore.ts    # Push notification state
└── 📄 index.ts                # Store exports and configuration
```

### 🔧 Services (`src/services/`)
**Purpose**: External API integrations and business logic

```
src/services/
├── 📄 aiService.ts            # AI/LLM API integration
├── 📄 firebaseService.ts      # Firebase operations
├── 📄 authService.ts          # Authentication service
├── 📄 gameService.ts          # Game logic and rules
├── 📄 storageService.ts       # Local/cloud storage
├── 📄 analyticsService.ts     # Usage analytics
├── 📄 billingService.ts       # Subscription/payment
├── 📄 notificationService.ts  # Push notifications
└── 📄 errorReporting.ts       # Error logging/reporting
```

### 📝 Type Definitions (`src/types/`)
**Purpose**: TypeScript interfaces and type definitions

```
src/types/
├── 📄 game.ts                 # Game-related types
├── 📄 user.ts                 # User and authentication types
├── 📄 ai.ts                   # AI service and response types
├── 📄 navigation.ts           # Navigation and routing types
├── 📄 api.ts                  # API request/response types
├── 📄 storage.ts              # Storage and persistence types
└── 📄 global.d.ts             # Global type declarations
```

### 🛠️ Utilities (`src/utils/`)
**Purpose**: Helper functions and shared utilities

```
src/utils/
├── 📄 dateUtils.ts            # Date formatting and manipulation
├── 📄 textUtils.ts            # String processing and formatting
├── 📄 validationUtils.ts      # Form and data validation
├── 📄 gameLogic.ts            # Game mechanics and calculations
├── 📄 cryptoUtils.ts          # Encryption and security
├── 📄 networkUtils.ts         # API request helpers
├── 📄 storageUtils.ts         # Local storage helpers
├── 📄 errorUtils.ts           # Error handling utilities
├── 📄 debugUtils.ts           # Development debugging tools
└── 📄 constants.ts            # Shared constants
```

### 🎨 Constants (`src/constants/`)
**Purpose**: Application constants and configuration

```
src/constants/
├── 📄 colors.ts               # Color palette and themes
├── 📄 fonts.ts                # Typography configuration
├── 📄 dimensions.ts           # Layout and spacing constants
├── 📄 gameConfig.ts           # Game rules and settings
├── 📄 apiEndpoints.ts         # API URLs and endpoints
├── 📄 routes.ts               # Navigation route definitions
└── 📄 errorMessages.ts        # User-facing error messages
```

### 🎨 Styles (`src/styles/`)
**Purpose**: Global CSS and styling configuration

```
src/styles/
├── 📄 global.css              # Global CSS for NativeWind
├── 📄 animations.css          # CSS animations and transitions
└── 📄 components.css          # Component-specific styles
```

---

## 🎨 Assets Structure (`assets/`)

```
assets/
├── 📁 images/                 # App images and graphics
│   ├── 📄 icon.png            # App icon (1024x1024)
│   ├── 📄 adaptive-icon.png   # Android adaptive icon
│   ├── 📄 splash.png          # Splash screen image
│   ├── 📄 favicon.png         # Web favicon
│   ├── 📁 eras/               # Historical era images
│   │   ├── 📄 medieval.jpg    # Medieval period background
│   │   ├── 📄 renaissance.jpg # Renaissance background
│   │   ├── 📄 industrial.jpg  # Industrial revolution
│   │   └── 📄 modern.jpg      # Modern era background
│   ├── 📁 characters/         # Character portraits and assets
│   ├── 📁 ui/                 # UI elements and icons
│   └── 📁 backgrounds/        # Game background images
├── 📁 fonts/                  # Custom typography
│   ├── 📄 Inter-Regular.ttf   # Main UI font
│   ├── 📄 Inter-Bold.ttf      # Bold UI font
│   └── 📄 EBGaramond-Regular.ttf # Narrative text font
└── 📁 sounds/                 # Audio assets
    ├── 📁 music/              # Background music
    ├── 📁 effects/            # Sound effects
    └── 📁 ambient/            # Ambient sounds
```

---

## 🧪 Testing Structure (`tests/`)

```
tests/
├── 📁 unit/                   # Unit tests
│   ├── 📁 components/         # Component tests
│   ├── 📁 hooks/              # Hook tests
│   ├── 📁 services/           # Service tests
│   └── 📁 utils/              # Utility function tests
├── 📁 integration/            # Integration tests
├── 📁 e2e/                    # End-to-end tests
├── 📄 setup.ts                # Test environment setup
└── 📄 __mocks__/              # Mock implementations
```

---

## ⚙️ Configuration Files

### 📄 package.json
**Purpose**: Project dependencies, scripts, and metadata
- Dependencies for React Native, Expo, TypeScript
- Build and development scripts
- Project metadata and configuration

### 📄 tsconfig.json
**Purpose**: TypeScript compiler configuration
- Strict type checking settings
- Path mapping for clean imports
- ES2022 target for modern features

### 📄 app.json
**Purpose**: Expo application configuration
- App metadata and branding
- Platform-specific settings
- Build and deployment options

### 📄 babel.config.js
**Purpose**: Babel transpilation configuration
- Expo preset for React Native
- Module resolver for path aliases
- React Native Reanimated plugin

### 📄 metro.config.js
**Purpose**: Metro bundler configuration
- CSS support for NativeWind
- Platform-specific bundling
- Performance optimizations

### 📄 firebase.json
**Purpose**: Firebase hosting and services configuration
- Hosting rules and redirects
- Security headers
- Cache control settings

---

## 📚 Documentation Structure (`docs/`)

```
docs/
├── 📄 API_DOCUMENTATION.md    # API endpoints and usage
├── 📄 COMPONENT_GUIDE.md      # Component usage examples
├── 📄 DEPLOYMENT_GUIDE.md     # Build and deployment steps
├── 📄 DEVELOPMENT_SETUP.md    # Local development setup
├── 📄 GAME_DESIGN.md          # Game mechanics and rules
├── 📄 STYLE_GUIDE.md          # Code and design standards
├── 📄 TESTING_STRATEGY.md     # Testing approaches and tools
└── 📄 TROUBLESHOOTING.md      # Common issues and solutions
```

---

## 🔄 GitHub Workflows (`.github/`)

```
.github/
├── 📁 workflows/              # GitHub Actions
│   ├── 📄 firebase-hosting-merge.yml  # Production deployment
│   ├── 📄 firebase-hosting-pr.yml     # Preview deployments
│   └── 📄 ci-tests.yml               # Continuous integration
└── 📁 templates/              # Issue and PR templates
    ├── 📄 bug_report.md       # Bug report template
    └── 📄 feature_request.md  # Feature request template
```

---

## 🎯 Key Implementation Notes

### 🔧 Technology Stack
- **Framework**: React Native with Expo Router
- **Language**: TypeScript with strict type checking
- **Styling**: NativeWind (Tailwind for React Native)
- **State Management**: Zustand for global state
- **Navigation**: Expo Router (file-based routing)
- **AI Integration**: Configurable LLM API service
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **Deployment**: Firebase Hosting with GitHub Actions

### 📱 Platform Support
- **Primary**: Web (Firebase Hosting)
- **Secondary**: iOS and Android (Expo development builds)
- **Progressive Web App**: PWA features for web users

### 🎮 Core Features
- AI-powered narrative generation
- Historical era-based storytelling
- Character creation and progression
- Choice-driven story branching
- Save/load game functionality
- User authentication and profiles
- Subscription-based premium features

### 🔒 Security Considerations
- Firebase Authentication for user management
- Environment variable protection
- Input sanitization for AI prompts
- Rate limiting for API calls
- Secure storage for sensitive data

This comprehensive file structure provides a solid foundation for building Chronicle Weaver v2.0 with clean architecture, maintainable code, and scalable features.