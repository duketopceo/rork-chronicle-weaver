import { GameState, GameChoice, GameSegment, InventoryItem, PoliticalFaction, LoreEntry, Memory, GameSetupState } from "@/types/game";

type ContentPart = 
  | { type: 'text'; text: string; }
  | { type: 'image'; image: string };

type CoreMessage = 
  | { role: 'system'; content: string; }  
  | { role: 'user'; content: string | Array<ContentPart>; }
  | { role: 'assistant'; content: string | Array<ContentPart>; };

// --- TypeScript global typing for debug state ---
declare global {
  interface GlobalThis {
    __CHRONICLE_DEBUG__?: {
      lastApiCall?: any;
      lastResponse?: any;
      lastError?: any;
      callCount: number;
      lastPrompt?: string;
      lastRawResponse?: string;
      apiCallHistory: any[];
    };
  }
}

// --- Debugging Tools & Utilities ---
// Use globalThis for cross-platform compatibility
if (typeof globalThis !== 'undefined') {
  if (!(globalThis as any).__CHRONICLE_DEBUG__) {
    (globalThis as any).__CHRONICLE_DEBUG__ = {
      callCount: 0,
      apiCallHistory: []
    };
  }
}

// Debug mode flag (manual toggle only)
let DEBUG_MODE = true;

/**
 * Enable or disable debug mode at runtime.
 */
export function setDebugMode(enabled: boolean) {
  DEBUG_MODE = enabled;
}

/**
 * Get the current debug state (deep clone to avoid mutation).
 */
export function getDebugState() {
  if (typeof globalThis !== 'undefined' && (globalThis as any).__CHRONICLE_DEBUG__) {
    return JSON.parse(JSON.stringify((globalThis as any).__CHRONICLE_DEBUG__));
  }
  return null;
}

/**
 * Clear debug history and counters.
 */
export function clearDebugHistory() {
  if (typeof globalThis !== 'undefined' && (globalThis as any).__CHRONICLE_DEBUG__) {
    (globalThis as any).__CHRONICLE_DEBUG__.lastApiCall = undefined;
    (globalThis as any).__CHRONICLE_DEBUG__.lastResponse = undefined;
    (globalThis as any).__CHRONICLE_DEBUG__.lastError = undefined;
    (globalThis as any).__CHRONICLE_DEBUG__.lastPrompt = undefined;
    (globalThis as any).__CHRONICLE_DEBUG__.lastRawResponse = undefined;
    (globalThis as any).__CHRONICLE_DEBUG__.callCount = 0;
    (globalThis as any).__CHRONICLE_DEBUG__.apiCallHistory = [];
  }
}

/**
 * Standardized API call logging utility.
 */
export function logApiCall(type: string, payload: any) {
  if (typeof globalThis !== 'undefined' && (globalThis as any).__CHRONICLE_DEBUG__) {
    (globalThis as any).__CHRONICLE_DEBUG__.apiCallHistory.push({
      timestamp: new Date().toISOString(),
      type,
      ...payload
    });
  }
  if (DEBUG_MODE) {
    _logDebug(`[API CALL] ${type}`, payload);
  }
}

// Patch logDebug and logError to respect DEBUG_MODE
const _logDebug = (message: string, data?: any) => {
  console.log(`[AI SERVICE DEBUG] ${message}`, data || '');
};
const _logError = (message: string, error?: any) => {
  console.error(`[AI SERVICE ERROR] ${message}`, error || '');
};
function logDebug(message: string, data?: any) {
  if (DEBUG_MODE) _logDebug(message, data);
}
function logError(message: string, error?: any) {
  if (DEBUG_MODE) _logError(message, error);
};

export async function generateInitialStory(gameState: GameState, gameSetup: GameSetupState): Promise<{ backstory: string, firstSegment: GameSegment }> {
  try {
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.callCount++;
    }
    
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

    const response = await fetch("https://toolkit.rork.com/text/llm/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    logDebug("📥 Response status:", response.status);
    let headersObj: any = {};
    // Feature detection for headers logging
    if (typeof Object.fromEntries === 'function' && response.headers && typeof (response.headers as any).entries === 'function') {
      headersObj = Object.fromEntries(Array.from((response.headers as any).entries()));
    }
    logDebug("Response headers:", headersObj);

    if (!response.ok) {
      const errorText = await response.text();
      logError("API error response:", errorText);
      
      if (typeof global !== 'undefined') {
        global.__CHRONICLE_DEBUG__.lastError = {
          timestamp: new Date().toISOString(),
          type: "api_error",
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        };
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    logDebug("📦 Raw response received, length:", data.completion?.length || 0);
    
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastResponse = {
        timestamp: new Date().toISOString(),
        type: "initial_story",
        data: data,
        completionLength: data.completion?.length || 0
      };
      global.__CHRONICLE_DEBUG__.lastRawResponse = data.completion;
    }
    
    if (!data.completion) {
      logError("❌ No completion in response:", data);
      throw new Error("No completion received from API");
    }

    logDebug("📖 Response preview:", data.completion.substring(0, 300) + "...");

    let parsedResponse;
    try {
      // Clean the response to ensure it's valid JSON
      let cleanedCompletion = data.completion.trim();
      
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
      
      logDebug("🔧 Attempting to parse JSON...");
      logDebug("Cleaned completion preview:", cleanedCompletion.substring(0, 500));
      
      parsedResponse = JSON.parse(cleanedCompletion);
      logDebug("✅ JSON parsed successfully");
    } catch (parseError) {
      logError("❌ Failed to parse AI response:", data.completion);
      logError("Parse error:", parseError);
      
      if (typeof global !== 'undefined') {
        global.__CHRONICLE_DEBUG__.lastError = {
          timestamp: new Date().toISOString(),
          type: "parse_error",
          error: parseError,
          rawCompletion: data.completion
        };
      }
      
      // Provide a comprehensive fallback for debugging
      logDebug("🔧 Providing enhanced fallback response for debugging");
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
      choices: parsedResponse.segment.choices.map((choice: any, index: number) => ({
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
    
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastError = {
        timestamp: new Date().toISOString(),
        type: "generation_error",
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      };
    }
    
    // Provide a comprehensive fallback response for debugging
    logDebug("🔧 Providing comprehensive fallback response for debugging");
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
  try {
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.callCount++;
    }
    
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

    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastApiCall = {
        timestamp: new Date().toISOString(),
        type: "next_segment",
        messages: messages,
        selectedChoice: selectedChoice
      };
      global.__CHRONICLE_DEBUG__.apiCallHistory.push({
        timestamp: new Date().toISOString(),
        type: "next_segment",
        choice: selectedChoice.text,
        turnCount: turnCount
      });
    }

    const response = await fetch("https://toolkit.rork.com/text/llm/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    logDebug("📥 Next segment response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      logError("API error response:", errorText);
      
      if (typeof global !== 'undefined') {
        global.__CHRONICLE_DEBUG__.lastError = {
          timestamp: new Date().toISOString(),
          type: "api_error",
          status: response.status,
          errorText: errorText
        };
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    logDebug("📦 Next segment response received, length:", data.completion?.length || 0);
    
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastResponse = {
        timestamp: new Date().toISOString(),
        type: "next_segment",
        data: data
      };
      global.__CHRONICLE_DEBUG__.lastRawResponse = data.completion;
    }
    
    if (!data.completion) {
      logError("❌ No completion in response:", data);
      throw new Error("No completion received from API");
    }

    let parsedResponse;
    try {
      // Clean the response to ensure it's valid JSON
      let cleanedCompletion = data.completion.trim();
      
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
      
      logDebug("🔧 Parsing next segment JSON...");
      parsedResponse = JSON.parse(cleanedCompletion);
      logDebug("✅ Next segment JSON parsed successfully");
    } catch (parseError) {
      logError("❌ Failed to parse next segment response:", data.completion);
      logError("Parse error:", parseError);
      
      if (typeof global !== 'undefined') {
        global.__CHRONICLE_DEBUG__.lastError = {
          timestamp: new Date().toISOString(),
          type: "parse_error",
          error: parseError,
          rawCompletion: data.completion
        };
      }
      
      // Provide fallback for development
      logDebug("🔧 Providing fallback next segment for development");
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

    // Validate response
    if (!parsedResponse.text || !parsedResponse.choices) {
      logError("❌ Incomplete next segment response:", parsedResponse);
      throw new Error("Incomplete response from AI");
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

    logDebug("✅ Next segment created successfully");
    logDebug("Next segment text length:", nextSegment.text.length);
    logDebug("=== ✅ NEXT SEGMENT GENERATION COMPLETE ===");

    return nextSegment;
  } catch (error) {
    logError("❌ Error in generateNextSegment:", error);
    
    if (typeof global !== 'undefined') {
      global.__CHRONICLE_DEBUG__.lastError = {
        timestamp: new Date().toISOString(),
        type: "generation_error",
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      };
    }
    
    // Provide fallback for development
    logDebug("🔧 Providing fallback next segment for development");
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

    logDebug("📤 Sending Kronos message to API...");

    const response = await fetch("https://toolkit.rork.com/text/llm/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logDebug("📥 Kronos response received");
    
    return data.completion || "I apologize, but I'm having trouble responding right now. Please try again later.";
  } catch (error) {
    logError("❌ Error processing Kronos message:", error);
    return "I apologize, but I'm having trouble responding right now. Please try again later.";
  }
}