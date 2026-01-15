# Portainer Environment Variables - Quick Reference

Copy and paste these into Portainer's "Environment variables" section when creating your stack.

## For Gemini 3 Flash (Current Setup)

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
AI_PROVIDER=gemini
AI_API_KEY=your-gemini-api-key
AI_MODEL=gemini-1.5-flash
NODE_ENV=production
AI_HANDLER_URL=http://backend:8080/ai
```

## For Ollama (Local/Private Deployment)

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
AI_PROVIDER=ollama
AI_MODEL=llama3.2
OLLAMA_BASE_URL=http://ollama:11434
NODE_ENV=production
AI_HANDLER_URL=http://backend:8080/ai
```

**Note**: For Ollama, `AI_API_KEY` is not required. Set `OLLAMA_BASE_URL` to your Ollama instance URL (default: `http://localhost:11434` for local, or `http://ollama:11434` if running in Docker).

## Step-by-Step in Portainer

1. **In the "Environment variables" section**, click "Add environment variable"

2. **Add each variable one by one:**

   | Name | Value |
   |------|-------|
   | `FIREBASE_PROJECT_ID` | `your-project-id` |
   | `FIREBASE_CLIENT_EMAIL` | `your-service-account@project.iam.gserviceaccount.com` |
   | `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"` |
   | `STRIPE_SECRET_KEY` | `sk_live_your_secret_key` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_your_webhook_secret` |
   | `AI_PROVIDER` | `gemini` |
   | `AI_API_KEY` | `your-gemini-api-key` |
   | `AI_MODEL` | `gemini-1.5-flash` |
   | `NODE_ENV` | `production` |
   | `AI_HANDLER_URL` | `http://backend:8080/ai` |

3. **Click "Deploy the stack"**

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key or use an existing one
4. Copy the key (starts with `AIza...`)

## Gemini Model Names

- `gemini-1.5-flash` - Fast and efficient (recommended)
- `gemini-1.5-pro` - More capable, slower
- `gemini-pro` - Previous generation

## AI Provider Options

### Gemini
- **AI_PROVIDER**: `gemini`
- **AI_API_KEY**: Required (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- **AI_MODEL**: `gemini-1.5-flash` (recommended) or `gemini-1.5-pro`

### Ollama
- **AI_PROVIDER**: `ollama`
- **AI_API_KEY**: Not required
- **AI_MODEL**: Any Ollama model name (e.g., `llama3.2`, `mistral`, `codellama`)
- **OLLAMA_BASE_URL**: Ollama instance URL (default: `http://localhost:11434`)

### OpenAI
- **AI_PROVIDER**: `openai`
- **AI_API_KEY**: Required (get from [OpenAI Platform](https://platform.openai.com/api-keys))
- **AI_MODEL**: `gpt-4`, `gpt-3.5-turbo`, etc.

### Anthropic
- **AI_PROVIDER**: `anthropic`
- **AI_API_KEY**: Required (get from [Anthropic Console](https://console.anthropic.com/))
- **AI_MODEL**: `claude-3-opus-20240229`, `claude-3-sonnet-20240229`, etc.

## Notes

- **FIREBASE_PRIVATE_KEY**: Must include `\n` characters for newlines
- **AI_MODEL**: Use `gemini-1.5-flash` for Gemini 3 Flash (note: Google calls it "1.5 Flash")
- **OLLAMA_BASE_URL**: Only required when using Ollama provider. Use Docker service name if Ollama runs in the same stack.
