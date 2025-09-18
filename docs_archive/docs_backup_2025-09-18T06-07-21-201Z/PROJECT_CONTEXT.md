# CHRONICLE WEAVER - AI CONTEXT & PROJECT HISTORY
# This file provides complete context for AI assistants and development teams
# Last Updated: July 12, 2025

## 🎮 PROJECT OVERVIEW
Chronicle Weaver is a sophisticated historical role-playing game built with React Native and Expo. Players create characters and embark on narrative adventures across different historical eras, making choices that shape their story and impact the world around them.

## 🏛️ GAME CONCEPT
- **Genre**: Historical Role-Playing Game (RPG)
- **Platform**: Cross-platform (iOS, Android, Web)
- **Theme**: Ancient manuscripts, medieval libraries, illuminated texts
- **Core Mechanic**: Choice-driven narrative with AI-powered story generation
- **Target Audience**: History enthusiasts, RPG players, interactive fiction fans

## 🛠️ TECHNICAL ARCHITECTURE

### Frontend Stack
- **React Native + Expo**: Cross-platform mobile and web development
- **TypeScript**: Type-safe development throughout
- **Expo Router**: File-based routing system
- **Zustand**: Lightweight state management
- **NativeWind**: Tailwind CSS for React Native styling

### Backend & Services
- **Firebase**: Authentication, Firestore database, hosting
- **tRPC**: End-to-end type-safe APIs
- **Hono**: Lightweight web framework for server functions
- **AI Integration**: Dynamic narrative generation (external AI service)

### Build & Deployment
- **Webpack**: Web bundle optimization
- **Expo CLI**: Development and build tools
- **Firebase Hosting**: Web deployment with custom domain
- **Bun**: JavaScript runtime and package manager

## 📁 PROJECT STRUCTURE EXPLAINED

```
/app                    # Main application screens (Expo Router)
  /_layout.tsx          # Root layout with providers (Firebase, tRPC, React Query)
  /index.tsx            # Home screen with game introduction
  /game/                # Game-specific screens
    /setup.tsx          # Character creation and world setup
    /play.tsx           # Main gameplay interface (core game loop)
    /character.tsx      # Character stats and inventory management
    /memories.tsx       # Player's story history and choices
    /lore.tsx           # World lore and historical information
    /systems.tsx        # Game mechanics overview
    /chronos.tsx        # Time management features
    /kronos.tsx         # AI advisor communication

/components             # Reusable UI components
  /Button.tsx           # Custom button with historical theming
  /ChoiceButton.tsx     # Game choice selection interface
  /NarrativeText.tsx    # Animated story text display
  /CustomSlider.tsx     # Settings and configuration sliders
  /StatsBar.tsx         # Character statistics visualization
  /MemoryList.tsx       # Memory management interface
  /DebugPanel.tsx       # Development debugging tools

/store                  # State management
  /gameStore.ts         # Central Zustand store for all game state

/types                  # TypeScript definitions
  /game.ts              # Complete game type system
  /global.d.ts          # Global type declarations

/services               # External integrations
  /aiService.ts         # AI narrative generation and game logic
  /firebaseUtils.ts     # Firebase helper functions

/backend                # Server-side code
  /hono.ts              # Main server setup
  /trpc/                # tRPC API routes and configuration

/constants              # App-wide constants
  /colors.ts            # Historical color palette (manuscript-inspired)

/assets                 # Static assets
  /images/              # App icons, splash screens, game graphics

/utils                  # Utility functions
  /dateUtils.ts         # Date/time helpers for historical context
```

## 🎨 DESIGN PHILOSOPHY

### Visual Theme: Illuminated Manuscripts
- **Color Palette**: Warm parchment browns, manuscript golds, deep burgundies
- **Typography**: Serif fonts for historical authenticity
- **UI Elements**: Inspired by aged leather, candlelit libraries, royal seals
- **Iconography**: Historical symbols, scrolls, crowns, quills

### User Experience Principles
- **Immersive Storytelling**: Rich narrative text with smooth animations
- **Meaningful Choices**: Every decision impacts character and world state
- **Historical Accuracy**: AI validates historical context and authenticity
- **Cross-Platform Consistency**: Seamless experience across all devices

## 🚀 CURRENT PROJECT STATUS (July 12, 2025)

### ✅ COMPLETED FEATURES
1. **Complete Architecture Setup**
   - React Native/Expo foundation established
   - TypeScript configuration optimized
   - State management with Zustand implemented
   - Firebase integration configured

2. **Core Game Systems**
   - Character creation and customization
   - Choice-driven narrative engine
   - Inventory and relationship systems
   - Memory system for tracking player history
   - World systems (political, economic, social)

3. **UI/UX Implementation**
   - Historical theming with manuscript-inspired design
   - Custom component library with consistent styling
   - Responsive design for mobile and web
   - Accessibility considerations

4. **AI Integration**
   - Dynamic story generation system
   - Historical context validation
   - Character personality modeling
   - Consequence calculation engine

5. **Comprehensive Documentation**
   - Every file thoroughly commented and explained
   - Architecture decisions documented
   - Game design philosophy recorded
   - Deployment plans created

### 🔧 IN PROGRESS
- Environment variable configuration and security hardening
- Build process optimization for web deployment
- Documentation updates and cleanup

### 📋 IMMEDIATE NEXT STEPS
1. Install and configure development tools (Git, Node.js, Bun, Firebase CLI)
2. Sync all changes to GitHub repository
3. Configure environment variables for Firebase
4. Test and optimize build process
5. Deploy to Firebase hosting with custom domain
6. Verify full functionality on live site

## 🌟 UNIQUE FEATURES & INNOVATIONS

### AI-Powered Narrative
- Dynamic story generation based on player choices
- Historical accuracy validation and context
- Character personality consistency across interactions
- Branching storylines with meaningful consequences

### Historical Immersion
- Authentic historical settings from Ancient Rome to Modern era
- Researched political, economic, and social systems
- Period-appropriate language and cultural references
- Educational value alongside entertainment

### Cross-Platform Excellence
- Single codebase for iOS, Android, and Web
- Optimized performance for each platform
- Consistent user experience across devices
- Progressive Web App capabilities

## 🔮 FUTURE ROADMAP

### Short-term (Next 3 months)
- Complete web deployment with custom domain
- User authentication and save game cloud sync
- Performance optimization and analytics
- Beta testing program launch

### Medium-term (3-6 months)
- Mobile app store submissions (iOS/Android)
- Additional historical eras and storylines
- Multiplayer features and shared narratives
- Enhanced AI dialogue system

### Long-term (6+ months)
- Character portrait generation with AI
- Voice narration for accessibility
- Educational partnerships with schools/museums
- Modding support for community content

## 🐛 KNOWN ISSUES & TECHNICAL DEBT
- Firebase configuration hardcoded (needs env variables)
- Webpack and Expo build processes need optimization
- Some TypeScript strict mode warnings in development
- Mobile platform testing needed for all features

## 🏆 SUCCESS METRICS & KPIs
- **Technical**: <3s load time, >90 Lighthouse score, 0 console errors
- **User Experience**: >4.5 app store rating, <10% bounce rate
- **Engagement**: >20 min average session, >60% story completion
- **Educational**: Positive feedback from history educators

## 🔐 SECURITY & PRIVACY
- Firebase security rules configured
- User data encryption in transit and at rest
- GDPR compliance considerations
- No sensitive data in client-side code

## 📞 KEY CONTACTS & RESOURCES
- **Primary Developer**: Chronicle Weaver Team
- **GitHub Repository**: https://github.com/username/chronicle-weaver
- **Firebase Project**: Your Firebase Project ID
- **Custom Domain**: chronicleweaver.com
- **Development Environment**: Cross-platform development setup

## 🤖 AI ASSISTANT NOTES
When working on this project:
1. Always maintain the historical theming and manuscript-inspired design
2. Preserve type safety - all code should be strongly typed
3. Follow established patterns in components and state management
4. Test cross-platform compatibility for any UI changes
5. Document all changes and maintain code comments
6. Consider performance impact of AI service calls
7. Respect the educational mission alongside entertainment value

## 📚 DOCUMENTATION REFERENCES
- Main README.md: Project overview and setup instructions
- CODE_DOCUMENTATION.md: Comprehensive technical documentation
- PACKAGE_DOCS.md: Dependency explanations
- APP_CONFIG_DOCS.md: Expo configuration details
- FIREBASE_DOCS.md: Hosting and deployment configuration

## 🎯 CURRENT FOCUS
The project is at a critical deployment phase. All core functionality is complete and thoroughly documented. The immediate priority is successful deployment to chronicleweaver.com with full functionality verification. This represents the transition from development to production-ready historical RPG experience.

---
END OF CONTEXT FILE
This file should be preserved and updated as the project evolves.
It serves as a complete reference for anyone (AI or human) working on Chronicle Weaver.
