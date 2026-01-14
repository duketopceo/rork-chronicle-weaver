# Chronicle Weaver Development Instructions

**ALWAYS follow these instructions first.**

Chronicle Weaver is an educational role-playing game focused on teaching business, finance, and management principles through AI-powered interactive storytelling.

## 🎓 Educational Focus

**CRITICAL**: This is an EDUCATIONAL game, NOT a fantasy game.

### Professional Roles (NOT Fantasy Eras)
- Bank Manager - Financial services, loan decisions, risk assessment
- Fund Manager - Investment strategies, portfolio management
- Store Owner - Retail operations, inventory, customer service
- Restaurant Manager - Operations, staffing, quality control
- Real Estate Investor - Property evaluation, financing
- Startup Founder - Product development, fundraising, growth

## 🔐 Admin Features

**Admin Email**: duketopceo@gmail.com

### Admin-Only Features
- Debug Panel
- Developer view toggle
- System metrics

### Implementation
```typescript
const { user } = useGameStore();
const isAdmin = user?.email === 'duketopceo@gmail.com';
{isAdmin && <DebugPanel />}
```

## 🏗️ Architecture

- React Native + Expo Router
- Zustand state management
- Firebase Hosting
- Educational/learning-focused theme

For full instructions, see README.md
