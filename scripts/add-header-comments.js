/**
 * add-header-comments.js
 * 
 * Source file for Chronicle Weaver application.
 * 
 * Purpose: Implements functionality for add-header-comments.
 * 
 * References:
 * - File: scripts/add-header-comments.js
 * - Part of Chronicle Weaver application
 */

#!/usr/bin/env node

/**
 * Header Comments Generator for Chronicle Weaver
 * 
 * This script automatically adds comprehensive header comments to all source files
 * that don't already have them. It analyzes each file's purpose based on its
 * location, content, and naming patterns to generate appropriate documentation.
 * 
 * Features:
 * - Detects existing header comments to avoid duplication
 * - Generates contextual comments based on file type and location
 * - Maintains consistent formatting across the codebase
 * - Preserves existing file content and structure
 * - Supports TypeScript, JavaScript, JSX, TSX, JSON, and Markdown files
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// File type mappings for header comment generation
const fileTypeMap = {
  // Components
  'components/AuthPanel.tsx': {
    title: 'Authentication Panel Component',
    description: 'User authentication interface with sign-in/sign-out functionality and user profile display.',
    purpose: 'Handles user authentication state and provides authentication controls.'
  },
  'components/BillingPanel.tsx': {
    title: 'Billing Management Panel Component',
    description: 'Comprehensive billing and subscription management interface for Chronicle Weaver.',
    purpose: 'Manages user subscriptions, payment methods, and billing history.'
  },
  'components/Button.tsx': {
    title: 'Reusable Button Component',
    description: 'Customizable button component with consistent styling and theming.',
    purpose: 'Provides standardized button interface across the application.'
  },
  'components/ChoiceButton.tsx': {
    title: 'Game Choice Button Component',
    description: 'Interactive button for player choices in narrative gameplay.',
    purpose: 'Handles player decision inputs and choice selection in game scenes.'
  },
  'components/CustomChoiceInput.tsx': {
    title: 'Custom Choice Input Component',
    description: 'Text input component for custom player choices and responses.',
    purpose: 'Allows players to create custom responses and choices in gameplay.'
  },
  'components/CustomSlider.tsx': {
    title: 'Custom Slider Component',
    description: 'Customizable slider component for numeric value selection.',
    purpose: 'Provides interactive numeric input controls for game settings.'
  },
  'components/ErrorBoundary.tsx': {
    title: 'React Error Boundary Component',
    description: 'Error boundary for catching and handling React component errors gracefully.',
    purpose: 'Provides error recovery and fallback UI for application errors.'
  },
  'components/MemoryList.tsx': {
    title: 'Memory List Component',
    description: 'Display component for player memories and historical choices.',
    purpose: 'Shows chronological list of player decisions and their consequences.'
  },
  'components/NarrativeText.tsx': {
    title: 'Narrative Text Component',
    description: 'Styled text component for displaying game narrative and story content.',
    purpose: 'Renders formatted narrative text with historical theming.'
  },
  'components/StatsBar.tsx': {
    title: 'Character Stats Bar Component',
    description: 'Visual representation of character statistics and attributes.',
    purpose: 'Displays character progress and attribute values in gameplay.'
  },
  'components/SubscriptionGate.tsx': {
    title: 'Subscription Gate Component',
    description: 'Access control component for premium features and content.',
    purpose: 'Manages access to premium features based on subscription status.'
  },
  'components/SubscriptionPanel.tsx': {
    title: 'Subscription Management Panel',
    description: 'User interface for managing subscriptions and premium features.',
    purpose: 'Handles subscription upgrades, downgrades, and feature access.'
  },
  'components/TextInput.tsx': {
    title: 'Styled Text Input Component',
    description: 'Customizable text input component with consistent theming.',
    purpose: 'Provides standardized text input interface across the application.'
  },
  'components/UltraDebugPanel.tsx': {
    title: 'Ultra Debug Panel Component',
    description: 'Advanced debugging interface with user and developer modes.',
    purpose: 'Provides comprehensive debugging and monitoring capabilities.'
  },
  'components/UpgradePrompt.tsx': {
    title: 'Upgrade Prompt Component',
    description: 'Modal component prompting users to upgrade to premium features.',
    purpose: 'Encourages subscription upgrades and displays premium benefits.'
  },
  'components/UsageIndicator.tsx': {
    title: 'Usage Indicator Component',
    description: 'Visual indicator showing API usage, quotas, and limits.',
    purpose: 'Displays current usage statistics and remaining quotas.'
  },

  // App Pages
  'app/index.tsx': {
    title: 'Home Screen - Chronicle Weaver Landing Page',
    description: 'Main landing page introducing players to Chronicle Weaver and guiding them to character creation.',
    purpose: 'Serves as the entry point for new and returning players.'
  },
  'app/+not-found.tsx': {
    title: 'Not Found Page Component',
    description: '404 error page for handling invalid routes and missing content.',
    purpose: 'Provides user-friendly error handling for navigation failures.'
  },
  'app/game/character.tsx': {
    title: 'Character Management Screen',
    description: 'Character sheet and management interface for player progression.',
    purpose: 'Allows players to view and manage their character attributes and progress.'
  },
  'app/game/chronos.tsx': {
    title: 'Chronos Time Management Screen',
    description: 'Time manipulation and historical period management interface.',
    purpose: 'Manages temporal aspects of gameplay and historical period selection.'
  },
  'app/game/kronos.tsx': {
    title: 'Kronos AI Advisor Screen',
    description: 'AI advisor interface for guidance and strategic consultation.',
    purpose: 'Provides AI-powered advice and historical context to players.'
  },
  'app/game/lore.tsx': {
    title: 'Lore and Knowledge Screen',
    description: 'Historical knowledge base and discovered lore repository.',
    purpose: 'Displays accumulated knowledge and historical discoveries.'
  },
  'app/game/memories.tsx': {
    title: 'Memory Repository Screen',
    description: 'Archive of player choices, decisions, and their historical consequences.',
    purpose: 'Tracks and displays player decision history and outcomes.'
  },
  'app/game/play.tsx': {
    title: 'Main Gameplay Screen',
    description: 'Core gameplay interface where narrative scenarios unfold and choices are made.',
    purpose: 'Primary interaction point for Chronicle Weaver gameplay experience.'
  },
  'app/game/setup.tsx': {
    title: 'Game Setup and Character Creation Screen',
    description: 'Initial game setup including character creation and world configuration.',
    purpose: 'Guides new players through character creation and game initialization.'
  },
  'app/game/systems.tsx': {
    title: 'Game Systems Overview Screen',
    description: 'Documentation and explanation of game mechanics and systems.',
    purpose: 'Educates players about Chronicle Weaver game mechanics.'
  },

  // Services
  'services/firebaseUtils.ts': {
    title: 'Firebase Utilities and Configuration',
    description: 'Firebase service initialization, authentication, and database utilities.',
    purpose: 'Centralized Firebase configuration and utility functions.'
  },

  // Store
  'store/gameStore.ts': {
    title: 'Game State Management Store',
    description: 'Zustand store managing global game state, character data, and gameplay progress.',
    purpose: 'Centralized state management for all game-related data and progress.'
  },

  // Types
  'types/game.ts': {
    title: 'Game Type Definitions',
    description: 'Comprehensive TypeScript type definitions for all game-related data structures.',
    purpose: 'Ensures type safety across the game system architecture.'
  },
  'types/global.d.ts': {
    title: 'Global Type Declarations',
    description: 'Global TypeScript declarations for modules, environments, and external libraries.',
    purpose: 'Provides type safety for global objects and external dependencies.'
  },

  // Utils
  'utils/dateUtils.ts': {
    title: 'Date and Time Utilities',
    description: 'Utility functions for handling dates, times, and historical periods.',
    purpose: 'Provides date formatting and manipulation for historical contexts.'
  },
  'utils/debugSystem.ts': {
    title: 'Debug System Utilities',
    description: 'Comprehensive debugging system with logging, metrics, and performance tracking.',
    purpose: 'Provides development debugging and monitoring capabilities.'
  },

  // Config files
  'package.json': {
    title: 'Project Package Configuration',
    description: 'NPM package configuration with dependencies, scripts, and project metadata.',
    purpose: 'Defines project dependencies and build/development scripts.'
  },
  'app.json': {
    title: 'Expo App Configuration',
    description: 'Expo application configuration for mobile and web deployment.',
    purpose: 'Configures Expo build settings and platform-specific options.'
  },
  'tsconfig.json': {
    title: 'TypeScript Configuration',
    description: 'TypeScript compiler configuration and type checking settings.',
    purpose: 'Defines TypeScript compilation rules and module resolution.'
  },
  'firebase.json': {
    title: 'Firebase Project Configuration',
    description: 'Firebase hosting, functions, and service configuration.',
    purpose: 'Configures Firebase services and deployment settings.'
  },
  'eslint.config.js': {
    title: 'ESLint Configuration',
    description: 'ESLint linting rules and code quality configuration.',
    purpose: 'Enforces code quality standards and style consistency.'
  },
  'jest.config.js': {
    title: 'Jest Testing Configuration',
    description: 'Jest test framework configuration and testing environment setup.',
    purpose: 'Configures unit testing environment and test execution.'
  },
  'webpack.config.js': {
    title: 'Webpack Build Configuration',
    description: 'Webpack bundling configuration for web builds.',
    purpose: 'Configures web application bundling and optimization.'
  },
  'metro.config.js': {
    title: 'Metro Bundler Configuration',
    description: 'Metro bundler configuration for React Native development.',
    purpose: 'Configures React Native bundling and development server.'
  },
  'babel.config.js': {
    title: 'Babel Transpilation Configuration',
    description: 'Babel JavaScript transpilation and transformation configuration.',
    purpose: 'Configures JavaScript/TypeScript transpilation rules.'
  }
};

// Extensions that should have header comments
const supportedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

// Files to exclude from header comment generation
const excludePatterns = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.expo',
  'ios',
  'android',
  'web-build',
  '.vscode',
  'scripts/error-scanner.js',
  'scripts/consolidate-structure.js',
  'scripts/add-header-comments.js',
  'tests/',
  '.test.',
  '.spec.',
  'bun.lock',
  'error-scan-report.json'
];

/**
 * Check if a file should be excluded from processing
 */
function shouldExclude(filePath) {
  return excludePatterns.some(pattern => 
    filePath.includes(pattern) || 
    filePath.endsWith(pattern) ||
    path.basename(filePath).startsWith('.')
  );
}

/**
 * Check if file already has a header comment
 */
function hasHeaderComment(content) {
  const trimmed = content.trim();
  return trimmed.startsWith('/**') || 
         trimmed.startsWith('/*') || 
         trimmed.startsWith('//') ||
         (trimmed.startsWith('{') && trimmed.includes('"description"'));
}

/**
 * Generate header comment based on file type and location
 */
function generateHeaderComment(filePath, extension) {
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  const fileName = path.basename(filePath);
  const dirName = path.dirname(relativePath);
  
  // Check for specific file mapping
  const mapping = fileTypeMap[relativePath.replace('src/', '')];
  if (mapping) {
    if (extension === '.json') {
      return `{
  "_comment": "${mapping.title}",
  "_description": "${mapping.description}",
  "_purpose": "${mapping.purpose}",
`;
    } else {
      return `/**
 * ${mapping.title}
 * 
 * ${mapping.description}
 * 
 * Purpose: ${mapping.purpose}
 * 
 * References:
 * - File: ${relativePath}
 * - Part of Chronicle Weaver game system
 * - Integrates with game state and navigation
 */
`;
    }
  }

  // Generate generic comment based on file location and type
  let title = fileName;
  let description = `Source file for Chronicle Weaver application.`;
  let purpose = `Implements functionality for ${fileName.replace(/\.(ts|tsx|js|jsx)$/, '')}.`;

  // Determine context from directory structure
  if (dirName.includes('components')) {
    title = `${fileName.replace(/\.(ts|tsx)$/, '')} Component`;
    description = `React component for Chronicle Weaver user interface.`;
    purpose = `Provides UI functionality and user interaction capabilities.`;
  } else if (dirName.includes('app')) {
    title = `${fileName.replace(/\.(ts|tsx)$/, '')} Screen`;
    description = `Application screen/page for Chronicle Weaver navigation.`;
    purpose = `Implements page-level functionality and user interface.`;
  } else if (dirName.includes('services')) {
    title = `${fileName.replace(/\.(ts|js)$/, '')} Service`;
    description = `Service module for Chronicle Weaver backend integration.`;
    purpose = `Provides data access and external service integration.`;
  } else if (dirName.includes('utils')) {
    title = `${fileName.replace(/\.(ts|js)$/, '')} Utilities`;
    description = `Utility functions and helpers for Chronicle Weaver.`;
    purpose = `Provides reusable functionality across the application.`;
  } else if (dirName.includes('types')) {
    title = `${fileName.replace(/\.(ts|d\.ts)$/, '')} Type Definitions`;
    description = `TypeScript type definitions for Chronicle Weaver.`;
    purpose = `Provides type safety and interface definitions.`;
  } else if (dirName.includes('constants')) {
    title = `${fileName.replace(/\.(ts|js)$/, '')} Constants`;
    description = `Application constants and configuration values.`;
    purpose = `Centralizes configuration and constant values.`;
  } else if (dirName.includes('store')) {
    title = `${fileName.replace(/\.(ts|js)$/, '')} State Store`;
    description = `State management store for Chronicle Weaver.`;
    purpose = `Manages application state and data persistence.`;
  }

  if (extension === '.json') {
    return `{
  "_comment": "${title}",
  "_description": "${description}",
  "_purpose": "${purpose}",
`;
  } else {
    return `/**
 * ${title}
 * 
 * ${description}
 * 
 * Purpose: ${purpose}
 * 
 * References:
 * - File: ${relativePath}
 * - Part of Chronicle Weaver application
 */
`;
  }
}

/**
 * Add header comment to a file
 */
function addHeaderComment(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const extension = path.extname(filePath);
    
    // Skip if already has header comment
    if (hasHeaderComment(content)) {
      console.log(`${colors.blue}ℹ️  ${colors.reset}${filePath} already has header comment`);
      return false;
    }

    const headerComment = generateHeaderComment(filePath, extension);
    let newContent;

    if (extension === '.json') {
      // Handle JSON files specially
      const jsonContent = content.trim();
      if (jsonContent.startsWith('{')) {
        newContent = headerComment + jsonContent.substring(1);
      } else {
        newContent = headerComment + jsonContent;
      }
    } else {
      // Handle code files
      newContent = headerComment + '\n' + content;
    }

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`${colors.green}✅ ${colors.reset}Added header comment to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ ${colors.reset}Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Process directory recursively
 */
function processDirectory(dirPath) {
  const results = {
    processed: 0,
    skipped: 0,
    errors: 0
  };

  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      
      if (shouldExclude(itemPath)) {
        continue;
      }

      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        const subResults = processDirectory(itemPath);
        results.processed += subResults.processed;
        results.skipped += subResults.skipped;
        results.errors += subResults.errors;
      } else if (stat.isFile()) {
        const extension = path.extname(itemPath);
        
        if (supportedExtensions.includes(extension)) {
          if (addHeaderComment(itemPath)) {
            results.processed++;
          } else {
            results.skipped++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`${colors.red}❌ ${colors.reset}Error processing directory ${dirPath}: ${error.message}`);
    results.errors++;
  }

  return results;
}

/**
 * Main execution function
 */
function main() {
  console.log(`${colors.cyan}${colors.bright}🔍 Chronicle Weaver Header Comments Generator${colors.reset}`);
  console.log(`${colors.yellow}📁 Processing files in: ${process.cwd()}${colors.reset}\n`);

  const startTime = Date.now();
  const results = processDirectory(process.cwd());
  const endTime = Date.now();

  console.log(`\n${colors.cyan}${colors.bright}📊 Header Comment Generation Report${colors.reset}`);
  console.log('================================================================================');
  console.log(`📈 ${colors.bright}STATISTICS:${colors.reset}`);
  console.log(`   Files Processed: ${colors.green}${results.processed}${colors.reset}`);
  console.log(`   Files Skipped: ${colors.yellow}${results.skipped}${colors.reset}`);
  console.log(`   Errors: ${colors.red}${results.errors}${colors.reset}`);
  console.log(`   Processing Time: ${colors.blue}${endTime - startTime}ms${colors.reset}`);
  console.log('================================================================================');

  if (results.processed > 0) {
    console.log(`${colors.green}🎉 SUCCESS: Added header comments to ${results.processed} files!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}ℹ️  All supported files already have header comments.${colors.reset}`);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  addHeaderComment,
  processDirectory,
  hasHeaderComment,
  generateHeaderComment
};
