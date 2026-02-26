/**
 * Context Manager for AI Conversations
 * 
 * Manages conversation context, game state context, and maintains
 * context continuity across game sessions and AI providers.
 */

import { GameState, GameSegment, GameChoice } from '../types/game';
import { aiLogger } from './aiLogger';

export interface ConversationContext {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  gameStateSnapshot?: {
    era: string;
    theme: string;
    characterName: string;
    turnCount: number;
    health: number;
    wealth: number;
  };
  recentChoices: Array<{
    choiceText: string;
    turnNumber: number;
  }>;
  narrativeSummary: string[];
}

class ContextManager {
  private static instance: ContextManager;
  private contexts: Map<string, ConversationContext> = new Map();
  private maxContextMessages: number = 20;
  private maxNarrativeSummaries: number = 5;

  private constructor() {
    aiLogger.info('ContextManager initialized');
  }

  public static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  /**
   * Initialize or get context for a game session
   */
  public initializeContext(sessionId: string, gameState: GameState): ConversationContext {
    aiLogger.debug('Initializing context', { 
      sessionId, 
      era: gameState.era, 
      theme: gameState.theme 
    });

    const context: ConversationContext = {
      messages: [],
      gameStateSnapshot: {
        era: gameState.era,
        theme: gameState.theme,
        characterName: gameState.character.name,
        turnCount: gameState.turnCount,
        health: gameState.character.stats.health,
        wealth: gameState.character.stats.resources, // Note: 'wealth' maps to 'resources' from game state
      },
      recentChoices: [],
      narrativeSummary: [],
    };

    // Add initial system context
    this.addSystemMessage(context, this.buildSystemPrompt(gameState));

    this.contexts.set(sessionId, context);
    aiLogger.logContextUpdate('initialize', context.messages.length, { sessionId });

    return context;
  }

  /**
   * Get existing context or create new one
   */
  public getOrCreateContext(sessionId: string, gameState: GameState): ConversationContext {
    let context = this.contexts.get(sessionId);
    
    if (!context) {
      context = this.initializeContext(sessionId, gameState);
    } else {
      // Update game state snapshot
      context.gameStateSnapshot = {
        era: gameState.era,
        theme: gameState.theme,
        characterName: gameState.character.name,
        turnCount: gameState.turnCount,
        health: gameState.character.stats.health,
        wealth: gameState.character.stats.resources,
      };
    }

    return context;
  }

  /**
   * Build comprehensive system prompt with context
   */
  private buildSystemPrompt(gameState: GameState): string {
    return `You are the Weaver, an AI storyteller for 'Chronicle Weaver', creating immersive historical interactive fiction.

GAME WORLD CONTEXT:
- Era: ${gameState.era}
- Theme: ${gameState.theme}
- Setting: Historical accuracy with creative narrative freedom

CHARACTER CONTEXT:
- Name: ${gameState.character.name}
- Current Turn: ${gameState.turnCount}
- Health: ${gameState.character.stats.health}/100
- Wealth: ${gameState.character.stats.resources}
- Social Standing: ${gameState.character.stats.socialStanding}

NARRATIVE GUIDELINES:
1. Maintain historical authenticity for the ${gameState.era} period
2. Honor the ${gameState.theme} theme in tone and content
3. Create meaningful choices with real consequences
4. Build upon previous narrative developments
5. Track character progression and world state changes

RESPONSE FORMAT:
Always respond with valid JSON containing:
- "text": narrative segment (2-3 paragraphs)
- "choices": array of 3-4 meaningful options with distinct outcomes
- Each choice should reflect different approaches (action, diplomacy, stealth, etc.)

Remember the ongoing story and maintain consistency with previous events.`;
  }

  /**
   * Add system message to context
   */
  private addSystemMessage(context: ConversationContext, content: string): void {
    context.messages.push({
      role: 'system',
      content,
      timestamp: Date.now(),
    });
  }

  /**
   * Add user message to context
   */
  public addUserMessage(sessionId: string, content: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) {
      aiLogger.warn('Attempted to add user message to non-existent context', { sessionId });
      return;
    }

    context.messages.push({
      role: 'user',
      content,
      timestamp: Date.now(),
    });

    this.trimContext(context);
    aiLogger.logContextUpdate('addUserMessage', context.messages.length, { sessionId });
  }

  /**
   * Add assistant response to context
   */
  public addAssistantMessage(sessionId: string, content: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) {
      aiLogger.warn('Attempted to add assistant message to non-existent context', { sessionId });
      return;
    }

    context.messages.push({
      role: 'assistant',
      content,
      timestamp: Date.now(),
    });

    this.trimContext(context);
    aiLogger.logContextUpdate('addAssistantMessage', context.messages.length, { sessionId });
  }

  /**
   * Add a choice to recent choices
   */
  public addChoice(sessionId: string, choice: GameChoice, turnNumber: number): void {
    const context = this.contexts.get(sessionId);
    if (!context) {
      aiLogger.warn('Attempted to add choice to non-existent context', { sessionId });
      return;
    }

    context.recentChoices.push({
      choiceText: choice.text,
      turnNumber,
    });

    // Keep only recent choices
    if (context.recentChoices.length > 10) {
      context.recentChoices = context.recentChoices.slice(-10);
    }

    aiLogger.debug('Choice added to context', { sessionId, turnNumber, choiceText: choice.text });
  }

  /**
   * Add narrative summary
   */
  public addNarrativeSummary(sessionId: string, summary: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) {
      aiLogger.warn('Attempted to add narrative summary to non-existent context', { sessionId });
      return;
    }

    context.narrativeSummary.push(summary);

    // Keep only recent summaries
    if (context.narrativeSummary.length > this.maxNarrativeSummaries) {
      context.narrativeSummary = context.narrativeSummary.slice(-this.maxNarrativeSummaries);
    }

    aiLogger.debug('Narrative summary added', { sessionId, summaryCount: context.narrativeSummary.length });
  }

  /**
   * Get formatted context for AI request
   */
  public getFormattedContext(sessionId: string, gameState: GameState): string {
    const context = this.getOrCreateContext(sessionId, gameState);

    const contextParts: string[] = [];

    // Add game state
    if (context.gameStateSnapshot) {
      contextParts.push(`CURRENT GAME STATE:
Turn ${context.gameStateSnapshot.turnCount} in ${context.gameStateSnapshot.era}
Character: ${context.gameStateSnapshot.characterName}
Health: ${context.gameStateSnapshot.health} | Wealth: ${context.gameStateSnapshot.wealth}`);
    }

    // Add recent choices
    if (context.recentChoices.length > 0) {
      const recentChoicesStr = context.recentChoices
        .slice(-5)
        .map(c => `Turn ${c.turnNumber}: ${c.choiceText}`)
        .join('\n');
      contextParts.push(`RECENT DECISIONS:\n${recentChoicesStr}`);
    }

    // Add narrative summaries
    if (context.narrativeSummary.length > 0) {
      contextParts.push(`STORY SO FAR:\n${context.narrativeSummary.join('\n\n')}`);
    }

    return contextParts.join('\n\n');
  }

  /**
   * Get messages for API call
   */
  public getMessages(sessionId: string): Array<{ role: string; content: string }> {
    const context = this.contexts.get(sessionId);
    if (!context) {
      aiLogger.warn('Attempted to get messages from non-existent context', { sessionId });
      return [];
    }

    return context.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }

  /**
   * Trim context to maintain reasonable size
   */
  private trimContext(context: ConversationContext): void {
    if (context.messages.length > this.maxContextMessages) {
      // Keep system message and recent messages
      const systemMessages = context.messages.filter(m => m.role === 'system');
      const recentMessages = context.messages
        .filter(m => m.role !== 'system')
        .slice(-this.maxContextMessages);
      
      context.messages = [...systemMessages, ...recentMessages];
      aiLogger.debug('Context trimmed', { newLength: context.messages.length });
    }
  }

  /**
   * Clear context for a session
   */
  public clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
    aiLogger.info('Context cleared', { sessionId });
  }

  /**
   * Clear all contexts
   */
  public clearAllContexts(): void {
    this.contexts.clear();
    aiLogger.info('All contexts cleared');
  }

  /**
   * Get context statistics
   */
  public getContextStats(sessionId: string): {
    messageCount: number;
    choiceCount: number;
    summaryCount: number;
  } | null {
    const context = this.contexts.get(sessionId);
    if (!context) {
      return null;
    }

    return {
      messageCount: context.messages.length,
      choiceCount: context.recentChoices.length,
      summaryCount: context.narrativeSummary.length,
    };
  }
}

// Export singleton instance
export const contextManager = ContextManager.getInstance();
