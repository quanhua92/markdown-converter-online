import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast, Toaster } from 'sonner'
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Eye, 
  Printer, 
  Download, 
  Moon, 
  Sun, 
  FolderOpen,
  Save,
  ChevronDown,
  Menu
} from 'lucide-react'
import {
  MarkdownRenderer,
  useTheme,
  useEditor,
  debounce
} from '@/components/shared'
import { FileTree, FileSystemItem } from '@/components/shared/FileTree'
import { useFileSystem } from '@/components/shared/useFileSystem'
import { TemplateQuickActions } from '@/components/shared/TemplateSelector'

export const Route = createFileRoute('/explorer')(({
  component: Explorer,
}))

function Explorer() {
  const { isDarkMode, toggleTheme } = useTheme()
  const { activeTab, setActiveTab, isDesktop, showEditPanel, setShowEditPanel, showPreviewPanel, setShowPreviewPanel } = useEditor()
  
  const {
    files,
    currentFile,
    selectFile,
    updateFileContent,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    toggleFolder,
    clearAll,
    initializeFromTemplate,
    isLoaded
  } = useFileSystem()

  const [isFileTreeCollapsed, setIsFileTreeCollapsed] = useState(false)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Sync markdown content with current file
  useEffect(() => {
    if (currentFile) {
      setMarkdownContent(currentFile.content || '')
    }
  }, [currentFile])

  // Debounced save function
  const debouncedSave = debounce((content: string) => {
    if (currentFile) {
      updateFileContent(currentFile.path, content)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }, 500)

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value)
    setSaveStatus('saving')
    debouncedSave(value)
  }

  const handleFileSelect = (item: FileSystemItem) => {
    selectFile(item)
  }

  const handlePrint = () => {
    if (!currentFile || !markdownContent.trim()) {
      toast.error('No content to print')
      return
    }

    try {
      localStorage.setItem('markdownDraft', markdownContent)
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
    if (!currentFile || !markdownContent.trim()) {
      toast.error('No content to export')
      return
    }

    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = currentFile.name.endsWith('.md') ? currentFile.name : `${currentFile.name}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Markdown file exported successfully!')
  }

  const handleManualSave = () => {
    if (currentFile) {
      updateFileContent(currentFile.path, markdownContent)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
      toast.success('File saved!')
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  title="Open file tree"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="hidden sm:inline">Markdown Explorer</span>
              <span className="sm:hidden">Explorer</span>
            </h1>
            {currentFile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Editing:</span>
                <Badge variant="secondary">{currentFile.name}</Badge>
                {saveStatus === 'saving' && (
                  <span className="text-xs text-yellow-600">Saving...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-xs text-green-600">✓ Saved</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSave}
              disabled={!currentFile}
              title="Manual save"
              className="hidden sm:flex"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              disabled={!currentFile}
              title="Export markdown"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              disabled={!currentFile}
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Mobile File Tree Sheet */}
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
          <SheetContent side="left" className="w-80 p-0 lg:hidden">
            <div className="p-4 h-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Files</h2>
              <FileTree
                items={files}
                selectedFile={currentFile?.path}
                onFileSelect={(item) => {
                  handleFileSelect(item)
                  setIsMobileSheetOpen(false)
                }}
                onCreateFile={createFile}
                onCreateFolder={createFolder}
                onDeleteItem={deleteItem}
                onRenameItem={renameItem}
                onToggleFolder={toggleFolder}
                onInitializeTemplate={initializeFromTemplate}
                showTemplateOptions={files.length === 0}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop File Tree Panel */}
        <Collapsible
          open={!isFileTreeCollapsed}
          onOpenChange={setIsFileTreeCollapsed}
          className="hidden lg:block border-r border-gray-200 dark:border-gray-700"
        >
          <div className={`transition-all duration-300 ${isFileTreeCollapsed ? 'w-12' : 'w-80'}`}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="absolute top-1/2 -right-4 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full w-8 h-8 p-0"
                data-testid="file-tree-toggle"
              >
                {isFileTreeCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="h-full">
              <div className="p-4 h-full">
                <FileTree
                  items={files}
                  selectedFile={currentFile?.path}
                  onFileSelect={handleFileSelect}
                  onCreateFile={createFile}
                  onCreateFolder={createFolder}
                  onDeleteItem={deleteItem}
                  onRenameItem={renameItem}
                  onToggleFolder={toggleFolder}
                  onInitializeTemplate={initializeFromTemplate}
                  showTemplateOptions={files.length === 0}
                />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Editor/Preview Area */}
        <div className="flex-1 p-2 lg:p-4">
          {currentFile ? (
            <>
              {/* Mobile Tab Buttons */}
              {!isDesktop && (
                <div className="mb-4 mx-2 lg:mx-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full bg-white dark:bg-gray-800 shadow-md">
                      <TabsTrigger value="edit" className="flex-1 text-xs lg:text-sm">
                        <Edit3 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex-1 text-xs lg:text-sm">
                        <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Desktop Panel Toggle Buttons */}
              {isDesktop && (
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={showEditPanel ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowEditPanel(!showEditPanel)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editor
                  </Button>
                  <Button
                    variant={showPreviewPanel ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowPreviewPanel(!showPreviewPanel)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              )}

              {/* Editor and Preview Panels */}
              <div className={`grid gap-4 h-[calc(100%-4rem)] ${
                isDesktop 
                  ? (showEditPanel && showPreviewPanel 
                      ? 'grid-cols-2' 
                      : 'grid-cols-1') 
                  : 'grid-cols-1'
              }`}>
                {/* Editor Panel */}
                <Card className={`${
                  isDesktop ? (!showEditPanel ? 'hidden' : '') : ''
                }`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5" />
                      {currentFile.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={!isDesktop && activeTab === 'preview' ? 'hidden' : ''}>
                    <Textarea
                      value={markdownContent}
                      onChange={(e) => handleMarkdownChange(e.target.value)}
                      placeholder="Start writing your markdown..."
                      className="min-h-[400px] lg:min-h-[600px] font-mono resize-none border-0 p-2 lg:p-4 focus:ring-0 text-sm lg:text-base"
                      style={{ fontSize: '14px' }}
                      data-testid="markdown-editor"
                    />
                  </CardContent>
                </Card>

                {/* Preview Panel */}
                <Card className={`${
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
                      content={markdownContent}
                      className="min-h-[400px] lg:min-h-[600px] overflow-auto prose prose-sm lg:prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-xl lg:prose-h1:text-3xl prose-h2:text-lg lg:prose-h2:text-2xl prose-h3:text-base lg:prose-h3:text-xl prose-h1:border-b prose-h2:border-b prose-h1:border-gray-300 dark:prose-h1:border-gray-600 prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h1:pb-2 prose-h2:pb-1"
                      data-testid="markdown-preview"
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            // Welcome screen when no file is selected
            <div className="flex items-center justify-center h-full">
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-center">Welcome to Markdown Explorer</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a file from the file tree to start editing, or get started quickly with one of the options below.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Start Templates</h3>
                      <TemplateQuickActions 
                        onTemplateSelect={initializeFromTemplate}
                        className="justify-center"
                      />
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">or</div>
                    
                    <Button 
                      onClick={() => createFile('/', 'new-file.md')}
                      data-testid="create-new-file-btn"
                    >
                      Create New File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}

export default Explorer