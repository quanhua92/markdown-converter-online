import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
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
import {
  MarkdownRenderer,
  useTheme,
  useDraft,
  useEditor,
  templates,
  formatConfig,
  defaultConversionOptions,
  type ConversionOptions
} from '@/components/shared'

export const Route = createFileRoute('/')({
  component: Index,
})


function Index() {
  // Git commit hash - prevent optimization
  const gitCommit = ['1', '5', '1', '0', 'd', 'f', 'c'].join('')
  
  // Use shared hooks
  const { isDarkMode, toggleTheme } = useTheme()
  const { markdown, setMarkdown, draftSaveStatus, clearDraft } = useDraft()
  const { activeTab, setActiveTab, isDesktop, showEditPanel, setShowEditPanel, showPreviewPanel, setShowPreviewPanel } = useEditor()
  
  const [selectedFormat, setSelectedFormat] = useState<string>('pptx')
  const [isConverting, setIsConverting] = useState(false)
  const [currentView, setCurrentView] = useState<'editor' | 'guides'>('editor')
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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>(defaultConversionOptions)

  // Guides-specific state
  const [activeSection, setActiveSection] = useState('getting-started')



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


  const handlePrint = () => {
    try {
      // Store content in localStorage using the same key as draft
      localStorage.setItem('markdownDraft', markdown)
      const printUrl = `/print`
      const newWindow = window.open(printUrl, '_blank')
      
      if (!newWindow) {
        toast.error('Failed to open print window. Please check your popup blocker settings.')
      }
    } catch (error) {
      console.error('Print error:', error)
      toast.error('Failed to prepare content for printing')
    }
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




  const applyTemplate = (templateKey: string) => {
    setMarkdown(templates[templateKey as keyof typeof templates])
    toast.success(`${templateKey.charAt(0).toUpperCase() + templateKey.slice(1)} template applied!`)
  }

  const currentConfig = formatConfig[selectedFormat as keyof typeof formatConfig]
  const IconComponent = currentConfig.icon

  // Render different views based on currentView
  const renderEditor = () => (
    <>
      {/* Template Selection */}
      <Card className="mb-6 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Templates
          </CardTitle>
          <CardDescription>
            Start with a pre-built template or create your own markdown content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Attractive Ultimate Template Button */}
            <div className="text-center">
              <Button
                onClick={() => applyTemplate('showcase')}
                size="lg"
                className="w-full sm:w-auto px-8 py-4 h-14 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-xl font-bold text-lg relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
              >
                <BookOpen className="mr-3 h-6 w-6" />
                ✨ Try Ultimate Template ✨
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Complete showcase with examples, diagrams & best practices
              </p>
            </div>
            
            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400 px-2">or choose manually</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            
            {/* Template Selection and Clear Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <Select onValueChange={applyTemplate}>
                <SelectTrigger className="w-full sm:w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
                  <SelectValue placeholder="Load Other Templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="showcase">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Ultimate Showcase
                    </div>
                  </SelectItem>
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
              
              <div className="flex gap-2">
                <Button
                  onClick={clearDraft}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={!markdown.trim()}
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="mb-6 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Edit Button */}
            <Button
              variant={isDesktop ? (showEditPanel ? "default" : "outline") : (activeTab === 'edit' ? "default" : "outline")}
              size="sm"
              onClick={() => {
                if (isDesktop) {
                  setShowEditPanel(!showEditPanel)
                } else {
                  setActiveTab('edit')
                }
              }}
              className="flex items-center justify-center gap-2 h-12"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm">Edit</span>
            </Button>
            
            {/* Preview Button */}
            <Button
              variant={isDesktop ? (showPreviewPanel ? "default" : "outline") : (activeTab === 'preview' ? "default" : "outline")}
              size="sm"
              onClick={() => {
                if (isDesktop) {
                  setShowPreviewPanel(!showPreviewPanel)
                } else {
                  setActiveTab('preview')
                }
              }}
              className="flex items-center justify-center gap-2 h-12"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">Preview</span>
            </Button>
            
            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center justify-center gap-2 h-12"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </Button>
            
            {/* Print Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 h-12"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm">Print</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor and Preview */}
      <div className={`grid gap-6 mb-6 ${
        isDesktop 
          ? (showEditPanel && showPreviewPanel 
              ? 'grid-cols-2' 
              : 'grid-cols-1') 
          : 'grid-cols-1'
      }`}>
        <Card className={`shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300 ${
          isDesktop ? (!showEditPanel ? 'hidden' : '') : ''
        }`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Markdown Editor
              {draftSaveStatus === 'saving' && (
                <span className="text-xs text-gray-500 ml-2">Saving...</span>
              )}
              {draftSaveStatus === 'saved' && (
                <span className="text-xs text-green-600 ml-2">✓ Saved</span>
              )}
              {draftSaveStatus === 'error' && (
                <span className="text-xs text-red-500 ml-2">⚠ Save failed</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className={!isDesktop && activeTab === 'preview' ? 'hidden' : ''}>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Enter your markdown here..."
              className="min-h-[600px] font-mono resize-none"
              style={{ fontSize: '14px' }}
            />
          </CardContent>
        </Card>

        <Card className={`shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300 ${
          isDesktop ? (!showPreviewPanel ? 'hidden' : '') : ''
        }`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
                <Badge variant="secondary" className="ml-2">Mermaid + Syntax</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className={!isDesktop && activeTab === 'edit' ? 'hidden' : ''}>
            <MarkdownRenderer
              content={markdown}
              className="min-h-[600px] overflow-auto prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h1:border-b prose-h2:border-b prose-h1:border-gray-300 prose-h2:border-gray-200 prose-h1:pb-2 prose-h2:pb-1"
            />
          </CardContent>
        </Card>
      </div>

      {/* Output Format Selection */}
      <Card className="mb-6 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300">
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
                  className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border ${
                    isSelected ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/40 dark:to-purple-900/40 scale-105 shadow-2xl' : 'border-gray-200/50 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
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

          {/* Advanced Options */}
          <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between mt-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm">
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
                        <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
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
                        <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
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
                            <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
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
                            <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
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
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Convert Button */}
      <div className="text-center mb-6">
        {!downloadResult ? (
          <Button 
            onClick={handleConvert}
            disabled={isConverting || !markdown.trim()}
            size="lg"
            className="w-full sm:w-auto px-8 py-3 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-full font-semibold text-lg relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
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
            size="lg"
            className="w-full sm:w-auto px-8 py-3 h-12 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-lg hover:scale-105 rounded-full font-semibold text-lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            Convert Another File
          </Button>
        )}
      </div>

      {/* Print Button */}
      <div className="text-center mb-6">
        <Button 
          onClick={handlePrint}
          disabled={!markdown.trim()}
          size="lg"
          className="w-full sm:w-auto px-8 py-3 h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-full font-semibold text-lg relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Preview
        </Button>
      </div>

      {/* Download Result UI */}
      {downloadResult && (
        <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 shadow-xl">
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
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-1 sm:flex-none h-10 px-6 hover:scale-105"
                  size="default"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={clearResult}
                  size="default"
                  className="h-10 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Error Debug Section */}
      {conversionError && (
        <Card className="mb-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700 shadow-xl">
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
              <div className="flex justify-end">
                <Button
                  onClick={() => setConversionError(null)}
                  size="sm"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <X className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )


  const renderGuides = () => {

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text)
    }

    const CodeBlock = ({ children, onCopy }: { children: string; onCopy?: () => void }) => (
      <div className="relative bg-gray-800 dark:bg-gray-950 rounded-lg p-4 my-4">
        <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
          <code>{children}</code>
        </pre>
        {onCopy && (
          <button
            onClick={onCopy}
            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Copy
          </button>
        )}
      </div>
    )

    const sections = {
      'getting-started': {
        title: 'Getting Started',
        content: (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Two Powerful Ways to Use Markdown Converter</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📄 Preview & Print</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Render markdown with full Mermaid diagrams and LaTeX math support. Perfect for viewing and printing documents.
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Live preview with syntax highlighting</li>
                  <li>• Mermaid diagrams (flowcharts, sequences, etc.)</li>
                  <li>• LaTeX math rendering (KaTeX)</li>
                  <li>• Print-optimized layout</li>
                  <li>• Dark/light mode support</li>
                </ul>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">📁 Convert & Export</h4>
                <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                  Transform markdown into multiple file formats for sharing and distribution.
                </p>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• PowerPoint presentations (Marp)</li>
                  <li>• PDF documents (Pandoc + LaTeX)</li>
                  <li>• Word documents (.docx)</li>
                  <li>• HTML files</li>
                  <li>• Built-in templates</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">🚀 Quick Start</h4>
              <ol className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
                <li><strong>1.</strong> Choose "Load Template" or write your own markdown</li>
                <li><strong>2.</strong> Use the <strong>Preview</strong> tab to see live rendering with Mermaid/LaTeX</li>
                <li><strong>3.</strong> Click <strong>Print Preview</strong> for print-optimized view</li>
                <li><strong>4.</strong> Or select a format and <strong>Convert</strong> to download files</li>
              </ol>
            </div>
          </div>
        )
      },
      'markdown-syntax': {
        title: 'Markdown Syntax Guide',
        content: (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Complete Markdown Reference</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Headers</h4>
                <CodeBlock onCopy={() => copyToClipboard('# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6')}>
{`# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Text Formatting</h4>
                <CodeBlock onCopy={() => copyToClipboard('**Bold text**\n*Italic text*\n***Bold and italic***\n~~Strikethrough~~\n`Inline code`')}>
{`**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
\`Inline code\``}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Lists</h4>
                <CodeBlock onCopy={() => copyToClipboard('- Unordered item 1\n- Unordered item 2\n  - Nested item\n\n1. Ordered item 1\n2. Ordered item 2\n   1. Nested ordered item')}>
{`- Unordered item 1
- Unordered item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2
   1. Nested ordered item`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Links and Images</h4>
                <CodeBlock onCopy={() => copyToClipboard('[GitHub](https://github.com)\n![Sample Image](https://picsum.photos/200/300)')}>
{`[GitHub](https://github.com)
![Sample Image](https://picsum.photos/200/300)`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Code Blocks</h4>
                <CodeBlock onCopy={() => copyToClipboard('```javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n```')}>
{`\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\``}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Tables</h4>
                <CodeBlock onCopy={() => copyToClipboard('| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Row 1    | Data     | More data|\n| Row 2    | Data     | More data|')}>
{`| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | More data|
| Row 2    | Data     | More data|`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Blockquotes</h4>
                <CodeBlock onCopy={() => copyToClipboard('> This is a blockquote\n> It can span multiple lines\n>\n> > Nested blockquotes are also possible')}>
{`> This is a blockquote
> It can span multiple lines
>
> > Nested blockquotes are also possible`}
                </CodeBlock>
              </div>
            </div>
          </div>
        )
      },
      'mermaid-diagrams': {
        title: 'Mermaid Diagrams',
        content: (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Interactive Diagrams with Mermaid</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create beautiful diagrams that render perfectly in both preview and print modes.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Flowcharts</h4>
                <CodeBlock onCopy={() => copyToClipboard('```mermaid\nflowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n    C --> E[End]\n    D --> E\n```')}>
{`\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\``}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Sequence Diagrams</h4>
                <CodeBlock onCopy={() => copyToClipboard('```mermaid\nsequenceDiagram\n    participant User\n    participant Frontend\n    participant API\n    participant Database\n    \n    User->>Frontend: Submit form\n    Frontend->>API: POST /convert\n    API->>Database: Save data\n    Database-->>API: Confirmation\n    API-->>Frontend: Success response\n    Frontend-->>User: Show result\n```')}>
{`\`\`\`mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Submit form
    Frontend->>API: POST /convert
    API->>Database: Save data
    Database-->>API: Confirmation
    API-->>Frontend: Success response
    Frontend-->>User: Show result
\`\`\``}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Class Diagrams</h4>
                <CodeBlock onCopy={() => copyToClipboard('```mermaid\nclassDiagram\n    class User {\n        +String name\n        +String email\n        +login()\n        +logout()\n    }\n    \n    class Document {\n        +String title\n        +String content\n        +convert()\n        +save()\n    }\n    \n    User --> Document : creates\n```')}>
{`\`\`\`mermaid
classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Document {
        +String title
        +String content
        +convert()
        +save()
    }
    
    User --> Document : creates
\`\`\``}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Gantt Charts</h4>
                <CodeBlock onCopy={() => copyToClipboard('```mermaid\ngantt\n    title Project Timeline\n    dateFormat YYYY-MM-DD\n    section Planning\n    Requirements    :done, req, 2024-01-01, 2024-01-07\n    Design         :done, design, after req, 5d\n    section Development\n    Frontend       :active, frontend, 2024-01-15, 10d\n    Backend        :backend, after frontend, 8d\n    Testing        :test, after backend, 5d\n```')}>
{`\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements    :done, req, 2024-01-01, 2024-01-07
    Design         :done, design, after req, 5d
    section Development
    Frontend       :active, frontend, 2024-01-15, 10d
    Backend        :backend, after frontend, 8d
    Testing        :test, after backend, 5d
\`\`\``}
                </CodeBlock>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Mermaid Tips</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Diagrams render live in the Preview tab</li>
                <li>• Print-optimized colors ensure readability</li>
                <li>• Works in all export formats (PDF, Word, HTML)</li>
                <li>• Use descriptive IDs for better maintenance</li>
              </ul>
            </div>
          </div>
        )
      },
      'latex-math': {
        title: 'LaTeX Math',
        content: (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Mathematical Expressions with LaTeX</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Render beautiful mathematical formulas using KaTeX in both preview and print modes.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Inline Math</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Use single dollar signs for inline expressions:</p>
                <CodeBlock onCopy={() => copyToClipboard('The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ for solving equations.')}>
{`The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ for solving equations.`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Block Math</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Use double dollar signs for display equations:</p>
                <CodeBlock onCopy={() => copyToClipboard('$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$')}>
{`$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Matrices</h4>
                <CodeBlock onCopy={() => copyToClipboard('$$\n\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}\n\\begin{pmatrix}\nx \\\\\ny\n\\end{pmatrix}\n=\n\\begin{pmatrix}\nax + by \\\\\ncx + dy\n\\end{pmatrix}\n$$')}>
{`$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\begin{pmatrix}
x \\\\
y
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}
$$`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Fractions and Roots</h4>
                <CodeBlock onCopy={() => copyToClipboard('$$\n\\frac{\\sqrt{x^2 + y^2}}{\\sqrt[3]{z^3 + w^3}} = \\frac{\\sqrt{x^2 + y^2}}{(z^3 + w^3)^{1/3}}\n$$')}>
{`$$
\\frac{\\sqrt{x^2 + y^2}}{\\sqrt[3]{z^3 + w^3}} = \\frac{\\sqrt{x^2 + y^2}}{(z^3 + w^3)^{1/3}}
$$`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Greek Letters and Symbols</h4>
                <CodeBlock onCopy={() => copyToClipboard('$$\n\\alpha + \\beta = \\gamma, \\quad \\Delta = b^2 - 4ac, \\quad \\sum_{i=1}^{n} x_i, \\quad \\prod_{j=1}^{m} y_j\n$$')}>
{`$$
\\alpha + \\beta = \\gamma, \\quad \\Delta = b^2 - 4ac, \\quad \\sum_{i=1}^{n} x_i, \\quad \\prod_{j=1}^{m} y_j
$$`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Aligned Equations</h4>
                <CodeBlock onCopy={() => copyToClipboard('$$\n\\begin{align}\nf(x) &= ax^2 + bx + c \\\\\nf\'(x) &= 2ax + b \\\\\nf\'\'(x) &= 2a\n\\end{align}\n$$')}>
{`$$
\\begin{align}
f(x) &= ax^2 + bx + c \\\\
f'(x) &= 2ax + b \\\\
f''(x) &= 2a
\\end{align}
$$`}
                </CodeBlock>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">🧮 Math Tips</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Math renders instantly in Preview mode</li>
                <li>• Print quality matches screen display</li>
                <li>• Supports full KaTeX syntax</li>
                <li>• Use `\\\\` for line breaks in align environments</li>
                <li>• Escape backslashes in JSON: use `\\\\` for `\\`</li>
              </ul>
            </div>
          </div>
        )
      },
      'templates': {
        title: 'Templates & Examples',
        content: (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Built-in Templates</h3>
            
            <div className="grid gap-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">📊 Presentation Template</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                  Optimized for PowerPoint conversion with Marp. Includes slide separators and presenter notes.
                </p>
                <CodeBlock onCopy={() => copyToClipboard('---\ntheme: default\npaginate: true\nbackgroundColor: white\n---\n\n# My Presentation\n## Subtitle Here\n\n---\n\n## Agenda\n\n- Introduction\n- Main Topics\n- Conclusion\n\n---\n\n## Key Points\n\n- **Point 1**: Important information\n- **Point 2**: More details\n- **Point 3**: Final thoughts\n\n<!-- Speaker notes go here -->')}>
{`---
theme: default
paginate: true
backgroundColor: white
---

# My Presentation
## Subtitle Here

---

## Agenda

- Introduction
- Main Topics  
- Conclusion

---

## Key Points

- **Point 1**: Important information
- **Point 2**: More details
- **Point 3**: Final thoughts

<!-- Speaker notes go here -->`}
                </CodeBlock>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📄 Document Template</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Comprehensive markdown showcase perfect for PDF and Word conversion.
                </p>
                <CodeBlock onCopy={() => copyToClipboard('# Document Title\n\n## Executive Summary\n\nBrief overview of the document contents.\n\n## Table of Contents\n\n1. [Introduction](#introduction)\n2. [Methodology](#methodology)\n3. [Results](#results)\n4. [Conclusion](#conclusion)\n\n## Introduction\n\nDetailed introduction with **bold** and *italic* text.\n\n### Subsection\n\nMore content here.\n\n## Methodology\n\n```python\ndef process_data(data):\n    return data.clean().analyze()\n```\n\n## Results\n\n| Metric | Value | Change |\n|--------|-------|--------|\n| Users  | 1,000 | +15%   |\n| Revenue| $50K  | +25%   |')}>
{`# Document Title

## Executive Summary

Brief overview of the document contents.

## Table of Contents

1. [Introduction](#introduction)
2. [Methodology](#methodology)  
3. [Results](#results)
4. [Conclusion](#conclusion)

## Introduction

Detailed introduction with **bold** and *italic* text.

### Subsection

More content here.

## Methodology

\`\`\`python
def process_data(data):
    return data.clean().analyze()
\`\`\`

## Results

| Metric | Value | Change |
|--------|-------|--------|
| Users  | 1,000 | +15%   |
| Revenue| $50K  | +25%   |`}
                </CodeBlock>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">📝 Article Template</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                  Blog-style content with metadata, suitable for all output formats.
                </p>
                <CodeBlock onCopy={() => copyToClipboard('---\ntitle: "Article Title"\nauthor: "Your Name"\ndate: "2024-01-15"\ntags: ["markdown", "tutorial"]\n---\n\n# Article Title\n\n*Published on January 15, 2024 by Your Name*\n\n## Introduction\n\nWelcome to this article about markdown conversion.\n\n> This is an important quote that summarizes the main point.\n\n## Main Content\n\n### Key Concepts\n\n1. **Concept A**: Explanation here\n2. **Concept B**: More details\n3. **Concept C**: Final point\n\n### Code Example\n\n```javascript\nconst example = () => {\n  console.log("Hello, World!");\n};\n```\n\n## Conclusion\n\nSummary of the article\'s main points.')}>
{`---
title: "Article Title"
author: "Your Name"  
date: "2024-01-15"
tags: ["markdown", "tutorial"]
---

# Article Title

*Published on January 15, 2024 by Your Name*

## Introduction

Welcome to this article about markdown conversion.

> This is an important quote that summarizes the main point.

## Main Content

### Key Concepts

1. **Concept A**: Explanation here
2. **Concept B**: More details
3. **Concept C**: Final point

### Code Example

\`\`\`javascript
const example = () => {
  console.log("Hello, World!");
};
\`\`\`

## Conclusion

Summary of the article's main points.`}
                </CodeBlock>
              </div>
            </div>
          </div>
        )
      },
      'preview-print': {
        title: 'Preview & Print Features',
        content: (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Advanced Preview & Print Capabilities</h3>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">🖥️ Live Preview Mode</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Real-time Rendering</h5>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Instant markdown parsing</li>
                    <li>• Live Mermaid diagram updates</li>
                    <li>• KaTeX math rendering</li>
                    <li>• Syntax highlighting</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Interactive Features</h5>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Dark/light mode toggle</li>
                    <li>• Responsive layout</li>
                    <li>• Typography scaling</li>
                    <li>• Accessible color contrast</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">🖨️ Print Preview Mode</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">Print Optimization</h5>
                  <ul className="text-green-700 dark:text-green-300 space-y-1">
                    <li>• Optimized page breaks</li>
                    <li>• Print-safe colors</li>
                    <li>• Consistent typography</li>
                    <li>• Proper margins & spacing</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">Enhanced Rendering</h5>
                  <ul className="text-green-700 dark:text-green-300 space-y-1">
                    <li>• High-resolution diagrams</li>
                    <li>• Vector-quality math</li>
                    <li>• Professional formatting</li>
                    <li>• Cross-browser compatibility</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold mb-2">🎯 When to Use Each Mode</h4>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">📝 Writing & Editing</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Use <strong>Preview</strong> mode for:</p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• Content creation</li>
                    <li>• Real-time feedback</li>
                    <li>• Interactive viewing</li>
                    <li>• Mobile responsiveness</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">🖨️ Print & Share</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Use <strong>Print Preview</strong> for:</p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• Document printing</li>
                    <li>• PDF generation</li>
                    <li>• Final review</li>
                    <li>• Professional presentation</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">📁 Export & Convert</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Use <strong>Convert</strong> for:</p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• File distribution</li>
                    <li>• PowerPoint slides</li>
                    <li>• Word documents</li>
                    <li>• HTML websites</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• <strong>Mermaid colors:</strong> Diagrams automatically adapt to print mode</li>
                <li>• <strong>Math rendering:</strong> LaTeX formulas maintain quality at any zoom level</li>
                <li>• <strong>Dark mode:</strong> Optimized for both screen viewing and print</li>
                <li>• <strong>Keyboard shortcuts:</strong> Ctrl+P for direct print preview access</li>
                <li>• <strong>Mobile friendly:</strong> Preview works perfectly on tablets and phones</li>
              </ul>
            </div>
          </div>
        )
      },
      'api-examples': {
        title: 'API Examples',
        content: (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">REST API Usage</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Converting to PDF</h4>
                <CodeBlock onCopy={() => copyToClipboard('curl -X POST http://localhost:3000/api/convert/pandoc \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "markdown": "# Hello World\\n\\nThis is **bold** text.",\n    "format": "pdf"\n  }\'')}>
{`curl -X POST http://localhost:3000/api/convert/pandoc \\
  -H "Content-Type: application/json" \\
  -d '{
    "markdown": "# Hello World\\n\\nThis is **bold** text.",
    "format": "pdf"
  }'`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Creating PowerPoint</h4>
                <CodeBlock onCopy={() => copyToClipboard('curl -X POST http://localhost:3000/api/convert/marp \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "markdown": "---\\ntheme: default\\n---\\n\\n# Slide 1\\n\\n---\\n\\n# Slide 2"\n  }\'')}>
{`curl -X POST http://localhost:3000/api/convert/marp \\
  -H "Content-Type: application/json" \\
  -d '{
    "markdown": "---\\ntheme: default\\n---\\n\\n# Slide 1\\n\\n---\\n\\n# Slide 2"
  }'`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">JavaScript Example</h4>
                <CodeBlock onCopy={() => copyToClipboard('const convertMarkdown = async (markdown, format) => {\n  const response = await fetch(\'/api/convert/pandoc\', {\n    method: \'POST\',\n    headers: { \'Content-Type\': \'application/json\' },\n    body: JSON.stringify({ markdown, format })\n  });\n  \n  const result = await response.json();\n  \n  // Download the file\n  const fileResponse = await fetch(result.downloadUrl);\n  const blob = await fileResponse.blob();\n  \n  const url = URL.createObjectURL(blob);\n  const a = document.createElement(\'a\');\n  a.href = url;\n  a.download = result.filename;\n  a.click();\n  URL.revokeObjectURL(url);\n};')}>
{`const convertMarkdown = async (markdown, format) => {
  const response = await fetch('/api/convert/pandoc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown, format })
  });
  
  const result = await response.json();
  
  // Download the file
  const fileResponse = await fetch(result.downloadUrl);
  const blob = await fileResponse.blob();
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename;
  a.click();
  URL.revokeObjectURL(url);
};`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Python Example</h4>
                <CodeBlock onCopy={() => copyToClipboard('import requests\n\ndef convert_to_pdf(markdown_content):\n    response = requests.post(\n        \'http://localhost:3000/api/convert/pandoc\',\n        json={\'markdown\': markdown_content, \'format\': \'pdf\'}\n    )\n    \n    result = response.json()\n    \n    # Download the file\n    file_response = requests.get(\n        f\'http://localhost:3000{result["downloadUrl"]}\'\n    )\n    \n    with open(result[\'filename\'], \'wb\') as f:\n        f.write(file_response.content)\n    \n    return result[\'filename\']')}>
{`import requests

def convert_to_pdf(markdown_content):
    response = requests.post(
        'http://localhost:3000/api/convert/pandoc',
        json={'markdown': markdown_content, 'format': 'pdf'}
    )
    
    result = response.json()
    
    # Download the file
    file_response = requests.get(
        f'http://localhost:3000{result["downloadUrl"]}'
    )
    
    with open(result['filename'], 'wb') as f:
        f.write(file_response.content)
    
    return result['filename']`}
                </CodeBlock>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ Rate Limits</h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• <strong>Limit:</strong> 100 requests per 15 minutes per IP</li>
                <li>• <strong>Size:</strong> 10MB maximum markdown content</li>
                <li>• <strong>Files:</strong> Auto-deleted after 1 hour</li>
              </ul>
            </div>
          </div>
        )
      }
    }

    return (
      <div className="space-y-6">
        {/* Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex flex-wrap gap-x-8 gap-y-2 pb-2">
            {Object.entries(sections).map(([key, section]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {sections[activeSection]?.content}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 py-4 sm:py-8 lg:py-12 px-4">
      
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Markdown Converter
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 mt-2 font-medium">
                ✨ Convert & preview markdown with Mermaid/LaTeX • Export to PowerPoint, PDF, Word, HTML
              </p>
            </div>
            <div className="flex items-center">
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-md rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              <Button
                onClick={() => setCurrentView('editor')}
                variant={currentView === 'editor' ? 'default' : 'outline'}
                size="default"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${currentView === 'editor' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm'}`}
              >
                <Edit3 className="h-4 w-4" />
                Editor & Converter
              </Button>
              <Button
                onClick={() => setCurrentView('guides')}
                variant={currentView === 'guides' ? 'default' : 'outline'}
                size="default"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${currentView === 'guides' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm'}`}
              >
                <BookOpen className="h-4 w-4" />
                Guides
              </Button>
          </div>
        </div>


        {/* Render content based on current view */}
        {currentView === 'editor' && renderEditor()}
        {currentView === 'guides' && renderGuides()}

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by Marp CLI and Pandoc • Built with React and Express • Git: {gitCommit} • {new Date().toISOString()}
            <br />
            <a 
              href="https://github.com/quanhua92/markdown-converter-online" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline hover:no-underline transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default Index