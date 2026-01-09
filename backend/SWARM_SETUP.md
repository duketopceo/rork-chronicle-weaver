# Docker Swarm Setup Guide

This guide explains how to deploy the Chronicle Weaver backend using Docker Swarm on your Mac mini cluster.

## Prerequisites

1. **Docker Swarm initialized** on your cluster
2. **Docker image built and available** (locally or in registry)
3. **Environment variables configured**

## Quick Start

### 1. Initialize Swarm (if not already done)

On your manager node:
```bash
docker swarm init
```

To add worker nodes:
```bash
# On manager, get join token:
docker swarm join-token worker

# On worker nodes, run the command provided
```

### 2. Build the Docker Image

**Option A: Build locally (for single-node or local registry)**
```bash
docker build -t chronicle-weaver-backend:latest ./backend
```

**Option B: Build and push to registry (recommended for multi-node)**
```bash
# Build
docker build -t your-registry/chronicle-weaver-backend:latest ./backend

# Push to registry
docker push your-registry/chronicle-weaver-backend:latest

# Update docker-stack.yml to use registry image
```

### 3. Set Environment Variables

Create a `.env` file in the project root with your variables:
```bash
export FIREBASE_PROJECT_ID=your-project-id
export FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
export STRIPE_SECRET_KEY=sk_live_...
export STRIPE_WEBHOOK_SECRET=whsec_...
export AI_PROVIDER=openai
export AI_API_KEY=sk-...
export AI_MODEL=gpt-4
```

Or use Docker secrets (recommended for production):
```bash
# Create secrets
echo "your-private-key" | docker secret create firebase_private_key -
echo "your-stripe-key" | docker secret create stripe_secret_key -
echo "your-ai-key" | docker secret create ai_api_key -

# Update docker-stack.yml to use secrets
```

### 4. Deploy the Stack

```bash
# Load environment variables
source .env  # or export them manually

# Deploy the stack
docker stack deploy -c docker-stack.yml chronicle-weaver
```

### 5. Verify Deployment

```bash
# Check service status
docker service ls

# Check service details
docker service ps chronicle-weaver_backend

# View logs
docker service logs chronicle-weaver_backend

# Check health
curl http://localhost:8080/health
```

## Managing the Stack

### Update the Stack

```bash
# After making changes to docker-stack.yml
docker stack deploy -c docker-stack.yml chronicle-weaver
```

### Scale Services

```bash
# Scale to 5 replicas
docker service scale chronicle-weaver_backend=5
```

### Update Image

```bash
# Pull/build new image
docker build -t chronicle-weaver-backend:v1.1.0 ./backend

# Update stack with new image tag
# Edit docker-stack.yml to use new tag, then:
docker stack deploy -c docker-stack.yml chronicle-weaver
```

### Rollback

```bash
# Docker Swarm automatically handles rollbacks
# If update fails, it will rollback automatically
# Or manually rollback:
docker service rollback chronicle-weaver_backend
```

### Remove Stack

```bash
docker stack rm chronicle-weaver
```

## Using Docker Secrets (Recommended)

For sensitive data like API keys, use Docker secrets:

### 1. Create Secrets

```bash
# Firebase private key
echo -n "-----BEGIN PRIVATE KEY-----\n..." | docker secret create firebase_private_key -

# Stripe secret key
echo -n "sk_live_..." | docker secret create stripe_secret_key -

# AI API key
echo -n "sk-..." | docker secret create ai_api_key -
```

### 2. Update docker-stack.yml

Uncomment the `secrets` section in both the service and the secrets definition:

```yaml
services:
  backend:
    secrets:
      - firebase_private_key
      - stripe_secret_key
      - ai_api_key
    environment:
      - FIREBASE_PRIVATE_KEY_FILE=/run/secrets/firebase_private_key
      # Update server.ts to read from file if using secrets

secrets:
  firebase_private_key:
    external: true
  stripe_secret_key:
    external: true
  ai_api_key:
    external: true
```

### 3. Update Server Code

Modify `backend/functions/server.ts` to read secrets from files:

```typescript
const privateKey = process.env.FIREBASE_PRIVATE_KEY_FILE 
  ? fs.readFileSync(process.env.FIREBASE_PRIVATE_KEY_FILE, 'utf8')
  : process.env.FIREBASE_PRIVATE_KEY;
```

## Load Balancing

Docker Swarm provides built-in load balancing. All replicas are accessible through the published port (8080). Swarm automatically distributes traffic across healthy replicas.

For external load balancing (nginx, HAProxy, etc.), you can:
1. Use Swarm's ingress network (default)
2. Configure your load balancer to point to any Swarm node on port 8080
3. Swarm will route to healthy containers

## Health Checks

Health checks are configured in the `deploy.healthcheck` section. Unhealthy containers are automatically replaced.

Monitor health:
```bash
docker service ps chronicle-weaver_backend --format "table {{.Name}}\t{{.CurrentState}}\t{{.Error}}"
```

## Networking

The stack uses an overlay network that spans all Swarm nodes. Services can communicate using service names (e.g., `backend`).

## Differences from docker-compose.yml

| Feature | docker-compose.yml | docker-stack.yml (Swarm) |
|---------|-------------------|-------------------------|
| Build | Supports `build:` | Must pre-build images |
| Container names | Custom names | Auto-generated |
| Restart policy | `restart:` | `deploy.restart_policy` |
| Replicas | Separate services | `deploy.replicas` |
| Network | Bridge | Overlay |
| Environment | `env_file:` supported | Use env vars or secrets |
| Ports | Direct mapping | Ingress mode |

## Troubleshooting

**Service won't start:**
```bash
# Check service logs
docker service logs chronicle-weaver_backend

# Check service details
docker service inspect chronicle-weaver_backend
```

**Image not found:**
- Ensure image is built: `docker images | grep chronicle-weaver-backend`
- If using registry, ensure image is pushed and accessible
- Check image name in docker-stack.yml matches your image

**Environment variables not working:**
- Swarm doesn't support `.env` files directly
- Export variables before `docker stack deploy`
- Or use Docker secrets for sensitive data

**Port conflicts:**
- Only one service can publish to a port in Swarm
- Use different ports or configure routing rules

## Production Recommendations

1. **Use Docker secrets** for all sensitive data
2. **Push images to a registry** (Docker Hub, GitHub Container Registry, etc.)
3. **Set up monitoring** (Prometheus, Grafana, etc.)
4. **Configure log aggregation** (ELK stack, Loki, etc.)
5. **Use resource limits** appropriate for your Mac minis
6. **Set up automated backups** for any persistent data
7. **Configure SSL/TLS** at a reverse proxy/load balancer level

## Mac Mini Cluster Setup

For a 3-node Mac mini cluster:

1. **Initialize Swarm:**
   - Designate one Mac mini as manager: `docker swarm init`
   - Add other two as workers using join token

2. **Build and distribute image:**
   - Build on manager or use registry
   - Swarm will pull image to workers as needed

3. **Deploy stack:**
   - Run `docker stack deploy` on manager
   - Swarm distributes replicas across available nodes

4. **Monitor:**
   - Use `docker service ls` and `docker service ps` to monitor
   - Check logs: `docker service logs chronicle-weaver_backend`
