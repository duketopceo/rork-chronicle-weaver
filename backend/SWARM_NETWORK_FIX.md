# Swarm Network Fix

If you're getting the error:
```
The network chronicle-weaver-network cannot be used with services. Only networks scoped to the swarm can be used
```

## Solution 1: Remove Existing Network (Recommended)

The network might already exist with the wrong driver. Remove it first:

```bash
# List networks
docker network ls

# Remove the old network if it exists
docker network rm chronicle-weaver-network

# Or force remove if it's in use
docker network rm -f chronicle-weaver-network
```

Then redeploy the stack in Portainer.

## Solution 2: Update Stack in Portainer

1. Go to **Stacks** → **chronicle_weaver**
2. Click **Editor**
3. The compose file should now have `driver: overlay` (already updated)
4. Click **Update the stack**

## Solution 3: Clean Up and Redeploy

If the above doesn't work:

```bash
# Remove the stack
docker stack rm chronicle_weaver

# Wait a few seconds, then remove any remaining networks
docker network prune -f

# Redeploy in Portainer
```

## Verification

After redeploying, verify the network:

```bash
docker network ls | grep chronicle
```

You should see a network with `overlay` driver, not `bridge`.

## Why This Happens

- Previous deployment created a `bridge` network
- Swarm requires `overlay` networks
- The network name conflict prevents Swarm from creating a new one
- Removing the old network allows Swarm to create it correctly
