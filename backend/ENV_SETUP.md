# Environment Variables Setup

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=production

# Firebase Admin SDK Configuration
# Get these from Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Stripe Configuration
# Get these from Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# AI Provider Configuration
# Choose: 'openai' or 'anthropic'
AI_PROVIDER=openai

# OpenAI Configuration (if using OpenAI)
AI_API_KEY=sk-your-openai-api-key-here
AI_MODEL=gpt-4

# Anthropic Configuration (if using Anthropic)
# AI_API_KEY=sk-ant-your-anthropic-api-key-here
# AI_MODEL=claude-3-opus-20240229

# AI Handler URL (for internal service calls)
# Default: http://localhost:8080/ai
# In Docker: http://backend-node1:8080/ai
AI_HANDLER_URL=http://localhost:8080/ai
```

## Required Variables

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (production/development)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `AI_PROVIDER` - AI provider (openai/anthropic)
- `AI_API_KEY` - AI provider API key
- `AI_MODEL` - AI model name
- `AI_HANDLER_URL` - AI handler service URL (for internal calls)
