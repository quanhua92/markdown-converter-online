import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast, Toaster } from 'sonner'
import { Download, FileText, Presentation, File, Loader2, X, BookOpen, Code, Zap } from 'lucide-react'

function App() {
  const [markdown, setMarkdown] = useState(`---
theme: default
paginate: true
---

# My Presentation
Welcome to my markdown converter!

---

## Features
- Convert markdown to PowerPoint
- Convert markdown to HTML
- Convert markdown to Word
- Convert markdown to PDF

---

## How to Use
1. Write your markdown content
2. Select output format
3. Click convert
4. Download your file

---

## Thank You!
Happy converting! 🎉`)

  const [selectedFormat, setSelectedFormat] = useState<string>('pptx')
  const [isConverting, setIsConverting] = useState(false)
  const [currentView, setCurrentView] = useState<'converter' | 'guides'>('converter')
  const [downloadResult, setDownloadResult] = useState<{
    success: boolean;
    downloadUrl: string;
    filename: string;
    format: string;
    timestamp: Date;
  } | null>(null)

  const formatConfig = {
    pptx: { 
      label: 'PowerPoint', 
      icon: Presentation, 
      endpoint: '/api/convert/marp',
      description: 'Interactive presentation slides',
      badge: 'Popular'
    },
    html: { 
      label: 'HTML', 
      icon: FileText, 
      endpoint: '/api/convert/pandoc',
      description: 'Web-ready HTML document',
      badge: 'Fast'
    },
    docx: { 
      label: 'Word', 
      icon: File, 
      endpoint: '/api/convert/pandoc',
      description: 'Microsoft Word document',
      badge: 'Standard'
    },
    pdf: { 
      label: 'PDF', 
      icon: FileText, 
      endpoint: '/api/convert/pandoc',
      description: 'Portable document format',
      badge: 'Print-ready'
    }
  }

  const handleConvert = async () => {
    if (!markdown.trim()) {
      toast.error('Please enter some markdown content')
      return
    }

    setIsConverting(true)
    const config = formatConfig[selectedFormat as keyof typeof formatConfig]
    
    try {
      const payload = selectedFormat === 'pptx' 
        ? { markdown }
        : { markdown, format: selectedFormat }
      
      toast.info(`Converting to ${config.label}...`)
      
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Conversion failed (${response.status})`)
      }

      const result = await response.json()
      
      if (result.success && result.downloadUrl) {
        // Store download result for UI display
        setDownloadResult({
          success: true,
          downloadUrl: result.downloadUrl,
          filename: result.filename,
          format: selectedFormat,
          timestamp: new Date()
        })
        
        toast.success(`${config.label} file ready for download!`)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Conversion error:', error)
      toast.error(error instanceof Error ? error.message : 'Conversion failed')
    } finally {
      setIsConverting(false)
    }
  }

  const currentConfig = formatConfig[selectedFormat as keyof typeof formatConfig]
  const IconComponent = currentConfig.icon

  const handleDownload = async () => {
    if (!downloadResult) return
    
    try {
      const downloadResponse = await fetch(downloadResult.downloadUrl)
      if (!downloadResponse.ok) {
        throw new Error('Failed to download file')
      }
      
      const blob = await downloadResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadResult.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('File downloaded successfully!')
    } catch (error) {
      toast.error('Download failed. Please try again.')
    }
  }

  const clearResult = () => {
    setDownloadResult(null)
  }

  const clearMarkdown = () => {
    setMarkdown('')
  }

  const GuidesPage = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          📚 Conversion Guides
        </h1>
        <p className="text-lg md:text-xl text-gray-600">
          Learn how to use the markdown converter effectively
        </p>
      </div>

      {/* Markdown Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Markdown Format Guide
          </CardTitle>
          <CardDescription>
            Learn the markdown syntax supported by our converter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Headers</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`# Header 1
## Header 2
### Header 3`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Text Formatting</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`**Bold text**
*Italic text*
\`inline code\``}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Lists</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`- Bullet point 1
- Bullet point 2

1. Numbered item
2. Numbered item`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Code Blocks</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`\`\`\`javascript
console.log("Hello!");
\`\`\``}
              </pre>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold mb-2">PowerPoint Slides (Marp)</h4>
            <p className="text-sm text-gray-600 mb-2">For PowerPoint conversion, use `---` to separate slides:</p>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`---
theme: default
---

# Slide 1 Title
Content for first slide

---

# Slide 2 Title
- Point 1
- Point 2`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* API Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            API Integration Guide
          </CardTitle>
          <CardDescription>
            Use our REST API to integrate conversions into your applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Base URL</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`${window.location.origin}/api`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Convert to PDF, Word, or HTML</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`POST /api/convert/pandoc
Content-Type: application/json

{
  "markdown": "# Your markdown content",
  "format": "pdf|docx|html"
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Convert to PowerPoint</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`POST /api/convert/marp
Content-Type: application/json

{
  "markdown": "---\\ntheme: default\\n---\\n\\n# Slide 1"
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Response Format</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "success": true,
  "downloadUrl": "/api/download/filename.pdf",
  "filename": "document_123456.pdf"
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Download File</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`GET /api/download/{filename}`}
            </pre>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Files are automatically deleted after 1 hour</li>
              <li>• Maximum markdown size: 10MB</li>
              <li>• Rate limit: 100 requests per 15 minutes</li>
              <li>• Use CORS headers for browser requests</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 lg:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Markdown Converter
            </h1>
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 mt-1">
              Convert markdown to PowerPoint, HTML, Word, or PDF
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentView('converter')}
              variant={currentView === 'converter' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Converter</span>
            </Button>
            <Button
              onClick={() => setCurrentView('guides')}
              variant={currentView === 'guides' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Guides</span>
            </Button>
          </div>
        </div>

        {currentView === 'guides' ? (
          <GuidesPage />
        ) : (
          <>
            {/* Converter Content */}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Markdown Input
            </CardTitle>
            <CardDescription>
              Enter your markdown content below. For presentations, use <code>---</code> to separate slides.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Enter your markdown here..."
                className="min-h-[200px] sm:min-h-[300px] font-mono text-sm"
              />
              <div className="flex justify-end">
                <Button
                  onClick={clearMarkdown}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={!markdown.trim()}
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              Output Format
            </CardTitle>
            <CardDescription>
              Choose the format you want to convert your markdown to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {Object.entries(formatConfig).map(([format, config]) => {
                const Icon = config.icon
                const isSelected = selectedFormat === format
                
                return (
                  <Card 
                    key={format}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedFormat(format)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs">
                          {config.badge}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base">{config.label}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                        {config.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select output format" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(formatConfig).map(([format, config]) => (
                  <SelectItem key={format} value={format}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="text-center">
          {!downloadResult ? (
            <Button 
              onClick={handleConvert}
              disabled={isConverting || !markdown.trim()}
              size="lg"
              className="w-full sm:w-auto px-6 sm:px-8"
            >
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Convert to {currentConfig.label}
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={clearResult}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-6 sm:px-8"
            >
              <FileText className="mr-2 h-4 w-4" />
              Convert Another File
            </Button>
          )}
        </div>

        {/* Download Result UI - Mobile First */}
        {downloadResult && (
          <Card className="mt-6 sm:mt-8 border-green-200 bg-green-50">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-green-800 text-lg sm:text-xl">
                <Download className="h-5 w-5" />
                Conversion Complete!
              </CardTitle>
              <CardDescription className="text-green-700 text-sm sm:text-base">
                Your {formatConfig[downloadResult.format as keyof typeof formatConfig].label} file is ready for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg border gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    {(() => {
                      const IconComponent = formatConfig[downloadResult.format as keyof typeof formatConfig].icon
                      return IconComponent ? <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" /> : null
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{downloadResult.filename}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Generated {downloadResult.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                    size="sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">Download</span>
                  </Button>
                  <Button
                    onClick={clearResult}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-green-700">
                <p>💡 <strong>Tip:</strong> Your file will be automatically cleaned up from the server after 1 hour for security.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by Marp CLI and Pandoc • Built with React and Express</p>
        </div>
          </>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default App