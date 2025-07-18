import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Edit3, Eye, Printer, Settings, Download, Moon, Sun } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import mermaid from 'mermaid'
import 'highlight.js/styles/github.css'

export const Route = createFileRoute('/editor')({
  component: MarkdownEditor,
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

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`# Markdown Editor & Preview

Welcome to the **advanced markdown editor** with live preview!

## Features

- 📝 **Split-screen editing** - Edit on the left, preview on the right
- 🎨 **Mermaid diagrams** - Create flowcharts and diagrams
- 🌈 **Code highlighting** - Syntax highlighting for many languages
- 🖨️ **Print support** - Beautiful A4 PDF printing
- ⚙️ **Configurable options** - Customize your editing experience

## Example Code

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## Example Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`

## Table Example

| Feature | Status |
|---------|--------|
| Markdown | ✅ |
| Mermaid | ✅ |
| Print | ✅ |

> **Note**: This is a powerful markdown editor with advanced features!`)
  
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isDesktop, setIsDesktop] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState('light')
  const [fontSize, setFontSize] = useState('14')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [previewStyle, setPreviewStyle] = useState('github')
  const { toast } = useToast()

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Markdown Document</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 2cm;
                }
                body {
                  font-family: 'Times New Roman', serif;
                  font-size: 12pt;
                  line-height: 1.6;
                  color: #000;
                }
                h1, h2, h3, h4, h5, h6 {
                  page-break-after: avoid;
                  margin-top: 1.5em;
                  margin-bottom: 0.5em;
                }
                p {
                  margin-bottom: 1em;
                }
                pre {
                  background: #f5f5f5;
                  padding: 1em;
                  border-radius: 4px;
                  overflow-wrap: break-word;
                  white-space: pre-wrap;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1em 0;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f2f2f2;
                }
                blockquote {
                  border-left: 4px solid #ddd;
                  padding-left: 1em;
                  margin: 1em 0;
                  font-style: italic;
                }
                .mermaid-diagram {
                  text-align: center;
                  margin: 2em 0;
                }
              }
            </style>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css">
          </head>
          <body>
            <div id="print-content"></div>
            <script src="https://cdn.jsdelivr.net/npm/mermaid@11.9.0/dist/mermaid.min.js"></script>
            <script>
              mermaid.initialize({ startOnLoad: true });
              
              // Content will be injected here
              document.getElementById('print-content').innerHTML = \`${renderMarkdownToHTML(markdown)}\`;
              
              // Auto-print after a short delay to ensure mermaid diagrams are rendered
              setTimeout(() => {
                window.print();
              }, 1000);
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const renderMarkdownToHTML = (content: string) => {
    // Simple HTML conversion for print view
    return content
      .replace(/```mermaid\n([\s\S]*?)```/g, '<div class="mermaid">$1</div>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
  }

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Export Complete",
      description: "Markdown file has been downloaded",
    })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Markdown Editor
            </h1>
            <p className="text-gray-600 mt-1">
              Edit and preview markdown with advanced features
            </p>
          </div>
          
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
              Print
            </Button>
          </div>
        </div>

        {showSettings && (
          <Card className="shadow-lg">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Editor
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
                Preview
                <Badge variant="secondary" className="ml-2">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className={!isDesktop && activeTab === 'edit' ? 'hidden' : ''}>
              <div className="min-h-[600px] overflow-auto prose prose-sm max-w-none">
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
      </div>
    </div>
  )
}