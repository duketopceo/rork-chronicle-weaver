# Contributing to Chronicle Weaver

Thank you for your interest in contributing to Chronicle Weaver! This document provides guidelines and instructions for contributing to the project.

## 🎯 Project Vision

Chronicle Weaver is an educational game focused on teaching business, finance, and management principles through interactive storytelling. All contributions should align with this educational mission.

## 🤝 How to Contribute

### For Developers

#### Getting Started
1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/rork-chronicle-weaver.git
   cd rork-chronicle-weaver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Write clean, maintainable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed

5. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   npm run build:production
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

#### Code Standards

**TypeScript**
- Use strict TypeScript with proper type definitions
- No `any` types unless absolutely necessary
- Define interfaces for all complex objects

**React Native Components**
- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use TypeScript for props

**State Management**
- Use Zustand for global state
- Keep state updates immutable
- Document state changes

**Testing**
- Write tests for all new features
- Aim for 90%+ code coverage
- Test edge cases and error scenarios

**Commit Messages**
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Build/tooling changes

### For Educators

We especially value input from educators! You can contribute by:

#### Learning Content
- Suggest new business scenarios
- Review educational accuracy
- Propose learning objectives
- Share classroom experiences

#### Feedback
- Report issues with educational content
- Suggest improvements to scenarios
- Share student engagement data
- Propose new features for classrooms

#### How to Submit Educational Feedback
1. Open a GitHub issue with label `education`
2. Email duketopceo@gmail.com with "Education Feedback" in subject
3. Use the feedback form at chronicleweaver.com (coming soon)

### For Players

#### Bug Reports
Found a bug? Help us fix it!

1. **Check existing issues** to avoid duplicates
2. **Open a new issue** with:
   - Clear title describing the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Device/browser information

#### Feature Requests
Have an idea? We'd love to hear it!

1. **Open a GitHub issue** with label `enhancement`
2. **Describe the feature**:
   - What problem does it solve?
   - How would it work?
   - Why is it valuable?
   - Any implementation ideas?

## 📋 Development Guidelines

### Setting Up Development Environment

1. **Required Software**
   - Node.js 18+ (20.x recommended)
   - npm or Bun package manager
   - Git
   - VS Code (recommended) with extensions:
     - ESLint
     - Prettier
     - TypeScript and JavaScript Language Features

2. **Environment Configuration**
   - Copy `.env.example` to `.env.local`
   - Add your Firebase configuration
   - Add your OpenAI API key (for testing AI features)

3. **Running Locally**
   ```bash
   npm run start-web  # Starts development server
   ```

### Project Structure
```
src/
├── app/              # Expo Router screens (file-based routing)
├── components/       # Reusable UI components
├── store/           # Zustand state management
├── services/        # External service integrations
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
└── constants/       # App constants and theme
```

### Key Files
- `src/store/gameStore.ts` - Main game state
- `src/services/aiService.ts` - AI narrative generation
- `src/app/game/setup.tsx` - Game setup screen
- `src/app/game/play.tsx` - Main gameplay screen

## 🧪 Testing

### Writing Tests
- Place tests in `tests/` directory
- Name test files: `*.test.ts` or `*.test.tsx`
- Test file structure:
  ```typescript
  describe('Feature Name', () => {
    it('should do something specific', () => {
      // Arrange
      const input = ...;
      
      // Act
      const result = ...;
      
      // Assert
      expect(result).toBe(expected);
    });
  });
  ```

### Running Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test -- --coverage  # With coverage report
```

### What to Test
- Game loop functionality
- State management actions
- Component rendering
- User interactions
- API integrations
- Edge cases and error handling

## 🎨 UI/UX Guidelines

### Design Principles
- **Clean and Minimal**: Reduce visual clutter
- **Educational Focus**: UI should support learning
- **Responsive**: Work on all screen sizes
- **Accessible**: Follow WCAG 2.1 AA standards

### Color Scheme
- Use colors from `src/constants/colors.ts`
- Maintain consistent visual hierarchy
- Ensure sufficient contrast ratios

### Typography
- Use typography scale from constants
- Keep text readable (minimum 16px for body)
- Use proper heading hierarchy

## 🔒 Security

### Security Best Practices
- Never commit sensitive data (API keys, secrets)
- Use environment variables for configuration
- Validate all user input
- Sanitize data before display
- Follow principle of least privilege

### Reporting Security Issues
**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email duketopceo@gmail.com with subject "Security Issue"
2. Include detailed description
3. Provide steps to reproduce
4. Wait for response before public disclosure

## 📚 Documentation

### Updating Documentation
When making changes:
- Update relevant README sections
- Add JSDoc comments to functions
- Update type definitions
- Document breaking changes
- Update migration guides if needed

### Documentation Structure
- `README.md` - Main project documentation
- `CONTRIBUTING.md` - This file
- `docs/` - Detailed technical documentation
- `AI_DEVELOPER_CONTEXT.md` - AI development guidelines

## ✅ Pull Request Process

1. **Before Submitting**
   - [ ] All tests pass
   - [ ] Code is linted and formatted
   - [ ] TypeScript compiles without errors
   - [ ] Documentation is updated
   - [ ] Commit messages follow conventions
   - [ ] Branch is up to date with main

2. **PR Description**
   - Clear title describing the change
   - Detailed description of what and why
   - Link to related issues
   - Screenshots for UI changes
   - Testing steps

3. **Review Process**
   - Maintainers will review within 3-5 days
   - Address any requested changes
   - Keep discussion focused and professional
   - Be patient and responsive

4. **After Merge**
   - Delete your feature branch
   - Update your local repository
   - Celebrate your contribution! 🎉

## 🤔 Questions?

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Open a GitHub Issue
- **Security Issues**: Email duketopceo@gmail.com
- **Educational Feedback**: Email duketopceo@gmail.com

## 📜 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers
- Focus on what's best for the community
- Show empathy towards others
- Accept constructive criticism gracefully

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

### Enforcement
Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to duketopceo@gmail.com

## 🎓 Learning Resources

### For Contributors New to:

**React Native**
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)

**TypeScript**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

**Testing**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)

**Git/GitHub**
- [GitHub Guides](https://guides.github.com/)
- [Git Book](https://git-scm.com/book/en/v2)

## 🙏 Thank You!

Your contributions make Chronicle Weaver better for learners everywhere. Whether you're fixing a bug, adding a feature, or improving documentation, we appreciate your time and effort!

---

**Questions?** Open a GitHub Discussion or email duketopceo@gmail.com
