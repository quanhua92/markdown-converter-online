# Multi-stage build for production deployment
FROM node:20-slim AS frontend-builder

# Build args for cache invalidation
ARG GIT_COMMIT=unknown
ARG CACHEBUST=1

# Build frontend first
WORKDIR /frontend

# Copy package files first (better caching)
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm with exact version for consistency
RUN npm install -g pnpm@latest

# Install dependencies (cached unless package files change)
RUN pnpm install --frozen-lockfile

# Copy source code (invalidates cache when code changes)
COPY . .

# Add cache bust to ensure fresh builds when needed
RUN echo "Cache bust: $CACHEBUST" > /tmp/cachebust
RUN echo "Git commit: $GIT_COMMIT" > /tmp/gitcommit

# Build frontend (static files)
RUN pnpm run build

# Backend stage
FROM node:20-slim AS backend

# Install system dependencies for Pandoc and Marp
RUN apt-get update && apt-get install -y \
    pandoc \
    texlive-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-xetex \
    lmodern \
    chromium \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome path for Marp
ENV CHROME_PATH=/usr/bin/chromium

WORKDIR /app

# Build args (after apt-get for better caching)
ARG GIT_COMMIT=unknown
ARG CACHEBUST=1

# Copy backend package files first for better caching
COPY server/package*.json ./

# Install backend dependencies
RUN npm install

# Install Marp CLI globally with consistent version
RUN npm install -g @marp-team/marp-cli

# Copy backend source code
COPY server/ .

# Build TypeScript
RUN npm run build

# Copy frontend build from frontend-builder stage
# This ensures we get the fresh build from the first stage
COPY --from=frontend-builder /frontend/dist ./public

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Verify the build contents
RUN ls -la ./public/assets/ | head -10
RUN echo "Frontend build copied successfully"

# Create directories for file operations
RUN mkdir -p downloads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the server
CMD ["npm", "start"]