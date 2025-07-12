# Markdown Converter Online

A powerful web application that converts markdown content to multiple formats including PowerPoint presentations, PDF documents, Word documents, and HTML files. Built with React, Express, and Docker for easy deployment.

## 🌟 Features

### Core Functionality
- **Multi-format conversion**: Convert markdown to PowerPoint (PPTX), PDF, Word (DOCX), and HTML
- **Real-time processing**: Fast conversion using Pandoc and Marp CLI
- **Template system**: Pre-built templates for presentations, documents, and articles
- **Copy-friendly guides**: One-click copy for markdown examples and LLM prompts

### User Experience
- **🌙 Dark/Light mode**: Automatic theme detection with manual toggle
- **📱 Mobile-first design**: Responsive layout optimized for all devices
- **✨ Beautiful UI**: Modern interface with intuitive navigation
- **🔄 Error debugging**: Comprehensive error display for troubleshooting

### Advanced Features
- **LLM integration**: Ready-to-use prompts for ChatGPT/Claude article conversion
- **Template showcase**: Interactive examples demonstrating markdown capabilities
- **REST API**: Programmatic access for integration with other applications
- **Reverse proxy ready**: Docker configuration for production deployment

## 🚀 Quick Start

### Using Docker (Recommended)

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

### For Production with Reverse Proxy

Use the proxy configuration for nginx-proxy-manager integration:

```bash
docker compose -f docker-compose.proxy.yml up -d
```

This binds to `127.0.0.1:3000` for proxy-only access.

## 📖 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Getting Started](docs/GETTING_STARTED.md)** - Installation, setup, and basic usage
- **[Technical Guide](docs/TECHNICAL.md)** - Architecture, development, and deployment
- **[API Reference](docs/API_REFERENCE.md)** - REST API endpoints and examples

## 🔧 Development

### Local Development Setup

1. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Build for production**
   ```bash
   npm run build
   # or
   pnpm build
   ```

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS 4, Vite
- **Backend**: Node.js, Express 4, TypeScript
- **Conversion**: Pandoc, Marp CLI, XeLaTeX
- **Deployment**: Docker, Docker Compose
- **UI Components**: Radix UI, Lucide React, Sonner

## 🎯 Use Cases

### Content Creators
- Convert blog posts to presentation slides
- Transform documentation to PDF reports
- Create professional presentations from markdown

### Developers
- Convert README files to presentations
- Generate documentation in multiple formats
- Integrate conversion API into applications

### Teams
- Standardize content formats across organization
- Automate document generation workflows
- Create consistent brand presentations

## 🔌 API Integration

The application provides REST endpoints for programmatic access:

```bash
# Convert markdown to PDF
curl -X POST http://localhost:3000/api/convert/pandoc \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello World", "format": "pdf"}'

# Convert markdown to PowerPoint
curl -X POST http://localhost:3000/api/convert/marp \
  -H "Content-Type: application/json" \
  -d '{"markdown": "---\ntheme: default\n---\n\n# Slide 1"}'
```

## 📋 Requirements

### System Requirements
- Docker and Docker Compose
- 2GB RAM minimum
- 1GB disk space

### Browser Support
- Modern browsers with ES2020 support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: Check the `docs/` folder for detailed guides
- **API**: Use the built-in guides page for API examples and LLM prompts

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Express API    │    │   Converters    │
│                 │    │                 │    │                 │
│ • Dark/Light    │────│ • REST Routes   │────│ • Pandoc        │
│ • Templates     │    │ • File Handling │    │ • Marp CLI      │
│ • Copy Features │    │ • Error Debug   │    │ • XeLaTeX       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

Built with ❤️ for the markdown community.