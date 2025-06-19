# TypeScript Configuration Documentation (tsconfig.json)

## Overview 
This TypeScript configuration is specifically tailored for Chronicle Weaver, a React Native Expo application. It extends Expo's base configuration while adding project-specific optimizations for the historical RPG game.

## Configuration Sections

### Base Configuration
- **extends**: "expo/tsconfig.base" - Inherits Expo's recommended TypeScript settings
- Provides sensible defaults for React Native development

### Compiler Options
- **target**: "es2015" - Compiles to ES2015 (ES6) for broad compatibility
- **module**: "es2015" - Uses ES2015 module system for modern JavaScript features
- **jsx**: "react" - Configures JSX transformation for React components
- **lib**: ["es2015", "dom"] - Includes ES2015 and DOM type definitions

### Type Safety Settings
- **strict**: true - Enables all strict type checking options
- **esModuleInterop**: true - Enables interoperability between CommonJS and ES modules
- **skipLibCheck**: true - Skips type checking of declaration files for faster builds
- **forceConsistentCasingInFileNames**: true - Ensures consistent file name casing

### Path Mapping
- **paths**: Maps "@/*" to "./*" - Enables absolute imports from project root
- Allows importing from "@/components/Button" instead of "../../components/Button"
- Improves code readability and maintainability

### File Inclusion
- **include**: Specifies which files TypeScript should process
  - "**/*.ts" - All TypeScript files
  - "**/*.tsx" - All TypeScript React files
  - ".expo/types/**/*.ts" - Expo-generated type definitions
  - "expo-env.d.ts" - Expo environment types
  - "src" - Source directory (if applicable)

### Exclusions
- **exclude**: ["node_modules"] - Excludes dependencies from type checking
- Improves compilation performance by skipping third-party packages

## Chronicle Weaver Specific Notes

### Game Development Considerations
- Strict mode ensures type safety for game state management
- Path mapping supports clean imports for game components and utilities
- ES2015 target provides good performance while maintaining compatibility

### React Native Optimizations
- Configuration optimized for Expo Router file-based navigation
- Supports both web and native platforms through Expo
- Compatible with Metro bundler used by React Native

### Development Workflow
- Fast compilation times through skipLibCheck
- Consistent file naming prevents cross-platform issues
- Absolute imports improve code organization for large game codebase
