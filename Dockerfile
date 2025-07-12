FROM node:18-alpine

RUN npm install -g pnpm

RUN apk update && apk add --no-cache \
    pandoc \
    texlive \
    texlive-xetex \
    chromium \
    fontconfig \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

ENV CHROME_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

RUN npm install -g @marp-team/marp-cli

COPY . .
RUN pnpm run client:build

RUN mkdir -p server/downloads server/temp && \
    addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs && \
    chown -R appuser:nodejs /usr/src/app

USER appuser

EXPOSE 3000
CMD ["pnpm", "run", "server:start"]