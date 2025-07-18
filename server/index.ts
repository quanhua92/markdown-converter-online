import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(helmet({
  contentSecurityPolicy: false,  // Disable CSP completely for reverse proxy
}));
app.use(cors({ 
  origin: true,  // Allow all origins for reverse proxy
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const downloadsDir = path.join(__dirname, 'downloads');
const tempDir = path.join(__dirname, 'temp');

// Marp conversion endpoint
app.post('/api/convert/marp', async (req, res) => {
  try {
    const { markdown, options = {} } = req.body;
    if (!markdown) return res.status(400).json({ error: 'Markdown required' });

    const filename = `presentation_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const mdPath = path.join(tempDir, `${filename}.md`);
    const pptxPath = path.join(downloadsDir, `${filename}.pptx`);

    await fs.writeFile(mdPath, markdown, 'utf8');

    // Build Marp command with options
    let marpCommand = `npx @marp-team/marp-cli "${mdPath}" --output "${pptxPath}" --no-stdin`;
    
    // Add theme option
    if (options.theme && ['default', 'gaia', 'uncover'].includes(options.theme)) {
      marpCommand += ` --theme ${options.theme}`;
    }
    
    // Add image scale option
    if (options.imageScale && [1, 2, 3, 4].includes(options.imageScale)) {
      marpCommand += ` --image-scale ${options.imageScale}`;
    }
    
    // Add browser timeout option
    if (options.browserTimeout && options.browserTimeout >= 30000 && options.browserTimeout <= 120000) {
      marpCommand += ` --browser-timeout ${options.browserTimeout}`;
    }
    
    // Add browser selection option
    if (options.browser && ['auto', 'chrome', 'firefox', 'edge'].includes(options.browser)) {
      marpCommand += ` --browser ${options.browser}`;
    }
    
    // Add Chrome configuration for headless operation
    marpCommand += ` --chrome-arg=--no-sandbox` +
      ` --chrome-arg=--disable-dev-shm-usage` +
      ` --chrome-arg=--disable-gpu` +
      ` --chrome-arg=--headless` +
      ` --chrome-arg=--disable-web-security` +
      ` --chrome-arg=--disable-features=VizDisplayCompositor` +
      ` --chrome-arg=--run-all-compositor-stages-before-draw` +
      ` --chrome-arg=--disable-background-timer-throttling` +
      ` --chrome-arg=--disable-renderer-backgrounding` +
      ` --chrome-arg=--disable-backgrounding-occluded-windows`;
    
    exec(marpCommand, { timeout: 30000 }, async (error, stdout, stderr) => {
      await fs.unlink(mdPath);
      
      if (error) {
        console.error('Marp conversion error:', error.message);
        console.error('Stderr:', stderr);
        console.error('Stdout:', stdout);
        return res.status(500).json({ 
          error: 'Conversion failed - browser or marp issue',
          details: error.message,
          stderr: stderr,
          stdout: stdout
        });
      }
      
      res.json({ 
        success: true, 
        downloadUrl: `/api/download/${filename}.pptx`,
        filename: `${filename}.pptx`
      });

      setTimeout(() => fs.unlink(pptxPath).catch(console.error), 3600000);
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Pandoc conversion endpoint
app.post('/api/convert/pandoc', async (req, res) => {
  try {
    const { markdown, format, options = {} } = req.body;
    if (!markdown || !format) return res.status(400).json({ error: 'Markdown and format required' });

    const filename = `document_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const mdPath = path.join(tempDir, `${filename}.md`);
    const outputPath = path.join(downloadsDir, `${filename}.${format}`);

    await fs.writeFile(mdPath, markdown, 'utf8');

    // Build Pandoc command with options
    let pandocCmd = `pandoc "${mdPath}" -o "${outputPath}"`;
    
    // PDF-specific options
    if (format === 'pdf') {
      pandocCmd += ` --pdf-engine=xelatex`;
      
      // Add margins
      if (options.margin && ['0.5in', '1in', '1.5in', '2in'].includes(options.margin)) {
        pandocCmd += ` -V geometry:margin=${options.margin}`;
      }
      
      // Add font size
      if (options.fontSize && ['10pt', '11pt', '12pt', '14pt', '16pt'].includes(options.fontSize)) {
        pandocCmd += ` -V fontsize=${options.fontSize}`;
      }
      
      // Add table of contents
      if (options.toc) {
        pandocCmd += ` --toc`;
        if (options.tocDepth && [1, 2, 3, 4].includes(options.tocDepth)) {
          pandocCmd += ` --toc-depth=${options.tocDepth}`;
        }
      }
      
      // Add colored links
      if (options.colorLinks) {
        pandocCmd += ` -V colorlinks=true -V linkcolor=blue -V urlcolor=blue`;
      }
      
      // Add paper size
      if (options.paperSize && ['a4paper', 'letterpaper', 'a3paper', 'a5paper'].includes(options.paperSize)) {
        pandocCmd += ` -V geometry:${options.paperSize}`;
      }
    }
    
    // HTML-specific options
    if (format === 'html') {
      pandocCmd += ` --standalone`;
      
      // Add table of contents
      if (options.toc) {
        pandocCmd += ` --toc`;
        if (options.tocDepth && [1, 2, 3, 4].includes(options.tocDepth)) {
          pandocCmd += ` --toc-depth=${options.tocDepth}`;
        }
      }
      
      // Add self-contained option
      if (options.selfContained) {
        pandocCmd += ` --self-contained`;
      }
      
      // Add section divs
      if (options.sectionDivs) {
        pandocCmd += ` --section-divs`;
      }
    }
    
    // Citation processing for all formats
    if (options.citeproc) {
      pandocCmd += ` --citeproc`;
    }
    
    exec(pandocCmd, { timeout: 15000 }, async (error, stdout, stderr) => {
      await fs.unlink(mdPath);
      
      if (error) {
        console.error('Pandoc conversion error:', error.message);
        console.error('Stderr:', stderr);
        console.error('Stdout:', stdout);
        return res.status(500).json({ 
          error: `Conversion failed for ${format} format`,
          details: error.message,
          stderr: stderr,
          stdout: stdout
        });
      }
      
      res.json({ 
        success: true, 
        downloadUrl: `/api/download/${filename}.${format}`,
        filename: `${filename}.${format}`
      });

      setTimeout(() => fs.unlink(outputPath).catch(console.error), 3600000);
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Download endpoint
app.get('/api/download/:filename', async (req, res) => {
  try {
    const filePath = path.join(downloadsDir, req.params.filename);
    await fs.access(filePath);
    res.download(filePath);
  } catch (_error) {
    res.status(404).json({ error: 'File not found' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test route to verify routing works
app.get('/test', (_req, res) => {
  res.send('Test route works!');
});

// Debug route that shows working JavaScript
app.get('/debug', (_req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Debug Test</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .success { color: green; font-size: 18px; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>Debug Page</h1>
  <div id="status">JavaScript not loaded</div>
  <div id="app">PLACEHOLDER</div>
  <button onclick="testAPI()">Test API</button>
  
  <script>
    console.log('Debug script loaded');
    document.getElementById('status').innerHTML = '<span class="success">✅ JavaScript is working!</span>';
    document.getElementById('app').innerHTML = '<h2 class="success">✅ DOM manipulation works!</h2>';
    
    function testAPI() {
      fetch('/api/health')
        .then(res => res.json())
        .then(data => {
          document.getElementById('app').innerHTML += '<p class="success">✅ API works: ' + data.status + '</p>';
        })
        .catch(err => {
          document.getElementById('app').innerHTML += '<p class="error">❌ API failed: ' + err.message + '</p>';
        });
    }
    
    // Auto test on load
    setTimeout(testAPI, 1000);
  </script>
</body>
</html>
  `);
});

// Setup static file serving (called after all routes are defined)
async function setupStaticFiles() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../../dist');
    console.log('Setting up static files from:', distPath);
    
    try {
      await fs.access(distPath);
      const files = await fs.readdir(distPath);
      console.log('Static files available:', files);
      
      // Serve static files
      app.use(express.static(distPath));
      
      // Handle client-side routing for SPA
      app.get('*', (req, res) => {
        // Skip API routes
        if (req.path.startsWith('/api/')) {
          return res.status(404).json({ error: 'API endpoint not found' });
        }
        
        console.log('Serving index.html for:', req.path);
        res.sendFile(path.join(distPath, 'index.html'));
      });
      
      console.log('✓ Static file serving configured');
    } catch (error) {
      console.error('✗ Static files setup failed:', error);
    }
  }
}

// Async startup function
async function startServer() {
  try {
    // Ensure directories exist
    await fs.mkdir(downloadsDir, { recursive: true });
    await fs.mkdir(tempDir, { recursive: true });
    console.log('✓ Server directories created');

    // Setup static file serving AFTER all routes
    await setupStaticFiles();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('✓ Server startup complete');
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

// Start the server
startServer();