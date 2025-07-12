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
const PORT = 3001;

app.use(helmet());
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const downloadsDir = path.join(__dirname, 'downloads');
const tempDir = path.join(__dirname, 'temp');

// Marp conversion endpoint
app.post('/api/convert/marp', async (req, res) => {
  try {
    const { markdown } = req.body;
    if (!markdown) return res.status(400).json({ error: 'Markdown required' });

    const filename = `presentation_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const mdPath = path.join(tempDir, `${filename}.md`);
    const pptxPath = path.join(downloadsDir, `${filename}.pptx`);

    await fs.writeFile(mdPath, markdown, 'utf8');

    // Enhanced Marp command with proper Chrome configuration
    const marpCommand = `npx @marp-team/marp-cli "${mdPath}" --output "${pptxPath}" --no-stdin ` +
      `--chrome-arg=--no-sandbox ` +
      `--chrome-arg=--disable-dev-shm-usage ` +
      `--chrome-arg=--disable-gpu ` +
      `--chrome-arg=--headless ` +
      `--chrome-arg=--disable-web-security ` +
      `--chrome-arg=--disable-features=VizDisplayCompositor ` +
      `--chrome-arg=--run-all-compositor-stages-before-draw ` +
      `--chrome-arg=--disable-background-timer-throttling ` +
      `--chrome-arg=--disable-renderer-backgrounding ` +
      `--chrome-arg=--disable-backgrounding-occluded-windows`;
    
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
    const { markdown, format } = req.body;
    if (!markdown || !format) return res.status(400).json({ error: 'Markdown and format required' });

    const filename = `document_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const mdPath = path.join(tempDir, `${filename}.md`);
    const outputPath = path.join(downloadsDir, `${filename}.${format}`);

    await fs.writeFile(mdPath, markdown, 'utf8');

    // Use PDF engine for better PDF generation
    const pandocCmd = format === 'pdf' 
      ? `pandoc "${mdPath}" -o "${outputPath}" --pdf-engine=xelatex`
      : `pandoc "${mdPath}" -o "${outputPath}"`;
    
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

// Setup static file serving (called after all routes are defined)
async function setupStaticFiles() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../dist');
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