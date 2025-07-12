# Build stage - includes all build dependencies
FROM node:18-bullseye AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

# Copy source code and build client
COPY . .
RUN pnpm run client:build

# Build server TypeScript
RUN npx tsc --project server/tsconfig.json

# Production stage - minimal runtime dependencies
FROM node:18-bullseye-slim AS production

# Install system dependencies for runtime
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libgconf-2-4 \
    && rm -rf /var/lib/apt/lists/*

# Install Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Install Pandoc and LaTeX (only essential packages)
RUN apt-get update && apt-get install -y \
    pandoc \
    texlive-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-xetex \
    lmodern \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g @marp-team/marp-cli

# Set environment variables
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN=/usr/bin/chromium
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy only production node_modules (install production deps only)
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && \
    pnpm install --prod --no-frozen-lockfile && \
    pnpm store prune

# Copy built artifacts from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/server/dist ./server/dist
COPY --from=builder /usr/src/app/server/minimal.js ./server/
COPY --from=builder /usr/src/app/server/tsconfig.json ./server/

# Create runtime directories and user
RUN mkdir -p server/downloads server/temp && \
    groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m appuser && \
    chown -R appuser:nodejs /usr/src/app

USER appuser

EXPOSE 3001
CMD ["node", "server/minimal.js"]