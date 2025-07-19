# Deployment Guide

This project supports two deployment configurations:

## Configuration Files

### 1. `docker-compose.yml` (Default/Development)
- **Purpose**: Local development and simple deployments
- **Features**: 
  - Exposes port 3000 directly
  - Includes git commit hash build args
  - Simple restart policy
- **Usage**: `./build-fresh.sh` or `docker compose up`

### 2. `docker-compose.proxy.yml` (Production/Proxy)
- **Purpose**: Production deployments behind nginx-proxy-manager
- **Features**:
  - No exposed ports (proxy handles routing)
  - Connected to nginx-proxy-manager network
  - Persistent volumes for downloads/temp
  - Includes git commit hash build args
- **Usage**: `./build-fresh.sh docker-compose.proxy.yml`

## Build Script Usage

The `build-fresh.sh` script accepts the compose file as an argument:

```bash
# Use default docker-compose.yml
./build-fresh.sh

# Use proxy configuration
./build-fresh.sh docker-compose.proxy.yml

# Use any custom compose file
./build-fresh.sh docker-compose.custom.yml
```

## Key Features

### ✅ Git Commit Hash Tracking
- Both configurations inject current git commit as build argument
- Displays git commit hash in application footer
- Prevents Docker cache issues by using commit hash for cache busting

### ✅ Fresh Build Guarantee
- `build-fresh.sh` ensures no stale Docker cache
- Removes old containers and images
- Rebuilds with current git commit hash
- Verifies deployment by showing git commit

### ✅ Environment Variable Fallback
- Works in environments without `.git` folder (Docker builds)
- Falls back to `GIT_COMMIT_HASH` or `GIT_COMMIT` environment variables
- Graceful degradation if git unavailable

## Quick Commands

### Development
```bash
./build-fresh.sh
```

### Production (with proxy)
```bash
./build-fresh.sh docker-compose.proxy.yml
```

### Manual deployment
```bash
# Get current commit
GIT_COMMIT=$(git rev-parse --short HEAD)

# Build and deploy
GIT_COMMIT=$GIT_COMMIT docker compose -f docker-compose.proxy.yml build --build-arg GIT_COMMIT=$GIT_COMMIT
GIT_COMMIT=$GIT_COMMIT docker compose -f docker-compose.proxy.yml up -d
```

### Verify deployment
```bash
# Check via Playwright
node playwright-console-test.js

# Check via curl (if port exposed)
curl -s http://localhost:3000 | grep -o 'Git: [a-f0-9]\{7\}'
```

## Network Configuration

### Default (docker-compose.yml)
- Uses default Docker network
- Port 3000 exposed to host
- Suitable for direct access

### Proxy (docker-compose.proxy.yml)  
- Connects to `nginx-proxy-manager` external network
- No ports exposed (handled by proxy)
- Includes persistent volumes for file storage

## Troubleshooting

### Stale Cache Issues
Always use `./build-fresh.sh` to ensure fresh builds. This script:
1. Stops existing containers
2. Removes old images
3. Builds with git commit as cache-busting build arg
4. Starts fresh containers

### Git Commit Not Showing
1. Check if `__GIT_COMMIT_HASH__` is being injected in build logs
2. Verify Vite config console output shows correct commit
3. Use Playwright test to check browser console logs
4. Ensure build script passes `GIT_COMMIT` environment variable

### Network Issues
- For proxy setup: Ensure `nginx-proxy-manager` network exists
- For direct access: Use default compose file with port mapping
- Check container logs: `docker compose logs markdown-converter`