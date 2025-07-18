import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Download, FileText, Presentation, File, Loader2, Edit3 } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [markdown, setMarkdown] = useState(`---
theme: default
paginate: true
---

# My Presentation
Welcome to my slides!

---

## Slide 2
- Point 1
- Point 2
- Point 3

---

## Thank You!
Questions?`)
  
  const [format, setFormat] = useState<string>('pptx')
  const [isConverting, setIsConverting] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const { toast } = useToast()

  const handleConvert = async () => {
    if (!markdown.trim()) {
      toast({
        title: "Error",
        description: "Please enter some markdown content",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)
    setDownloadUrl(null)

    try {
      const endpoint = format === 'pptx' ? '/api/convert/marp' : '/api/convert/pandoc'
      const body = format === 'pptx' ? { markdown } : { markdown, format }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setDownloadUrl(data.downloadUrl)
        setFilename(data.filename)
        toast({
          title: "Success!",
          description: "Your file has been converted successfully",
        })
      } else {
        throw new Error(data.error || 'Conversion failed')
      }
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      })
    } finally {
      setIsConverting(false)
    }
  }

  const getFormatIcon = (fmt: string) => {
    switch (fmt) {
      case 'pptx': return <Presentation className="w-4 h-4" />
      case 'pdf': return <FileText className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Markdown Converter
          </h1>
          <p className="text-xl text-gray-600 mt-4">
            Transform your markdown into beautiful presentations and documents
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary">Marp PowerPoint</Badge>
            <Badge variant="secondary">Pandoc PDF</Badge>
            <Badge variant="secondary">DOCX Support</Badge>
            <Badge variant="secondary">Live Preview</Badge>
          </div>
          <div className="flex justify-center mt-6">
            <Button 
              asChild 
              variant="outline"
              size="lg"
              className="bg-white/50 hover:bg-white/80 backdrop-blur-sm"
            >
              <a href="/editor">
                <Edit3 className="w-5 h-5 mr-2" />
                Markdown Editor & Preview
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Markdown Input
                </CardTitle>
                <CardDescription>
                  Enter your markdown content below. Use Marp syntax for presentations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Enter your markdown here..."
                  className="min-h-[500px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getFormatIcon(format)}
                  Output Format
                </CardTitle>
                <CardDescription>
                  Choose your desired output format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pptx">
                      <div className="flex items-center gap-2">
                        <Presentation className="w-4 h-4" />
                        PowerPoint (.pptx)
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        PDF Document
                      </div>
                    </SelectItem>
                    <SelectItem value="docx">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4" />
                        Word Document (.docx)
                      </div>
                    </SelectItem>
                    <SelectItem value="html">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4" />
                        HTML File
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleConvert} 
                  disabled={isConverting || !markdown.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      {getFormatIcon(format)}
                      <span className="ml-2">Convert to {format.toUpperCase()}</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {downloadUrl && (
              <Card className="shadow-lg border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Download className="w-5 h-5" />
                    Ready to Download
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 mb-4">
                    Your file has been converted successfully!
                  </p>
                  <Button 
                    asChild 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <a href={downloadUrl} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download {filename}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm">Example Formats</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <Badge variant="outline" className="mb-1">Marp Slides</Badge>
                  <p className="text-gray-600">Use --- to separate slides, add themes with frontmatter</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">Pandoc</Badge>
                  <p className="text-gray-600">Standard markdown for documents, supports LaTeX math</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
