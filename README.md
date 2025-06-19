# Chronicle Weaver
*A Historical Role-Playing Game*

Created by Rork

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

### Backend
- **Hono**: Lightweight web framework
- **tRPC**: End-to-end type-safe APIs
- **Firebase**: Authentication and data persistence
- **Zod**: Schema validation

### UI/UX
- **Lucide Icons**: Consistent iconography
- **Linear Gradients**: Rich visual backgrounds
- **Haptic Feedback**: Enhanced mobile experience
- **Responsive Design**: Optimized for all screen sizes

## 📁 Project Structure

```
/app                    # Main application screens (Expo Router)
  /_layout.tsx         # Root layout with providers
  /index.tsx           # Home screen
  /game/               # Game-specific screens
    /setup.tsx         # Character and world setup
    /play.tsx          # Main gameplay interface
    /character.tsx     # Character management
    /memories.tsx      # Player's story history
    /lore.tsx          # World lore and information
    /systems.tsx       # Game systems overview
    /chronos.tsx       # Time management features
    /kronos.tsx        # Advanced time mechanics

/components             # Reusable UI components
  /Button.tsx          # Custom button component
  /ChoiceButton.tsx    # Game choice interface
  /TextInput.tsx       # Styled text input
  /CustomSlider.tsx    # Game settings slider
  /NarrativeText.tsx   # Story text display
  /StatsBar.tsx        # Character stats visualization
  /MemoryList.tsx      # Memory management UI
  /DebugPanel.tsx      # Development debugging tools

/store                  # State management
  /gameStore.ts        # Central game state with Zustand

/types                  # TypeScript type definitions
  /game.ts             # Game-related types and schemas
  /global.d.ts         # Global type declarations

/services               # External service integrations
  /aiService.ts        # AI narrative generation
  /firebaseUtils.ts    # Firebase helper functions

/backend                # Server-side code
  /hono.ts             # Main server setup
  /trpc/               # tRPC API routes
    /app-router.ts     # Main router configuration
    /create-context.ts # Request context creation
    /routes/           # API route definitions

/constants              # App-wide constants
  /colors.ts           # Color theme definitions

/utils                  # Utility functions
  /dateUtils.ts        # Date/time helper functions

/assets                 # Static assets
  /images/             # App icons and graphics

/lib                    # Library configurations
  /trpc.ts             # tRPC client setup
```

## 🎮 Game Flow

1. **Home Screen**: Introduction and game selection
2. **Setup**: Choose historical era, themes, and create character
3. **Gameplay**: Navigate through story segments making choices
4. **Character Management**: View stats, inventory, and relationships
5. **Memory System**: Review past decisions and their consequences
6. **Lore Discovery**: Learn about the historical world and its systems

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
1. Configure Firebase project
2. Update Firebase config in `app/_layout.tsx`
3. Set up tRPC endpoints
4. Configure AI service integration

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

See `security.md` for detailed security considerations and privacy policy.

## 📄 License

Private project - All rights reserved.