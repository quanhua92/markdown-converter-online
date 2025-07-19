# Getting Started Guide

This guide will help you get the Markdown Converter Online up and running quickly.

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- 2GB RAM available
- 1GB disk space

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd markdown-converter-online
   ```

2. **Start the application**
   ```bash
   docker compose up -d
   ```

3. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

4. **Verify installation**
   - Check if the dark/light mode toggle works
   - Try converting sample markdown using templates
   - Test different output formats (PDF, Word, HTML, PowerPoint)

### Production Deployment

For production with reverse proxy (nginx-proxy-manager):

```bash
docker compose -f docker-compose.proxy.yml up -d
```

This configuration:
- Binds to `127.0.0.1:3000` (localhost only)
- Uses external `nginx-proxy-manager` network
- Provides persistent volumes for downloads and temp files

## Basic Usage

### Two Main Modes

The application offers two distinct interfaces:

#### 1. Converter Mode (Quick Conversion)
1. **Navigate to the Converter tab**
2. **Enter your markdown content** or use a template:
   - Click "Load Template" dropdown
   - Choose from Presentation, Document, or Article templates
3. **Select output format** (PowerPoint, PDF, Word, HTML)
4. **Click "Convert"** 
5. **Download your file** when conversion completes

#### 2. Explorer Mode (File Management & Workspace)
1. **Click the Explorer button** in the navigation
2. **Choose a template** or start fresh:
   - **Project Notes**: Organized documentation structure
   - **Knowledge Base**: Personal knowledge management system  
   - **Blog/Website**: Content structure for blogs and websites
3. **Use the file tree** to navigate and organize your content
4. **Edit multiple files** with auto-save functionality
5. **Export individual files** or use the print function

### Using Templates

#### Converter Templates (For Quick Conversion)
The Converter provides three built-in templates:

- **Presentation Template**: Optimized for PowerPoint conversion with Marp
- **Document Template**: Comprehensive markdown showcase for PDF/Word
- **Article Template**: Blog-style content for all output formats

#### Explorer Templates (For Workspace Management)
The Explorer offers structured workspace templates:

- **Project Notes**: Complete project documentation structure with README, docs/, and notes/ folders
- **Knowledge Base**: Personal knowledge management with organized learning, references, and daily notes
- **Blog/Website**: Content structure with posts, drafts, and about pages for content creators

### Explorer Features

#### File Management
- **Create/Delete/Rename**: Files and folders with right-click context menu
- **File Tree Navigation**: Collapsible folder structure like VS Code
- **Auto-Save**: Content automatically saved to browser localStorage
- **Multi-File Editing**: Switch between files while preserving content

#### Workspace Organization  
- **Folder Structure**: Organize content hierarchically
- **File Persistence**: Data saved across browser sessions
- **Mobile Responsive**: Touch-friendly interface with edit/preview tabs
- **Export Options**: Individual file export and print functionality

### Dark/Light Mode

- **Automatic detection**: Follows your system preference
- **Manual toggle**: Click the Sun/Moon icon in navigation
- **Persistence**: Your choice is saved in browser storage

## Troubleshooting

### Common Issues

#### Conversion Fails
1. Check the error debug section (appears automatically)
2. Verify markdown syntax using the comprehensive Guides tab (includes syntax reference, Mermaid diagrams, and LaTeX math)
3. Try with a simpler template first (use built-in templates from Guides tab)
4. Check Docker container logs: `docker compose logs`

#### Dark Mode Not Working
1. Ensure you're using a modern browser
2. Clear browser cache and reload
3. Check if JavaScript is enabled

#### Application Won't Start
1. Verify Docker is running: `docker --version`
2. Check port 3000 isn't in use: `lsof -i :3000`
3. Review Docker logs: `docker compose logs`
4. Try rebuilding: `docker compose build --no-cache`

### Getting Help

1. **Built-in Guides**: Use the Guides tab for comprehensive documentation including:
   - Getting Started & Quick Start guide
   - Complete Markdown syntax reference with copy-to-clipboard examples
   - Mermaid diagrams (flowcharts, sequences, class diagrams, Gantt charts)
   - LaTeX math expressions with KaTeX rendering
   - Built-in templates for presentations, documents, and articles
   - Preview & Print features guide
   - REST API examples in multiple languages
2. **Error Details**: The app shows detailed error information for debugging
3. **Docker Logs**: `docker compose logs -f` for real-time logging
4. **Health Check**: Visit `http://localhost:3000/api/health`

## Next Steps

- **Explore API**: Check [API Reference](API_REFERENCE.md) for programmatic access
- **Technical Details**: See [Technical Guide](TECHNICAL.md) for architecture
- **Interactive Guides**: Access comprehensive documentation in the Guides tab
- **LLM Integration**: Use the built-in prompts for ChatGPT/Claude conversion
- **Customization**: Modify templates or add new conversion formats

## Development Mode

For local development without Docker:

1. **Install Node.js 18+** and pnpm
2. **Install dependencies**
   ```bash
   pnpm install
   ```
3. **Start development server**
   ```bash
   pnpm dev
   ```
4. **Install system dependencies** (Pandoc, LaTeX, Chromium)

See [Technical Guide](TECHNICAL.md) for detailed development setup.

## Configuration

### Environment Variables

- `NODE_ENV`: Set to 'production' for production builds
- `PORT`: Override default port 3000 (development only)

### Volume Mounts

- `./server/downloads`: Converted files (auto-cleanup after 1 hour)
- `./server/temp`: Temporary processing files

### Network Configuration

- **Standard**: Exposes port 3000 to host
- **Proxy**: Binds to 127.0.0.1:3000 for reverse proxy setups

## Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: This guide and other docs in `/docs`
- **API Examples**: Built-in Guides tab in the application