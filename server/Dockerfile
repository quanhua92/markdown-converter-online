# Multi-stage build for production deployment
FROM node:20-slim AS frontend-builder

# Build frontend first
WORKDIR /frontend
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install frontend dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy frontend source
COPY . .

# Build frontend (static files)
RUN pnpm run build

# Backend stage
FROM node:20-slim AS backend

# Install system dependencies for Pandoc and Marp
RUN apt-get update && apt-get install -y \
    pandoc \
    texlive-xelatex \
    texlive-fonts-recommended \
    texlive-latex-extra \
    chromium \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome path for Marp
ENV CHROME_PATH=/usr/bin/chromium

WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Install Marp CLI globally
RUN npm install -g @marp-team/marp-cli

# Copy backend application code
COPY server/ .

# Build TypeScript
RUN npm run build

# Copy frontend build from frontend-builder stage
COPY --from=frontend-builder /frontend/dist ./public

# Create directories for file operations
RUN mkdir -p downloads temp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the server
CMD ["npm", "start"]