# AI Debugging, Logging, and Ollama Failsafe System

## Overview

Chronicle Weaver now includes comprehensive AI debugging capabilities, enhanced logging, context management, and an Ollama-based local AI failsafe for redundancy. This document explains how to use these features.

## Table of Contents

1. [Enhanced Logging System](#enhanced-logging-system)
2. [Ollama Failsafe Configuration](#ollama-failsafe-configuration)
3. [Context Management](#context-management)
4. [Debugging Features](#debugging-features)
5. [Configuration](#configuration)
6. [Testing](#testing)

## Enhanced Logging System

### Features

- **Multi-level logging**: DEBUG, INFO, WARN, ERROR
- **Structured logging**: All logs include contextual information (requestId, sessionId, userId, etc.)
- **Performance tracking**: Request durations, API latency
- **Error tracking**: Stack traces, error chains
- **Session tracking**: All operations within a game session are tracked

### Usage

The logging system is automatically integrated into all AI operations. Logs are output to the browser console (frontend) and server logs (backend).

#### Log Levels

```typescript
// Debug - Detailed diagnostic information
logAIDebug('Processing request', { requestId, messageCount });

// Info - General informational messages
logAIInfo('API call successful', { duration: 1234, provider: 'gemini' });

// Warn - Warning messages (non-critical issues)
logAIWarn('Rate limit approaching', { usage: 4, limit: 5 });

// Error - Error conditions
logAIError('API call failed', { requestId }, error);
```

#### Log Format

All logs follow this structure:

```
[2025-02-15T10:30:45.123Z] [INFO] AI request completed {
  "requestId": "req_1234567890_abc123",
  "duration": 1234,
  "usedFailsafe": false,
  "provider": "gemini",
  "sessionId": "session_1234567890_xyz789"
}
```

### Accessing Logs

#### Frontend (Browser)

Open your browser's developer console to see all AI-related logs. Use the filter `[DEBUG]`, `[INFO]`, `[WARN]`, or `[ERROR]` to focus on specific log levels.

#### Backend (Server)

For Docker deployments:
```bash
docker logs chronicle-weaver-backend 2>&1 | grep -E "\[(DEBUG|INFO|WARN|ERROR)\]"
```

For Firebase Functions:
```bash
firebase functions:log --only ai-handler
```

## Ollama Failsafe Configuration

### What is the Ollama Failsafe?

When the primary AI provider (OpenAI, Anthropic, Gemini) fails after all retries, the system automatically falls back to a local Ollama instance for redundancy. This ensures the game continues working even during API outages.

### Setup

#### 1. Install Ollama

```bash
# Linux/Mac
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

#### 2. Pull a Model

```bash
# Recommended: Llama 2 (fast, good quality)
ollama pull llama2

# Alternative: Mistral (higher quality, slower)
ollama pull mistral

# Alternative: CodeLlama (good for structured outputs)
ollama pull codellama
```

#### 3. Start Ollama Server

```bash
# Start Ollama (runs on port 11434 by default)
ollama serve
```

#### 4. Configure Environment Variables

Add to your `.env.local` file:

```bash
# Enable Ollama failsafe (MUST be explicitly enabled)
# Set to 'true' to enable automatic failover to Ollama
ENABLE_OLLAMA_FAILSAFE=true

# Ollama server URL (default: http://localhost:11434)
OLLAMA_BASE_URL=http://localhost:11434

# Ollama model to use (default: llama2)
OLLAMA_MODEL=llama2
```

**Important**: The Ollama failsafe requires explicit opt-in. You must set `ENABLE_OLLAMA_FAILSAFE=true` to enable it. This prevents unexpected behavior in production environments where Ollama may not be installed.

### How It Works

1. **Primary API Called**: System attempts to call your configured AI provider (e.g., Gemini)
2. **Retry on Failure**: If the call fails, it retries up to 3 times with exponential backoff
3. **Failover to Ollama**: After all retries fail, if Ollama failsafe is enabled, it automatically calls your local Ollama instance
4. **Response Indicated**: The response includes `usedFailsafe: true` to indicate Ollama was used

### Monitoring Failover

Check logs for failover events:

```
[WARN] Primary provider failed after all retries, attempting Ollama failsafe {
  "primaryProvider": "gemini",
  "error": "API rate limit exceeded"
}

[INFO] Ollama failsafe successful {
  "primaryProvider": "gemini"
}
```

### Disabling Failsafe

The Ollama failsafe is disabled by default and must be explicitly enabled. To ensure it's disabled:

```bash
# In .env.local - either omit the variable or set it to false
ENABLE_OLLAMA_FAILSAFE=false
# OR simply don't set the variable at all
```

## Context Management

### Overview

The context management system maintains conversation history, game state, and narrative continuity across all AI interactions.

### Features

- **Session-based context**: Each game session has its own context
- **Conversation history**: Tracks all messages (system, user, assistant)
- **Game state snapshots**: Captures era, theme, character stats, turn count
- **Recent choices**: Maintains history of player decisions
- **Narrative summaries**: Accumulates story progression

### Usage

Context management is automatic. The system:

1. Initializes context when a game starts
2. Adds user messages and AI responses automatically
3. Tracks player choices
4. Includes context in all API requests
5. Maintains context across game sessions

### Context Structure

```typescript
interface ConversationContext {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  gameStateSnapshot: {
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
```

### Manual Context Management

If you need to manually manage context:

```typescript
import { contextManager } from '@/utils/contextManager';

// Get or create context for a session
const context = contextManager.getOrCreateContext(sessionId, gameState);

// Add a user message
contextManager.addUserMessage(sessionId, 'Player message here');

// Add an assistant response
contextManager.addAssistantMessage(sessionId, 'AI response here');

// Add a choice
contextManager.addChoice(sessionId, choice, turnNumber);

// Add narrative summary
contextManager.addNarrativeSummary(sessionId, 'Summary of recent events');

// Get formatted context for AI request
const formattedContext = contextManager.getFormattedContext(sessionId, gameState);

// Clear context for a session
contextManager.clearContext(sessionId);
```

## Debugging Features

### Debug Mode

Enable debug mode for verbose logging:

```bash
# In .env.local
EXPO_PUBLIC_DEBUG_MODE=true
```

### API Call History

Access the global debug state to see API call history:

```typescript
// In browser console
console.log(global.__CHRONICLE_DEBUG__);
```

### Performance Metrics

Performance metrics are automatically tracked and logged:

- API request duration
- Token usage
- Memory usage
- Cache hit rates

### Log Retrieval

Retrieve logs programmatically:

```typescript
import { aiLogger } from '@/utils/aiLogger';

// Get all logs
const allLogs = aiLogger.getLogs();

// Get only error logs
const errorLogs = aiLogger.getLogs(LogLevel.ERROR);

// Clear logs
aiLogger.clearLogs();

// Get session ID
const sessionId = aiLogger.getSessionId();
```

## Configuration

### Environment Variables

#### Frontend (.env.local)

```bash
# Gemini API Key (optional, for direct Gemini calls)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Backend URL
EXPO_PUBLIC_BACKEND_URL=http://localhost:8082

# Debug mode
EXPO_PUBLIC_DEBUG_MODE=true
```

#### Backend (backend/.env or environment)

```bash
# Primary AI provider
AI_PROVIDER=gemini  # Options: openai, anthropic, gemini, ollama
AI_API_KEY=your_primary_api_key_here
AI_MODEL=gemini-1.5-flash

# Ollama failsafe configuration
ENABLE_OLLAMA_FAILSAFE=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Retry configuration
AI_MAX_RETRIES=3
AI_RETRY_DELAY=1000  # milliseconds
```

## Testing

### Testing Primary API

1. Start your backend server
2. Make a game move
3. Check logs for successful API calls:

```
[INFO] AI request completed successfully {
  "duration": 2345,
  "usedFailsafe": false,
  "provider": "gemini"
}
```

### Testing Ollama Failsafe

#### Method 1: Simulate API Failure

Temporarily set an invalid API key to force failover:

```bash
AI_API_KEY=invalid_key_to_test_failsafe
```

#### Method 2: Disconnect from Internet

Disable your network connection temporarily to test failover.

#### Method 3: Monitor Logs

With Ollama running, when the primary API fails, you should see:

```
[WARN] Primary provider failed after all retries, attempting Ollama failsafe
[INFO] Ollama failsafe successful
```

### Testing Context Management

```typescript
import { contextManager } from '@/utils/contextManager';

// Check context statistics
const stats = contextManager.getContextStats(sessionId);
console.log('Context stats:', stats);
// Expected: { messageCount: X, choiceCount: Y, summaryCount: Z }
```

### Verifying Logs

Check that all operations are being logged:

```bash
# Backend logs should show
[DEBUG] Calling Gemini API
[INFO] Gemini API success
[INFO] AI request completed successfully

# Browser console should show
[INFO] Processing AI request
[DEBUG] AI request prepared
[INFO] Backend response received
```

## Troubleshooting

### Issue: Ollama Failsafe Not Working

**Check:**
1. Is Ollama installed and running? (`ollama list` should show installed models)
2. Is `ENABLE_OLLAMA_FAILSAFE=true`?
3. Is the Ollama URL correct? (default: `http://localhost:11434`)
4. Check logs for Ollama connection errors

**Solution:**
```bash
# Verify Ollama is running
curl http://localhost:11434/api/version

# Check Ollama logs
journalctl -u ollama -f  # Linux with systemd
```

### Issue: No Logs Appearing

**Check:**
1. Is debug mode enabled? (`EXPO_PUBLIC_DEBUG_MODE=true`)
2. Is console filtering enabled? (clear console filters)
3. Check browser console settings (verbose logging enabled)

### Issue: Context Not Persisting

**Check:**
1. Are you using the correct sessionId?
2. Context is cleared on page refresh (this is intentional)
3. Check context stats: `contextManager.getContextStats(sessionId)`

### Issue: High Token Usage

**Context can increase token usage**. To optimize:
1. Reduce `maxContextMessages` in contextManager
2. Reduce `maxNarrativeSummaries`
3. Use shorter summary texts

## Best Practices

1. **Enable Ollama in Production**: Provides redundancy during API outages
2. **Monitor Logs Regularly**: Check for failover events and errors
3. **Tune Context Size**: Balance between continuity and token costs
4. **Use Appropriate Log Levels**: DEBUG for development, INFO for production
5. **Test Failover**: Regularly test that Ollama failsafe works
6. **Keep Ollama Models Updated**: `ollama pull llama2` to update

## Performance Impact

- **Logging**: Minimal (<1ms per log entry)
- **Context Management**: ~5-10ms per operation
- **Ollama Failsafe**: Only activated on primary failure (no impact on normal operation)
- **First Ollama Call**: May take 2-5 seconds (model loading)
- **Subsequent Ollama Calls**: Fast (~500ms - 2s depending on model)

## Security Notes

- API keys are never logged (redacted in logs)
- Ollama runs locally, no data leaves your server
- All logs include sanitized data (no PII)
- Context is stored in memory only (cleared on restart)
