#!/bin/bash

# Build script that ensures fresh builds in remote environments
set -e

echo "🚀 Building fresh Docker image..."

# Get current git commit
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
echo "📝 Git commit: $GIT_COMMIT"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down

# Remove old images to force rebuild
echo "🗑️  Removing old images..."
docker compose rm -f
docker image prune -f

# Build with git commit as build arg (forces cache invalidation)
echo "🔨 Building with fresh cache..."
docker compose build --build-arg GIT_COMMIT=$GIT_COMMIT

# Start the new containers
echo "🏃 Starting fresh containers..."
docker compose up -d

echo "✅ Fresh build complete!"
echo "🔗 Git commit: $GIT_COMMIT"