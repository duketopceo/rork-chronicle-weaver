# Docker Backend Setup

This directory contains the Docker configuration for running the Chronicle Weaver backend on a Mac mini cluster.

## Prerequisites

- Docker and Docker Compose installed
- Environment variables configured (see `ENV_SETUP.md`)
- Node.js 18+ (for local development)

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp ENV_SETUP.md .env
   # Edit .env with your actual values
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up -d --build
   ```

3. **Check service status:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f backend-node1
   ```

## Architecture

The setup runs 3 backend nodes:
- `backend-node1` - Port 8081
- `backend-node2` - Port 8082  
- `backend-node3` - Port 8083

Each node runs the same backend service and can handle requests independently. Use a load balancer (nginx, HAProxy, etc.) in front of these nodes for production.

## Building

Build a single image:
```bash
docker build -t chronicle-weaver-backend ./backend
```

Build all services:
```bash
docker-compose build
```

## Running

Start all services:
```bash
docker-compose up -d
```

Start a specific node:
```bash
docker-compose up -d backend-node1
```

Stop all services:
```bash
docker-compose down
```

## Health Checks

Each container has a health check endpoint at `/health`. Check status:

```bash
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health
```

## Environment Variables

See `ENV_SETUP.md` for required environment variables. These can be set in:
1. `.env` file (recommended)
2. `docker-compose.yml` environment section
3. Docker environment variables

## Troubleshooting

**Container won't start:**
- Check logs: `docker-compose logs backend-node1`
- Verify environment variables are set correctly
- Ensure port 8081-8083 are not in use

**Build fails:**
- Ensure you're building from the project root
- Check that all dependencies are in `package.json`
- Verify TypeScript compilation: `cd backend/functions && npm run build`

**Runtime errors:**
- Check Firebase credentials are correct
- Verify API keys are valid
- Review container logs for specific error messages

## Development

For local development without Docker:

```bash
cd backend/functions
npm install
npm run build
npm run start:docker
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a reverse proxy/load balancer in front of the 3 nodes
3. Configure SSL/TLS termination at the load balancer
4. Set up monitoring and logging
5. Configure resource limits appropriately for your Mac minis

## Mac Mini Cluster Setup

For a 3-node Mac mini cluster:

1. **Option 1: Single machine with 3 containers**
   - Run all 3 containers on one Mac mini
   - Use different ports (8081, 8082, 8083)

2. **Option 2: Distributed across 3 machines**
   - Deploy one container per Mac mini
   - Use a load balancer to distribute traffic
   - Configure shared networking if needed

## Resource Limits

Default resource limits (adjust in `docker-compose.yml`):
- CPU: 2 cores max, 1 core reserved
- Memory: 2GB max, 1GB reserved

Adjust based on your Mac mini specifications.
