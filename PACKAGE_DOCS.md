# Chronicle Weaver - Package Dependencies Documentation

## Project Overview
Chronicle Weaver is a historical role-playing game built with React Native and Expo. Players can create characters and embark on narrative adventures across different historical eras, making choices that shape their story.

## Package.json Structure

### Project Metadata
- **name**: "expo-app" (Base Expo app name - should be updated to match actual app name)
- **main**: "expo-router/entry" (Entry point for Expo Router navigation system)
- **version**: "1.0.0" (Current app version)

### Build and Development Scripts
- **start**: Development server with custom project ID and tunnel for external access
- **start-web**: Web version with tunnel for cross-platform testing
- **start-web-dev**: Debug version with verbose logging for development

### Runtime Dependencies

#### UI and Design System
- `@expo/vector-icons`: Icon library for Expo apps
- `expo`: Core Expo SDK for React Native development
- `expo-blur`: Blur effects for UI elements
- `expo-constants`: Access to app constants and configuration
- `expo-font`: Custom font loading
- `expo-haptics`: Haptic feedback for game interactions
- `expo-image`: Optimized image component
- `expo-image-picker`: Image selection for character customization
- `expo-linear-gradient`: Gradient backgrounds for UI
- `expo-linking`: Deep linking capabilities
- `expo-location`: Location services (if needed for historical context)
- `expo-router`: File-based routing system
- `expo-splash-screen`: Splash screen management
- `expo-status-bar`: Status bar styling
- `expo-symbols`: System symbols and icons
- `expo-system-ui`: System UI theming
- `expo-web-browser`: In-app browser for external links

#### Navigation and UI Components
- `@react-navigation/native`: Navigation library
- `react`: React framework
- `react-dom`: React DOM for web support
- `react-native`: React Native framework
- `react-native-gesture-handler`: Gesture handling
- `react-native-safe-area-context`: Safe area management
- `react-native-screens`: Native screen management
- `react-native-svg`: SVG support for icons and graphics
- `react-native-web`: Web support for React Native

#### State Management and Data Persistence
- `@react-native-async-storage/async-storage`: Local storage for game saves
- `zustand`: Lightweight state management for game state

#### Game-specific UI Components
- `@react-native-community/slider`: Slider component for game settings
- `lucide-react-native`: Icon library for game UI
- `nativewind`: Tailwind CSS for React Native styling

#### Backend and API Communication
- `@hono/trpc-server`: tRPC server integration with Hono
- `@tanstack/react-query`: Data fetching and caching
- `@trpc/client`: tRPC client for type-safe API calls
- `@trpc/react-query`: React Query integration with tRPC
- `@trpc/server`: tRPC server for API endpoints
- `hono`: Lightweight web framework for backend

#### Data Validation and Serialization
- `superjson`: Enhanced JSON serialization for complex data types
- `zod`: Schema validation for game data and API responses

#### Firebase Integration
- `firebase`: Firebase SDK for authentication and database (user data and game saves)

#### Build Tools
- `ts-loader`: TypeScript loader for webpack
- `webpack`: Module bundler
- `webpack-cli`: Webpack command line interface

### Development Dependencies
- `@babel/core`: JavaScript compiler for React Native
- `@expo/ngrok`: Tunneling service for development
- `@types/node`: Node.js type definitions
- `@types/react`: React type definitions
- `typescript`: TypeScript compiler for type safety

### Configuration Notes
- `private: true`: Prevents accidental publishing to npm
- All Expo packages are pinned to compatible versions for SDK 53
- TypeScript is used throughout for type safety
- Firebase is configured for user authentication and game data persistence
