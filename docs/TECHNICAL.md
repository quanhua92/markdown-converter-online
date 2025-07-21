# Technical Guide

This guide covers the architecture, development, and deployment details of the Markdown Converter Online.

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────── │
│  │   React App     │  │  Dark/Light     │  │   Templates   │ │
│  │                 │  │  Mode Toggle    │  │   & Workflow  │ │
│  │ • UI Components │  │ • Theme State   │  │ • Template    │ │
│  │ • State Mgmt    │  │ • Local Storage │  │   Selector    │ │
│  │ • Explorer      │  │ • Auto-Save     │  │ • File Close  │ │
│  │ • File Tree     │  │ • Persistence   │  │ • Workspaces  │ │
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
- **React 19**: Modern hooks and concurrent features
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS 4**: Utility-first styling with dark mode
- **Vite**: Fast build tool and dev server
- **Radix UI**: Accessible component primitives (Dialog, Collapsible, etc.)
- **Sonner**: Toast notifications
- **Lucide React**: Icon library
- **TanStack Router**: File-based routing with type safety
- **IndexedDB (Dexie.js)**: Client-side persistence with migration from localStorage

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
│   ├── db/                       # IndexedDB storage layer
│   │   ├── db.ts                 # Database configuration
│   │   ├── storage.ts            # Storage service wrapper
│   │   └── migration.ts          # Migration logic
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
# Build and start fresh
./build-fresh.sh

# Or manually
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

### Storage Architecture (IndexedDB Migration)

#### Overview
The application has migrated from localStorage to IndexedDB using Dexie.js for improved performance, larger storage capacity, and better error handling.

#### Database Schema
```typescript
interface StorageItem {
  id?: number;
  key: string;
  value: any;
  timestamp: number;
}

// Database Configuration
{
  storage: '++id, &key, timestamp'
}
```

#### Storage Service Features
- **Async Operations**: All storage operations are asynchronous
- **Error Handling**: Comprehensive error handling with graceful degradation
- **JSON Serialization**: Automatic serialization/deserialization
- **Quota Management**: Handles storage quota exceeded errors
- **Database Health Checks**: Ensures database availability before operations

#### Migration System
**Automated Migration Dialog**: When localStorage data is detected, users see a migration dialog with:
- Real-time progress bar showing migration status
- Console-like interface with timestamped logs
- Error handling and recovery mechanisms
- Visual feedback during the entire migration process

**Migration Features**:
```typescript
interface MigrationProgress {
  total: number;
  current: number;
  currentKey?: string;
  status: 'starting' | 'migrating' | 'completed' | 'error';
  message: string;
  errors: string[];
}
```

#### Storage Service API
```typescript
class StorageService {
  static async saveItem(key: string, value: any): Promise<void>
  static async loadItem(key: string): Promise<any>
  static async removeItem(key: string): Promise<void>
  static async getAllItems(): Promise<Array<{key: string, value: any}>>
  static async getAllKeys(): Promise<string[]>
  static async clear(): Promise<void>
  static async getStorageInfo(): Promise<{
    itemCount: number;
    estimatedSize: number;
    keys: string[];
  }>
}
```

#### Browser Compatibility
- **IndexedDB Detection**: Checks for IndexedDB availability before operations
- **Graceful Degradation**: Falls back gracefully when IndexedDB is unavailable
- **Cross-browser Support**: Works across all modern browsers
- **Error Recovery**: Handles database initialization failures

### State Management
- **React Hooks**: Local component state
- **Context**: Theme management
- **IndexedDB**: Robust client-side persistence with Dexie.js
- **Migration System**: Automated localStorage to IndexedDB migration
- **Workspace Sessions**: Sign-in/sign-out workflow for multi-workspace management

### Component Structure
```typescript
App.tsx
├── Navigation (theme toggle, view switching)
├── GuidesPage (comprehensive documentation with 6 sections:
│   │ Getting Started, Markdown Syntax, Mermaid Diagrams,
│   │ LaTeX Math, Templates & Examples, Preview & Print Features,
│   │ API Examples with copy-to-clipboard functionality)
├── ConverterPage
│   ├── MarkdownInput (templates, clear button)
│   ├── FormatSelection (interactive cards)
│   ├── ConversionButton (progress states)
│   ├── DownloadResult (success UI)
│   └── ErrorDebug (detailed error display)
└── ExplorerPage (v2.2 Template System)
    ├── ExplorerHeader (workspace selector, actions)
    ├── ExplorerFileTreePanels (file navigation)
    ├── ExplorerEditorSection (NEW: template selector)
    │   ├── TemplateSelector (dropdown with 4 options)
    │   ├── FileCloseButton (X button for workflow)
    │   ├── MarkdownEditor (with auto-save)
    │   └── MarkdownRenderer (live preview)
    └── ExplorerMobileNavigation (responsive design)
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

### Workspace Management Architecture

#### No-Workspace State & Welcome Flow
The workspace system now supports a "no-workspace" state with an enhanced welcome experience:

```typescript
// Enhanced Workspace Operations
interface WorkspaceManager {
  joinWorkspace(id: string): void                    // Join existing workspace
  leaveWorkspace(): void                             // Leave to no-workspace state
  createWorkspace(name: string): void                // Create new workspace
  createWorkspaceFromTemplate(name: string, template: FileSystemItem[]): void
  importWorkspaceFromZip(name: string, file: File): Promise<void>
}

// Workspace Welcome Flow
enum WorkspaceState {
  NO_WORKSPACE,    // Shows welcome screen with 4 options
  IN_WORKSPACE     // Shows file tree and editor
}
```

#### Data Storage Evolution

**IndexedDB Storage (v3 - Current)**:
```typescript
// IndexedDB Storage via Dexie.js
Database: MarkdownFilesDB
Table: storage (++id, &key, timestamp)

// Storage Keys (maintained for compatibility)
{
  "markdown-explorer-v2-current-workspace": "workspace_id",
  "markdown-explorer-v2-workspace-{id}": WorkspaceData,
  "theme": "dark" | "light",
  "markdownDraft": string
}
```

**localStorage Structure (v2 - Legacy)**:
```typescript
{
  "markdown-explorer-v2-current-workspace": "workspace_id",
  "markdown-explorer-v2-workspace-{id}": WorkspaceData
}

// Legacy localStorage Structure (v1 - Deprecated)
{
  "markdown-explorer-current-workspace": "workspace_id",
  "markdown-explorer-workspace-default": WorkspaceData,
  "markdown-explorer-workspace-{id}": WorkspaceData
}
```

interface WorkspaceData {
  id: string
  name: string
  files: FileSystemItem[]
  currentFilePath?: string
  createdAt: string
  lastModified: string
}
```

#### Storage Migration (localStorage → IndexedDB)

**IndexedDB Migration (v3 - January 2025)**:
- **Enhancement**: Migrated from localStorage to IndexedDB for better performance and larger storage capacity
- **Migration Dialog**: Interactive migration process with progress tracking and console output
- **Backward Compatibility**: Maintains v2 storage key structure for seamless transition
- **Benefits**:
  - **Performance**: Faster operations with larger datasets
  - **Capacity**: No 10MB localStorage limit
  - **Reliability**: Better error handling and recovery
  - **Async Operations**: Non-blocking storage operations
  - **Future-proof**: Structured database for advanced features

**Migration Process**:
```typescript
// Automated Migration Flow
1. Detect localStorage data on app startup
2. Show migration dialog with progress tracking
3. Migrate all localStorage items to IndexedDB
4. Preserve data structure and keys
5. Mark migration as completed
6. Continue with IndexedDB operations

// Migration Progress Tracking
- Real-time progress bar
- Console-like interface with timestamps
- Error handling and recovery
- Item-by-item migration logging
```

**Storage Evolution Timeline**:
```typescript
// v1 Storage Keys (Legacy - Deprecated)
const CURRENT_WORKSPACE_KEY = 'markdown-explorer-current-workspace'
const WORKSPACE_PREFIX = 'markdown-explorer-workspace-'

// v2 Storage Keys (localStorage - Previous)
const CURRENT_WORKSPACE_KEY = 'markdown-explorer-v2-current-workspace'
const WORKSPACE_PREFIX = 'markdown-explorer-v2-workspace-'

// v3 Storage (IndexedDB - Current)
// Same keys as v2, but stored in IndexedDB via Dexie.js
Database: MarkdownFilesDB
Table: storage
```

**Migration Features**:
- **Zero Data Loss**: All localStorage data is preserved during migration
- **Error Recovery**: Handles partial failures and invalid data gracefully
- **User Control**: Clear visual feedback and manual continuation
- **Performance Monitoring**: Track migration progress and completion time

#### UI Design Principles
- **Welcome Screen**: Full-screen onboarding when no workspace is active
- **4 Entry Points**: Join existing, create new, import ZIP, init from template
- **Current Session Display**: Shows active workspace with blue badge
- **Explicit Actions**: "Leave" button for sign-out, clear action cards for sign-in
- **Modal Workflows**: Separate dialogs for joining vs creating workspaces
- **Session Boundaries**: Clear visual separation between workspace states
- **No Accidental Switching**: Prevents unintended workspace changes
- **Template Integration**: Quick template buttons in welcome screen
- **No Default Workspace**: System starts with no workspace, requiring explicit creation

#### State Management Flow
1. **No workspace state** → Shows welcome screen with 4 action options
2. **User joins workspace** → Loads target workspace data → Updates UI
3. **User creates workspace** → Creates new → Auto-joins → Shows file tree
4. **User leaves workspace** → Saves current state → Returns to welcome screen
5. **Template initialization** → Creates workspace from template → Auto-joins
6. **ZIP import** → Extracts files → Creates workspace → Auto-joins
7. **File operations** → Isolated to current workspace → Auto-saved per session

#### Implementation Components
- `useWorkspaceManager.tsx`: Core session and persistence logic with multi-workspace support
- `WorkspaceWelcome.tsx`: Full-screen welcome interface for no-workspace state
- `WorkspaceSelector.tsx`: Sign-in/sign-out UI component (legacy, used within workspaces)
- `useFileSystem.tsx`: Integration layer with file operations and workspace management
- `FileTree.tsx`: Workspace status display and controls with fixed folder toggle functionality
- `TemplateSelector.tsx`: Template selection with compact mode for welcome screen
- `explorer.tsx`: Main route that conditionally renders welcome or workspace view

#### Template System Evolution (v2.1 → v2.2)

**v2.1 - Folder-based Templates**:
- Complex workspace creation with multiple files and folders
- `TemplateQuickActions` component with multiple buttons
- Heavy file structure initialization per template

**v2.2 - Single File Templates** (Current):
Each template creates a single markdown file with rich content:

**📚 Complete Showcase Template**:
- `showcase-template.md`: Ultimate markdown examples with comprehensive Mermaid diagrams
- Covers all markdown syntax, multiple diagram types, code examples
- 1000+ lines of educational content with best practices

**🎯 Presentation Template**:
- `presentation-template.md`: Clean slide format using Marp syntax
- Structured for presentation workflows with theme metadata
- Ready-to-use presentation framework

**📄 Document Template**:
- `document-template.md`: Professional document structure
- Headers, formatting, tables, and content organization
- Standard business document layout

**📝 Article Template**:
- `article-template.md`: Blog/article format with metadata
- Author information, technical content structure
- Publishing-ready markdown format

#### Template System Implementation (v2.2)
- **Simplified UI**: Single dropdown selector instead of multiple buttons
- **File Management**: Close button (X) for easy workflow switching
- **Content Integration**: Templates use existing `templates.ts` content
- **Workflow Enhancement**: Create → Edit → Close → Select New Template cycle

## Testing

### Test Categories
- **Unit Tests**: Component and utility functions
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full conversion workflows

### Essential Test Suite (v3 Enhanced)

The test suite includes comprehensive testing for the new IndexedDB migration system plus core functionality:

#### 1. Template Functionality Test (`test-template-functionality.cjs`)
**NEW in v2.2** - Comprehensive testing of the new template system:
- Template dropdown selector functionality
- All 4 template options (showcase, presentation, document, article)
- File creation with template content
- "Create Empty File" functionality
- File close button workflow
- File tree integration verification
- Visual screenshot validation

**Technical details**:
- Tests template content injection into created files
- Validates file close → template selector workflow
- Ensures all created files appear in file tree
- Comprehensive error handling and edge cases

#### 2. Dark Mode Test (`test-dark-mode.cjs`)
- Light/dark theme toggle functionality
- CSS class management (`dark` class addition/removal)
- Visual verification through screenshots
- Computed style validation

#### 3. Workspace Welcome Test (`test-workspace-welcome.cjs`)
- Workspace creation workflow
- Join existing workspace functionality
- Leave workspace flow
- Template initialization from welcome screen
- No-workspace state management

#### 4. Delete Functionality Test (`test-delete-functionality.cjs`)
- File deletion (immediate, no confirmation)
- Folder deletion with confirmation dialogs
- Nested structure deletion
- Cancel/confirm dialog functionality
- Visual feedback and error handling

#### 5. Readability Test (`test-readability.cjs`)
- WCAG accessibility compliance
- Color contrast ratio validation
- Text readability across UI elements
- Accessibility standards verification

#### 6. IndexedDB Migration Tests (`test-indexeddb-migration.cjs`)
**NEW in v3** - Comprehensive testing of the IndexedDB migration system:
- Migration detection when localStorage contains data
- Migration dialog appearance and functionality
- Progress tracking with console interface
- Data integrity preservation during migration
- Error handling for failed migrations
- Prevention of duplicate migrations
- Complex data structure migration (nested objects, special characters)

**Technical details**:
- Tests migration dialog UI components (progress bar, console, buttons)
- Validates complete data transfer from localStorage to IndexedDB
- Verifies error scenarios and graceful degradation
- Ensures migration completion marking prevents re-migration

#### 7. IndexedDB Workflow Tests (`test-indexeddb-workflows.cjs`)
**NEW in v3** - Testing IndexedDB operations and workflows:
- Workspace creation and persistence with IndexedDB
- Data loading from IndexedDB on page refresh
- Large file handling (1MB+ content)
- Concurrent workspace operations
- Theme persistence across sessions
- Draft auto-save functionality
- Storage quota error handling
- Browser compatibility testing

**Technical details**:
- Tests async storage operations in real browser environment
- Validates IndexedDB performance with large datasets
- Ensures proper error handling for storage failures
- Verifies cross-session data persistence

### Test Infrastructure Improvements (v3)
- **Enhanced Coverage**: Added comprehensive IndexedDB testing (2 new test files)
- **Migration Testing**: Full coverage of localStorage to IndexedDB migration
- **Async Operations**: Tests for all async storage operations
- **Error Scenarios**: Comprehensive error handling and edge case testing
- **Performance Testing**: Large dataset and concurrent operation testing
- **Visual Validation**: Strategic screenshot capture for manual review
- **Browser Compatibility**: Cross-browser IndexedDB functionality testing

### Removed Test Categories (v2.2 Cleanup)
- Debug utilities (2 files): Too specific for general testing
- Device-specific tests (7 files): Overly granular, covered by responsive design
- Print/Mermaid tests (3 files): Niche functionality, low priority
- Enhanced UI tests (2 files): Overly specific, covered by core tests
- Duplicate workspace tests (2 files): Redundant with workspace welcome test

### Running Tests

First ensure the application is running:
```bash
./build-fresh.sh
```

Then run tests:
```bash
# Complete test suite (recommended)
for test in test-template-functionality.cjs test-dark-mode.cjs test-workspace-welcome.cjs test-delete-functionality.cjs test-readability.cjs test-indexeddb-migration.cjs test-indexeddb-workflows.cjs; do
  echo "🧪 Running tests/$test..."
  node "tests/$test"
  echo "✅ Completed tests/$test"
  echo "---"
done

# Individual test execution
node tests/test-template-functionality.cjs  # Template system
node tests/test-dark-mode.cjs              # UI theming
node tests/test-workspace-welcome.cjs      # Workspace management
node tests/test-delete-functionality.cjs   # File operations
node tests/test-readability.cjs            # Accessibility
node tests/test-indexeddb-migration.cjs    # IndexedDB migration
node tests/test-indexeddb-workflows.cjs    # IndexedDB operations

# Migration-specific testing
node tests/test-migration-dialog-manual.cjs # Manual migration dialog test
```
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
./build-fresh.sh
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

#### File Tree Issues
```bash
# Folder toggle not working (fixed in v2.1)
# Issue: Folders showed as collapsed but children remained visible
# Root cause: Weak condition checking in FileTree.tsx

# Fixed by:
# 1. Explicit boolean check: item.isExpanded === true
# 2. Proper undefined state handling in toggleFolder function
# 3. Ensured collapsed folders hide their children correctly

# Test folder toggle functionality:
node tests/test-folder-toggle-fix.cjs
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
./build-fresh.sh

# Commit changes
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```