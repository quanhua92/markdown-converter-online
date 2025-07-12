# Technical Guide

This guide covers the architecture, development, and deployment details of the Markdown Converter Online.

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────── │
│  │   React App     │  │  Dark/Light     │  │   Templates   │ │
│  │                 │  │  Mode Toggle    │  │   & Guides    │ │
│  │ • UI Components │  │ • Theme State   │  │ • Copy Utils  │ │
│  │ • State Mgmt    │  │ • Local Storage │  │ • Examples    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────── │
└─────────────────────────────────────────────────────────────┘
                               │ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   Express Server                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────── │
│  │   API Routes    │  │  File Handling  │  │   Security    │ │
│  │                 │  │                 │  │               │ │
│  │ • /api/convert  │  │ • Upload/Store  │  │ • CORS        │ │
│  │ • /api/download │  │ • Auto-cleanup  │  │ • Rate Limit  │ │
│  │ • /api/health   │  │ • Error Debug   │  │ • Helmet      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────── │
└─────────────────────────────────────────────────────────────┘
                               │ Process Execution
┌─────────────────────────────────────────────────────────────┐
│                 Conversion Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────── │
│  │     Pandoc      │  │    Marp CLI     │  │   System      │ │
│  │                 │  │                 │  │               │ │
│  │ • PDF (XeLaTeX) │  │ • PowerPoint    │  │ • Chromium    │ │
│  │ • Word (DOCX)   │  │ • Headless      │  │ • LaTeX       │ │
│  │ • HTML          │  │ • Themes        │  │ • Fonts       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────── │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

#### Frontend
- **React 18**: Modern hooks and concurrent features
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS 4**: Utility-first styling with dark mode
- **Vite**: Fast build tool and dev server
- **Radix UI**: Accessible component primitives
- **Sonner**: Toast notifications
- **Lucide React**: Icon library

#### Backend
- **Node.js 18**: LTS runtime environment
- **Express 4**: Web framework with middleware support
- **TypeScript**: Server-side type safety
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection

#### Conversion Tools
- **Pandoc**: Universal document converter
- **Marp CLI**: Markdown to presentation converter
- **XeLaTeX**: PDF generation engine
- **Chromium**: Headless browser for rendering

#### Infrastructure
- **Docker**: Containerization and deployment
- **Multi-stage builds**: Optimized production images
- **Volume mounts**: Persistent data storage
- **Health checks**: Application monitoring

## Development Setup

### Prerequisites

#### System Requirements
- **Node.js 18+**: Latest LTS version
- **pnpm**: Fast package manager
- **Docker**: For containerized development
- **Git**: Version control

#### System Dependencies (Local Development)
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y \
    pandoc \
    texlive-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-xetex \
    lmodern \
    chromium-browser

# macOS
brew install pandoc
brew install --cask mactex
brew install chromium

# Install Marp CLI globally
npm install -g @marp-team/marp-cli
```

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd markdown-converter-online
   pnpm install
   ```

2. **Development Server**
   ```bash
   # Start frontend dev server
   pnpm dev

   # In another terminal, start backend
   pnpm server:dev
   ```

3. **Build and Test**
   ```bash
   # Build client
   pnpm build

   # Build server
   pnpm server:build

   # Type checking
   pnpm typecheck

   # Run tests (if available)
   pnpm test
   ```

### Project Structure

```
markdown-converter-online/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Application entry point
│   └── styles.css                # Global styles and Tailwind
├── server/                       # Backend Express server
│   ├── index.ts                  # Server entry point
│   ├── dist/                     # Compiled server code
│   ├── downloads/                # Generated files (temporary)
│   └── temp/                     # Processing workspace
├── docs/                         # Documentation
├── dist/                         # Built frontend assets
├── docker-compose.yml            # Standard deployment
├── docker-compose.proxy.yml      # Reverse proxy deployment
├── Dockerfile                    # Multi-stage container build
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Frontend build configuration
└── README.md                     # Project overview
```

### Environment Configuration

#### Development (.env.local)
```bash
NODE_ENV=development
PORT=5173
VITE_API_URL=http://localhost:3000
```

#### Production
```bash
NODE_ENV=production
PORT=3000
```

## Deployment

### Docker Deployment

#### Standard Deployment
```bash
# Build and start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

#### Reverse Proxy Deployment
```bash
# For nginx-proxy-manager integration
docker compose -f docker-compose.proxy.yml up -d

# Requires external network: nginx-proxy-manager
docker network create nginx-proxy-manager
```

### Production Considerations

#### Security
- **Rate limiting**: 100 requests per 15 minutes
- **CORS**: Configurable origin restrictions
- **Helmet**: Security headers enabled
- **File cleanup**: Auto-delete after 1 hour
- **Size limits**: 10MB maximum markdown input

#### Performance
- **Multi-stage builds**: Minimal production image
- **Static caching**: Nginx-compatible headers
- **Process isolation**: User-based container security
- **Resource limits**: Configurable in docker-compose

#### Monitoring
- **Health endpoint**: `/api/health`
- **Error debugging**: Comprehensive error responses
- **Logging**: Structured JSON logs
- **Metrics**: Request timing and success rates

## API Architecture

### Endpoints

#### Conversion Endpoints
```typescript
POST /api/convert/pandoc
- Body: { markdown: string, format: 'pdf'|'docx'|'html' }
- Response: { success: boolean, downloadUrl: string, filename: string }

POST /api/convert/marp  
- Body: { markdown: string }
- Response: { success: boolean, downloadUrl: string, filename: string }
```

#### Utility Endpoints
```typescript
GET /api/health
- Response: { status: 'OK', timestamp: string }

GET /api/download/:filename
- Response: File download with appropriate headers
```

### Error Handling

#### Error Response Format
```typescript
{
  error: string;           // Human-readable error message
  details?: string;        // Technical error details
  stderr?: string;         // Process standard error
  stdout?: string;         // Process standard output
}
```

#### Error Categories
- **400 Bad Request**: Invalid markdown or format
- **500 Internal Server Error**: Conversion process failures
- **404 Not Found**: File not found for download
- **429 Too Many Requests**: Rate limit exceeded

## Frontend Architecture

### State Management
- **React Hooks**: Local component state
- **Context**: Theme management
- **LocalStorage**: Preference persistence

### Component Structure
```typescript
App.tsx
├── Navigation (theme toggle, view switching)
├── GuidesPage (markdown examples, API docs)
└── ConverterPage
    ├── MarkdownInput (templates, clear button)
    ├── FormatSelection (interactive cards)
    ├── ConversionButton (progress states)
    ├── DownloadResult (success UI)
    └── ErrorDebug (detailed error display)
```

### Theme System
```css
/* Tailwind CSS 4 configuration */
@theme {
  --color-*: initial;
  --dark-mode: class;
}
```

### Responsive Design
- **Mobile-first**: Base styles for mobile
- **Breakpoints**: `sm:`, `md:`, `lg:` progressive enhancement
- **Touch-friendly**: Adequate tap targets
- **Accessibility**: ARIA labels and keyboard navigation

## Testing

### Test Categories
- **Unit Tests**: Component and utility functions
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full conversion workflows
- **Docker Tests**: Container build verification

### Test Commands
```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Docker integration tests
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

## Performance Optimization

### Frontend Optimization
- **Code splitting**: Dynamic imports for large components
- **Tree shaking**: Unused code elimination
- **Asset optimization**: Image compression and caching
- **Bundle analysis**: Size monitoring and optimization

### Backend Optimization
- **Process pooling**: Reuse conversion processes
- **Caching**: Template and asset caching
- **Streaming**: Large file handling
- **Compression**: Response compression

### Docker Optimization
- **Multi-stage builds**: Separate build and runtime stages
- **Layer caching**: Optimize Dockerfile for build speed
- **Base image**: Minimal production footprint
- **Security scanning**: Vulnerability detection

## Troubleshooting

### Common Development Issues

#### Build Failures
```bash
# Clear caches
pnpm store prune
rm -rf node_modules dist
pnpm install

# Docker build issues
docker system prune -f
docker compose build --no-cache
```

#### Conversion Errors
```bash
# Check system dependencies
pandoc --version
marp --version
chromium --version

# Test conversion manually
echo "# Test" | pandoc -o test.pdf
```

#### Port Conflicts
```bash
# Find process using port 3000
lsof -i :3000
kill -9 <PID>

# Use alternative port
PORT=3001 pnpm dev
```

### Debugging Tools

#### Development Tools
- **React DevTools**: Component inspection
- **Vite DevTools**: Build analysis  
- **Browser DevTools**: Network and performance
- **Docker Desktop**: Container management

#### Production Debugging
```bash
# Container logs
docker compose logs -f markdown-converter

# Execute in container
docker compose exec markdown-converter bash

# Health check
curl http://localhost:3000/api/health
```

## Contributing

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Pull Request Process
1. Fork repository and create feature branch
2. Implement changes with tests
3. Verify Docker build and functionality
4. Submit PR with clear description
5. Address review feedback

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
pnpm dev
docker compose up -d

# Commit changes
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```