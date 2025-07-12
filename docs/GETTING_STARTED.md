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

### Converting Markdown

1. **Navigate to the Converter tab**
2. **Enter your markdown content** or use a template:
   - Click "Load Template" dropdown
   - Choose from Presentation, Document, or Article templates
3. **Select output format** (PowerPoint, PDF, Word, HTML)
4. **Click "Convert"** 
5. **Download your file** when conversion completes

### Using Templates

The application provides three built-in templates:

#### Presentation Template
- Optimized for PowerPoint conversion with Marp
- Includes slide separators (`---`)
- Contains sample content structure

#### Document Template 
- Comprehensive markdown showcase
- Headers, lists, code blocks, tables
- Perfect for PDF and Word conversion

#### Article Template
- Blog-style content with metadata
- Advanced formatting examples
- Suitable for all output formats

### Dark/Light Mode

- **Automatic detection**: Follows your system preference
- **Manual toggle**: Click the Sun/Moon icon in navigation
- **Persistence**: Your choice is saved in browser storage

## Troubleshooting

### Common Issues

#### Conversion Fails
1. Check the error debug section (appears automatically)
2. Verify markdown syntax using the Guides tab
3. Try with a simpler template first
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

1. **Built-in Guides**: Use the Guides tab for markdown syntax and API examples
2. **Error Details**: The app shows detailed error information for debugging
3. **Docker Logs**: `docker compose logs -f` for real-time logging
4. **Health Check**: Visit `http://localhost:3000/api/health`

## Next Steps

- **Explore API**: Check [API Reference](API_REFERENCE.md) for programmatic access
- **Technical Details**: See [Technical Guide](TECHNICAL.md) for architecture
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