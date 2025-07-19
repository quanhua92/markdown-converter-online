import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { toast, Toaster } from 'sonner'
import {
  useTheme,
  useEditor,
  debounce
} from '@/components/shared'
import { FileSystemItem } from '@/components/shared/FileTree'
import { useFileSystem } from '@/components/shared/useFileSystem'
import { ExplorerHeader } from '@/components/shared/ExplorerHeader'
import { ExplorerMobileNavigation } from '@/components/shared/ExplorerMobileNavigation'
import { ExplorerFileTreePanels } from '@/components/shared/ExplorerFileTreePanels'
import { ExplorerEditorSection } from '@/components/shared/ExplorerEditorSection'

export const Route = createFileRoute('/explorer')({
  component: Explorer,
})

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
    isLoaded,
    // Workspace management
    currentWorkspaceId,
    workspaces,
    joinWorkspace,
    leaveWorkspace,
    createWorkspace,
    deleteWorkspace,
    renameWorkspace,
    getAllWorkspaces
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

  // Debounced save function - memoized to prevent recreation on every render
  const debouncedSave = useCallback(
    debounce((content: string) => {
      if (currentFile) {
        updateFileContent(currentFile.path, content)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    }, 500),
    [currentFile, updateFileContent]
  )

  const handleMarkdownChange = useCallback((value: string) => {
    setMarkdownContent(value)
    setSaveStatus('saving')
    debouncedSave(value)
  }, [debouncedSave])

  const handleFileSelect = useCallback((item: FileSystemItem) => {
    selectFile(item)
  }, [selectFile])

  const handlePrint = useCallback(() => {
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
  }, [currentFile, markdownContent])

  const handleExport = useCallback(() => {
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
  }, [currentFile, markdownContent])

  const handleManualSave = useCallback(() => {
    if (currentFile) {
      updateFileContent(currentFile.path, markdownContent)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
      toast.success('File saved!')
    }
  }, [currentFile, markdownContent, updateFileContent])

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
      <ExplorerHeader
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        currentFile={currentFile}
        saveStatus={saveStatus}
        isMobileSheetOpen={isMobileSheetOpen}
        setIsMobileSheetOpen={setIsMobileSheetOpen}
        files={files}
        onFileSelect={handleFileSelect}
        onCreateFile={createFile}
        onCreateFolder={createFolder}
        onDeleteItem={deleteItem}
        onRenameItem={renameItem}
        onToggleFolder={toggleFolder}
        onInitializeTemplate={initializeFromTemplate}
        onManualSave={handleManualSave}
        onExport={handleExport}
        onPrint={handlePrint}
      />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Desktop File Tree Panel */}
        <ExplorerFileTreePanels
          isFileTreeCollapsed={isFileTreeCollapsed}
          setIsFileTreeCollapsed={setIsFileTreeCollapsed}
          files={files}
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
          onCreateFile={createFile}
          onCreateFolder={createFolder}
          onDeleteItem={deleteItem}
          onRenameItem={renameItem}
          onToggleFolder={toggleFolder}
          onInitializeTemplate={initializeFromTemplate}
          currentWorkspaceId={currentWorkspaceId}
          workspaces={workspaces}
          onWorkspaceJoin={joinWorkspace}
          onWorkspaceLeave={leaveWorkspace}
          onWorkspaceCreate={createWorkspace}
        />

        {/* Editor/Preview Area */}
        <div className="flex-1 p-2 lg:p-4">
          {currentFile && (
            <>
              {/* Mobile Tab Buttons and Actions */}
              {!isDesktop && (
                <ExplorerMobileNavigation
                  currentFile={currentFile}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onManualSave={handleManualSave}
                  onExport={handleExport}
                  onPrint={handlePrint}
                />
              )}
            </>
          )}
          
          <ExplorerEditorSection
            currentFile={currentFile}
            markdownContent={markdownContent}
            onMarkdownChange={handleMarkdownChange}
            isDesktop={isDesktop}
            activeTab={activeTab}
            showEditPanel={showEditPanel}
            showPreviewPanel={showPreviewPanel}
            setShowEditPanel={setShowEditPanel}
            setShowPreviewPanel={setShowPreviewPanel}
            onCreateFile={createFile}
            onInitializeTemplate={initializeFromTemplate}
          />
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}

export default Explorer