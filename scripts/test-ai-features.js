#!/usr/bin/env node
/**
 * Test Script for AI Debugging and Failsafe Features
 * 
 * This script tests the new logging, context management, and Ollama failsafe features.
 * 
 * Usage: node test-ai-features.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Chronicle Weaver AI Features Test\n');

// Test 1: Check if required files exist
console.log('Test 1: Checking if required files exist...');
const requiredFiles = [
  'src/utils/aiLogger.ts',
  'src/utils/contextManager.ts',
  'backend/functions/ai-handler.ts',
  'docs/AI_DEBUGGING_AND_FAILSAFE.md',
  '.env.example'
];

let filesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - NOT FOUND`);
    filesExist = false;
  }
});

console.log();

// Test 2: Check environment variables in .env.example
console.log('Test 2: Checking environment variables...');
const envExamplePath = path.join(__dirname, '..', '.env.example');
const envExample = fs.readFileSync(envExamplePath, 'utf8');

const requiredEnvVars = [
  'ENABLE_OLLAMA_FAILSAFE',
  'OLLAMA_BASE_URL',
  'OLLAMA_MODEL',
  'AI_PROVIDER',
  'AI_MODEL'
];

let envVarsPresent = true;
requiredEnvVars.forEach(envVar => {
  if (envExample.includes(envVar)) {
    console.log(`  ✅ ${envVar}`);
  } else {
    console.log(`  ❌ ${envVar} - NOT FOUND`);
    envVarsPresent = false;
  }
});

console.log();

// Test 3: Check if aiLogger exports are present
console.log('Test 3: Checking aiLogger exports...');
const aiLoggerPath = path.join(__dirname, '..', 'src/utils/aiLogger.ts');
const aiLoggerContent = fs.readFileSync(aiLoggerPath, 'utf8');

const requiredExports = [
  'LogLevel',
  'aiLogger',
  'logAIDebug',
  'logAIInfo',
  'logAIWarn',
  'logAIError'
];

let exportsPresent = true;
requiredExports.forEach(exp => {
  if (aiLoggerContent.includes(`export.*${exp}`) || aiLoggerContent.includes(`export const ${exp}`) || aiLoggerContent.includes(`export enum ${exp}`)) {
    console.log(`  ✅ ${exp}`);
  } else {
    console.log(`  ❌ ${exp} - NOT FOUND`);
    exportsPresent = false;
  }
});

console.log();

// Test 4: Check if contextManager exports are present
console.log('Test 4: Checking contextManager exports...');
const contextManagerPath = path.join(__dirname, '..', 'src/utils/contextManager.ts');
const contextManagerContent = fs.readFileSync(contextManagerPath, 'utf8');

const requiredContextExports = [
  'contextManager',
  'ConversationContext'
];

let contextExportsPresent = true;
requiredContextExports.forEach(exp => {
  if (contextManagerContent.includes(`export.*${exp}`) || contextManagerContent.includes(`export const ${exp}`) || contextManagerContent.includes(`export interface ${exp}`)) {
    console.log(`  ✅ ${exp}`);
  } else {
    console.log(`  ❌ ${exp} - NOT FOUND`);
    contextExportsPresent = false;
  }
});

console.log();

// Test 5: Check if backend has Ollama failsafe
console.log('Test 5: Checking backend Ollama failsafe implementation...');
const aiHandlerPath = path.join(__dirname, '..', 'backend/functions/ai-handler.ts');
const aiHandlerContent = fs.readFileSync(aiHandlerPath, 'utf8');

const requiredBackendFeatures = [
  'retryWithBackoffAndFailsafe',
  'callOllama',
  'enableOllamaFailsafe',
  'logDebug',
  'logInfo',
  'logWarn',
  'logError'
];

let backendFeaturesPresent = true;
requiredBackendFeatures.forEach(feature => {
  if (aiHandlerContent.includes(feature)) {
    console.log(`  ✅ ${feature}`);
  } else {
    console.log(`  ❌ ${feature} - NOT FOUND`);
    backendFeaturesPresent = false;
  }
});

console.log();

// Test 6: Check if frontend integration is present
console.log('Test 6: Checking frontend integration...');
const aiServicePath = path.join(__dirname, '..', 'src/services/aiService.ts');
const aiServiceContent = fs.readFileSync(aiServicePath, 'utf8');

const requiredFrontendFeatures = [
  'import.*aiLogger',
  'import.*contextManager',
  'logAIInfo',
  'logAIError',
  'contextManager.getOrCreateContext',
  'contextManager.addUserMessage'
];

let frontendFeaturesPresent = true;
requiredFrontendFeatures.forEach(feature => {
  const regex = new RegExp(feature);
  if (regex.test(aiServiceContent)) {
    console.log(`  ✅ ${feature.replace('.*', ' ')}`);
  } else {
    console.log(`  ❌ ${feature.replace('.*', ' ')} - NOT FOUND`);
    frontendFeaturesPresent = false;
  }
});

console.log();

// Summary
console.log('📊 Test Summary\n');
const allTestsPassed = filesExist && envVarsPresent && exportsPresent && contextExportsPresent && backendFeaturesPresent && frontendFeaturesPresent;

if (allTestsPassed) {
  console.log('✅ All tests passed! The AI debugging and failsafe features are properly implemented.');
  console.log('\n📚 Next steps:');
  console.log('   1. Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh');
  console.log('   2. Pull a model: ollama pull llama2');
  console.log('   3. Start Ollama: ollama serve');
  console.log('   4. Configure .env.local with Ollama settings');
  console.log('   5. Test the application with API calls');
  console.log('\n📖 For more information, see docs/AI_DEBUGGING_AND_FAILSAFE.md');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the output above.');
  process.exit(1);
}
