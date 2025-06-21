/**
 * AI Service - Narrative Generation and Game Logic for Chronicle Weaver
 * 
 * This service handles all AI-powered features of Chronicle Weaver:
 * - Dynamic narrative generation based on player choices
 * - Character backstory creation
 * - World building and lore generation
 * - Consequence calculation and story branching
 * - Integration with external AI APIs
 * 
 * Key Features:
 * - Type-safe API communication with validation
 * - Debug mode for development and testing
 * - Error handling and fallback mechanisms
 * - Performance metrics and monitoring
 * - Historical accuracy and context awareness
 * 
 * Architecture:
 * - Uses Firebase Functions for scalable AI processing
 * - Implements retry logic for API reliability
 * - Maintains conversation context for coherent narratives
 * - Provides both synchronous and asynchronous operations
 * 
 * AI Models:
 * - Narrative generation using advanced language models
 * - Historical fact-checking and context validation
 * - Character personality and behavior modeling
 * - Dynamic world state management
 */

import { GameState, GameChoice, GameSegment, InventoryItem, PoliticalFaction, LoreEntry, Memory, GameSetupState, PerformanceMetrics } from "@/types/game";
import { ChronicleDebugState, ApiCompletion } from "@/types/global";
import { useGameStore } from "@/store/gameStore";
import { fetchFromFirebaseFunction } from "@/services/firebaseUtils";

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

export async function generateInitialStory(gameState: GameState, gameSetup: GameSetupState): Promise<{ backstory: string, firstSegment: GameSegment }> {
  const startTime = Date.now();
  
  try {
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.callCount++;
    }
    
    logDebug("Starting initial story generation");
    logDebug("Game state:", {
      era: gameState.era,
      theme: gameState.theme,
      characterName: gameState.character.name,
      difficulty: gameState.difficulty
    });

    const { era, theme, difficulty, character } = gameState;

    // Adjust the prompt based on the difficulty setting
    const realismLevel = difficulty <= 0.2 ? "hyper-realistic" : 
                         difficulty <= 0.4 ? "historically accurate" :
                         difficulty <= 0.6 ? "balanced" : 
                         difficulty <= 0.8 ? "dramatic" : "pure fantasy";

    const systemPrompt = `You are Kronos, the Weaver of Chronicles - an expert AI storyteller specializing in immersive interactive fiction with deep world-building systems for Chronicle Weaver.

Your writing style should be:
- Vivid and atmospheric with rich sensory details
- Engaging and accessible to modern readers
- Character-driven with meaningful choices
- Integrated with living world systems (politics, economics, war, relationships)
- Written in a literary style befitting historical chronicles

Realism Level: ${realismLevel}
${difficulty <= 0.3 ? "- Strictly adhere to realistic elements and documented facts" : 
  difficulty <= 0.7 ? "- Balance realism with engaging narrative elements" : 
  "- Prioritize narrative excitement, allowing creative liberties and fantastical elements"}

CRITICAL REQUIREMENTS:
1. ALWAYS respond with ONLY valid JSON - no markdown, no extra text, no code blocks
2. The opening segment MUST be substantial (6-8 full paragraphs minimum)
3. Include exactly 3 meaningful choices that advance the story
4. Create an engaging hook that immediately draws the reader in
5. The narrative must be complete and ready to display
6. Ensure the backstory is rich and detailed (4-5 paragraphs minimum)

World Systems Integration:
- Introduce political factions, economic systems, and social structures naturally
- Create opportunities for inventory acquisition and character development
- Establish relationships and reputation systems
- Set up potential conflicts and alliances`;

    const userPrompt = `Create a compelling backstory and opening segment for an interactive chronicle in Chronicle Weaver:

**Setting:** ${era}
**Theme:** ${theme}
**Character:** ${character.name}
**Tone:** ${realismLevel}
**Generate Backstory:** ${gameSetup.generateBackstory}

${gameSetup.generateBackstory ? 
  `First, write a rich backstory for ${character.name} (4-5 substantial paragraphs) that establishes:
- Their background and position in this setting
- Their motivations and goals
- How they fit into the world context
- Their connection to the theme: ${theme}
- Initial relationships and reputation
- Their skills and knowledge relevant to the era` :
  `Create a brief backstory (2-3 paragraphs) that introduces ${character.name} in the context of ${era}.`}

Then, write an engaging opening segment that:
- Is substantial narrative text (6-8 full paragraphs minimum - this is CRITICAL)
- Immediately immerses the reader in the setting with vivid details
- Introduces a compelling situation or conflict
- Shows the character in action or facing a decision
- Establishes world systems (politics, economics, social structures)
- Ends with exactly 3 meaningful choices that reflect the theme
- Creates opportunities for inventory, relationships, and world interaction
- Uses rich, literary language appropriate for a historical chronicle

CRITICAL: The opening segment must be substantial narrative text (6-8 full paragraphs) that sets the scene and creates an engaging story moment. Do not summarize - write the full scene with rich detail.

Respond with ONLY this JSON structure (no markdown, no code blocks):
{
  "backstory": "Character backstory here (4-5 substantial paragraphs)...",
  "segment": {
    "text": "Opening narrative here (6-8 substantial paragraphs)...",
    "choices": [
      {"id": "1", "text": "First choice description"},
      {"id": "2", "text": "Second choice description"},
      {"id": "3", "text": "Third choice description"}
    ]
  }
}`;

    const messages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    logDebug("Sending request to AI API...");
    logDebug("Request payload:", { 
      messagesCount: messages.length,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length
    });

    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastApiCall = {
        timestamp: new Date().toISOString(),
        type: "initial_story",
        messages: messages,
        gameState: gameState,
        gameSetup: gameSetup
      };
      global.__CHRONICLE_DEBUG__.lastPrompt = userPrompt;
      global.__CHRONICLE_DEBUG__.apiCallHistory.push({
        timestamp: new Date().toISOString(),
        type: "initial_story",
        era: gameState.era,
        theme: gameState.theme,
        character: gameState.character.name
      });
    }

    console.log('[aiService] Sending prompt to Firebase Function:', messages);

    // Use retry logic for API call
    const response = await retryApiCall(async () => {
      // Route through secure Firebase Function
      return await processAIRequest({ messages });
    });

    const apiLatency = Date.now() - startTime;
    updatePerformanceMetrics(apiLatency);

    logDebug("Response status:", response.status);

    const data = await response.json();
    logDebug("Raw response received, length:", data.completion?.length || 0);
    
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastResponse = {
        timestamp: new Date().toISOString(),
        type: "initial_story",
        data: data,
        completionLength: data.completion?.length || 0,
        processingTime: apiLatency
      };
      global.__CHRONICLE_DEBUG__.lastRawResponse = data.completion;
    }
    
    if (!data.completion) {
      logError("No completion in response:", data);
      throw new Error("No completion received from API");
    }

    logDebug("Response preview:", data.completion.substring(0, 300) + "...");

    let parsedResponse;
    try {
      parsedResponse = parseAIResponse(data.completion);
      
      // Validate the response structure
      if (!validateAIResponse(parsedResponse, true)) {
        throw new Error("Invalid AI response structure");
      }
      
    } catch (parseError) {
      logError("Failed to parse AI response:", parseError);
      
      if (typeof global !== 'undefined') {
        global.__CHRONICLE_DEBUG__.lastError = {
          timestamp: new Date().toISOString(),
          type: "parse_error",
          error: parseError,
          rawCompletion: data.completion
        };
      }
      
      // Re-throw the error to be handled by the UI layer
      throw new Error(`Failed to parse AI response: ${isError(parseError) ? parseError.message : 'Unknown error'}`);
    }

    // Ensure segment text is substantial
    if (parsedResponse.segment.text.length < 1000) {
      logError("Segment text shorter than expected:", parsedResponse.segment.text.length);
      // Don't throw error, but log warning
    }

    // Ensure backstory is substantial
    if (parsedResponse.backstory.length < 500) {
      logError("Backstory shorter than expected:", parsedResponse.backstory.length);
    }

    logDebug("Validation passed");
    logDebug("Backstory length:", parsedResponse.backstory.length);
    logDebug("Segment text length:", parsedResponse.segment.text.length);
    logDebug("Choices count:", parsedResponse.segment.choices?.length || 0);

    const backstory = parsedResponse.backstory;
    const firstSegment: GameSegment = {
      id: "segment-1",
      text: parsedResponse.segment.text,
      choices: parsedResponse.segment.choices.map((choice: any, index: number) => ({
        id: choice.id || (index + 1).toString(),
        text: choice.text
      })),
      customChoiceEnabled: true
    };

    logDebug("Successfully created first segment");
    logDebug("Final segment text length:", firstSegment.text.length);
    logDebug("Final choices:", firstSegment.choices);

    return { backstory, firstSegment };
  } catch (error) {
    logError("Error in generateInitialStory:", error);
    
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastError = {
        timestamp: new Date().toISOString(),
        type: "generation_error",
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      };
    }
    
    // Re-throw the error to be handled by the UI layer, which can then update the store
    throw new Error(`Failed to generate initial story: ${isError(error) ? error.message : 'Unknown error'}`);
  }
}

export async function generateNextSegment(gameState: GameState, selectedChoice: GameChoice): Promise<GameSegment> {
  const startTime = Date.now();
  
  try {
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.callCount++;
    }
    
    logDebug("Starting next segment generation");
    logDebug("Selected choice:", selectedChoice.text);

    const { era, theme, difficulty, character, pastSegments, turnCount, memories } = gameState;

    // Log the exact prompt being sent for the second turn
    if (turnCount === 2) {
      logDebug("Exact prompt for Turn 2:", {
        era,
        theme,
        difficulty,
        character,
        pastSegments,
        memories,
        worldSystems
      });
    }

    const realismLevel = difficulty <= 0.2 ? "hyper-realistic" : 
                         difficulty <= 0.4 ? "historically accurate" :
                         difficulty <= 0.6 ? "balanced" : 
                         difficulty <= 0.8 ? "dramatic" : "pure fantasy";

    // Create context from recent segments and memories
    const recentSegments = pastSegments.slice(-2); // Last 2 segments
    const recentMemories = memories.slice(0, 3); // Last 3 memories

    const contextSummary = recentSegments.map((segment, index) => 
      `Segment ${pastSegments.length - recentSegments.length + index + 1}: ${segment.text.substring(0, 150)}...`
    ).join("\n\n");

    const memorySummary = recentMemories.map(memory => 
      `${memory.title}: ${memory.description}`
    ).join("\n");

    const systemPrompt = `You are Kronos, the Weaver of Chronicles, continuing an interactive chronicle in Chronicle Weaver. Maintain narrative consistency and character development while advancing the story based on the player's choice.

Setting: ${era}
Theme: ${theme}
Realism Level: ${realismLevel}
Character: ${character.name}

CRITICAL REQUIREMENTS:
1. ALWAYS respond with ONLY valid JSON - no markdown, no extra text, no code blocks
2. The segment MUST be substantial (5-7 full paragraphs minimum)
3. Include exactly 3 meaningful choices that advance the story
4. Show clear consequences of the player's choice
5. The narrative must be complete and engaging
6. Use rich, literary language appropriate for a historical chronicle

Focus on:
- Advancing the narrative meaningfully
- Integrating world systems naturally
- Creating opportunities for character growth
- Maintaining the chosen realism level
- Providing engaging, diverse choices`;

    const userPrompt = `Continue the chronicle based on the player's choice. Here is the context:

**Recent Chronicle Context:**
${contextSummary}

**Recent Memories:**
${memorySummary}

**Player's Choice:** "${selectedChoice.text}"

Write the next segment that:
- Is substantial narrative text (5-7 full paragraphs minimum - this is CRITICAL)
- Shows the immediate consequences of the player's choice
- Advances the plot meaningfully
- Maintains consistency for the ${realismLevel} level
- Develops the character and their relationships
- Integrates world systems (politics, economics, war, inventory)
- Ends with exactly 3 new meaningful choices that advance the story
- Uses rich, literary language befitting a historical chronicle

Respond with ONLY this JSON structure (no markdown, no code blocks):
{
  "text": "Next segment narrative here (5-7 substantial paragraphs)...",
  "choices": [
    {"id": "1", "text": "First choice description"},
    {"id": "2", "text": "Second choice description"},
    {"id": "3", "text": "Third choice description"}
  ]
}`;

    const messages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    logDebug("Sending request for next segment...");

    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastApiCall = {
        timestamp: new Date().toISOString(),
        type: "next_segment",
        messages: messages,
        selectedChoice: selectedChoice
      };
      global.__CHRONICLE_DEBUG__.lastPrompt = userPrompt;
      global.__CHRONICLE_DEBUG__.apiCallHistory.push({
        timestamp: new Date().toISOString(),
        type: "next_segment",
        choice: selectedChoice.text,
        turnCount: turnCount
      });
    }

    console.log('[aiService] Sending prompt to Firebase Function:', messages);

    // Use retry logic for API call
    const response = await retryApiCall(async () => {
      // Route through secure Firebase Function
      return await processAIRequest({ messages });
    });

    const apiLatency = Date.now() - startTime;
    updatePerformanceMetrics(apiLatency);

    logDebug("Next segment response status:", response.status);

    const data = await response.json();
    logDebug("Next segment response received, length:", data.completion?.length || 0);
    
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastResponse = {
        timestamp: new Date().toISOString(),
        type: "next_segment",
        data: data,
        completionLength: data.completion?.length || 0,
        processingTime: apiLatency
      };
      global.__CHRONICLE_DEBUG__.lastRawResponse = data.completion;
    }
    
    if (!data.completion) {
      logError("No completion in response:", data);
      throw new Error("No completion received from API");
    }

    let parsedResponse;
    try {
      parsedResponse = parseAIResponse(data.completion);
      
      // Validate the response structure
      if (!validateAIResponse(parsedResponse, false)) {
        throw new Error("Invalid AI response structure");
      }
      
    } catch (parseError) {
      logError("Failed to parse next segment response:", parseError);
      
      if (typeof global !== 'undefined') {
        global.__CHRONICLE_DEBUG__.lastError = {
          timestamp: new Date().toISOString(),
          type: "parse_error",
          error: parseError,
          rawCompletion: data.completion
        };
      }
      
      // Re-throw the error to be handled by the UI layer
      throw new Error(`Failed to parse next segment response: ${isError(parseError) ? parseError.message : 'Unknown error'}`);
    }

    const nextSegment: GameSegment = {
      id: `segment-${turnCount + 1}`,
      text: parsedResponse.text,
      choices: parsedResponse.choices.map((choice: any, index: number) => ({
        id: choice.id || (index + 1).toString(),
        text: choice.text
      })),
      customChoiceEnabled: true
    };

    logDebug("Next segment created successfully");
    logDebug("Next segment text length:", nextSegment.text.length);

    return nextSegment;
  } catch (error) {
    logError("Error in generateNextSegment:", error);
    
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastError = {
        timestamp: new Date().toISOString(),
        type: "generation_error",
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      };
    }
    
    // Re-throw the error to be handled by the UI layer
    throw new Error(`Failed to generate next segment: ${isError(error) ? error.message : 'Unknown error'}`);
  }
}

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

// Refactor ApiResponse to include timestamp
interface ApiResponse {
  status: number;
  statusText: string;
  completion?: string;
  timestamp?: string;
}

// Ensure proper initialization of global.__CHRONICLE_DEBUG__
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
    await enforceTurnLimit();

    // Route AI request through Firebase Functions
    const response = await fetchFromFirebaseFunction("processAIRequest", requestPayload);

    console.log("Processing AI request with payload:", requestPayload);

    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error processing AI request via Firebase Functions:", error.message);
    } else {
      console.error("Unknown error occurred during AI request processing via Firebase Functions:", error);
    }
    throw error;
  }
}