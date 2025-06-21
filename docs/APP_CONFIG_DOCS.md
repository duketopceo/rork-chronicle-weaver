# App Configuration Documentation (app.json)

## Overview
This file defines the Expo configuration for Chronicle Weaver, a historical RPG game. It contains settings for app metadata, platform-specific configurations, plugins, and experimental features.

## Configuration Sections

### App Identity and Branding
- **name**: "Chronicle Weaver" - Display name shown to users on their devices
- **slug**: "chronicle-weaver" - URL-friendly identifier used by Expo services
- **version**: "1.0.0" - App version for updates and releases

### Display and UI Configuration
- **orientation**: "portrait" - Locks app to portrait mode for consistent game UI
- **icon**: "./assets/images/icon.png" - App icon displayed on device home screens
- **scheme**: "myapp" - URL scheme for deep linking into the app
- **userInterfaceStyle**: "automatic" - Adapts to system light/dark mode preferences
- **newArchEnabled**: true - Enables React Native's new architecture for better performance

### Splash Screen Configuration
- **image**: "./assets/images/splash-icon.png" - Image shown while app loads
- **resizeMode**: "contain" - Fits image within screen bounds maintaining aspect ratio
- **backgroundColor**: "#ffffff" - Background color displayed during splash

### iOS Platform Configuration
- **supportsTablet**: true - Enables iPad support for larger screen gameplay
- **bundleIdentifier**: "app.rork.chronicle-weaver" - Unique iOS bundle ID required for App Store

### Android Platform Configuration
- **adaptiveIcon**: 
  - **foregroundImage**: Android adaptive icon foreground
  - **backgroundColor**: Background color for adaptive icon system
- **package**: "app.rork.chronicle-weaver" - Unique Android package name for Play Store

### Web Platform Configuration
- **favicon**: "./assets/images/favicon.png" - Browser favicon for web version

### Expo Plugins Configuration
- **expo-router**: File-based routing system for navigation
  - **origin**: "https://rork.com/" - Base URL for deep linking and SEO optimization

### Experimental Features
- **typedRoutes**: true - Enables TypeScript type generation for file-based routes

## Platform Support
This configuration enables the app to run on:
- iOS devices (iPhone and iPad)
- Android devices
- Web browsers (as PWA)

## Development Notes
- Bundle identifiers follow reverse domain naming convention
- Icons should be provided in multiple resolutions for different devices
- The adaptive icon system on Android requires separate foreground/background images
- Typed routes experiment provides better TypeScript integration with Expo Router
