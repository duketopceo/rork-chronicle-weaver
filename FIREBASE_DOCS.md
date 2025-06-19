# Firebase Configuration Documentation (firebase.json)

## Overview
This Firebase configuration file defines the hosting settings for Chronicle Weaver's web deployment. It configures how the game is served to players through Firebase Hosting.

## Configuration Sections

### Hosting Configuration
The hosting section defines how Chronicle Weaver is deployed and served on the web:

#### Public Directory
- **public**: "dist" - Specifies the build output directory containing the compiled game
- This directory contains the webpack-built bundle and assets

#### Ignore Patterns
Files and directories to exclude from deployment:
- **firebase.json** - Configuration files shouldn't be deployed
- **.**/*** - Hidden dot files (like .git, .env)
- ***/node_modules/*** - Dependencies are bundled, not deployed separately

#### URL Routing (Rewrites)
- **source**: "**" - Matches all incoming URL patterns
- **destination**: "/index.html" - Routes all requests to the main app entry point

## Chronicle Weaver Specific Features

### Single Page Application (SPA) Support
- All routes are handled by the React app through Expo Router
- Players can bookmark specific game states or screens
- Direct URL access works for any part of the game

### Game Asset Delivery
- Optimized serving of game images, fonts, and other assets
- Cached delivery for better performance during gameplay
- Global CDN distribution for players worldwide

### Historical Context
- Configured for the historical RPG's web presence
- Supports the game's cross-platform nature (mobile apps also available)
- Enables web-based game sessions alongside native mobile experience

## Deployment Process
1. Webpack builds the game into the `dist/` directory
2. Firebase CLI deploys the `dist/` contents to Firebase Hosting
3. Players access Chronicle Weaver through the hosted web URL
4. All game routes are handled client-side for smooth navigation

## Performance Considerations
- Static file caching for fast subsequent loads
- Global CDN reduces latency for international players
- Optimized for the game's rich visual and interactive content
