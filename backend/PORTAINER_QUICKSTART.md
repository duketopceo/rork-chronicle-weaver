# Portainer Quick Start Guide

## Deploy in 5 Minutes

### Step 1: Access Portainer
```
http://your-manager-ip:9000
```

### Step 2: Create Stack
1. Click **"Stacks"** → **"Add stack"**
2. Name: `chronicle-weaver`
3. Build method: **"Repository"**
4. Repository URL: `https://github.com/duketopceo/rork-chronicle-weaver.git`
5. Compose path: `docker-compose.yml`

### Step 3: Add Environment Variables
Click "Add environment variable" for each:

| Variable | Value | Required |
|----------|-------|----------|
| `FIREBASE_PROJECT_ID` | your-project-id | ✅ |
| `FIREBASE_CLIENT_EMAIL` | your-email@project.iam.gserviceaccount.com | ✅ |
| `FIREBASE_PRIVATE_KEY` | "-----BEGIN PRIVATE KEY-----\n..." | ✅ |
| `STRIPE_SECRET_KEY` | sk_live_... | ✅ |
| `STRIPE_WEBHOOK_SECRET` | whsec_... | ✅ |
| `AI_PROVIDER` | openai | ✅ |
| `AI_API_KEY` | sk-... | ✅ |
| `AI_MODEL` | gpt-4 | ✅ |
| `NODE_ENV` | production | ⚪ |

### Step 4: Deploy
Click **"Deploy the stack"**

### Step 5: Verify
1. Wait for deployment (30-60 seconds)
2. Check stack status (should show "Running")
3. Test health: `curl http://localhost:8082/health`

## Common Tasks

### View Logs
**Stacks** → **chronicle-weaver** → **backend** → **Logs**

### Scale Service
**Stacks** → **chronicle-weaver** → **backend** → **Scale/Replicate** → Set replicas → **Update**

### Update Stack
**Stacks** → **chronicle-weaver** → **Editor** → Edit → **Update the stack**

### Restart Service
**Stacks** → **chronicle-weaver** → **backend** → **Restart**

## Troubleshooting

**Service won't start?**
- Check logs in Portainer
- Verify environment variables are set
- Check port 8080 is available

**Health check failing?**
- View container logs
- Verify `/health` endpoint responds
- Check service is running

**Need help?**
- See `PORTAINER_SETUP.md` for detailed guide
- Check `DOCKER_README.md` for Docker info
