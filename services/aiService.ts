import type { GameState, GameChoice, GameSegment, InventoryItem, PoliticalFaction, LoreEntry, Memory, GameSetupState } from "@/types/game";

// --- Type definitions ---
type ContentPart = 
  | { type: 'text'; text: string }
  | { type: 'image'; image: string };

type CoreMessage = 
  | { role: 'system'; content: string }  
  | { role: 'user'; content: string | ContentPart[] }
  | { role: 'assistant'; content: string | ContentPart[] };

interface ApiResponse {
  timestamp: string;
  type: string;
  data: unknown;
  completionLength?: number;
}

interface ApiError {
  timestamp: string;
  type: string;
  status?: number;
  statusText?: string;
  errorText?: string;
  error?: unknown;
  stack?: string;
  rawCompletion?: string;
}

interface ApiCall {
  timestamp: string;
  type: string;
  messages?: CoreMessage[];
  gameState?: GameState;
  gameSetup?: GameSetupState;
  selectedChoice?: GameChoice;
  choice?: string;
  turnCount?: number;
  era?: string;
  theme?: string;
  character?: string;
}

interface ApiCompletion<T = unknown> {
  completion?: string;
  data?: T;
  [key: string]: unknown;
}

interface ChronicleDebugState {
  lastApiCall?: ApiCall;
  lastResponse?: ApiResponse;
  lastError?: ApiError;
  callCount: number;
  lastPrompt?: string;
  lastRawResponse?: string;
  apiCallHistory: ApiCall[];
}

interface InitialStoryResponse {
  backstory: string;
  segment: {
    text: string;
    choices: Array<{ id: string; text: string; }>;
  };
  worldSystems: {
    politics: Array<{ name: string; description: string; power: number; playerStanding: number; }>;
    economics: {
      currency: string;
      marketPrices: Record<string, number>;
      tradeRoutes: string[];
    };
    initialInventory: Array<{
      name: string;
      description: string;
      quantity: number;
      value: number;
      category: string;
    }>;
  };
}

interface NextSegmentResponse {
  text: string;
  choices: Array<{ id: string; text: string; }>;
  consequences: {
    statChanges: {
      influence: number;
      knowledge: number;
      resources: number;
      reputation: number;
    };
    newInventory: Array<{
      name: string;
      description: string;
      quantity: number;
      value: number;
      category: string;
    }>;
    politicalChanges: Array<{
      factionName: string;
      standingChange: number;
    }>;
    economicChanges: {
      wealthChange: number;
      newPrices: Record<string, number>;
    };
    newLore: Array<{
      title: string;
      content: string;
      category: string;
    }>;
    newMemories: Array<{
      title: string;
      description: string;
      category: string;
    }>;
  };
}

// --- Global type declarations ---
interface GlobalWithDebug {
  __CHRONICLE_DEBUG__?: ChronicleDebugState;
}

declare global {
  interface Headers {
    entries(): IterableIterator<[string, string]>;
    forEach(callback: (value: string, key: string) => void): void;
  }
  
  var __CHRONICLE_DEBUG__: ChronicleDebugState | undefined;
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
function _logDebug(message: string, data?: unknown): void {
  console.log(`[AI SERVICE] ${message}`, data || '');
}

function _logError(message: string, error?: unknown): void {
  console.error(`[AI SERVICE ERROR] ${message}`, error || '');
}

export function logDebug(message: string, data?: unknown): void {
  if (DEBUG_MODE) _logDebug(message, data);
}

export function logError(message: string, error?: unknown): void {
  _logError(message, error);
}

export function setDebugMode(enabled: boolean): void {
  DEBUG_MODE = enabled;
  logDebug('Debug mode set to:', enabled);
}

export function getDebugState(): ChronicleDebugState | null {
  const debug = ensureDebugState();
  return debug ? JSON.parse(JSON.stringify(debug)) : null;
}

export function clearDebugHistory(): void {
  const debug = ensureDebugState();
  debug.lastApiCall = undefined;
  debug.lastResponse = undefined;
  debug.lastError = undefined;
  debug.lastPrompt = undefined;
  debug.lastRawResponse = undefined;
  debug.callCount = 0;
  debug.apiCallHistory = [];
  logDebug('Debug history cleared');
}

export function logApiCall(type: string, payload: unknown): void {
  const debug = ensureDebugState();
  const apiCall: ApiCall = {
    timestamp: new Date().toISOString(),
    type,
    ...(payload as object)
  };
  debug.apiCallHistory.push(apiCall);
  debug.lastApiCall = apiCall;
  logDebug(`[API CALL] ${type}`, payload);
}

// --- Headers helper ---
function safeGetHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  
  // ES2019 compatible Headers handling
  try {
    // Use Headers.entries() which returns an iterator
    const entries = headers.entries();
    for (const entry of entries) {
      const [key, value] = entry;
      result[key] = value;
    }
  } catch (error) {
    // Fallback to forEach for older environments
    try {
      headers.forEach((value, key) => {
        result[key] = value;
      });
    } catch (fallbackError) {
      logError('Failed to process headers', { error, fallbackError });
    }
  }
  
  return result;
}

// --- API request handling ---
async function makeApiRequest<T>(
  messages: CoreMessage[],
  requestType: string,
  maxRetries = 3,
  retryDelay = 1000
): Promise<ApiCompletion<T>> {
  const debugState = ensureDebugState();
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logDebug(`📤 Sending ${requestType} request (attempt ${attempt}/${maxRetries})...`);

      const response = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      const headers = safeGetHeaders(response.headers);
      logDebug(`📥 ${requestType} response status:`, response.status);
      logDebug("Response headers:", headers);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: ApiCompletion<T> = await response.json();
      
      if (!data.completion) {
        throw new Error("No completion received from API");
      }

      debugState.lastResponse = {
        timestamp: new Date().toISOString(),
        type: requestType,
        data,
        completionLength: data.completion.length
      };
      debugState.lastRawResponse = data.completion;

      return data;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      debugState.lastError = {
        timestamp: new Date().toISOString(),
        type: `${requestType}_error`,
        error: lastError,
        stack: lastError.stack
      };

      if (attempt < maxRetries) {
        logDebug(`Retrying ${requestType} request after error:`, lastError);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  throw lastError || new Error(`Failed to complete ${requestType} request after ${maxRetries} attempts`);
}

async function parseApiResponse<T>(completion: string | undefined, type: string): Promise<T> {
  if (!completion) {
    throw new Error(`No completion received from API for ${type}`);
  }
  
  try {
    // Clean the response to ensure it's valid JSON
    let cleanedCompletion = completion.trim();
    
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
    
    logDebug(`🔧 Parsing ${type} JSON...`);
    const parsed = JSON.parse(cleanedCompletion) as T;
    logDebug(`✅ ${type} JSON parsed successfully`);
    return parsed;
  } catch (error) {
    const parseError = error as Error;
    logError(`❌ Failed to parse ${type} response:`, completion);
    throw new Error(`Failed to parse API response: ${parseError.message}`);
  }
}

export async function generateInitialStory(gameState: GameState, gameSetup: GameSetupState): Promise<{ backstory: string, firstSegment: GameSegment }> {
  const debugState = ensureDebugState();
  debugState.callCount++;

  try {
    logDebug("=== 🚀 STARTING INITIAL STORY GENERATION ===");
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
  },
  "worldSystems": {
    "politics": [
      {"name": "Faction Name", "description": "Brief description", "power": 7, "playerStanding": 0}
    ],
    "economics": {
      "currency": "Currency Name",
      "marketPrices": {"item": 10},
      "tradeRoutes": ["Route description"]
    },
    "initialInventory": [
      {"name": "Item Name", "description": "Item description", "quantity": 1, "value": 10, "category": "tool"}
    ]
  }
}`;

    const messages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    logDebug("📤 Sending request to AI API...");
    logDebug("Request payload:", { 
      messagesCount: messages.length,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length
    });

    debugState.lastApiCall = {
      timestamp: new Date().toISOString(),
      type: "initial_story",
      messages,
      gameState,
      gameSetup
    };
    
    debugState.lastPrompt = userPrompt;
    debugState.apiCallHistory.push({
      timestamp: new Date().toISOString(),
      type: "initial_story",
      era: gameState.era,
      theme: gameState.theme,
      character: gameState.character.name
    });

    const response = await makeApiRequest<InitialStoryResponse>(messages, "initial_story");
    logDebug("📖 Response preview:", response.completion?.substring(0, 300) + "...");

    let parsedResponse;
    try {
      parsedResponse = await parseApiResponse<InitialStoryResponse>(response.completion, "initial story");
    } catch (parseError) {
      logError("❌ Failed to parse AI response:", response.completion);
      logError("Parse error:", parseError);
      
      debugState.lastError = {
        timestamp: new Date().toISOString(),
        type: "parse_error",
        error: parseError,
        rawCompletion: response.completion
      };
      
      throw new Error("Failed to parse API response");
    }

    // Validate the response structure
    if (!parsedResponse.backstory || !parsedResponse.segment || !parsedResponse.segment.text) {
      logError("❌ Incomplete response from AI:", parsedResponse);
      throw new Error("Incomplete response from AI - missing backstory or segment text");
    }

    if (!parsedResponse.segment.choices || parsedResponse.segment.choices.length === 0) {
      logError("❌ No choices in AI response:", parsedResponse);
      throw new Error("Incomplete response from AI - missing choices");
    }

    // Ensure segment text is substantial
    if (parsedResponse.segment.text.length < 1000) {
      logError("⚠️ Segment text shorter than expected:", parsedResponse.segment.text.length);
      logError("Actual text:", parsedResponse.segment.text);
      // Don't throw error, but log warning
    }

    // Ensure backstory is substantial
    if (parsedResponse.backstory.length < 500) {
      logError("⚠️ Backstory shorter than expected:", parsedResponse.backstory.length);
    }

    logDebug("✅ Validation passed");
    logDebug("Backstory length:", parsedResponse.backstory.length);
    logDebug("Segment text length:", parsedResponse.segment.text.length);
    logDebug("Choices count:", parsedResponse.segment.choices?.length || 0);

    const backstory = parsedResponse.backstory;
    const firstSegment: GameSegment = {
      id: "segment-1",
      text: parsedResponse.segment.text,
      choices: parsedResponse.segment.choices.map((choice, index) => ({
        id: choice.id || (index + 1).toString(),
        text: choice.text
      })),
      customChoiceEnabled: true
    };

    logDebug("✅ Successfully created first segment");
    logDebug("Final segment text length:", firstSegment.text.length);
    logDebug("Final choices:", firstSegment.choices);
    logDebug("=== ✅ INITIAL STORY GENERATION COMPLETE ===");

    return { backstory, firstSegment };
  } catch (error) {
    logError("❌ Error in generateInitialStory:", error);
    
    debugState.lastError = {
      timestamp: new Date().toISOString(),
      type: "generation_error",
      error,
      stack: error instanceof Error ? error.stack : undefined
    };
    
    throw error;
  }
}

export async function generateNextSegment(gameState: GameState, selectedChoice: GameChoice): Promise<GameSegment> {
  const debugState = ensureDebugState();
  
  try {
    debugState.callCount++;
    
    logDebug("=== 🎯 STARTING NEXT SEGMENT GENERATION ===");
    logDebug("Selected choice:", selectedChoice.text);

    const { era, theme, difficulty, character, pastSegments, turnCount, memories, worldSystems } = gameState;

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

    const worldContext = `
Politics: ${worldSystems.politics.map(f => `${f.name} (Power: ${f.power}, Standing: ${f.playerStanding})`).join(", ")}
Economics: ${character.inventory.length} items, ${worldSystems.economics.playerWealth} ${worldSystems.economics.currency}
Military: ${worldSystems.war.playerRole}, Experience: ${worldSystems.war.battleExperience}
`;

    const systemPrompt = `You are Kronos, the Weaver of Chronicles, continuing an interactive chronicle in Chronicle Weaver. Maintain narrative consistency and character development while advancing the story based on the player's choice.

Setting: ${era}
Theme: ${theme}
Realism Level: ${realismLevel}
Character: ${character.name}

Current Stats:
- Influence: ${character.stats.influence}/10
- Knowledge: ${character.stats.knowledge}/10  
- Resources: ${character.stats.resources}/10
- Reputation: ${character.stats.reputation}/10

World Context:
${worldContext}

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

    const userPrompt = `Continue the chronicle based on the player's choice. Here's the context:

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

Also suggest:
- Stat changes based on the choice and consequences (each stat can change by -2 to +2)
- New inventory items if applicable
- Political faction standing changes
- Economic impacts
- New lore discoveries

Respond with ONLY this JSON structure (no markdown, no code blocks):
{
  "text": "Next segment narrative here (5-7 substantial paragraphs)...",
  "choices": [
    {"id": "1", "text": "First choice description"},
    {"id": "2", "text": "Second choice description"},
    {"id": "3", "text": "Third choice description"}
  ],
  "consequences": {
    "statChanges": {
      "influence": 0,
      "knowledge": 0,
      "resources": 0,
      "reputation": 0
    },
    "newInventory": [
      {"name": "Item", "description": "Description", "quantity": 1, "value": 10, "category": "tool"}
    ],
    "politicalChanges": [
      {"factionName": "Name", "standingChange": 1}
    ],
    "economicChanges": {
      "wealthChange": 0,
      "newPrices": {"item": 15}
    },
    "newLore": [
      {"title": "Discovery", "content": "Lore content", "category": "historical"}
    ],
    "newMemories": [
      {"title": "Event", "description": "Memory description", "category": "event"}
    ]
  }
}`;

    const messages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    logDebug("📤 Sending request for next segment...");
    
    debugState.lastApiCall = {
      timestamp: new Date().toISOString(),
      type: "next_segment",
      messages,
      selectedChoice
    };

    debugState.apiCallHistory.push({
      timestamp: new Date().toISOString(),
      type: "next_segment",
      choice: selectedChoice.text,
      turnCount
    });

    const response = await makeApiRequest<NextSegmentResponse>(messages, "next_segment");
    logDebug("📖 Next segment response preview:", response.completion?.substring(0, 300) + "...");

    let parsedResponse;
    try {
      parsedResponse = await parseApiResponse<NextSegmentResponse>(response.completion, "next segment");
    } catch (parseError) {
      logError("❌ Failed to parse AI response:", response.completion);
      logError("Parse error:", parseError);
      
      debugState.lastError = {
        timestamp: new Date().toISOString(),
        type: "parse_error",
        error: parseError,
        rawCompletion: response.completion
      };
      
      throw new Error("Failed to parse API response");
    }

    // Validate response
    if (!parsedResponse.text || !parsedResponse.choices) {
      logError("❌ Incomplete next segment response:", parsedResponse);
      throw new Error("Incomplete response from AI");
    }

    const nextSegment: GameSegment = {
      id: `segment-${turnCount + 1}`,
      text: parsedResponse.text,
      choices: parsedResponse.choices.map((choice, index) => ({
        id: choice.id || (index + 1).toString(),
        text: choice.text
      })),
      customChoiceEnabled: true
    };

    logDebug("✅ Next segment created successfully");
    logDebug("Next segment text length:", nextSegment.text.length);
    logDebug("=== ✅ NEXT SEGMENT GENERATION COMPLETE ===");

    return nextSegment;
  } catch (error) {
    logError("❌ Error in generateNextSegment:", error);
    
    debugState.lastError = {
      timestamp: new Date().toISOString(),
      type: "generation_error",
      error,
      stack: error instanceof Error ? error.stack : undefined
    };
    
    throw error;
  }
}

export async function processKronosMessage(gameState: GameState, message: string): Promise<string> {
  const debugState = ensureDebugState();
  
  try {
    logDebug("🤖 Processing Kronos message:", message);

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

Respond as Kronos in a helpful, knowledgeable way. Acknowledge their request and explain how you'll implement it in their chronicle. Keep responses concise but informative.`;

    const messages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];

    debugState.lastApiCall = {
      timestamp: new Date().toISOString(),
      type: "kronos_message",
      messages,
      gameState
    };

    logDebug("📤 Sending Kronos message to API...");

    const response = await makeApiRequest<{ completion: string }>(messages, "kronos_message");
    return response.completion || "I apologize, but I'm having trouble responding right now. Please try again later.";
  } catch (error) {
    logError("❌ Error processing Kronos message:", error);
    
    debugState.lastError = {
      timestamp: new Date().toISOString(),
      type: "generation_error",
      error,
      stack: error instanceof Error ? error.stack : undefined
    };
    
    return "I apologize, but I'm having trouble responding right now. Please try again later.";
  }
}