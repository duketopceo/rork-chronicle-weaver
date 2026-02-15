/**
 * Chronicle Weaver - AI Handler Service
 * 
 * Secure backend AI integration with OpenAI/Anthropic/Gemini APIs and Ollama failsafe.
 * Handles rate limiting, caching, usage tracking, and content moderation.
 * 
 * Features:
 * - Secure API key handling (server-side only)
 * - Rate limiting (free: 5/day, premium: unlimited)
 * - Response caching for repeated requests
 * - Retry logic with exponential backoff
 * - Ollama local AI failsafe for redundancy
 * - Token usage tracking for billing
 * - Content moderation and safety filters
 * - Comprehensive logging and debugging
 * 
 * Last Updated: February 2025
 */

import { Hono } from 'hono';
import { z } from 'zod';

// Enhanced logging utility
function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  // Only format data in development mode for performance
  const formattedData = process.env.NODE_ENV === 'development' && data 
    ? JSON.stringify(data, null, 2) 
    : (data ? JSON.stringify(data) : '');
  console.log(`[${timestamp}] [DEBUG] ${message}`, formattedData);
}

function logInfo(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const formattedData = process.env.NODE_ENV === 'development' && data 
    ? JSON.stringify(data, null, 2) 
    : (data ? JSON.stringify(data) : '');
  console.info(`[${timestamp}] [INFO] ${message}`, formattedData);
}

function logWarn(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const formattedData = process.env.NODE_ENV === 'development' && data 
    ? JSON.stringify(data, null, 2) 
    : (data ? JSON.stringify(data) : '');
  console.warn(`[${timestamp}] [WARN] ${message}`, formattedData);
}

function logError(message: string, error?: any, data?: any) {
  const timestamp = new Date().toISOString();
  const formattedData = process.env.NODE_ENV === 'development' && data 
    ? JSON.stringify(data, null, 2) 
    : (data ? JSON.stringify(data) : '');
  console.error(`[${timestamp}] [ERROR] ${message}`, formattedData, error);
  if (error?.stack) {
    console.error('Stack trace:', error.stack);
  }
}

// AI Service Configuration
const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || 'openai', // 'openai', 'anthropic', 'gemini', or 'ollama'
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL || 'gpt-4',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama2', // Default Ollama model for failsafe
  // IMPORTANT: Ollama failsafe requires explicit opt-in to avoid unexpected behavior
  // Set ENABLE_OLLAMA_FAILSAFE=true in your environment to enable
  enableOllamaFailsafe: process.env.ENABLE_OLLAMA_FAILSAFE === 'true', 
  maxTokens: 4000,
  temperature: 0.7,
  maxRetries: 3,
  retryDelay: 1000,
};

// Provider response format configuration (module-level constant for performance)
const CHOICE_PROVIDERS = new Set(['openai', 'gemini', 'ollama']);

logInfo('AI Handler initialized', {
  provider: AI_CONFIG.provider,
  model: AI_CONFIG.model,
  ollamaEnabled: AI_CONFIG.enableOllamaFailsafe,
  ollamaBaseUrl: AI_CONFIG.ollamaBaseUrl,
  ollamaModel: AI_CONFIG.ollamaModel,
});

// Rate limiting configuration
const RATE_LIMITS = {
  free: {
    daily: 5,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  premium: {
    daily: 1000,
    windowMs: 24 * 60 * 60 * 1000,
  },
  master: {
    daily: 10000,
    windowMs: 24 * 60 * 60 * 1000,
  },
};

// Response cache (in production, use Redis)
const responseCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Usage tracking
const usageTracker = new Map<string, { count: number; resetTime: number }>();

const app = new Hono();

// === UTILITY FUNCTIONS ===

/**
 * Generate cache key for request
 */
function generateCacheKey(messages: any[], userId: string): string {
  const content = JSON.stringify(messages);
  return `ai_${userId}_${Buffer.from(content).toString('base64').slice(0, 32)}`;
}

/**
 * Check if user has exceeded rate limits
 */
function checkRateLimit(userId: string, subscriptionTier: string): boolean {
  logDebug('Checking rate limit', { userId, subscriptionTier });
  
  const now = Date.now();
  const userUsage = usageTracker.get(userId);
  
  if (!(subscriptionTier in RATE_LIMITS)) {
    logWarn('Invalid subscription tier', { subscriptionTier, validTiers: Object.keys(RATE_LIMITS) });
  }
  
  if (!userUsage) {
    const rateLimit = RATE_LIMITS[subscriptionTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
    usageTracker.set(userId, { count: 1, resetTime: now + rateLimit.windowMs });
    logInfo('Rate limit initialized', { userId, subscriptionTier, resetTime: now + rateLimit.windowMs });
    return true;
  }

  // Reset if window has passed
  if (now > userUsage.resetTime) {
    const rateLimit = RATE_LIMITS[subscriptionTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
    usageTracker.set(userId, { count: 1, resetTime: now + rateLimit.windowMs });
    logInfo('Rate limit window reset', { userId, subscriptionTier });
    return true;
  }

  // Check if limit exceeded
  const rateLimit = RATE_LIMITS[subscriptionTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
  const limit = rateLimit.daily;
  if (userUsage.count >= limit) {
    logWarn('Rate limit exceeded', { userId, subscriptionTier, count: userUsage.count, limit });
    return false;
  }

  // Increment usage
  usageTracker.set(userId, { count: userUsage.count + 1, resetTime: userUsage.resetTime });
  logDebug('Rate limit incremented', { userId, newCount: userUsage.count + 1, limit });
  return true;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages: any[]): Promise<any> {
  logDebug('Calling OpenAI API', { messageCount: messages.length, model: AI_CONFIG.model });
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
      }),
    });

    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      logError('OpenAI API error', { status: response.status, statusText: response.statusText, errorText });
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logInfo('OpenAI API success', { duration, hasResponse: !!data });
    return data;
  } catch (error) {
    logError('OpenAI API exception', error, { duration: Date.now() - startTime });
    throw error;
  }
}

/**
 * Call Anthropic API
 */
async function callAnthropic(messages: any[]): Promise<any> {
  logDebug('Calling Anthropic API', { messageCount: messages.length, model: AI_CONFIG.model });
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': AI_CONFIG.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
      }),
    });

    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      logError('Anthropic API error', { status: response.status, statusText: response.statusText, errorText });
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logInfo('Anthropic API success', { duration, hasResponse: !!data });
    return data;
  } catch (error) {
    logError('Anthropic API exception', error, { duration: Date.now() - startTime });
    throw error;
  }
}

/**
 * Call Ollama API (local or remote)
 */
async function callOllama(messages: any[], modelOverride?: string): Promise<any> {
  const model = modelOverride || AI_CONFIG.ollamaModel;
  logDebug('Calling Ollama API', { 
    messageCount: messages.length, 
    model, 
    baseUrl: AI_CONFIG.ollamaBaseUrl 
  });
  
  const startTime = Date.now();

  if (!model) {
    logError('Ollama model not configured');
    throw new Error('OLLAMA_MODEL is required for Ollama provider');
  }

  try {
    // Convert messages format for Ollama (expects role and content)
    const ollamaMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
    }));

    const url = `${AI_CONFIG.ollamaBaseUrl}/api/chat`;
    logDebug('Ollama request URL', { url });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: ollamaMessages,
        options: {
          temperature: AI_CONFIG.temperature,
          num_predict: AI_CONFIG.maxTokens,
        },
        stream: false,
      }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logError('Ollama API error', { status: response.status, statusText: response.statusText, errorText });
      throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    logInfo('Ollama API success', { duration, hasResponse: !!data, model });

    // Transform Ollama response to match expected format
    return {
      choices: [{
        message: {
          content: data.message?.content || ''
        }
      }],
      usage: {
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
        total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      }
    };
  } catch (error) {
    logError('Ollama API exception', error, { duration: Date.now() - startTime, model });
    throw error;
  }
}

/**
 * Call Google Gemini API
 */
async function callGemini(messages: any[]): Promise<any> {
  logDebug('Calling Gemini API', { messageCount: messages.length, hasApiKey: !!AI_CONFIG.apiKey, model: AI_CONFIG.model });
  
  const startTime = Date.now();
  
  if (!AI_CONFIG.apiKey) {
    logError('Missing AI_API_KEY for Gemini', { provider: AI_CONFIG.provider });
    throw new Error('AI_API_KEY is not configured');
  }
  
  try {
    // Convert messages format for Gemini
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    logDebug('Gemini message conversion', { 
      originalCount: messages.length, 
      convertedCount: geminiMessages.length, 
      firstMessageRole: geminiMessages[0]?.role 
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${AI_CONFIG.apiKey}`;
    logDebug('Gemini API request', { url: url.replace(AI_CONFIG.apiKey, '[REDACTED]'), model: AI_CONFIG.model });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: AI_CONFIG.maxTokens,
          temperature: AI_CONFIG.temperature,
        },
      }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logError('Gemini API error', { status: response.status, statusText: response.statusText, errorText: errorText.substring(0, 200) });
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    logInfo('Gemini API success', { 
      duration, 
      hasCandidates: !!data.candidates, 
      candidateCount: data.candidates?.length, 
      hasContent: !!data.candidates?.[0]?.content?.parts?.[0]?.text 
    });
    
    // Transform Gemini response to match expected format
    return {
      choices: [{
        message: {
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        }
      }],
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0,
      }
    };
  } catch (error) {
    logError('Gemini API exception', error, { duration: Date.now() - startTime });
    throw error;
  }
}

/**
 * Retry logic with exponential backoff and Ollama failsafe
 */
async function retryWithBackoffAndFailsafe<T>(
  fn: () => Promise<T>,
  messages: any[],
  maxRetries: number = AI_CONFIG.maxRetries
): Promise<{ result: T; usedFailsafe: boolean }> {
  let lastError: Error;
  
  logDebug('Starting retry with backoff', { maxRetries, ollamaFailsafeEnabled: AI_CONFIG.enableOllamaFailsafe });
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logDebug(`Attempt ${attempt + 1}/${maxRetries + 1}`);
      const result = await fn();
      logInfo('Primary API call successful', { attempt: attempt + 1 });
      return { result, usedFailsafe: false };
    } catch (error) {
      lastError = error as Error;
      logWarn(`Attempt ${attempt + 1} failed`, { error: lastError.message, attemptsLeft: maxRetries - attempt });
      
      if (attempt === maxRetries) {
        // All retries exhausted, try Ollama failsafe if enabled
        if (AI_CONFIG.enableOllamaFailsafe) {
          logWarn('Primary provider failed after all retries, attempting Ollama failsafe', { 
            primaryProvider: AI_CONFIG.provider,
            error: lastError.message 
          });
          
          try {
            const ollamaResult = await callOllama(messages) as T;
            logInfo('Ollama failsafe successful', { primaryProvider: AI_CONFIG.provider });
            return { result: ollamaResult, usedFailsafe: true };
          } catch (ollamaError) {
            logError('Ollama failsafe also failed', ollamaError, { 
              primaryError: lastError.message,
              ollamaError: (ollamaError as Error).message 
            });
            // Throw the original error since both failed
            throw lastError;
          }
        } else {
          logWarn('Ollama failsafe disabled, throwing error');
          throw lastError;
        }
      }
      
      // Exponential backoff
      const delay = AI_CONFIG.retryDelay * Math.pow(2, attempt);
      logDebug(`Backing off for ${delay}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Legacy retry logic with exponential backoff (without failsafe)
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = AI_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = AI_CONFIG.retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Content moderation check
 */
function moderateContent(content: string): boolean {
  // Basic content moderation - in production, use a proper moderation service
  const blockedTerms = ['explicit', 'violence', 'hate'];
  const lowerContent = content.toLowerCase();
  
  return !blockedTerms.some(term => lowerContent.includes(term));
}

// === API ENDPOINTS ===

/**
 * Process AI request with full security and rate limiting
 */
app.post('/process', async (c) => {
  const requestStartTime = Date.now();
  let usedFailsafe = false;
  
  try {
    const body = await c.req.json();
    const { messages, userId, subscriptionTier = 'free', context } = body;

    logInfo('AI request received', { userId, subscriptionTier, messageCount: messages?.length });

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      logWarn('Invalid messages format', { userId });
      return c.json({ error: 'Invalid messages format' }, 400);
    }

    if (!userId) {
      logWarn('Missing userId in request');
      return c.json({ error: 'User ID required' }, 400);
    }

    // Check rate limits
    logDebug('Checking rate limit', { userId, subscriptionTier });
    if (!checkRateLimit(userId, subscriptionTier)) {
      const rateLimit = RATE_LIMITS[subscriptionTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
      return c.json({ 
        error: 'Rate limit exceeded',
        message: 'You have reached your daily AI request limit. Upgrade to continue.',
        limit: rateLimit.daily,
      }, 429);
    }

    // Check cache first
    const cacheKey = generateCacheKey(messages, userId);
    const cached = responseCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      logInfo('Returning cached response', { userId });
      return c.json({
        success: true,
        completion: cached.response,
        cached: true,
        usage: { cached: true },
      });
    }

    // Content moderation
    const allText = messages.map((m: any) => m.content).join(' ');
    if (!moderateContent(allText)) {
      logWarn('Content moderation failed', { userId });
      return c.json({ error: 'Content violates community guidelines' }, 400);
    }

    // Add context to messages if provided
    let enhancedMessages = messages;
    if (context) {
      logDebug('Adding context to messages', { contextLength: context.length });
      // Prepend context as a system message if not already present
      const hasSystemMessage = messages.some((m: any) => m.role === 'system');
      if (!hasSystemMessage && context) {
        enhancedMessages = [
          { role: 'system', content: context },
          ...messages
        ];
      }
    }

    // Call AI API with retry logic and Ollama failsafe
    const { result: aiResponse, usedFailsafe: failsafeUsed } = await retryWithBackoffAndFailsafe(async () => {
      // Provider routing with improved maintainability
      const providers = {
        openai: callOpenAI,
        anthropic: callAnthropic,
        gemini: callGemini,
        ollama: callOllama,
      };
      
      const providerFn = providers[AI_CONFIG.provider as keyof typeof providers];
      if (!providerFn) {
        throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`);
      }
      
      return await providerFn(enhancedMessages);
    }, enhancedMessages);

    usedFailsafe = failsafeUsed;

    // Extract completion text
    let completion: string;
    
    if (CHOICE_PROVIDERS.has(AI_CONFIG.provider) || usedFailsafe) {
      completion = aiResponse.choices[0]?.message?.content || '';
    } else if (AI_CONFIG.provider === 'anthropic') {
      completion = aiResponse.content[0]?.text || '';
    } else {
      throw new Error('Invalid AI response format');
    }

    // Cache successful response
    responseCache.set(cacheKey, {
      response: completion,
      timestamp: Date.now(),
    });

    // Track usage for billing
    const usage = {
      promptTokens: aiResponse.usage?.prompt_tokens || 0,
      completionTokens: aiResponse.usage?.completion_tokens || 0,
      totalTokens: aiResponse.usage?.total_tokens || 0,
      cached: false,
    };

    const duration = Date.now() - requestStartTime;
    logInfo('AI request completed successfully', { 
      userId, 
      duration, 
      usedFailsafe,
      tokensUsed: usage.totalTokens 
    });

    return c.json({
      success: true,
      completion,
      usage,
      usedFailsafe,
      provider: usedFailsafe ? 'ollama' : AI_CONFIG.provider,
      duration,
    });

  } catch (error) {
    const duration = Date.now() - requestStartTime;
    logError('AI Handler Error', error, { duration, usedFailsafe });
    return c.json({
      error: 'Failed to process AI request',
      message: error instanceof Error ? error.message : 'Unknown error',
      usedFailsafe,
    }, 500);
  }
});

/**
 * Get usage statistics for user
 */
app.get('/usage/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const userUsage = usageTracker.get(userId);
    
    if (!userUsage) {
      return c.json({ count: 0, resetTime: null });
    }

    return c.json({
      count: userUsage.count,
      resetTime: userUsage.resetTime,
      remaining: Math.max(0, RATE_LIMITS.free.daily - userUsage.count),
    });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return c.json({ error: 'Failed to get usage stats' }, 500);
  }
});

/**
 * Clear cache (admin endpoint)
 */
app.post('/cache/clear', async (c) => {
  try {
    responseCache.clear();
    return c.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    console.error('Cache clear error:', error);
    return c.json({ error: 'Failed to clear cache' }, 500);
  }
});

/**
 * Health check
 */
app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    provider: AI_CONFIG.provider,
    model: AI_CONFIG.model,
    ollamaBaseUrl: AI_CONFIG.provider === 'ollama' ? AI_CONFIG.ollamaBaseUrl : undefined,
    cacheSize: responseCache.size,
    activeUsers: usageTracker.size,
  });
});

export default app;

