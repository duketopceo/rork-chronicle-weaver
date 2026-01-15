/**
 * Chronicle Weaver - AI Handler Service
 * 
 * Secure backend AI integration with OpenAI/Anthropic APIs.
 * Handles rate limiting, caching, usage tracking, and content moderation.
 * 
 * Features:
 * - Secure API key handling (server-side only)
 * - Rate limiting (free: 5/day, premium: unlimited)
 * - Response caching for repeated requests
 * - Retry logic with exponential backoff
 * - Token usage tracking for billing
 * - Content moderation and safety filters
 * 
 * Last Updated: January 2025
 */

import { Hono } from 'hono';
import { z } from 'zod';

// AI Service Configuration
const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || 'openai', // 'openai', 'anthropic', 'gemini', or 'ollama'
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL || 'gpt-4',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  maxTokens: 4000,
  temperature: 0.7,
  maxRetries: 3,
  retryDelay: 1000,
};

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
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:70',message:'checkRateLimit entry',data:{userId,subscriptionTier,validTiers:Object.keys(RATE_LIMITS)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const now = Date.now();
  const userUsage = usageTracker.get(userId);
  
  // #region agent log
  if (!(subscriptionTier in RATE_LIMITS)) {
    fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:76',message:'Invalid subscription tier',data:{subscriptionTier,validTiers:Object.keys(RATE_LIMITS)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion
  
  if (!userUsage) {
    const rateLimit = RATE_LIMITS[subscriptionTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
    usageTracker.set(userId, { count: 1, resetTime: now + rateLimit.windowMs });
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:81',message:'Rate limit initialized',data:{userId,subscriptionTier,resetTime:now + rateLimit.windowMs},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return true;
  }

  // Reset if window has passed
  if (now > userUsage.resetTime) {
    const rateLimit = RATE_LIMITS[subscriptionTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
    usageTracker.set(userId, { count: 1, resetTime: now + rateLimit.windowMs });
    return true;
  }

  // Check if limit exceeded
  const rateLimit = RATE_LIMITS[subscriptionTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
  const limit = rateLimit.daily;
  if (userUsage.count >= limit) {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:89',message:'Rate limit exceeded',data:{userId,subscriptionTier,count:userUsage.count,limit},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return false;
  }

  // Increment usage
  usageTracker.set(userId, { count: userUsage.count + 1, resetTime: userUsage.resetTime });
  return true;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages: any[]): Promise<any> {
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

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Call Anthropic API
 */
async function callAnthropic(messages: any[]): Promise<any> {
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

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Call Ollama API
 */
async function callOllama(messages: any[]): Promise<any> {
  if (!AI_CONFIG.model) {
    throw new Error('AI_MODEL is required for Ollama provider');
  }

  // Convert messages format for Ollama (expects role and content)
  const ollamaMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
  }));

  const url = `${AI_CONFIG.ollamaBaseUrl}/api/chat`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: ollamaMessages,
      options: {
        temperature: AI_CONFIG.temperature,
        num_predict: AI_CONFIG.maxTokens,
      },
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

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
}

/**
 * Call Google Gemini API
 */
async function callGemini(messages: any[]): Promise<any> {
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:150',message:'callGemini entry',data:{messageCount:messages.length,hasApiKey:!!AI_CONFIG.apiKey,model:AI_CONFIG.model},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  if (!AI_CONFIG.apiKey) {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:155',message:'Missing AI_API_KEY',data:{provider:AI_CONFIG.provider},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    throw new Error('AI_API_KEY is not configured');
  }
  
  // Convert messages format for Gemini
  const geminiMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:163',message:'Gemini message conversion',data:{originalCount:messages.length,convertedCount:geminiMessages.length,firstMessageRole:geminiMessages[0]?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${AI_CONFIG.apiKey}`;
  
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:170',message:'Gemini API request',data:{url:url.replace(AI_CONFIG.apiKey,'[REDACTED]'),model:AI_CONFIG.model},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
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

  if (!response.ok) {
    const errorText = await response.text();
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:178',message:'Gemini API error',data:{status:response.status,statusText:response.statusText,errorText:errorText.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:185',message:'Gemini API response',data:{hasCandidates:!!data.candidates,candidateCount:data.candidates?.length,hasContent:!!data.candidates?.[0]?.content?.parts?.[0]?.text},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
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
}

/**
 * Retry logic with exponential backoff
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
  try {
    const body = await c.req.json();
    const { messages, userId, subscriptionTier = 'free' } = body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'Invalid messages format' }, 400);
    }

    if (!userId) {
      return c.json({ error: 'User ID required' }, 400);
    }

    // Check rate limits
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/dead119f-f43b-4b6c-98f2-917f26109bf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-handler.ts:256',message:'Checking rate limit',data:{userId,subscriptionTier},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
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
      return c.json({ error: 'Content violates community guidelines' }, 400);
    }

    // Call AI API with retry logic
    const aiResponse = await retryWithBackoff(async () => {
      if (AI_CONFIG.provider === 'openai') {
        return await callOpenAI(messages);
      } else if (AI_CONFIG.provider === 'anthropic') {
        return await callAnthropic(messages);
      } else if (AI_CONFIG.provider === 'gemini') {
        return await callGemini(messages);
      } else if (AI_CONFIG.provider === 'ollama') {
        return await callOllama(messages);
      } else {
        throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`);
      }
    });

    // Extract completion text
    let completion: string;
    if (AI_CONFIG.provider === 'openai') {
      completion = aiResponse.choices[0]?.message?.content || '';
    } else if (AI_CONFIG.provider === 'anthropic') {
      completion = aiResponse.content[0]?.text || '';
    } else if (AI_CONFIG.provider === 'gemini') {
      completion = aiResponse.choices[0]?.message?.content || '';
    } else if (AI_CONFIG.provider === 'ollama') {
      completion = aiResponse.choices[0]?.message?.content || '';
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

    return c.json({
      success: true,
      completion,
      usage,
    });

  } catch (error) {
    console.error('AI Handler Error:', error);
    return c.json({
      error: 'Failed to process AI request',
      message: error instanceof Error ? error.message : 'Unknown error',
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

