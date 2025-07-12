# API Reference

Complete reference for the Markdown Converter Online REST API.

## Base URL

```
http://localhost:3000/api
```

For production deployments, replace `localhost:3000` with your domain.

## Authentication

Currently no authentication is required. The API uses rate limiting for protection:
- **Rate Limit**: 100 requests per 15 minutes per IP
- **Size Limit**: 10MB maximum markdown content

## Endpoints

### Convert to PDF, Word, or HTML

Convert markdown content to PDF, Word document, or HTML using Pandoc.

**Endpoint:** `POST /convert/pandoc`

**Request Body:**
```json
{
  "markdown": "# Your markdown content here",
  "format": "pdf"
}
```

**Parameters:**
- `markdown` (string, required): Markdown content to convert
- `format` (string, required): Output format - one of:
  - `"pdf"` - PDF document using XeLaTeX
  - `"docx"` - Microsoft Word document
  - `"html"` - HTML document

**Response:**
```json
{
  "success": true,
  "downloadUrl": "/api/download/document_1234567890_abc123.pdf",
  "filename": "document_1234567890_abc123.pdf"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/convert/pandoc \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\nThis is a **bold** statement.",
    "format": "pdf"
  }'
```

### Convert to PowerPoint

Convert markdown content to PowerPoint presentation using Marp CLI.

**Endpoint:** `POST /convert/marp`

**Request Body:**
```json
{
  "markdown": "---\ntheme: default\n---\n\n# Slide 1\n\nContent here\n\n---\n\n# Slide 2\n\nMore content"
}
```

**Parameters:**
- `markdown` (string, required): Markdown content with Marp frontmatter and slide separators (`---`)

**Response:**
```json
{
  "success": true,
  "downloadUrl": "/api/download/presentation_1234567890_abc123.pptx",
  "filename": "presentation_1234567890_abc123.pptx"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/convert/marp \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "---\ntheme: default\npaginate: true\n---\n\n# My Presentation\n\nWelcome slide\n\n---\n\n## Agenda\n\n- Point 1\n- Point 2\n- Point 3"
  }'
```

### Download File

Download a converted file using the URL provided in conversion responses.

**Endpoint:** `GET /download/:filename`

**Parameters:**
- `filename` (path parameter): Filename returned from conversion endpoint

**Response:** 
- File download with appropriate Content-Type and Content-Disposition headers
- Files are automatically deleted after 1 hour

**Example:**
```bash
curl -O http://localhost:3000/api/download/document_1234567890_abc123.pdf
```

### Health Check

Check if the API service is running and healthy.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

## Error Responses

### Error Format

All errors return a JSON object with error details:

```json
{
  "error": "Human-readable error message",
  "details": "Technical error details (optional)",
  "stderr": "Process standard error output (optional)",
  "stdout": "Process standard output (optional)"
}
```

### HTTP Status Codes

- **200 OK**: Successful conversion or file download
- **400 Bad Request**: Invalid request body or parameters
- **404 Not Found**: File not found for download
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Conversion process failed

### Common Errors

#### Invalid Markdown Format
```json
{
  "error": "Markdown and format required",
  "details": "Request body must include 'markdown' and 'format' fields"
}
```

#### Conversion Process Failed
```json
{
  "error": "Conversion failed for pdf format",
  "details": "pandoc: error message here",
  "stderr": "LaTeX Error: File not found",
  "stdout": "Processing output logs"
}
```

#### File Not Found
```json
{
  "error": "File not found",
  "details": "The requested file may have expired or been deleted"
}
```

#### Rate Limit Exceeded
```json
{
  "error": "Too Many Requests",
  "details": "Rate limit of 100 requests per 15 minutes exceeded"
}
```

## Usage Examples

### Complete Workflow Example

```javascript
// Convert markdown to PDF
const convertToPdf = async (markdownContent) => {
  try {
    const response = await fetch('http://localhost:3000/api/convert/pandoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        markdown: markdownContent,
        format: 'pdf'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const result = await response.json();
    
    // Download the file
    const downloadResponse = await fetch(`http://localhost:3000${result.downloadUrl}`);
    const blob = await downloadResponse.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return result;
  } catch (error) {
    console.error('Conversion failed:', error);
    throw error;
  }
};

// Usage
const markdown = `
# My Document

This is a **sample** document with:

- Lists
- *Italic text*
- \`code examples\`

## Conclusion

Converting markdown is easy!
`;

convertToPdf(markdown);
```

### Python Example

```python
import requests
import json

def convert_markdown(markdown_content, output_format):
    """Convert markdown to specified format"""
    
    url = "http://localhost:3000/api/convert/pandoc"
    
    payload = {
        "markdown": markdown_content,
        "format": output_format
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        
        # Download the file
        download_url = f"http://localhost:3000{result['downloadUrl']}"
        file_response = requests.get(download_url)
        file_response.raise_for_status()
        
        # Save to disk
        with open(result['filename'], 'wb') as f:
            f.write(file_response.content)
        
        print(f"File saved as: {result['filename']}")
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            error_data = e.response.json()
            print(f"Error details: {error_data}")
        raise

# Usage
markdown = """
# Python Integration Example

This document was generated using the Markdown Converter API.

## Features

- Easy HTTP API
- Multiple output formats
- Error handling included

```python
print("Hello from Python!")
```
"""

convert_markdown(markdown, "pdf")
```

### Presentation Example

```javascript
const createPresentation = async () => {
  const presentationMarkdown = `---
theme: default
paginate: true
backgroundColor: white
color: black
---

# Welcome to Our API

Building presentations from markdown

---

## Key Features

- 🚀 Fast conversion
- 📱 Mobile responsive
- 🌙 Dark mode support
- 🔄 Error debugging

---

## API Benefits

### For Developers
- RESTful endpoints
- Clear error messages
- Rate limiting protection

### For Users
- Multiple output formats
- Template system
- Copy-friendly guides

---

# Thank You!

Questions?`;

  try {
    const response = await fetch('http://localhost:3000/api/convert/marp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        markdown: presentationMarkdown
      })
    });

    const result = await response.json();
    console.log('Presentation created:', result.filename);
    
    // Download would happen here
    return result;
  } catch (error) {
    console.error('Failed to create presentation:', error);
  }
};
```

## Best Practices

### Request Optimization
- **Batch operations**: Group multiple conversions when possible
- **Content validation**: Validate markdown syntax before sending
- **Error handling**: Always handle both network and conversion errors
- **Rate limiting**: Implement client-side rate limiting to avoid 429 errors

### Security Considerations
- **Input sanitization**: Validate markdown content on client side
- **File handling**: Don't expose download URLs publicly
- **CORS**: Configure appropriate CORS headers for browser requests
- **Content limits**: Respect the 10MB markdown size limit

### Performance Tips
- **Caching**: Cache conversion results when appropriate
- **Parallel requests**: Use concurrent requests for different formats
- **Progress indication**: Show loading states for long conversions
- **Error recovery**: Implement retry logic for transient failures

## Integration Patterns

### Single Page Application
```javascript
class MarkdownConverter {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  async convert(markdown, format) {
    const endpoint = format === 'pptx' ? 'marp' : 'pandoc';
    const payload = format === 'pptx' 
      ? { markdown } 
      : { markdown, format };

    const response = await fetch(`${this.baseUrl}/convert/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return response.json();
  }

  async download(downloadUrl, filename) {
    const response = await fetch(`${this.baseUrl}${downloadUrl}`);
    const blob = await response.blob();
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Usage
const converter = new MarkdownConverter();
const result = await converter.convert('# Hello', 'pdf');
await converter.download(result.downloadUrl, result.filename);
```

### Server-Side Integration
```javascript
const express = require('express');
const axios = require('axios');

const app = express();

app.post('/generate-report', async (req, res) => {
  try {
    const { content, format } = req.body;
    
    // Convert using the API
    const response = await axios.post('http://localhost:3000/api/convert/pandoc', {
      markdown: content,
      format: format
    });
    
    // Get the file
    const fileResponse = await axios.get(
      `http://localhost:3000${response.data.downloadUrl}`,
      { responseType: 'stream' }
    );
    
    // Stream to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${response.data.filename}"`);
    fileResponse.data.pipe(res);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: Rate limit info in response headers
- **Reset**: Automatic reset after window expires

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95  
X-RateLimit-Reset: 1642234567
```

### Handling Rate Limits
```javascript
const makeRequest = async (url, options, retries = 3) => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const delay = (resetTime * 1000) - Date.now();
      
      if (retries > 0 && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest(url, options, retries - 1);
      }
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return makeRequest(url, options, retries - 1);
    }
    throw error;
  }
};
```

## Support

- **Built-in Documentation**: Visit `/` for interactive guides and examples
- **Error Debugging**: Detailed error responses with stderr/stdout
- **Health Monitoring**: Use `/api/health` for service status
- **GitHub Issues**: Report bugs and request features