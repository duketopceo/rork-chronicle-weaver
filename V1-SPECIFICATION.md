# Chronicle Weaver V1 Specification
**Simple Narrative RPG - Core Functionality Only**

## 🎯 V1 Goal
Create a minimal but fully functional narrative RPG where a player can:
1. Start a new game
2. Set up character and world (era/theme)
3. Play through AI-generated narrative choices
4. Experience branching story based on decisions

## 📱 V1 User Flow
```
Home Screen → Game Setup → Narrative Gameplay
     ↓            ↓              ↓
"Start Game" → Character → Story + Choices
              + Era       → Make Choice
              + Theme     → Continue Story
```

## 📁 V1 File Structure (Simplified)
```
src/
  app/
    _layout.tsx          # Root layout with providers
    index.tsx            # Home screen
    +not-found.tsx       # 404 page
    game/
      setup.tsx          # Character & world setup
      play.tsx           # Main narrative gameplay
      
  components/
    Button.tsx           # Basic button component
    ChoiceButton.tsx     # Story choice selection
    ErrorBoundary.tsx    # Error handling
    NarrativeText.tsx    # Story text display
    TextInput.tsx        # Basic text input
    
  store/
    gameStore.ts         # Game state management
    
  types/
    game.ts              # Type definitions
    
  services/
    aiService.ts         # AI story generation
    firebaseUtils.ts     # Basic Firebase utils
    
  constants/
    colors.ts            # App colors
    
  utils/
    debugSystem.ts       # Basic debugging

assets/images/           # App icons and images
```

## 🎮 V1 Features (Essential Only)

### ✅ KEEP (Core Narrative)
- **Home Screen**: Start new game button
- **Game Setup**: Character name, era, theme selection
- **Narrative Display**: Animated story text
- **Choice System**: 2-3 predefined choices per story segment
- **AI Integration**: Generate story based on player choices
- **Game State**: Save/load current story progress
- **Basic Styling**: Clean, readable UI with historical theme

### ❌ REMOVE (Advanced Features)
- Character stats and inventory
- Memory system and lore
- Subscription/auth panels
- Debug panels (except basic dev mode)
- Multiple game management
- Social features
- Complex world systems
- Analytics and tracking
- Advanced UI components

## 🔧 V1 Technical Stack

### Core Dependencies (Keep)
- React Native + Expo
- TypeScript
- Expo Router
- Zustand (simplified state)
- Basic Firebase (minimal)

### Remove Dependencies
- tRPC (use simple fetch)
- Complex Firebase features
- Analytics libraries
- UI enhancement libraries
- Testing frameworks (for now)

## 🎭 V1 Game Flow Detail

### 1. Home Screen (`index.tsx`)
- Welcome message
- "Start New Chronicle" button
- Basic branding

### 2. Setup Screen (`setup.tsx`)
- Character name input
- Era selection (dropdown with examples)
- Theme selection (dropdown with examples)
- "Begin Chronicle" button

### 3. Play Screen (`play.tsx`)
- Story text display (animated typing)
- 2-3 choice buttons
- Simple "thinking..." state during AI generation
- Basic error handling

### 4. Game State (Simplified)
```typescript
interface GameStateV1 {
  characterName: string;
  era: string;
  theme: string;
  currentStory: string;
  choices: Choice[];
  storyHistory: string[];
}
```

## 🚀 V1 Development Plan

### Phase 1: Core Setup (Day 1)
1. Simplify gameStore to V1 state only
2. Clean up setup.tsx - remove advanced options
3. Strip play.tsx to essential narrative display
4. Test basic flow: Home → Setup → Play

### Phase 2: AI Integration (Day 2)
1. Simplify aiService.ts to basic story generation
2. Remove complex prompt engineering
3. Test story generation and choice handling
4. Add basic error handling

### Phase 3: Polish (Day 3)
1. Ensure consistent styling
2. Add loading states
3. Test full user flow
4. Basic responsive design

## 📋 V1 Success Criteria
- [ ] User can start a new game
- [ ] User can set character name and pick era/theme
- [ ] User sees generated story text
- [ ] User can make choices and see story continue
- [ ] App works on web and mobile
- [ ] No crashes or major bugs
- [ ] Clean, readable interface

## 🎯 V1 Limitations (Acceptable)
- No save/load between sessions
- No character progression
- No complex branching logic
- Basic AI prompts only
- Single story thread
- No user accounts
- Minimal styling

This V1 focuses on proving the core concept: **AI-powered narrative choices work and are engaging.**
