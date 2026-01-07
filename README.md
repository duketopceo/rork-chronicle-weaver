# Chronicle Weaver 🎓
*An Educational Role-Playing Game for Learning Business & Finance*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-chronicleweaver.com-blue)](https://chronicleweaver.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.80-blue)](https://reactnative.dev/)

## 🎯 What is Chronicle Weaver?

Chronicle Weaver is an innovative educational game that teaches business, finance, and management principles through AI-powered interactive storytelling. Players take on professional roles (bank manager, fund manager, store owner, etc.) and make real-world decisions that teach valuable lessons about business operations, financial management, and strategic thinking.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run start-web

# Build for production
npm run build:production
```

## 🎮 Game Overview

### Educational Focus
Unlike traditional fantasy RPGs, Chronicle Weaver focuses on **real-world learning** through:
- **Business Management**: Run a store, manage inventory, handle customers
- **Financial Decision-Making**: Manage funds, investments, and budgets
- **Professional Development**: Build skills, relationships, and reputation
- **Strategic Thinking**: Navigate competition, regulations, and market dynamics

### Professional Roles (Learning Scenarios)
- **Bank Manager**: Loan decisions, risk assessment, customer relationships
- **Fund Manager**: Investment strategies, portfolio management, market analysis
- **Store Owner**: Inventory management, pricing, customer service, marketing
- **Restaurant Manager**: Operations, staffing, supply chain, quality control
- **Real Estate Investor**: Property evaluation, financing, tenant management
- **Startup Founder**: Product development, fundraising, team building, growth

## 📚 Product Roadmap

### 🔵 Beta Version (Current - v0.8)
**Status**: In Development | **Target**: Q1 2026

**Core Features:**
- ✅ Basic game loop (setup → play → make choices)
- ✅ AI-powered narrative generation
- ✅ Single professional role (Store Owner)
- ✅ Character stats and progression
- ✅ Save/load game functionality
- ✅ Web deployment on Firebase Hosting
- 🔄 Admin developer view (in progress)
- 🔄 Comprehensive testing (in progress)
- ⏳ UI polish and responsive design

**Learning Objectives:**
- Basic business operations
- Simple financial decisions
- Customer relationship management

### 🟢 Version 1.0 (MVP)
**Target**: Q2 2026

**New Features:**
- 3 complete professional roles (Bank Manager, Fund Manager, Store Owner)
- Enhanced AI with educational feedback
- Progress tracking and achievements
- Responsive mobile-optimized UI
- Multiplayer comparison (leaderboards)
- Tutorial system for new players
- Comprehensive help documentation

**Learning Objectives:**
- Advanced financial concepts
- Risk management principles
- Strategic decision-making
- Professional ethics

**Technical Goals:**
- 90%+ test coverage
- Sub-3s page load times
- Mobile app (iOS/Android) via Expo
- Improved state management
- Real-time analytics

### 🟡 Version 2.0 (Enhanced)
**Target**: Q3-Q4 2026

**New Features:**
- 6+ professional roles including Restaurant Manager, Real Estate Investor
- Scenario builder (create custom learning scenarios)
- Multi-week campaigns with evolving challenges
- Social features (teams, mentoring)
- Integration with learning management systems (LMS)
- Detailed performance analytics for educators
- Custom difficulty/complexity levels

**Learning Objectives:**
- Industry-specific knowledge
- Advanced strategy and planning
- Leadership and team management
- Economic principles

### 🔮 Future Vision (v3.0+)
**Target**: 2027+

**Planned Features:**
- AI-powered adaptive learning paths
- VR/AR immersive experiences
- Real-world case studies integration
- Certification programs
- Enterprise/educational institution licensing
- Multi-language support
- Accessibility enhancements

## 🛠️ Technology Stack

### Frontend
- **React Native + Expo**: Cross-platform mobile development
- **Expo Router**: File-based routing
- **Zustand**: State management
- **TypeScript**: Type-safe development
- **NativeWind**: Tailwind CSS for React Native

### Backend & Services
- **Firebase**: Authentication, hosting, analytics
- **OpenAI API**: AI narrative generation
- **Hono**: Lightweight API framework (planned)
- **tRPC**: Type-safe APIs (planned)

### Development Tools
- **ESLint + Prettier**: Code quality
- **Jest**: Unit testing
- **GitHub Actions**: CI/CD
- **Firebase Hosting**: Deployment

## 👨‍💻 Development

### Project Structure
```
src/
├── app/              # Expo Router screens
│   ├── index.tsx     # Home screen
│   └── game/         # Game screens (setup, play, etc.)
├── components/       # Reusable UI components
├── store/           # Zustand state management
├── services/        # API integrations (AI, Firebase)
├── types/           # TypeScript definitions
└── utils/           # Helper functions
```

### Key Commands
```bash
# Development
npm run start-web          # Start web dev server
npm run lint              # Run ESLint
npm run type-check        # TypeScript validation

# Testing
npm run test              # Run tests
npm run test:watch        # Watch mode

# Building & Deployment
npm run build:production  # Production build (30-45 min first time)
npm run deploy            # Build + deploy to Firebase
firebase serve --only hosting  # Preview production build locally
```

### Developer View (Admin Only)
If logged in as admin (duketopceo@gmail.com), you'll see:
- Debug panel with system metrics
- Advanced game state controls
- Performance monitoring
- Test scenario generators

## 🧪 Testing

### Running Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode for development
```

### Test Coverage Goals
- **Beta (v0.8)**: 60% coverage ✅
- **v1.0**: 90% coverage
- **v2.0+**: 95% coverage

Current coverage focuses on:
- Game loop functionality
- State management
- AI service integration
- Admin authentication

## 🔐 Security & Privacy

### Environment Variables
Never commit sensitive data. Required environment variables:
```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config

# AI Service
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
```

### Security Measures
- Client-side code sanitized (no secrets)
- Firebase security rules enforced
- Input validation on all user data
- Regular security audits via CodeQL
- Admin features restricted to verified accounts

## 📖 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### For Developers
1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

### For Educators
We'd love your input on:
- Learning scenarios and objectives
- Educational content accuracy
- Classroom integration needs
- Assessment and tracking features

## 📝 License

This project is private and proprietary. All rights reserved.

## 🤝 Support & Contact

- **Email**: duketopceo@gmail.com
- **Website**: [chronicleweaver.com](https://chronicleweaver.com)
- **Issues**: [GitHub Issues](https://github.com/duketopceo/rork-chronicle-weaver/issues)

## 🙏 Acknowledgments

Built with:
- OpenAI for AI narrative generation
- Firebase for infrastructure
- Expo for cross-platform development
- The open-source community

---

**Current Version**: v0.8.0-beta  
**Last Updated**: January 2026  
**Status**: Active Development
