#!/bin/bash

# Build script that ensures fresh builds in remote environments
set -e

# Default compose file
COMPOSE_FILE="docker-compose.yml"

# Check if first argument is provided (compose file)
if [ "$1" != "" ]; then
    COMPOSE_FILE="$1"
fi

echo "🚀 Building fresh Docker image..."
echo "📋 Using compose file: $COMPOSE_FILE"

# Get current git commit
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
echo "📝 Git commit: $GIT_COMMIT"


# Build with git commit as build arg (forces cache invalidation)
echo "🔨 Building with fresh cache..."
CACHEBUST=$(date +%s)
echo "🔄 Cache bust: $CACHEBUST"
GIT_COMMIT=$GIT_COMMIT docker compose -f "$COMPOSE_FILE" build --build-arg GIT_COMMIT=$GIT_COMMIT --build-arg CACHEBUST=$CACHEBUST

# Start/restart containers with new image
echo "🔄 Starting containers with new image..."
GIT_COMMIT=$GIT_COMMIT docker compose -f "$COMPOSE_FILE" up -d --force-recreate

echo "✅ Fresh build complete!"
echo "🔗 Git commit: $GIT_COMMIT"
echo "📋 Compose file: $COMPOSE_FILE"