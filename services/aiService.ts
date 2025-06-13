import { GameState, GameChoice, GameSegment, InventoryItem, PoliticalFaction, LoreEntry, Memory, GameSetupState, PerformanceMetrics } from "@/types/game";
import { ChronicleDebugState, ApiCompletion } from "@/types/global";
import { useGameStore } from "@/store/gameStore";

type ContentPart = 
  | { type: 'text'; text: string; }
  | { type: 'image'; image: string };

type CoreMessage = 
  | { role: 'system'; content: string; }  
  | { role: 'user'; content: string | Array<ContentPart>; }
  | { role: 'assistant'; content: string | Array<ContentPart>; };

// --- Global type declarations ---
interface GlobalWithDebug {
  __CHRONICLE_DEBUG__?: ChronicleDebugState;
}

declare global {
  interface Headers {
    entries(): IterableIterator<[string, string]>;
    forEach(callback: (value: string, key: string) => void): void;
  }
  
  var __CHRONICLE_DEBUG__: ChronicleDebugState;
}

// --- Debug state configuration ---
let DEBUG_MODE = false;

// --- Type guards ---
function isApiCompletion(data: unknown): data is ApiCompletion<unknown> {
  return typeof data === 'object' && data !== null && 'completion' in data;
}

function isError(error: unknown): error is Error {
  return error instanceof Error || (typeof error === 'object' && error !== null && 'message' in error);
}

function ensureDebugState(): ChronicleDebugState {
  const g = globalThis as typeof globalThis & GlobalWithDebug;
  if (!g.__CHRONICLE_DEBUG__) {
    g.__CHRONICLE_DEBUG__ = {
      callCount: 0,
      apiCallHistory: []
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

    // Use retry logic for API call
    const response = await retryApiCall(async () => {
      const res = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        logError("API error response:", errorText);
        throw new Error(`API request failed: ${res.status} ${res.statusText} - ${errorText}`);
      }
      
      return res;
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
      
      // Provide a comprehensive fallback for debugging
      logDebug("Providing enhanced fallback response for debugging");
      return {
        backstory: `${gameState.character.name} emerges from the complex tapestry of ${gameState.era}, a figure shaped by the tumultuous forces of their time. Born into a world where ${gameState.theme} defines the very essence of existence, they have learned to navigate the intricate web of politics, economics, and social dynamics that characterize this pivotal period in history.

Through years of experience and careful observation, ${gameState.character.name} has developed a keen understanding of how power flows through the corridors of influence in their world. They have witnessed the rise and fall of leaders, the ebb and flow of economic fortunes, and the constant struggle between tradition and progress that defines their era.

Their journey has been marked by both triumph and adversity, each experience adding another layer to their complex character. The theme of ${gameState.theme} has been a constant companion, influencing their decisions and shaping their worldview in ways both subtle and profound.

Now, standing at this crucial juncture in their life, ${gameState.character.name} finds themselves uniquely positioned to influence the course of events. Their background has prepared them for the challenges ahead, and their understanding of the world's complexities gives them an advantage that few others possess.

The choices they make in the coming days will not only determine their own fate but may well influence the broader currents of history itself. The stage is set, the players are in position, and the chronicle of ${gameState.character.name} is about to begin in earnest.`,
        firstSegment: {
          id: "segment-1",
          text: `The year unfolds within the era of ${gameState.era}, and you are ${gameState.character.name}, standing at the crossroads of destiny. The world around you pulses with the energy of ${gameState.theme}, a force that shapes every decision and colors every interaction in this complex tapestry of human experience.

The morning sun casts long shadows across the landscape as you find yourself in a position of significant consequence. The air is thick with possibility and tension, as the political undercurrents of your time swirl around you like invisible currents in a vast ocean. You can feel the weight of history pressing down upon your shoulders, yet also sense the opportunity to shape the future through your actions.

Around you, the economic systems of your era function with their own rhythm and logic. Merchants hawk their wares, coins change hands, and the great machinery of commerce continues its eternal dance. You understand that wealth and resources are tools of power, and that your financial decisions will ripple outward to affect not just your own circumstances, but the broader community in which you live.

The social fabric of your world is complex and nuanced, woven from threads of tradition, innovation, conflict, and cooperation. You recognize the faces of those who hold power, those who seek it, and those who are content to live their lives in the shadows of greater events. Your reputation precedes you in some circles, while in others you remain an unknown quantity, full of potential for both great achievement and spectacular failure.

As you contemplate your next move, you realize that this moment represents a crucial juncture in your personal chronicle. The choices you make here will set in motion a chain of events that will define not only your immediate future, but potentially the legacy you leave behind. The theme of ${gameState.theme} resonates through every option before you, reminding you that your actions carry weight far beyond their immediate consequences.

The world watches and waits, ready to respond to your decisions with all the complexity and unpredictability that defines this remarkable period in history. Your chronicle begins now, with this single moment of choice that will echo through time.

What path will you choose to begin this new chapter of your chronicle?`,
          choices: [
            { id: "1", text: "Seek out the local centers of power and attempt to establish yourself within existing political structures" },
            { id: "2", text: "Focus on building economic relationships and establishing a network of trade connections" },
            { id: "3", text: "Take time to observe and gather information before making any significant commitments" }
          ],
          customChoiceEnabled: true
        }
      };
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
    
    // Provide a comprehensive fallback response for debugging
    logDebug("Providing comprehensive fallback response for debugging");
    return {
      backstory: `${gameState.character.name} emerges from the complex tapestry of ${gameState.era}, a figure shaped by the tumultuous forces of their time. Born into a world where ${gameState.theme} defines the very essence of existence, they have learned to navigate the intricate web of politics, economics, and social dynamics that characterize this pivotal period in history.

Through years of experience and careful observation, ${gameState.character.name} has developed a keen understanding of how power flows through the corridors of influence in their world. They have witnessed the rise and fall of leaders, the ebb and flow of economic fortunes, and the constant struggle between tradition and progress that defines their era.

Their journey has been marked by both triumph and adversity, each experience adding another layer to their complex character. The theme of ${gameState.theme} has been a constant companion, influencing their decisions and shaping their worldview in ways both subtle and profound.

Now, standing at this crucial juncture in their life, ${gameState.character.name} finds themselves uniquely positioned to influence the course of events. Their background has prepared them for the challenges ahead, and their understanding of the world's complexities gives them an advantage that few others possess.

The choices they make in the coming days will not only determine their own fate but may well influence the broader currents of history itself. The stage is set, the players are in position, and the chronicle of ${gameState.character.name} is about to begin in earnest.`,
      firstSegment: {
        id: "segment-1",
        text: `The year unfolds within the era of ${gameState.era}, and you are ${gameState.character.name}, standing at the crossroads of destiny. The world around you pulses with the energy of ${gameState.theme}, a force that shapes every decision and colors every interaction in this complex tapestry of human experience.

The morning sun casts long shadows across the landscape as you find yourself in a position of significant consequence. The air is thick with possibility and tension, as the political undercurrents of your time swirl around you like invisible currents in a vast ocean. You can feel the weight of history pressing down upon your shoulders, yet also sense the opportunity to shape the future through your actions.

Around you, the economic systems of your era function with their own rhythm and logic. Merchants hawk their wares, coins change hands, and the great machinery of commerce continues its eternal dance. You understand that wealth and resources are tools of power, and that your financial decisions will ripple outward to affect not just your own circumstances, but the broader community in which you live.

The social fabric of your world is complex and nuanced, woven from threads of tradition, innovation, conflict, and cooperation. You recognize the faces of those who hold power, those who seek it, and those who are content to live their lives in the shadows of greater events. Your reputation precedes you in some circles, while in others you remain an unknown quantity, full of potential for both great achievement and spectacular failure.

As you contemplate your next move, you realize that this moment represents a crucial juncture in your personal chronicle. The choices you make here will set in motion a chain of events that will define not only your immediate future, but potentially the legacy you leave behind. The theme of ${gameState.theme} resonates through every option before you, reminding you that your actions carry weight far beyond their immediate consequences.

The world watches and waits, ready to respond to your decisions with all the complexity and unpredictability that defines this remarkable period in history. Your chronicle begins now, with this single moment of choice that will echo through time.

What path will you choose to begin this new chapter of your chronicle?`,
        choices: [
          { id: "1", text: "Seek out the local centers of power and attempt to establish yourself within existing political structures" },
          { id: "2", text: "Focus on building economic relationships and establishing a network of trade connections" },
          { id: "3", text: "Take time to observe and gather information before making any significant commitments" }
        ],
        customChoiceEnabled: true
      }
    };
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

    // Use retry logic for API call
    const response = await retryApiCall(async () => {
      const res = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        logError("API error response:", errorText);
        throw new Error(`API request failed: ${res.status} ${res.statusText} - ${errorText}`);
      }
      
      return res;
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
      
      // Provide fallback for development
      logDebug("Providing fallback next segment for development");
      return {
        id: `segment-${turnCount + 1}`,
        text: `Following your choice to "${selectedChoice.text}", the story continues to unfold in ${gameState.era}. 

The consequences of your decision begin to manifest as the world around you responds to your actions. The theme of ${gameState.theme} becomes more apparent as you navigate the complexities of this historical period, and you find yourself facing new challenges that test your resolve and wisdom.

Your choice has set in motion a series of events that ripple through the political, economic, and social systems of your world. You can feel the weight of these changes as they begin to take shape, affecting not only your immediate circumstances but also your long-term prospects in this complex environment.

As you observe the results of your actions, you realize that each decision in this world carries significant weight. The path forward requires careful consideration of your goals, your resources, and the potential consequences of your next move. The theme of ${gameState.theme} continues to influence every aspect of your journey.

The world around you continues to evolve and respond to your presence, creating new opportunities and challenges that will shape the next chapter of your chronicle. Your reputation and relationships are beginning to form, and the choices you make now will have lasting impacts on your future.

What will you do next as this chronicle continues to unfold around you?`,
        choices: [
          { id: "1", text: "Take a cautious approach to the new situation and gather more information" },
          { id: "2", text: "Act boldly to seize the opportunities that have emerged" },
          { id: "3", text: "Seek allies and build relationships to strengthen your position" }
        ],
        customChoiceEnabled: true
      };
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
    
    // Provide fallback for development
    logDebug("Providing fallback next segment for development");
    return {
      id: `segment-${gameState.turnCount + 1}`,
      text: `Following your choice to "${selectedChoice.text}", the story continues to unfold in ${gameState.era}. 

The consequences of your decision begin to manifest as the world around you responds to your actions. The theme of ${gameState.theme} becomes more apparent as you navigate the complexities of this historical period, and you find yourself facing new challenges that test your resolve and wisdom.

Your choice has set in motion a series of events that ripple through the political, economic, and social systems of your world. You can feel the weight of these changes as they begin to take shape, affecting not only your immediate circumstances but also your long-term prospects in this complex environment.

As you observe the results of your actions, you realize that each decision in this world carries significant weight. The path forward requires careful consideration of your goals, your resources, and the potential consequences of your next move. The theme of ${gameState.theme} continues to influence every aspect of your journey.

The world around you continues to evolve and respond to your presence, creating new opportunities and challenges that will shape the next chapter of your chronicle. Your reputation and relationships are beginning to form, and the choices you make now will have lasting impacts on your future.

What will you do next as this chronicle continues to unfold around you?`,
      choices: [
        { id: "1", text: "Take a cautious approach to the new situation and gather more information" },
        { id: "2", text: "Act boldly to seize the opportunities that have emerged" },
        { id: "3", text: "Seek allies and build relationships to strengthen your position" }
      ],
      customChoiceEnabled: true
    };
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
      const res = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        logError("API error response:", errorText);
        throw new Error(`API request failed: ${res.status} ${res.statusText} - ${errorText}`);
      }
      
      return res;
    });

    const data = await response.json();
    logDebug("Kronos response received");
    
    return data.completion || "I apologize, but I am having trouble responding right now. Please try again later.";
  } catch (error) {
    logError("Error processing Kronos message:", error);
    return "I apologize, but I am having trouble responding right now. Please try again later.";
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

    // Proceed with AI request logic
    console.log("Processing AI request with payload:", requestPayload);

    // ...existing AI request logic...
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error processing AI request:", error.message);
    } else {
      console.error("Unknown error occurred during AI request processing:", error);
    }
    throw error;
  }
}