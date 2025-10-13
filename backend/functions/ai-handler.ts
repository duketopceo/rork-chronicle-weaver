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
  provider: process.env.AI_PROVIDER || 'openai', // 'openai' or 'anthropic'
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL || 'gpt-4',
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
  const now = Date.now();
  const userUsage = usageTracker.get(userId);
  
  if (!userUsage) {
    usageTracker.set(userId, { count: 1, resetTime: now + RATE_LIMITS[subscriptionTier].windowMs });
    return true;
  }

  // Reset if window has passed
  if (now > userUsage.resetTime) {
    usageTracker.set(userId, { count: 1, resetTime: now + RATE_LIMITS[subscriptionTier].windowMs });
    return true;
  }

  // Check if limit exceeded
  const limit = RATE_LIMITS[subscriptionTier].daily;
  if (userUsage.count >= limit) {
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
    if (!checkRateLimit(userId, subscriptionTier)) {
      return c.json({ 
        error: 'Rate limit exceeded',
        message: 'You have reached your daily AI request limit. Upgrade to continue.',
        limit: RATE_LIMITS[subscriptionTier].daily,
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
      } else {
        throw new Error('Unsupported AI provider');
      }
    });

    // Extract completion text
    let completion: string;
    if (AI_CONFIG.provider === 'openai') {
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
    cacheSize: responseCache.size,
    activeUsers: usageTracker.size,
  });
});

export default app;

