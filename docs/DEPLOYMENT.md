# Hybrid Deployment Guide

This guide explains how to deploy the Markdown Converter as a hybrid application with the frontend on Vercel and backend on a remote server.

## Architecture Overview

The application supports **two deployment architectures**:

### 1. Hybrid Architecture (Recommended for Production)
```
┌─────────────────┐    ┌──────────────────┐
│                 │    │                  │
│   Vercel        │    │  Remote Server   │
│   (Frontend)    │───▶│  (Backend API)   │
│                 │    │                  │
│ • Editor        │    │ • PDF Conversion │
│ • Preview       │    │ • PPTX Conversion│
│ • Explorer      │    │ • File Downloads │
│ • 100% Client   │    │ • Marp + Pandoc  │
└─────────────────┘    └──────────────────┘
```

**Benefits**: Global CDN frontend, dedicated conversion infrastructure, auto-scaling

### 2. Standalone Architecture (Self-Hosted)
```
┌──────────────────────────────────┐
│        Single Server             │
│                                  │
│ • Frontend (Static Files)        │
│ • Backend API                    │
│ • PDF/PPTX Conversion            │
│ • File Downloads                 │
│ • Marp + Pandoc                  │
└──────────────────────────────────┘
```

**Benefits**: Single deployment, simpler setup, full control

### Frontend (Client-Side Only)
- **Hybrid**: Deployed on Vercel
- **Standalone**: Served from backend server
- **Features**: Editor, Preview, Explorer, Templates, Dark Mode
- **Dependencies**: Zero server dependencies for core features
- **API Calls**: Only for PDF/PPTX conversion

### Backend (Conversion Services)
- **Deployment**: Docker container on any server
- **Services**: Marp (PPTX), Pandoc (PDF/HTML/DOCX)
- **Multi-mode**: API-only OR full-stack with frontend included

## Frontend Deployment (Vercel)

### 1. Build Configuration

The frontend is configured to build as a static single-page application:

```json
// vercel.json
{
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api-base-url"
  }
}
```

### 2. Environment Variables

Set up the following environment variable in Vercel:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend-api.com` | Backend API URL |

### 3. Deployment Steps

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Build the frontend
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variable
vercel env add VITE_API_BASE_URL production
# Enter your backend URL: https://your-backend-api.com
```

#### Option B: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Set `VITE_API_BASE_URL` in Environment Variables
3. Deploy automatically on git push

### 4. Domain Configuration
```bash
# Add custom domain (optional)
vercel domains add your-domain.com
```

## Backend Deployment (Remote Server)

### 1. Server Requirements

**Minimum Specifications:**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB
- **OS**: Ubuntu 20.04+ or any Docker-compatible Linux

**Dependencies:**
- Docker and Docker Compose
- 2GB free space for conversion tools
- Open port 3000 (or configure custom port)

### 2. Deployment Options

#### Option A: Docker Compose (Recommended)

The main docker-compose files can now deploy both hybrid (API-only) and standalone (full-stack) modes:

**Hybrid Mode (API-only backend):**
```bash
# Clone repository
git clone your-repo-url
cd markdown-converter-online

# Deploy with standard compose file
docker-compose up -d --build

# Check status
docker-compose ps
```

**Standalone Mode (includes frontend):**
The same deployment also includes the frontend, accessible at `http://your-server:3000`

```yaml
# Existing docker-compose.yml already configured for both modes
services:
  markdown-converter:
    build: 
      context: .
      dockerfile: server/Dockerfile  # Multi-stage build with frontend
    ports:
      - "3000:3000"
    volumes:
      - ./server/downloads:/app/downloads
      - ./server/temp:/app/temp
```

#### Option B: Direct Docker

```bash
# Build full-stack image (includes frontend + backend)
docker build -f server/Dockerfile -t markdown-converter .

# Run container
docker run -d \
  --name markdown-converter \
  -p 3000:3000 \
  -v $(pwd)/server/downloads:/app/downloads \
  -v $(pwd)/server/temp:/app/temp \
  --restart unless-stopped \
  markdown-converter

# Access:
# - Frontend: http://localhost:3000
# - API: http://localhost:3000/api/health
```

#### Option C: Cloud Platforms

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**DigitalOcean App Platform:**
```yaml
# app.yaml
name: markdown-converter-backend
services:
- name: api
  source_dir: server
  build_command: npm run build
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
```

**Google Cloud Run:**
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/markdown-converter-backend server/
gcloud run deploy --image gcr.io/PROJECT-ID/markdown-converter-backend --platform managed
```

### 3. SSL/HTTPS Setup

#### Option A: Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/markdown-converter
server {
    listen 80;
    server_name your-backend-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-backend-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Option B: Cloudflare Tunnel
```bash
# Install cloudflared
cloudflared tunnel login
cloudflared tunnel create markdown-converter
cloudflared tunnel route dns markdown-converter your-backend-domain.com
cloudflared tunnel run --url http://localhost:3000 markdown-converter
```

## Local Development

### Full Stack Development
```bash
# Terminal 1: Start backend
cd server
npm install
npm run dev

# Terminal 2: Start frontend with API proxy
cd ../
VITE_API_BASE_URL=http://localhost:3000 npm run dev
```

### Frontend Only Development
```bash
# Set remote backend URL
VITE_API_BASE_URL=https://your-deployed-backend.com npm run dev
```

## Environment Configuration

### Frontend (.env)
```bash
# Required for conversion features
VITE_API_BASE_URL=https://your-backend-api.com

# Optional: Local development
# VITE_API_BASE_URL=http://localhost:3000
```

### Backend (.env)
```bash
# Server configuration
NODE_ENV=production
PORT=3000

# Optional: CORS origins
CORS_ORIGINS=https://your-frontend.vercel.app

# Optional: Rate limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## API Endpoints

The backend exposes these endpoints for the frontend:

### Conversion Endpoints
- `POST /api/convert/marp` - PowerPoint conversion
- `POST /api/convert/pandoc` - PDF/HTML/DOCX conversion

### Utility Endpoints
- `GET /api/health` - Health check
- `GET /api/download/:filename` - File download

### CORS Configuration
The backend accepts requests from any origin by default. For production, configure specific origins:

```typescript
app.use(cors({ 
  origin: process.env.CORS_ORIGINS?.split(',') || true,
  credentials: true
}))
```

## Monitoring and Maintenance

### Health Checks
```bash
# Check backend status
curl https://your-backend-api.com/api/health

# Expected response:
# {"status":"OK","timestamp":"2024-01-20T10:30:00.000Z"}
```

### Logs
```bash
# Docker Compose
docker-compose -f docker-compose.backend.yml logs -f

# Direct Docker
docker logs -f markdown-converter-backend
```

### File Cleanup
The backend automatically cleans up temporary files after 1 hour. For manual cleanup:

```bash
# Clean temporary files
docker exec markdown-converter-backend find /app/temp -type f -mtime +1 -delete
docker exec markdown-converter-backend find /app/downloads -type f -mtime +1 -delete
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```javascript
// Error: Access to fetch at 'backend-url' has been blocked by CORS policy

// Solution: Ensure CORS_ORIGINS includes your Vercel domain
CORS_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

#### 2. Conversion Timeouts
```bash
# Increase timeout in backend (server/index.ts)
exec(command, { timeout: 60000 }, callback) // Increase from 30000
```

#### 3. Missing Dependencies
```bash
# Check if tools are installed
docker exec markdown-converter-backend which pandoc
docker exec markdown-converter-backend which chromium
docker exec markdown-converter-backend npx @marp-team/marp-cli --version
```

#### 4. Memory Issues
```yaml
# Increase memory limit
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Testing Deployment

#### Frontend Test
```bash
# Visit your Vercel URL
https://your-app.vercel.app

# Test client-side features:
# ✓ Editor works
# ✓ Preview renders
# ✓ Dark mode toggles
# ✓ Templates load
```

#### Backend Test
```bash
# Test health endpoint
curl https://your-backend.com/api/health

# Test conversion (should return download URL)
curl -X POST https://your-backend.com/api/convert/pandoc \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# Test","format":"html"}'
```

#### Integration Test
1. Open frontend in browser
2. Enter markdown content
3. Select PDF or PPTX format
4. Click Convert
5. Download should work

## Security Considerations

### Backend Security
- Rate limiting enabled (100 requests per 15 minutes)
- Helmet.js for security headers
- File cleanup prevents disk filling
- No sensitive data stored

### Frontend Security
- Static files only on Vercel
- No server-side rendering
- Environment variables properly configured
- API calls over HTTPS only

## Cost Optimization

### Vercel (Frontend)
- **Free Tier**: Sufficient for most use cases
- **Pro Tier**: For custom domains and higher limits

### Backend Hosting
- **DigitalOcean Droplet**: $12/month (2GB RAM)
- **Railway**: $5-20/month (auto-scaling)
- **Google Cloud Run**: Pay per request
- **AWS Fargate**: Pay per usage

### Recommended Setup
- **Small Scale**: DigitalOcean + Vercel Free = $12/month
- **Medium Scale**: Railway + Vercel Pro = $25/month
- **Large Scale**: AWS/GCP + Vercel Pro = $50+/month

## Backup and Recovery

### Frontend
- Code backed up in Git repository
- Vercel handles deployment artifacts
- No data to backup (stateless)

### Backend
- Docker images can be rebuilt from source
- No persistent data (files auto-deleted)
- Configuration in environment variables

## Migration Guide

### From Monolithic to Hybrid

1. **Deploy Backend First**
   ```bash
   # Deploy backend to your chosen platform
   docker-compose -f docker-compose.backend.yml up -d
   ```

2. **Update Frontend Configuration**
   ```bash
   # Set environment variable
   export VITE_API_BASE_URL=https://your-backend.com
   npm run build
   ```

3. **Deploy Frontend to Vercel**
   ```bash
   vercel --prod
   vercel env add VITE_API_BASE_URL production
   ```

4. **Test Integration**
   - Verify all features work
   - Test conversion functionality
   - Check download links

5. **Update DNS/Domains**
   - Point your domain to Vercel
   - Ensure backend is accessible

This hybrid deployment provides the best of both worlds: lightning-fast static frontend on Vercel's CDN and powerful backend services for file conversion.