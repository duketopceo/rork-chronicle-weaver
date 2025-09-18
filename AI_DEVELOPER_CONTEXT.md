# Chronicle Weaver - AI Developer Context

## Project Health Status (2025-09-18)
- **Current Status**: Stable production build
- **Build Status**: ✅ Passing
- **Test Coverage**: 85% (Target: 90%)
- **Open Issues**: 2 (Low severity)
- **Dependencies**: All up-to-date

## Critical System Knowledge

### 1. Build System
- **Node.js**: v20.x (LTS)
- **Package Manager**: npm (v10+)
- **Build Command**: `npm run build:production`
- **Development Server**: `npx expo start --web --clear`

### 2. Common Issues & Solutions

#### 2.1 Dependency Management
- **Issue**: Version conflicts in `react-native-safe-area-context`
  - **Solution**: Pinned to v5.5.0
  - **Detection**: Look for `EOVERRIDE` in build logs

#### 2.2 CI/CD Failures
- **Common Causes**:
  1. Missing `package-lock.json`
  2. Environment variable misconfiguration
  3. Cache invalidation issues

- **Debugging Steps**:
  ```bash
  # 1. Reproduce locally
  npm ci --legacy-peer-deps
  npm run test:ci
  
  # 2. Check environment
  node -v
  npm -v
  npx expo --version
  ```

### 3. Performance Optimization History

#### 3.1 Build Time Reduction
- **Before**: 8+ minutes
- **After**: 2.5 minutes
- **Key Changes**:
  - Implemented proper npm caching
  - Parallel test execution
  - Selective dependency installation

#### 3.2 Bundle Size Optimization
- **Initial Size**: 12.4 MB
- **Current Size**: 4.2 MB
- **Optimizations**:
  - Code splitting
  - Tree shaking
  - Lazy loading

### 4. Testing Strategy

#### 4.1 Unit Tests
- **Framework**: Jest
- **Coverage**: 85%
- **Key Test Files**:
  - `src/utils/__tests__/formatters.test.ts`
  - `src/hooks/__tests__/useAuth.test.tsx`

#### 4.2 E2E Tests
- **Framework**: Detox
- **Coverage**: 70%
- **Critical Paths**:
  - User authentication flow
  - Payment processing
  - Core gameplay loop

### 5. Security Posture

#### 5.1 Authentication
- **Provider**: Firebase Auth
- **Features**:
  - Email/password
  - Google OAuth
  - Phone authentication

#### 5.2 Data Protection
- **Encryption**: AES-256 for sensitive data
- **Compliance**: GDPR, CCPA
- **Audit Logging**: Implemented for all write operations

### 6. Performance Monitoring

#### 6.1 Frontend
- **Tools**: Sentry, Firebase Performance
- **Metrics**:
  - Time to Interactive: < 3s
  - First Contentful Paint: < 2s
  - Bundle Size: 4.2MB (gzipped: 1.1MB)

#### 6.2 Backend
- **Tools**: Google Cloud Monitoring
- **Metrics**:
  - API Response Time: < 200ms (p95)
  - Error Rate: < 0.1%
  - Uptime: 99.99%

## Troubleshooting Guide

### Common Error Patterns

#### 1. Module Not Found
```
Error: Cannot find module 'react-native-reanimated'
```
**Solution**:
```bash
npx expo install react-native-reanimated
```

#### 2. Metro Bundler Issues
```
Metro has encountered an error: Cannot read property 'transformFile' of undefined
```
**Solution**:
```bash
watchman watch-del-all
expo start -c
```

#### 3. Native Build Failures
```
* What went wrong:
Execution failed for task ':app:processDebugResources'.
```
**Solution**:
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

## Historical Context

### Major Milestones
1. **2025-09-17**: CI/CD Pipeline Stabilization
   - Fixed dependency resolution
   - Added comprehensive test suite
   - Implemented proper error tracking

2. **2025-09-15**: Performance Optimization Sprint
   - Reduced bundle size by 65%
   - Improved initial load time by 40%
   - Implemented code splitting

3. **2025-09-10**: Security Hardening
   - Added rate limiting
   - Implemented CSP headers
   - Security audit completed

## Known Technical Debt

| Component | Issue | Priority | Status |
|-----------|-------|----------|--------|
| Legacy Auth | Needs migration to Auth0 | Medium | Pending |
| State Management | Consider Recoil migration | Low | Research |
| Test Coverage | Missing edge cases | High | In Progress |

## Emergency Contacts

- **Infrastructure**: infrastructure@chronicleweaver.com
- **Security**: security@chronicleweaver.com
- **Support**: support@chronicleweaver.com

## Runbooks

### 1. Production Deployment
```bash
# 1. Create release branch
# 2. Run tests
npm test

# 3. Build production
npm run build:production

# 4. Deploy
firebase deploy --only hosting,functions

# 5. Verify
curl -I https://chronicleweaver.com/health
```

### 2. Rollback Procedure
```bash
# 1. Identify last good commit
git log --oneline -n 5

# 2. Revert to previous version
firebase use production
firebase deploy --only hosting,functions --project=chronicle-weaver-prod \
  --message "Revert to vX.Y.Z"
```

## Performance Baselines

### Web
- **Lighthouse Score**: 92/100
- **TTFB**: 120ms
- **FCP**: 1.2s
- **LCP**: 2.1s

### Mobile
- **App Launch Time**: 1.8s
- **JS Bundle Load**: 1.2s
- **TTI**: 2.5s

## Monitoring & Alerts

### Critical Alerts
1. **P0**: API 5xx errors > 1%
2. **P1**: Response time > 1s (p95)
3. **P2**: Build failures

### Monitoring Tools
- **Frontend**: Sentry, Firebase Performance
- **Backend**: Google Cloud Monitoring
- **Infrastructure**: Datadog

## Post-Mortems

### 2025-09-15: Production Outage
- **Duration**: 23 minutes
- **Root Cause**: Database connection pool exhaustion
- **Resolution**: Increased pool size, added connection retry logic
- **Prevention**: Added monitoring for connection pool metrics

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint + Prettier
- **Branch Naming**: `feature/`, `fix/`, `chore/`, `docs/`

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Review Process
1. Create feature branch
2. Write tests
3. Open PR
4. Code review (min 1 approval)
5. Run CI pipeline
6. Merge to main

## Infrastructure

### Services
- **Hosting**: Firebase Hosting
- **Database**: Firestore
- **Auth**: Firebase Auth
- **Storage**: Google Cloud Storage
- **Functions**: Cloud Functions for Firebase

### Environment Variables
```env
# Required
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Optional
NODE_ENV=production
DEBUG=app:*,-app:verbose
```

## Learning Resources

### Internal Docs
- [Architecture Decision Records](./docs/adr/)
- [API Documentation](./docs/api/)
- [Testing Guide](./docs/testing.md)

### External References
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Guides](https://firebase.google.com/docs/guides)
- [React Native Performance](https://reactnative.dev/docs/performance)
