/**
 * aiService.ts - AI/LLM Integration Service
 * 
 * Purpose: Core AI service for narrative generation, character development, and game logic
 * Location: src/services/aiService.ts
 * 
 * Key Features:
 * - Dynamic narrative generation using advanced language models
 * - Historical fact-checking and context validation  
 * - Character personality and behavior modeling
 * - Dynamic world state management
 * - Performance metrics and error handling
 * 
 * Referenced by: 
 * - src/app/game/play.tsx (main game loop)
 * - src/app/game/setup.tsx (character creation)
 * - src/app/game/lore.tsx (world building)
 * - src/components/UltraDebugPanel.tsx (debugging)
 * 
 * References:
 * - src/types/game.ts (GameState, GameChoice, GameSegment types)
 * - src/types/global.d.ts (ChronicleDebugState, ApiCompletion types)
 * - src/store/gameStore.ts (game state management)
 * - src/services/firebaseUtils.ts (cloud function calls)
 * 
 * Last updated: 2025-06-24
 */

import { GameState, GameChoice, GameSegment, InventoryItem, PoliticalFaction, LoreEntry, Memory, GameSetupState, PerformanceMetrics } from "../types/game";
import { ChronicleDebugState, ApiCompletion } from "../types/global.d";
import { useGameStore } from "../store/gameStore";
import { fetchFromFirebaseFunction, auth } from "./firebaseUtils";
import { getAuth } from "firebase/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Content Part Type
 * 
 * Defines the structure for AI message content.
 * Supports both text and image inputs for rich interactions.
 */
type ContentPart =
  | { type: 'text'; text: string; }      // Text-based content
  | { type: 'image'; image: string };    // Image-based content (base64 or URL)

/**
 * Core Message Type
 * 
 * Represents the conversation structure for AI interactions.
 * Follows standard chat completion format with role-based messaging.
 */
type CoreMessage =
  | { role: 'system'; content: string; }                    // System instructions and context
  | { role: 'user'; content: string | Array<ContentPart>; } // User input (text or multimodal)
  | { role: 'assistant'; content: string | Array<ContentPart>; }; // AI responses

// === GLOBAL TYPE DECLARATIONS ===

/**
 * Global Debug Interface
 * 
 * Extends the global object to include Chronicle Weaver debug state.
 * Used for development monitoring and API call tracking.
 */
interface GlobalWithDebug {
  __CHRONICLE_DEBUG__?: ChronicleDebugState;
}

/**
 * Global Type Augmentation
 * 
 * Extends standard global interfaces with Chronicle Weaver specific functionality.
 * Provides enhanced Headers API and debug state access.
 */
declare global {
  interface Headers {
    entries(): IterableIterator<[string, string]>;          // Headers iteration
    forEach(callback: (value: string, key: string) => void): void; // Headers traversal
  }

  var __CHRONICLE_DEBUG__: ChronicleDebugState;             // Debug state singleton
}

// === DEBUG CONFIGURATION ===

/**
 * Debug Mode Flag
 * 
 * Controls verbose logging and development features.
 * Set to true during development for enhanced debugging.
 */
let DEBUG_MODE = false;

// === TYPE GUARD FUNCTIONS ===

/**
 * API Completion Type Guard
 * 
 * Validates that an unknown response matches the expected API completion format.
 * Provides type safety for external API responses.
 */
function isApiCompletion(data: unknown): data is ApiCompletion<unknown> {
  return typeof data === 'object' && data !== null && 'completion' in data;
}

/**
 * Error Type Guard
 * 
 * Safely identifies Error objects for proper error handling.
 * Handles both standard Error instances and error-like objects.
 */
function isError(error: unknown): error is Error {
  return error instanceof Error || (typeof error === 'object' && error !== null && 'message' in error);
}

/**
 * Debug State Initializer
 * 
 * Ensures debug state is properly initialized on the global object.
 * Creates singleton debug state for consistent monitoring.
 */
function ensureDebugState(): ChronicleDebugState {
  const g = globalThis as typeof globalThis & GlobalWithDebug;
  if (!g.__CHRONICLE_DEBUG__) {
    g.__CHRONICLE_DEBUG__ = {
      callCount: 0,        // Track number of API calls
      apiCallHistory: []   // Store API call history for debugging
    };
  }
  return g.__CHRONICLE_DEBUG__;
}

// --- Logging utilities ---
function logDebug(message: string, ...optionalParams: any[]) {
  console.debug(message, ...optionalParams);
}

function logError(message: string, ...optionalParams: any[]) {
  console.error(message, ...optionalParams);
}

// Enhanced global debug state for tracking
declare global {
  var __CHRONICLE_DEBUG__: ChronicleDebugState;
}

if (typeof global !== 'undefined') {
  // Ensure global.__CHRONICLE_DEBUG__ is initialized properly
  if (!global.__CHRONICLE_DEBUG__) {
    global.__CHRONICLE_DEBUG__ = {
      callCount: 0,
      apiCallHistory: [],
      performanceMetrics: undefined,
      systemInfo: undefined,
      lastPrompt: undefined,
      lastResponse: undefined,
      lastRawResponse: undefined,
      lastError: undefined,
      lastApiCall: undefined,
    };
  }

  global.__CHRONICLE_DEBUG__ = global.__CHRONICLE_DEBUG__ || {
    callCount: 0,
    apiCallHistory: [],
    performanceMetrics: {
      timestamp: Date.now(),
      memoryUsage: 0,
      renderTime: 0,
      apiLatency: 0,
      frameRate: 0,
      networkStatus: "unknown",
      batteryLevel: 100,
    },
    systemInfo: {
      os: "unknown",
      version: "unknown",
    },
    lastPrompt: "",
    lastResponse: {
      status: 200,
      statusText: "OK",
    },
    lastRawResponse: "",
    lastError: "",
  } as ChronicleDebugState;
}

// Maximum retries for API calls
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // ms

// Helper function to retry API calls
const retryApiCall = async (apiCallFn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
  try {
    return await apiCallFn();
  } catch (error) {
    if (retries > 0) {
      logDebug(`Retrying API call, ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryApiCall(apiCallFn, retries - 1);
    }
    throw error;
  }
};

// Update performance metrics
const updatePerformanceMetrics = (apiLatency?: number) => {
  if (typeof global !== 'undefined' && global.__CHRONICLE_DEBUG__) {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      memoryUsage: Math.floor(Math.random() * 100) + 50, // Mock memory usage
      renderTime: Math.floor(Math.random() * 20) + 5, // Mock render time
      apiLatency: apiLatency || 0,
      frameRate: 60, // Mock frame rate
      networkStatus: "Connected", // Mock network status
      batteryLevel: Math.floor(Math.random() * 100), // Mock battery
      cpuUsage: Math.floor(Math.random() * 50) + 10, // Mock CPU usage
      diskUsage: Math.floor(Math.random() * 80) + 20, // Mock disk usage
      networkLatency: Math.floor(Math.random() * 100) + 10, // Mock network latency
    };

    global.__CHRONICLE_DEBUG__.performanceMetrics = metrics;
  }
};

// Validate AI response structure
const validateAIResponse = (response: any, isInitial = false): boolean => {
  if (!response) return false;

  if (isInitial) {
    // Initial story validation
    if (!response.backstory || typeof response.backstory !== 'string') {
      logError("Missing or invalid backstory in AI response");
      return false;
    }

    if (!response.segment || typeof response.segment !== 'object') {
      logError("Missing or invalid segment in AI response");
      return false;
    }

    if (!response.segment.text || typeof response.segment.text !== 'string') {
      logError("Missing or invalid segment text in AI response");
      return false;
    }

    if (!Array.isArray(response.segment.choices) || response.segment.choices.length === 0) {
      logError("Missing or invalid choices in AI response");
      return false;
    }

    return true;
  } else {
    // Next segment validation
    if (!response.text || typeof response.text !== 'string') {
      logError("Missing or invalid text in AI response");
      return false;
    }

    if (!Array.isArray(response.choices) || response.choices.length === 0) {
      logError("Missing or invalid choices in AI response");
      return false;
    }

    return true;
  }
};

// Clean and parse AI response
const parseAIResponse = (rawResponse: string): any => {
  try {
    // Clean the response to ensure it's valid JSON
    let cleanedCompletion = rawResponse.trim();

    // Remove any markdown code blocks if present
    if (cleanedCompletion.startsWith("```json")) {
      cleanedCompletion = cleanedCompletion.replace(/```json\s*/, "").replace(/```\s*$/, "");
    }
    if (cleanedCompletion.startsWith("```")) {
      cleanedCompletion = cleanedCompletion.replace(/```\s*/, "").replace(/```\s*$/, "");
    }

    // Remove any leading/trailing text that isn't JSON
    const jsonStart = cleanedCompletion.indexOf('{');
    const jsonEnd = cleanedCompletion.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedCompletion = cleanedCompletion.substring(jsonStart, jsonEnd + 1);
    }

    logDebug("Attempting to parse JSON...");
    const parsedResponse = JSON.parse(cleanedCompletion);
    logDebug("JSON parsed successfully");
    return parsedResponse;
  } catch (error) {
    logError("Failed to parse AI response:", error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export async function processKronosMessage(gameState: GameState, message: string): Promise<string> {
  try {
    logDebug("Processing Kronos message:", message);

    const systemPrompt = `You are Kronos, the Weaver of Chronicles, the AI storyteller managing an interactive chronicle in Chronicle Weaver. The player is communicating directly with you to request changes, improvements, or clarifications about their story world.

Current Chronicle Context:
- Era: ${gameState.era}
- Theme: ${gameState.theme}
- Character: ${gameState.character.name}
- Turn: ${gameState.turnCount}

The player may ask you to:
- Add more detail to specific aspects (politics, economics, war, relationships)
- Modify how certain systems work
- Explain story elements
- Request specific additions to the world

Respond as Kronos in a helpful, knowledgeable way. Acknowledge their request and explain how you will implement it in their chronicle. Keep responses concise but informative.`;

    const messages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];

    logDebug("Sending Kronos message to API...");

    // Use retry logic for API call
    const response = await retryApiCall(async () => {
      // Route through secure Firebase Function
      return await processAIRequest({ messages });
    });

    const data = await response.json();
    logDebug("Kronos response received");

    return data.completion || "I apologize, but I am having trouble responding right now. Please try again later.";
  } catch (error) {
    logError("Error processing Kronos message:", error);
    // Re-throw the error to be handled by the UI layer
    throw new Error(`Failed to process message to Kronos: ${isError(error) ? error.message : 'Unknown error'}`);
  }
}

// Add safe access for global.__CHRONICLE_DEBUG__
function updateDebugState(update: Partial<ChronicleDebugState>) {
  if (global.__CHRONICLE_DEBUG__) {
    Object.assign(global.__CHRONICLE_DEBUG__, update);
  }
}

// Example usage
updateDebugState({ callCount: (global.__CHRONICLE_DEBUG__?.callCount || 0) + 1 });

// Initialize worldSystems where used
const worldSystems = {
  politics: [],
  economics: {
    currency: "",
    marketPrices: {},
    tradeRoutes: []
  },
  initialInventory: []
};

async function enforceTurnLimit() {
  const { currentGame, userType } = useGameStore.getState();

  if (!currentGame) {
    throw new Error("No active game found.");
  }

  const turnLimit = userType === "free" ? 50 : 10000;

  if (currentGame.turnCount >= turnLimit) {
    throw new Error(`Turn limit reached for ${userType} user.`);
  }
}

async function processAIRequest(requestPayload: any) {
  try {
    // Check if user is authenticated
    const authInstance = getAuth();
    const user = authInstance.currentUser;

    if (!user) {
      console.log("User not authenticated, redirecting to sign-in...");
      // Store the current path to redirect back after sign-in
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('returnUrl', window.location.pathname);
        // Show sign-in modal or redirect to sign-in page
        const signInEvent = new CustomEvent('show-sign-in');
        window.dispatchEvent(signInEvent);
      }
      throw new Error("Please sign in to continue.");
    }

    await enforceTurnLimit();

    // Add user ID to the request payload
    const payloadWithUser = {
      ...requestPayload,
      metadata: {
        ...requestPayload.metadata,
        userId: user.uid,
        timestamp: new Date().toISOString()
      }
    };

    console.log("Processing AI request with payload:", payloadWithUser);

    // Route AI request through Firebase Functions
    const response = await fetchFromFirebaseFunction("processAIRequest", payloadWithUser);

    return response;
  } catch (error) {
    console.error("Error in processAIRequest:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("not authenticated")) {
        // Trigger sign-in flow if in browser environment
        if (typeof window !== 'undefined') {
          const signInEvent = new CustomEvent('show-sign-in');
          window.dispatchEvent(signInEvent);
        }
      }

      // Rethrow with user-friendly message
      throw new Error(`Failed to process request: ${error.message}`);
    }

    throw new Error("An unknown error occurred while processing your request.");
  }
}

export async function generateInitialStory(gameState: GameState, gameSetup: GameSetupState): Promise<{ backstory: string, firstSegment: GameSegment }> {
  const startTime = Date.now();

  try {
    // Check for Gemini API Key
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    const systemPrompt = `You are the Weaver, an AI storyteller for the text-based RPG 'Chronicle Weaver'.
Your goal is to create an immersive, interactive historical fiction experience.
The player has just created a character. You must generate a backstory and the first segment of their journey.

Game Context:
- Era: ${gameSetup.era}
- Theme: ${gameSetup.theme}
- Character Name: ${gameSetup.characterName}
- Character Archetype: ${gameSetup.characterArchetype || "Adventurer"}
- Difficulty: ${gameSetup.difficulty}

Output Format:
You must respond with a VALID JSON object. Do not include any markdown formatting like \`\`\`json.
The JSON object must have this exact structure:
{
  "backstory": "A compelling 2-3 paragraph backstory for the character, establishing their place in the world.",
  "segment": {
    "text": "The first narrative segment of the game (2-3 paragraphs). Set the scene, introduce the immediate conflict or situation.",
    "choices": [
      { "id": "1", "text": "Choice 1 description", "type": "action" },
      { "id": "2", "text": "Choice 2 description", "type": "diplomacy" },
      { "id": "3", "text": "Choice 3 description", "type": "stealth" }
    ]
  }
}

Ensure the tone matches the '${gameSetup.theme}' theme.
The choices should be meaningful and distinct.`;

    const userPrompt = `Create a new chronicle for a character named ${gameSetup.characterName} in the ${gameSetup.era} era.`;

    let response;

    if (apiKey) {
      logDebug("Using Gemini API for initial story generation");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
      const text = result.response.text();
      response = parseAIResponse(text);
    } else {
      logDebug("Using Firebase Function for initial story generation");
      const messages: CoreMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      const apiResponse = await retryApiCall(async () => {
        return await processAIRequest({ messages });
      });

      response = await apiResponse.json();
      if (response.completion) {
        response = parseAIResponse(response.completion);
      }
    }

    if (!validateAIResponse(response, true)) {
      throw new Error("Invalid AI response format");
    }

    updatePerformanceMetrics(Date.now() - startTime);

    return {
      backstory: response.backstory,
      firstSegment: {
        id: "segment_1",
        text: response.segment.text,
        choices: response.segment.choices,
        consequences: [],
        isEnding: false
      }
    };

  } catch (error) {
    logError("Error generating initial story:", error);
    throw error;
  }
}

export async function generateNextSegment(gameState: GameState, selectedChoice: GameChoice): Promise<GameSegment> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    const systemPrompt = `You are the Weaver, continuing the chronicle of ${gameState.character.name}.
  
Current Context:
- Era: ${gameState.era}
- Turn: ${gameState.turnCount}
- Health: ${gameState.character.stats.health}
- Wealth: ${gameState.character.stats.resources}

Previous Segment:
${gameState.pastSegments.length > 0 ? gameState.pastSegments[gameState.pastSegments.length - 1].text : "N/A"}

Player Choice:
${selectedChoice.text}

Output Format:
You must respond with a VALID JSON object. Do not include any markdown formatting.
Structure:
{
  "text": "The next narrative segment (2-3 paragraphs). Describe the consequences of the player's choice and the new situation.",
  "choices": [
    { "id": "1", "text": "Choice 1", "type": "action" },
    { "id": "2", "text": "Choice 2", "type": "diplomacy" },
    { "id": "3", "text": "Choice 3", "type": "stealth" }
  ],
  "isEnding": false // Set to true if the character dies or achieves a major victory
}
`;

    const userPrompt = `Continue the story based on the choice: ${selectedChoice.text}`;

    let response;

    if (apiKey) {
      logDebug("Using Gemini API for next segment generation");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
      const text = result.response.text();
      response = parseAIResponse(text);
    } else {
      logDebug("Using Firebase Function for next segment generation");
      const messages: CoreMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      const apiResponse = await retryApiCall(async () => {
        return await processAIRequest({ messages });
      });

      response = await apiResponse.json();
      if (response.completion) {
        response = parseAIResponse(response.completion);
      }
    }

    if (!validateAIResponse(response, false)) {
      throw new Error("Invalid AI response format");
    }

    updatePerformanceMetrics(Date.now() - startTime);

    return {
      id: `segment_${gameState.turnCount + 1}`,
      text: response.text,
      choices: response.choices,
      consequences: [],
      isEnding: response.isEnding || false
    };

  } catch (error) {
    logError("Error generating next segment:", error);
    throw error;
  }
}