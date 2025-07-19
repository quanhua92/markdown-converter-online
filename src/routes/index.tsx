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
import { TemplateSection } from '@/components/shared/TemplateSection'
import { ActionButtonsSection } from '@/components/shared/ActionButtonsSection'
import { EditorPreviewSection } from '@/components/shared/EditorPreviewSection'
import { OutputFormatAndConversionSection } from '@/components/shared/OutputFormatAndConversionSection'
import { GuidesSection } from '@/components/shared/GuidesSection'
import { HeaderSection } from '@/components/shared/HeaderSection'

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
      <TemplateSection 
        onApplyTemplate={applyTemplate}
        onClearDraft={clearDraft}
        hasContent={!!markdown.trim()}
      />

      {/* Action Buttons */}
      <ActionButtonsSection
        isDesktop={isDesktop}
        showEditPanel={showEditPanel}
        showPreviewPanel={showPreviewPanel}
        activeTab={activeTab}
        onToggleEditPanel={() => setShowEditPanel(!showEditPanel)}
        onTogglePreviewPanel={() => setShowPreviewPanel(!showPreviewPanel)}
        onSetActiveTab={setActiveTab}
        onExport={handleExport}
        onPrint={handlePrint}
      />

      {/* Editor and Preview */}
      <EditorPreviewSection
        isDesktop={isDesktop}
        showEditPanel={showEditPanel}
        showPreviewPanel={showPreviewPanel}
        activeTab={activeTab}
        markdown={markdown}
        onMarkdownChange={setMarkdown}
        draftSaveStatus={draftSaveStatus}
      />

      {/* Output Format and Conversion Section */}
      <OutputFormatAndConversionSection
        selectedFormat={selectedFormat}
        onFormatChange={setSelectedFormat}
        formatConfig={formatConfig}
        conversionOptions={conversionOptions}
        onConversionOptionsChange={setConversionOptions}
        showAdvancedOptions={showAdvancedOptions}
        onAdvancedOptionsToggle={setShowAdvancedOptions}
        isConverting={isConverting}
        hasContent={!!markdown.trim()}
        onConvert={handleConvert}
        onPrint={handlePrint}
        downloadResult={downloadResult}
        onClearResult={clearResult}
        conversionError={conversionError}
        onDismissError={() => setConversionError(null)}
        onCopyToClipboard={() => {}}
        onDownload={handleDownload}
      />
    </>
  )


  const renderGuides = () => <GuidesSection />

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 py-4 sm:py-8 lg:py-12 px-4">
      
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <HeaderSection 
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          currentView={currentView}
          onViewChange={setCurrentView}
        />


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