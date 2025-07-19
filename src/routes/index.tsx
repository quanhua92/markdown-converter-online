import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { toast, Toaster } from 'sonner'
import { Download, FileText, Presentation, File, Loader2, Edit3, Eye, Printer, Settings, Moon, Sun, ChevronDown, BookOpen, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import mermaid from 'mermaid'
import 'highlight.js/styles/github.css'

export const Route = createFileRoute('/')({
  component: Index,
})

interface MermaidProps {
  chart: string
}

function MermaidDiagram({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      })
      
      mermaid.render('mermaid-diagram', chart)
        .then((result) => {
          if (ref.current) {
            ref.current.innerHTML = result.svg
          }
        })
        .catch((err) => {
          console.error('Mermaid rendering error:', err)
          setError('Failed to render diagram')
        })
    }
  }, [chart])

  if (error) {
    return <div className="text-red-500 p-4 border border-red-200 rounded">{error}</div>
  }

  return <div ref={ref} className="mermaid-diagram" />
}

function Index() {
  // Git commit hash - prevent optimization
  const gitCommit = ['1', '5', '1', '0', 'd', 'f', 'c'].join('')
  
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
- Live preview with Mermaid diagrams
- Advanced conversion options

---

## Example Code

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

---

## Example Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`

---

## Thank You!
Happy converting! 🎉`)
  
  const [selectedFormat, setSelectedFormat] = useState<string>('pptx')
  const [isConverting, setIsConverting] = useState(false)
  const [currentView, setCurrentView] = useState<'converter' | 'guides' | 'editor'>('converter')
  const [showConverterPreview, setShowConverterPreview] = useState(false)
  const [downloadResult, setDownloadResult] = useState<{
    success: boolean;
    downloadUrl: string;
    filename: string;
    format: string;
    timestamp: Date;
  } | null>(null)
  const [conversionError, setConversionError] = useState<{
    message: string;
    details?: string;
    stderr?: string;
    stdout?: string;
  } | null>(null)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [conversionOptions, setConversionOptions] = useState<{
    // Marp options
    theme?: string;
    imageScale?: number;
    browserTimeout?: number;
    browser?: string;
    // Pandoc options
    margin?: string;
    fontSize?: string;
    toc?: boolean;
    tocDepth?: number;
    colorLinks?: boolean;
    paperSize?: string;
    selfContained?: boolean;
    sectionDivs?: boolean;
    citeproc?: boolean;
  }>({
    theme: 'default',
    imageScale: 2,
    browserTimeout: 60000,
    browser: 'chrome',
    margin: '1in',
    fontSize: '12pt',
    toc: false,
    tocDepth: 2,
    colorLinks: true,
    paperSize: 'a4paper',
    selfContained: false,
    sectionDivs: false,
    citeproc: false
  })
  
  // Editor-specific state
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isDesktop, setIsDesktop] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState('light')
  const [fontSize, setFontSize] = useState('14')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [previewStyle, setPreviewStyle] = useState('github')

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

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
    setConversionError(null) // Clear previous errors
    const config = formatConfig[selectedFormat as keyof typeof formatConfig]
    
    try {
      const payload = selectedFormat === 'pptx' 
        ? { markdown, options: conversionOptions }
        : { markdown, format: selectedFormat, options: conversionOptions }
      
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
        
        // Store detailed error information
        setConversionError({
          message: errorData.error || `Conversion failed (${response.status})`,
          details: errorData.details,
          stderr: errorData.stderr,
          stdout: errorData.stdout
        })
        
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
    setConversionError(null)
  }

  const clearMarkdown = () => {
    setMarkdown('')
  }

  const handlePrint = () => {
    // Create a new route/page for print view instead of manual HTML construction
    const printUrl = `/print?content=${encodeURIComponent(markdown)}`
    window.open(printUrl, '_blank')
  }

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Markdown file has been downloaded')
  }

  const customComponents = {
    code(props: any) {
      const { children, className, ...rest } = props
      const match = /language-(\w+)/.exec(className || '')
      if (match && match[1] === 'mermaid') {
        return <MermaidDiagram chart={children as string} />
      }
      return <code {...rest} className={className}>{children}</code>
    }
  }


  const templates = {
    presentation: `---
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
Happy converting! 🎉`,
    
    document: `# Document Title

## Introduction
This is a sample markdown document that showcases various formatting options.

## Headers
You can create multiple levels of headers using # symbols.

### Subsection
This is a third-level header.

## Text Formatting
- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- \`inline code\` for technical terms
- ~~Strikethrough~~ for deleted content

## Lists
### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

## Code Blocks
\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

## Links and Images
[Visit our website](https://example.com)

## Tables
| Feature | Description | Status |
|---------|-------------|--------|
| PDF | Portable Document Format | ✅ |
| Word | Microsoft Word Document | ✅ |
| HTML | Web Page | ✅ |
| PowerPoint | Presentation Slides | ✅ |

## Conclusion
This template demonstrates the power of markdown for creating structured documents.`,

    article: `# Article Title: The Power of Markdown

**Published:** $(date)  
**Author:** Your Name

## Abstract
This article explores the versatility and power of Markdown as a lightweight markup language for creating formatted documents.

## Introduction
Markdown has revolutionized the way we write and format text. Its simplicity and readability make it an ideal choice for:

- Technical documentation
- Blog posts and articles
- README files
- Academic papers

## Key Benefits

### 1. Simplicity
Markdown syntax is intuitive and easy to learn. Unlike complex word processors, Markdown focuses on content over formatting.

### 2. Portability
Markdown files are plain text, making them:
- Version control friendly
- Platform independent
- Future-proof

### 3. Flexibility
Convert to multiple formats:
- **HTML** for web publishing
- **PDF** for sharing and printing
- **Word** for collaborative editing
- **PowerPoint** for presentations

## Technical Examples

### Code Snippet
\`\`\`python
def convert_markdown(content):
    """Convert markdown to various formats"""
    return processor.convert(content)
\`\`\`

### Mathematical Expressions
While not all converters support it, you can include LaTeX-style math:
\`$E = mc^2$\`

## Best Practices

> **Tip:** Keep your markdown files organized with clear hierarchical structure using headers.

1. **Use descriptive headers** - They become your document outline
2. **Keep paragraphs concise** - Break up long text blocks
3. **Use lists effectively** - They improve readability
4. **Include code examples** - When writing technical content

## Conclusion
Markdown strikes the perfect balance between simplicity and functionality. Whether you're writing documentation, articles, or presentations, Markdown provides a clean, efficient way to create professional content.

---

*Happy writing with Markdown!*`
  }

  const applyTemplate = (templateKey: string) => {
    setMarkdown(templates[templateKey as keyof typeof templates])
    toast.success(`${templateKey.charAt(0).toUpperCase() + templateKey.slice(1)} template applied!`)
  }

  const currentConfig = formatConfig[selectedFormat as keyof typeof formatConfig]
  const IconComponent = currentConfig.icon

  // Render different views based on currentView
  const renderEditor = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Raw Markdown Editor
            </CardTitle>
            {!isDesktop && (
              <div className="flex gap-1">
                <Button
                  variant={activeTab === 'edit' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab('edit')}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={activeTab === 'preview' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className={!isDesktop && activeTab === 'preview' ? 'hidden' : ''}>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Enter your markdown here..."
            className="min-h-[600px] font-mono resize-none"
            style={{ fontSize: `${fontSize}px` }}
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Live Preview
            <Badge variant="secondary" className="ml-2">Mermaid + Syntax</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={!isDesktop && activeTab === 'edit' ? 'hidden' : ''}>
          <div className="min-h-[600px] overflow-auto prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h1:border-b prose-h2:border-b prose-h1:border-gray-300 prose-h2:border-gray-200 prose-h1:pb-2 prose-h2:pb-1">
            <div className="markdown-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={customComponents}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderConverter = () => (
    <>
      {showConverterPreview ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="card-elegant">
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex gap-2">
                    <Select onValueChange={applyTemplate}>
                      <SelectTrigger className="w-40 h-9 input-elegant">
                        <SelectValue placeholder="Load Template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presentation">
                          <div className="flex items-center gap-2">
                            <Presentation className="h-4 w-4" />
                            Presentation
                          </div>
                        </SelectItem>
                        <SelectItem value="document">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Document
                          </div>
                        </SelectItem>
                        <SelectItem value="article">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4" />
                            Article
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => setShowConverterPreview(!showConverterPreview)}
                      size="sm"
                      variant={showConverterPreview ? "default" : "outline"}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 ${showConverterPreview ? 'btn-gradient' : 'btn-elegant'}`}
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      onClick={handlePrint}
                      size="sm"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 btn-elegant"
                      disabled={!markdown.trim()}
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      onClick={clearMarkdown}
                      size="sm"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 btn-elegant hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      disabled={!markdown.trim()}
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Enter your markdown here..."
                  className="min-h-[400px] font-mono text-sm input-elegant"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
                <Badge variant="secondary" className="ml-2">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] overflow-auto prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h1:border-b prose-h2:border-b prose-h1:border-gray-300 prose-h2:border-gray-200 prose-h1:pb-2 prose-h2:pb-1">
                <div className="markdown-preview">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    components={{
                      code(props: any) {
                        const { children, className, ...rest } = props
                        const match = /language-(\w+)/.exec(className || '')
                        if (match && match[1] === 'mermaid') {
                          return <MermaidDiagram chart={children as string} />
                        }
                        return <code {...rest} className={className}>{children}</code>
                      }
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="mb-8 card-elegant">
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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex gap-2">
                  <Select onValueChange={applyTemplate}>
                    <SelectTrigger className="w-40 h-9 input-elegant">
                      <SelectValue placeholder="Load Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presentation">
                        <div className="flex items-center gap-2">
                          <Presentation className="h-4 w-4" />
                          Presentation
                        </div>
                      </SelectItem>
                      <SelectItem value="document">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Document
                        </div>
                      </SelectItem>
                      <SelectItem value="article">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4" />
                          Article
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => setShowConverterPreview(!showConverterPreview)}
                    size="sm"
                    variant={showConverterPreview ? "default" : "outline"}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 ${showConverterPreview ? 'btn-gradient' : 'btn-elegant'}`}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={handlePrint}
                    size="sm"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 btn-elegant"
                    disabled={!markdown.trim()}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    onClick={clearMarkdown}
                    size="sm"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 btn-elegant hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                    disabled={!markdown.trim()}
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Enter your markdown here..."
                className="min-h-[200px] sm:min-h-[300px] font-mono text-sm input-elegant"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8 card-elegant">
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
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 card-elegant ${
                    isSelected ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30' : ''
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
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                      {config.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-full input-elegant">
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
          
          {/* Advanced Options */}
          <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between mt-4 btn-elegant">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Options
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {selectedFormat === 'pptx' ? (
                /* Marp Options */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={conversionOptions.theme} onValueChange={(value) => setConversionOptions({...conversionOptions, theme: value})}>
                        <SelectTrigger className="input-elegant">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="gaia">Gaia</SelectItem>
                          <SelectItem value="uncover">Uncover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="imageScale">Image Scale</Label>
                      <Select value={conversionOptions.imageScale?.toString()} onValueChange={(value) => setConversionOptions({...conversionOptions, imageScale: parseInt(value)})}>
                        <SelectTrigger className="input-elegant">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x (Standard)</SelectItem>
                          <SelectItem value="2">2x (High Quality)</SelectItem>
                          <SelectItem value="3">3x (Ultra High)</SelectItem>
                          <SelectItem value="4">4x (Maximum)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="browser">Browser</Label>
                      <Select value={conversionOptions.browser} onValueChange={(value) => setConversionOptions({...conversionOptions, browser: value})}>
                        <SelectTrigger className="input-elegant">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="chrome">Chrome</SelectItem>
                          <SelectItem value="firefox">Firefox</SelectItem>
                          <SelectItem value="edge">Edge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="browserTimeout">Browser Timeout</Label>
                      <Select value={conversionOptions.browserTimeout?.toString()} onValueChange={(value) => setConversionOptions({...conversionOptions, browserTimeout: parseInt(value)})}>
                        <SelectTrigger className="input-elegant">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30000">30 seconds</SelectItem>
                          <SelectItem value="60000">60 seconds</SelectItem>
                          <SelectItem value="90000">90 seconds</SelectItem>
                          <SelectItem value="120000">120 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                /* Pandoc Options */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedFormat === 'pdf' && (
                      <>
                        <div>
                          <Label htmlFor="margin">Page Margins</Label>
                          <Select value={conversionOptions.margin} onValueChange={(value) => setConversionOptions({...conversionOptions, margin: value})}>
                            <SelectTrigger className="input-elegant">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.5in">0.5 inch</SelectItem>
                              <SelectItem value="1in">1 inch</SelectItem>
                              <SelectItem value="1.5in">1.5 inches</SelectItem>
                              <SelectItem value="2in">2 inches</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="fontSize">Font Size</Label>
                          <Select value={conversionOptions.fontSize} onValueChange={(value) => setConversionOptions({...conversionOptions, fontSize: value})}>
                            <SelectTrigger className="input-elegant">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10pt">10pt</SelectItem>
                              <SelectItem value="11pt">11pt</SelectItem>
                              <SelectItem value="12pt">12pt</SelectItem>
                              <SelectItem value="14pt">14pt</SelectItem>
                              <SelectItem value="16pt">16pt</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="paperSize">Paper Size</Label>
                          <Select value={conversionOptions.paperSize} onValueChange={(value) => setConversionOptions({...conversionOptions, paperSize: value})}>
                            <SelectTrigger className="input-elegant">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a4paper">A4</SelectItem>
                              <SelectItem value="letterpaper">Letter</SelectItem>
                              <SelectItem value="a3paper">A3</SelectItem>
                              <SelectItem value="a5paper">A5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    {selectedFormat === 'html' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="selfContained" 
                            checked={conversionOptions.selfContained} 
                            onCheckedChange={(checked) => setConversionOptions({...conversionOptions, selfContained: checked})}
                          />
                          <Label htmlFor="selfContained">Self-contained HTML</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="sectionDivs" 
                            checked={conversionOptions.sectionDivs} 
                            onCheckedChange={(checked) => setConversionOptions({...conversionOptions, sectionDivs: checked})}
                          />
                          <Label htmlFor="sectionDivs">Section divs</Label>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="toc" 
                        checked={conversionOptions.toc} 
                        onCheckedChange={(checked) => setConversionOptions({...conversionOptions, toc: checked})}
                      />
                      <Label htmlFor="toc">Table of Contents</Label>
                    </div>
                    {conversionOptions.toc && (
                      <div className="ml-6">
                        <Label htmlFor="tocDepth">TOC Depth</Label>
                        <Select value={conversionOptions.tocDepth?.toString()} onValueChange={(value) => setConversionOptions({...conversionOptions, tocDepth: parseInt(value)})}>
                          <SelectTrigger className="input-elegant w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 level</SelectItem>
                            <SelectItem value="2">2 levels</SelectItem>
                            <SelectItem value="3">3 levels</SelectItem>
                            <SelectItem value="4">4 levels</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {selectedFormat === 'pdf' && (
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="colorLinks" 
                          checked={conversionOptions.colorLinks} 
                          onCheckedChange={(checked) => setConversionOptions({...conversionOptions, colorLinks: checked})}
                        />
                        <Label htmlFor="colorLinks">Colored Links</Label>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="citeproc" 
                        checked={conversionOptions.citeproc} 
                        onCheckedChange={(checked) => setConversionOptions({...conversionOptions, citeproc: checked})}
                      />
                      <Label htmlFor="citeproc">Citation Processing</Label>
                    </div>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <div className="text-center">
        {!downloadResult ? (
          <Button 
            onClick={handleConvert}
            disabled={isConverting || !markdown.trim()}
            size="default"
            className="w-full sm:w-auto px-6 py-2 h-10 btn-gradient hover:scale-105"
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
            size="default"
            className="w-full sm:w-auto px-6 py-2 h-10 btn-elegant hover:scale-105"
          >
            <FileText className="mr-2 h-4 w-4" />
            Convert Another File
          </Button>
        )}
      </div>

      {/* Download Result UI */}
      {downloadResult && (
        <Card className="mt-6 sm:mt-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 card-elegant">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  {(() => {
                    const IconComponent = formatConfig[downloadResult.format as keyof typeof formatConfig].icon
                    return IconComponent ? <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" /> : null
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{downloadResult.filename}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Generated {downloadResult.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleDownload}
                  className="btn-gradient flex-1 sm:flex-none h-10 px-6 hover:scale-105"
                  size="default"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={clearResult}
                  size="default"
                  className="h-10 px-3 btn-elegant hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-green-700 dark:text-green-300">
              <p>💡 <strong>Tip:</strong> Your file will be automatically cleaned up from the server after 1 hour for security.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Error Debug Section */}
      {conversionError && (
        <Card className="mt-6 sm:mt-8 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700 card-elegant">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-red-800 text-lg sm:text-xl">
              <X className="h-5 w-5" />
              Conversion Failed
            </CardTitle>
            <CardDescription className="text-red-700 text-sm sm:text-base">
              {conversionError.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionError.details && (
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Details:</h4>
                  <pre className="bg-red-100 dark:bg-red-900/20 p-3 rounded text-sm overflow-x-auto text-red-700 dark:text-red-300">
                    {conversionError.details}
                  </pre>
                </div>
              )}
              {conversionError.stderr && (
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Standard Error:</h4>
                  <pre className="bg-red-100 dark:bg-red-900/20 p-3 rounded text-sm overflow-x-auto text-red-700 dark:text-red-300">
                    {conversionError.stderr}
                  </pre>
                </div>
              )}
              {conversionError.stdout && (
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Standard Output:</h4>
                  <pre className="bg-red-100 dark:bg-red-900/20 p-3 rounded text-sm overflow-x-auto text-red-700 dark:text-red-300">
                    {conversionError.stdout}
                  </pre>
                </div>
              )}
              <div className="flex justify-end">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setConversionError(null)}
                    size="sm"
                    className="btn-elegant hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Dismiss
                  </Button>
                  <Button
                    onClick={() => setShowAdvancedOptions(true)}
                    size="sm"
                    className="btn-elegant"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Check Options
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )

  const renderGuides = () => (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">Guides Coming Soon</h2>
      <p className="text-gray-600 dark:text-gray-300">Documentation and guides will be available here.</p>
    </div>
  )

  return (
    <div className="min-h-screen main-bg py-4 sm:py-8 lg:py-12 px-4">
      
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Markdown Converter
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 dark:text-gray-300 mt-1">
                Convert markdown to PowerPoint, HTML, Word, or PDF
              </p>
            </div>
            <div className="flex items-center">
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 px-3 py-2 btn-elegant"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              <Button
                onClick={() => setCurrentView('converter')}
                variant={currentView === 'converter' ? 'default' : 'outline'}
                size="default"
                className={`flex items-center gap-2 px-4 py-2 ${currentView === 'converter' ? 'btn-gradient' : 'btn-elegant'}`}
              >
                <FileText className="h-4 w-4" />
                Converter
              </Button>
              <Button
                onClick={() => setCurrentView('editor')}
                variant={currentView === 'editor' ? 'default' : 'outline'}
                size="default"
                className={`flex items-center gap-2 px-4 py-2 ${currentView === 'editor' ? 'btn-gradient' : 'btn-elegant'}`}
              >
                <Edit3 className="h-4 w-4" />
                Editor
              </Button>
              <Button
                onClick={() => setCurrentView('guides')}
                variant={currentView === 'guides' ? 'default' : 'outline'}
                size="default"
                className={`flex items-center gap-2 px-4 py-2 ${currentView === 'guides' ? 'btn-gradient' : 'btn-elegant'}`}
              >
                <BookOpen className="h-4 w-4" />
                Guides
              </Button>
          </div>
        </div>

        {/* Editor settings for editor view */}
        {currentView === 'editor' && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={showSettings ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export MD
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print/PDF
                </Button>
              </div>
            </div>

            {showSettings && (
              <Card className="shadow-lg mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Editor Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Theme</label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="w-4 h-4" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="w-4 h-4" />
                              Dark
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size</label>
                      <Select value={fontSize} onValueChange={setFontSize}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12px</SelectItem>
                          <SelectItem value="14">14px</SelectItem>
                          <SelectItem value="16">16px</SelectItem>
                          <SelectItem value="18">18px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Preview Style</label>
                      <Select value={previewStyle} onValueChange={setPreviewStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="lineNumbers"
                        checked={showLineNumbers}
                        onChange={(e) => setShowLineNumbers(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="lineNumbers" className="text-sm font-medium">
                        Show line numbers
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Render content based on current view */}
        {currentView === 'converter' && renderConverter()}
        {currentView === 'editor' && renderEditor()}
        {currentView === 'guides' && renderGuides()}

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by Marp CLI and Pandoc • Built with React and Express • Git: {gitCommit} • {new Date().toISOString()}</p>
          <div className="bg-purple-500 text-white p-4 mt-4 rounded font-mono text-lg">
            🚀 BUILD INFO: Git commit {gitCommit} • Build time: {new Date().toISOString()}
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default Index