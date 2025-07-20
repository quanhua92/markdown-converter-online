import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit3, Eye, FileText, X } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'
import type { FileSystemItem } from './FileTree'
import { templates } from './templates'

interface ExplorerEditorSectionProps {
  currentFile: FileSystemItem | null
  markdownContent: string
  onMarkdownChange: (value: string) => void
  isDesktop: boolean
  activeTab: string
  showEditPanel: boolean
  showPreviewPanel: boolean
  setShowEditPanel: (show: boolean) => void
  setShowPreviewPanel: (show: boolean) => void
  onCreateFile: (parentPath: string, name: string, content?: string) => void
  onInitializeTemplate: (templateKey: string) => void
  onCloseFile: () => void
}

export function ExplorerEditorSection({
  currentFile,
  markdownContent,
  onMarkdownChange,
  isDesktop,
  activeTab,
  showEditPanel,
  showPreviewPanel,
  setShowEditPanel,
  setShowPreviewPanel,
  onCreateFile,
  onInitializeTemplate,
  onCloseFile
}: ExplorerEditorSectionProps) {
  const handleTemplateSelect = (templateKey: string) => {
    const content = templates[templateKey as keyof typeof templates]
    if (content) {
      const fileName = `${templateKey}-template.md`
      onCreateFile('/', fileName, content)
    }
  }
  if (!currentFile) {
    return (
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
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Create from Template</h3>
                <div className="flex justify-center">
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="showcase">📚 Complete Showcase</SelectItem>
                      <SelectItem value="presentation">🎯 Presentation</SelectItem>
                      <SelectItem value="document">📄 Document</SelectItem>
                      <SelectItem value="article">📝 Article</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">or</div>
              
              <Button 
                onClick={() => onCreateFile('/', 'new-file.md')}
                data-testid="create-new-file-btn"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Empty File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                {currentFile.name}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCloseFile}
                className="h-8 w-8 p-0"
                data-testid="close-file-btn"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className={!isDesktop && activeTab === 'preview' ? 'hidden' : ''}>
            <Textarea
              value={markdownContent}
              onChange={(e) => onMarkdownChange(e.target.value)}
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
  )
}