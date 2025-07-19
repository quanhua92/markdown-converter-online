# Remote Deployment Guide

This guide explains how to ensure fresh builds in remote environments where you only have access to `docker compose up/down`.

## Problem
Docker caching can cause stale builds where new code changes aren't reflected in the running container, even after `docker compose up --build`.

## Solutions

### Option 1: Use the Build Script (Recommended)
```bash
# Use default docker-compose.yml
./build-fresh.sh

# Use specific compose file (e.g., for proxy setup)
./build-fresh.sh docker-compose.proxy.yml

# Download and run the fresh build script
curl -sSL https://raw.githubusercontent.com/[your-repo]/main/build-fresh.sh | bash
```

### Option 2: Manual Fresh Build
```bash
# Set git commit environment variable
export GIT_COMMIT=$(git rev-parse --short HEAD)

# Stop and remove everything
docker compose down
docker compose rm -f
docker image prune -f

# Build with fresh cache
docker compose build --no-cache

# Start fresh containers
docker compose up -d
```

### Option 3: Force Cache Invalidation with Build Args
```bash
# Get current git commit
GIT_COMMIT=$(git rev-parse --short HEAD)

# Build with git commit arg (forces cache invalidation)
GIT_COMMIT=$GIT_COMMIT docker compose build --build-arg GIT_COMMIT=$GIT_COMMIT
docker compose up -d
```

### Option 4: Quick Commands for Common Scenarios

#### For CI/CD Pipelines
```bash
# Add this to your CI/CD script
export GIT_COMMIT=${GITHUB_SHA::7}  # For GitHub Actions
# or
export GIT_COMMIT=${CI_COMMIT_SHORT_SHA}  # For GitLab CI

docker compose build --build-arg GIT_COMMIT=$GIT_COMMIT
docker compose up -d
```

#### For Manual Remote Deployment
```bash
# One-liner for quick fresh deployment
GIT_COMMIT=$(git rev-parse --short HEAD) docker compose down && docker compose build --build-arg GIT_COMMIT=$GIT_COMMIT && docker compose up -d
```

### Option 5: Verify Deployment
```bash
# Check if the latest git commit is displayed
curl -s http://localhost:3000 | grep -o 'Git: [a-f0-9]\{7\}'

# Or check Docker logs
docker compose logs markdown-converter | grep "Git commit"
```

## How It Works

### 1. `.dockerignore` File
Ensures only necessary files are copied, reducing cache issues:
- Excludes `node_modules`, `dist`, build outputs
- Excludes development files that shouldn't affect builds

### 2. Build Args for Cache Busting
The Dockerfile uses build arguments to force cache invalidation:
```dockerfile
ARG GIT_COMMIT=unknown
ENV GIT_COMMIT_HASH=${GIT_COMMIT}
```

When the git commit changes, Docker is forced to rebuild layers that depend on it.

### 3. Git Commit Environment Variable
The application uses Vite's build-time variable injection:
```javascript
// vite.config.ts
const gitCommitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()

export default defineConfig({
  define: {
    __GIT_COMMIT_HASH__: JSON.stringify(gitCommitHash)
  }
})
```

## Troubleshooting

### Still Seeing Stale Data?
1. **Check git commit in browser**: Look for `Git: [7-char-hash]` in footer
2. **Verify build args**: Run with verbose output `docker compose build --progress=plain`
3. **Clear all cache**: `docker system prune -a` (WARNING: removes all unused images)
4. **Check .dockerignore**: Ensure important files aren't being excluded

### In Production Environments
- Use specific image tags instead of `latest`
- Consider using multi-stage builds with hash-based tags
- Implement health checks that verify git commit
- Use container registries with proper tagging

## Best Practices

1. **Always pass git commit**: `GIT_COMMIT=$(git rev-parse --short HEAD)`
2. **Use build args**: Include in docker-compose.yml build section
3. **Verify deployment**: Check footer shows correct git commit
4. **Monitor logs**: Look for "Building with git commit: ..." in build logs
5. **Document process**: Ensure team knows how to force fresh builds

## Example Deployment Workflow
```bash
#!/bin/bash
set -e

echo "🚀 Deploying latest changes..."

# Pull latest changes
git pull origin main

# Get commit hash
COMMIT=$(git rev-parse --short HEAD)
echo "📝 Deploying commit: $COMMIT"

# Deploy with fresh build
GIT_COMMIT=$COMMIT docker compose down
GIT_COMMIT=$COMMIT docker compose build --build-arg GIT_COMMIT=$COMMIT
GIT_COMMIT=$COMMIT docker compose up -d

# Verify deployment
sleep 5
DEPLOYED_COMMIT=$(curl -s http://localhost:3000 | grep -o 'Git: [a-f0-9]\{7\}' | cut -d' ' -f2)
if [ "$DEPLOYED_COMMIT" = "$COMMIT" ]; then
    echo "✅ Deployment successful! Running commit: $DEPLOYED_COMMIT"
else
    echo "❌ Deployment verification failed. Expected: $COMMIT, Got: $DEPLOYED_COMMIT"
    exit 1
fi
```