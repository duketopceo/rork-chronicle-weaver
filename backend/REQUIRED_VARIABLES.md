# Required Environment Variables

Complete reference for all environment variables needed for Chronicle Weaver backend deployment.

## 🔴 Required Variables (Must Have)

These variables are **required** for the backend to function:

### Firebase Configuration

| Variable | Description | Where to Get | Example |
|----------|-------------|--------------|---------|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | Firebase Console → Project Settings → General | `chronicle-weaver-460713` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Firebase Console → Project Settings → Service Accounts | `firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | Firebase Console → Project Settings → Service Accounts → Generate New Private Key | `"-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"` |

**How to get Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Download JSON file
7. Extract values from JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)

### Stripe Configuration

| Variable | Description | Where to Get | Example |
|----------|-------------|--------------|---------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | Stripe Dashboard → Developers → API keys → Secret key | `sk_live_51AbCdEf...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard → Developers → Webhooks → Add endpoint → Signing secret | `whsec_1234567890abcdef...` |

**How to get Stripe credentials:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click "Developers" → "API keys"
3. Copy "Secret key" (starts with `sk_live_` or `sk_test_`)
4. For webhook secret:
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint" or select existing
   - Copy "Signing secret" (starts with `whsec_`)

### AI Provider Configuration

| Variable | Description | Where to Get | Example |
|----------|-------------|--------------|---------|
| `AI_PROVIDER` | AI service provider | Choose: `openai` or `anthropic` | `openai` |
| `AI_API_KEY` | AI provider API key | Provider dashboard | `sk-proj-...` (OpenAI) or `sk-ant-...` (Anthropic) |
| `AI_MODEL` | AI model to use | Provider documentation | `gpt-4` (OpenAI) or `claude-3-opus-20240229` (Anthropic) |

**How to get AI credentials:**

**OpenAI:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Click "API keys" → "Create new secret key"
3. Copy the key (starts with `sk-proj-`)
4. Common models: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`

**Anthropic:**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Click "API Keys" → "Create Key"
3. Copy the key (starts with `sk-ant-`)
4. Common models: `claude-3-opus-20240229`, `claude-3-sonnet-20240229`

## 🟡 Optional Variables (Have Defaults)

These variables have default values but can be customized:

| Variable | Default | Description | When to Change |
|----------|---------|-------------|----------------|
| `NODE_ENV` | `production` | Environment mode | Set to `development` for local dev |
| `PORT` | `8080` | Server port | Change if port conflict |
| `AI_HANDLER_URL` | `http://backend:8080/ai` | Internal AI handler URL | Only change if service name/port differs |

## 📋 Complete Variable List for Portainer

Copy this list when deploying in Portainer:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
AI_PROVIDER=openai
AI_API_KEY=sk-your-ai-api-key
AI_MODEL=gpt-4
NODE_ENV=production
AI_HANDLER_URL=http://backend:8080/ai
```

## 🔐 Security Best Practices

### For Portainer Deployment:

1. **Use Docker Secrets** (Recommended for production)
   ```bash
   echo -n "your-private-key" | docker secret create firebase_private_key -
   echo -n "your-stripe-key" | docker secret create stripe_secret_key -
   echo -n "your-ai-key" | docker secret create ai_api_key -
   ```
   Then reference in compose file (see `SWARM_SETUP.md`)

2. **Environment Variables in Portainer**
   - Use Portainer's environment variable management
   - Mark sensitive variables as "password" type
   - Don't commit `.env` files to git

3. **Variable Validation**
   - Ensure `FIREBASE_PRIVATE_KEY` includes `\n` characters
   - Verify API keys are active and have correct permissions
   - Test webhook secret matches Stripe endpoint

## 📝 Variable Format Examples

### Firebase Private Key
**Important:** Must include `\n` for newlines:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Stripe Keys
```
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

### AI Provider
```
AI_PROVIDER=openai
AI_API_KEY=sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
AI_MODEL=gpt-4
```

## ✅ Pre-Deployment Checklist

Before deploying, verify you have:

- [ ] `FIREBASE_PROJECT_ID` - From Firebase Console
- [ ] `FIREBASE_CLIENT_EMAIL` - From Firebase service account JSON
- [ ] `FIREBASE_PRIVATE_KEY` - From Firebase service account JSON (with `\n`)
- [ ] `STRIPE_SECRET_KEY` - From Stripe Dashboard (API keys)
- [ ] `STRIPE_WEBHOOK_SECRET` - From Stripe Dashboard (Webhooks)
- [ ] `AI_PROVIDER` - Chosen provider (`openai` or `anthropic`)
- [ ] `AI_API_KEY` - From provider dashboard
- [ ] `AI_MODEL` - Model name matching your provider
- [ ] `NODE_ENV` - Set to `production` for production
- [ ] `AI_HANDLER_URL` - Default is fine unless custom setup

## 🧪 Testing Variables

After setting variables, test the deployment:

```bash
# Check health endpoint
curl http://localhost:8080/health

# Should return:
# {"status":"healthy","timestamp":"...","version":"1.0.0","environment":"production"}
```

If health check fails, check logs:
```bash
docker service logs chronicle-weaver_backend
# or in Portainer: Stacks → chronicle-weaver → backend → Logs
```

## 📚 Related Documentation

- `ENV_SETUP.md` - Environment setup guide
- `PORTAINER_SETUP.md` - Portainer deployment guide
- `PORTAINER_QUICKSTART.md` - Quick start guide
- `SWARM_SETUP.md` - Docker Swarm setup with secrets
