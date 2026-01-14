# Portainer Setup Guide

This guide explains how to deploy and manage the Chronicle Weaver backend using Portainer.

## What is Portainer?

Portainer is a lightweight management UI for Docker and Kubernetes. It provides a web-based interface to manage containers, images, networks, volumes, and stacks.

## Prerequisites

1. **Portainer installed** on your cluster
   - Install guide: https://docs.portainer.io/start/install/server/docker/linux
   - Or use: `docker run -d -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest`

2. **Docker Swarm initialized** (for cluster deployment)
   ```bash
   docker swarm init
   ```

3. **Repository cloned** on your manager node
   ```bash
   git clone git@github.com:duketopceo/rork-chronicle-weaver.git
   ```

## Deployment Methods

### Method 1: Deploy from Portainer UI (Recommended)

1. **Access Portainer**
   - Open browser: `http://your-manager-ip:9000`
   - Login to Portainer

2. **Navigate to Stacks**
   - Click "Stacks" in left sidebar
   - Click "Add stack"

3. **Configure Stack**
   - **Name**: `chronicle-weaver`
   - **Build method**: Select "Repository"
   - **Repository URL**: `https://github.com/duketopceo/rork-chronicle-weaver.git`
   - **Repository reference**: `main` (or your branch)
   - **Compose path**: `docker-compose.yml`
   - **Environment variables**: Add all required variables (see below)

4. **Add Environment Variables**
   Click "Add environment variable" for each:
   - `FIREBASE_PROJECT_ID` = your-project-id
   - `FIREBASE_CLIENT_EMAIL` = your-email@project.iam.gserviceaccount.com
   - `FIREBASE_PRIVATE_KEY` = "-----BEGIN PRIVATE KEY-----\n..."
   - `STRIPE_SECRET_KEY` = sk_live_...
   - `STRIPE_WEBHOOK_SECRET` = whsec_...
   - `AI_PROVIDER` = openai
   - `AI_API_KEY` = sk-...
   - `AI_MODEL` = gpt-4
   - `NODE_ENV` = production

5. **Deploy**
   - Click "Deploy the stack"
   - Wait for deployment to complete

### Method 2: Deploy from Git Repository

1. **In Portainer UI**
   - Go to "Stacks" → "Add stack"
   - Select "Repository" build method
   - Enter repository URL and path to `docker-compose.yml`
   - Portainer will pull and deploy automatically

### Method 3: Use Portainer Template

1. **Add Template to Portainer**
   - Copy `portainer-template.json` content
   - In Portainer: Settings → App Templates
   - Add template from JSON

2. **Deploy from Template**
   - Go to "App Templates"
   - Find "Chronicle Weaver Backend"
   - Click "Deploy"
   - Fill in environment variables
   - Deploy

### Method 4: Upload Compose File

1. **Prepare compose file**
   - Ensure `docker-compose.yml` is ready
   - Environment variables can be set in Portainer UI

2. **Upload in Portainer**
   - Go to "Stacks" → "Add stack"
   - Select "Web editor" or "Upload"
   - Paste or upload `docker-compose.yml`
   - Add environment variables
   - Deploy

## Managing the Stack

### View Stack Status

1. **In Portainer UI**
   - Go to "Stacks"
   - Click on "chronicle-weaver"
   - View service status, logs, and metrics

### View Logs

1. **Service Logs**
   - Go to "Stacks" → "chronicle-weaver"
   - Click on "backend" service
   - Click "Logs" tab
   - View real-time logs

2. **Container Logs**
   - Go to "Containers"
   - Find containers with name starting with "chronicle-weaver"
   - Click on container → "Logs"

### Scale Services

1. **In Portainer UI**
   - Go to "Stacks" → "chronicle-weaver"
   - Click on "backend" service
   - Click "Scale/Replicate"
   - Adjust replica count
   - Click "Update the service"

### Update Stack

1. **Update from Git**
   - Go to "Stacks" → "chronicle-weaver"
   - Click "Editor"
   - Update compose file or pull latest from Git
   - Click "Update the stack"

2. **Redeploy**
   - Go to "Stacks" → "chronicle-weaver"
   - Click "Redeploy"
   - Confirm redeployment

### Monitor Health

1. **Health Status**
   - Go to "Stacks" → "chronicle-weaver"
   - View health status indicators
   - Green = healthy, Red = unhealthy

2. **Health Checks**
   - Health checks configured in compose file
   - Portainer displays health status automatically
   - Unhealthy containers are automatically replaced

### Resource Usage

1. **View Resources**
   - Go to "Stacks" → "chronicle-weaver"
   - Click on "backend" service
   - View CPU and memory usage
   - Check resource limits

## Environment Variables in Portainer

### Setting Variables

1. **During Deployment**
   - Add variables in stack creation form
   - Use "Add environment variable" button

2. **After Deployment**
   - Go to "Stacks" → "chronicle-weaver"
   - Click "Editor"
   - Edit environment section
   - Update stack

### Using Docker Secrets (Recommended)

1. **Create Secrets**
   ```bash
   echo -n "your-private-key" | docker secret create firebase_private_key -
   echo -n "your-stripe-key" | docker secret create stripe_secret_key -
   echo -n "your-ai-key" | docker secret create ai_api_key -
   ```

2. **In Portainer**
   - Go to "Secrets"
   - View or create secrets
   - Reference in compose file

3. **Update Compose File**
   - Uncomment secrets section
   - Reference secrets in service
   - Update stack

## Portainer Features for Chronicle Weaver

### 1. Stack Management
- Deploy, update, and remove stacks
- View stack status and health
- Manage multiple environments

### 2. Service Monitoring
- Real-time logs
- Resource usage metrics
- Health check status
- Container status

### 3. Network Management
- View network configuration
- Manage network connections
- Monitor network traffic

### 4. Volume Management
- Create and manage volumes
- View volume usage
- Backup volumes

### 5. Image Management
- View built images
- Pull images from registries
- Manage image tags

## Troubleshooting in Portainer

### Service Won't Start

1. **Check Logs**
   - Go to "Stacks" → "chronicle-weaver" → "backend" → "Logs"
   - Look for error messages

2. **Check Events**
   - Go to "Stacks" → "chronicle-weaver"
   - Click "Events" tab
   - View deployment events

3. **Check Container Status**
   - Go to "Containers"
   - Find chronicle-weaver containers
   - Check status and errors

### Environment Variables Not Working

1. **Verify Variables**
   - Go to "Stacks" → "chronicle-weaver" → "Editor"
   - Check environment section
   - Ensure variables are set correctly

2. **Check Container Environment**
   - Go to "Containers"
   - Click on container
   - View "Env" tab
   - Verify variables are present

### Port Conflicts

1. **Check Port Usage**
   - Go to "Stacks" → "chronicle-weaver"
   - View port mappings
   - Ensure ports are not in use

2. **Change Port**
   - Edit compose file in Portainer
   - Change port mapping
   - Update stack

### Image Build Failures

1. **Check Build Logs**
   - View build output in Portainer
   - Check for build errors

2. **Verify Build Context**
   - Ensure repository is accessible
   - Check Dockerfile exists
   - Verify build context path

## Best Practices

1. **Use Environment Variables**
   - Don't hardcode secrets
   - Use Portainer's environment variable management
   - Consider Docker secrets for sensitive data

2. **Monitor Regularly**
   - Check stack status daily
   - Monitor resource usage
   - Review logs for errors

3. **Backup Configuration**
   - Export stack configuration
   - Save environment variables securely
   - Document deployment settings

4. **Use Tags for Images**
   - Tag images with versions
   - Use semantic versioning
   - Keep track of deployed versions

5. **Health Checks**
   - Ensure health checks are configured
   - Monitor health status
   - Set up alerts for failures

## Quick Reference

### Access Portainer
- URL: `http://your-manager-ip:9000`
- Default admin setup on first login

### Stack Commands (via Portainer UI)
- **Deploy**: Stacks → Add stack
- **Update**: Stacks → chronicle-weaver → Editor → Update
- **Remove**: Stacks → chronicle-weaver → Remove
- **Redeploy**: Stacks → chronicle-weaver → Redeploy

### Service Commands
- **Scale**: Stacks → chronicle-weaver → backend → Scale
- **Logs**: Stacks → chronicle-weaver → backend → Logs
- **Restart**: Stacks → chronicle-weaver → backend → Restart

## Additional Resources

- Portainer Documentation: https://docs.portainer.io
- Docker Compose Reference: https://docs.docker.com/compose
- Chronicle Weaver Docs: `backend/DOCKER_README.md`
