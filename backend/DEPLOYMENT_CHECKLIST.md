# Cluster Deployment Checklist

Use this checklist to deploy the Chronicle Weaver backend on your Mac mini cluster.

## Pre-Deployment

### 1. Code Preparation
- [x] All Docker files created and committed
- [x] Standalone server.ts created
- [x] Dockerfile optimized for ARM64
- [x] docker-stack.yml configured for Swarm
- [ ] Code pushed to repository
- [ ] Latest code pulled on deployment machines

### 2. Environment Setup
- [ ] Create `.env` file with all required variables (see `ENV_SETUP.md`)
- [ ] Verify Firebase credentials are correct
- [ ] Verify Stripe API keys are valid
- [ ] Verify AI provider API keys are valid
- [ ] Test environment variables locally

### 3. Docker Setup
- [ ] Docker installed on all Mac minis
- [ ] Docker Swarm initialized (manager node)
- [ ] Worker nodes joined to Swarm
- [ ] Docker network connectivity verified

## Deployment Steps

### Step 1: Build Docker Image

**On manager node or build machine:**
```bash
cd /path/to/rork-chronicle-weaver
docker build -t chronicle-weaver-backend:latest ./backend
```

**Or if using a registry:**
```bash
docker build -t your-registry/chronicle-weaver-backend:latest ./backend
docker push your-registry/chronicle-weaver-backend:latest
```

### Step 2: Set Environment Variables

**Option A: Export before deployment**
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

**Option B: Use Docker Secrets (Recommended)**
```bash
echo -n "your-private-key" | docker secret create firebase_private_key -
echo -n "your-stripe-key" | docker secret create stripe_secret_key -
echo -n "your-ai-key" | docker secret create ai_api_key -
```

### Step 3: Deploy Stack

```bash
# Navigate to project directory
cd /path/to/rork-chronicle-weaver

# Deploy the stack
docker stack deploy -c docker-stack.yml chronicle-weaver
```

### Step 4: Verify Deployment

```bash
# Check service status
docker service ls

# Check service details
docker service ps chronicle-weaver_backend

# View logs
docker service logs -f chronicle-weaver_backend

# Test health endpoint
curl http://localhost:8080/health

# Check all replicas are running
docker service ps chronicle-weaver_backend --format "table {{.Name}}\t{{.Node}}\t{{.CurrentState}}"
```

## Post-Deployment

### Verification
- [ ] All 3 replicas are running
- [ ] Health checks are passing
- [ ] API endpoints are responding
- [ ] tRPC endpoints are working
- [ ] AI handler is accessible
- [ ] Firebase connection is working
- [ ] Stripe integration is working

### Monitoring
- [ ] Set up log aggregation (if needed)
- [ ] Configure health check monitoring
- [ ] Set up alerts for service failures
- [ ] Monitor resource usage

### Load Balancing
- [ ] Configure reverse proxy/load balancer (nginx, HAProxy, etc.)
- [ ] Set up SSL/TLS certificates
- [ ] Configure domain DNS
- [ ] Test load distribution

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker service logs chronicle-weaver_backend

# Check service details
docker service inspect chronicle-weaver_backend

# Check if image exists
docker images | grep chronicle-weaver-backend
```

### Environment Variables Not Working
- Verify variables are exported before `docker stack deploy`
- Check service environment: `docker service inspect chronicle-weaver_backend | grep -A 20 Env`
- Consider using Docker secrets instead

### Port Conflicts
- Check if port 8080 is already in use: `lsof -i :8080`
- Modify published port in docker-stack.yml if needed

### Image Not Found
- Build image: `docker build -t chronicle-weaver-backend:latest ./backend`
- If using registry, ensure image is pushed and accessible
- Check image name matches docker-stack.yml

### Replicas Not Distributing
- Check node availability: `docker node ls`
- Verify placement constraints in docker-stack.yml
- Check node resources: `docker node inspect <node-id>`

## Scaling

### Scale Up
```bash
docker service scale chronicle-weaver_backend=5
```

### Scale Down
```bash
docker service scale chronicle-weaver_backend=2
```

## Updates

### Update Code
```bash
# 1. Pull latest code
git pull

# 2. Build new image
docker build -t chronicle-weaver-backend:v1.1.0 ./backend

# 3. Update docker-stack.yml with new image tag

# 4. Redeploy
docker stack deploy -c docker-stack.yml chronicle-weaver
```

### Rolling Update
Swarm handles rolling updates automatically. If update fails, it will rollback:
```bash
# Monitor update
docker service ps chronicle-weaver_backend

# Manual rollback if needed
docker service rollback chronicle-weaver_backend
```

## Rollback Plan

If deployment fails:
1. Check logs: `docker service logs chronicle-weaver_backend`
2. Rollback service: `docker service rollback chronicle-weaver_backend`
3. Remove stack if needed: `docker stack rm chronicle-weaver`
4. Fix issues and redeploy

## Security Checklist

- [ ] Environment variables are not committed to git
- [ ] Docker secrets used for sensitive data
- [ ] Non-root user in Dockerfile
- [ ] Resource limits configured
- [ ] Network isolation configured
- [ ] SSL/TLS configured at load balancer
- [ ] Firewall rules configured
- [ ] Regular security updates scheduled

## Backup & Recovery

- [ ] Backup strategy for persistent data (if any)
- [ ] Document recovery procedures
- [ ] Test restore procedures

## Performance Tuning

- [ ] Adjust resource limits based on Mac mini specs
- [ ] Configure appropriate replica count
- [ ] Monitor and optimize based on usage
- [ ] Set up auto-scaling if needed

## Documentation

- [ ] Deployment procedures documented
- [ ] Troubleshooting guide available
- [ ] Team members trained on deployment
- [ ] Runbooks created for common issues
