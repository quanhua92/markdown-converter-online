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

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f "$COMPOSE_FILE" down

# Remove old images to force rebuild
echo "🗑️  Removing old images..."
docker compose -f "$COMPOSE_FILE" rm -f
docker image prune -f

# Build with git commit as build arg (forces cache invalidation)
echo "🔨 Building with fresh cache..."
GIT_COMMIT=$GIT_COMMIT docker compose -f "$COMPOSE_FILE" build --build-arg GIT_COMMIT=$GIT_COMMIT

# Stop existing containers after build
echo "🛑 Stopping containers after build..."
docker compose -f "$COMPOSE_FILE" stop

# Start the new containers
echo "🏃 Starting fresh containers..."
GIT_COMMIT=$GIT_COMMIT docker compose -f "$COMPOSE_FILE" up -d

echo "✅ Fresh build complete!"
echo "🔗 Git commit: $GIT_COMMIT"
echo "📋 Compose file: $COMPOSE_FILE"