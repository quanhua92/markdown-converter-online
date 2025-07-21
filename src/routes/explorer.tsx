import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { toast, Toaster } from 'sonner'
import {
  useTheme,
  useEditor,
  debounce
} from '@/components/shared'
import type { FileSystemItem } from '@/components/shared/FileTree'
import { useIntegratedFileSystem, useWorkspaceActions } from '../hooks/useIntegratedFileSystem'
import { useEnhancedWorkspaceManager } from '../hooks/useEnhancedWorkspaceManager'
import { EnhancedExplorerHeader } from '../components/git/EnhancedExplorerHeader'
import { ExplorerMobileNavigation } from '@/components/shared/ExplorerMobileNavigation'
import { FileTree } from '@/components/shared/FileTree'
import { ExplorerEditorSection } from '@/components/shared/ExplorerEditorSection'
import { WorkspaceWelcome } from '@/components/shared/WorkspaceWelcome'
import { GitWorkspaceCreator } from '../components/git/GitWorkspaceCreator'
import { GitStatus } from '../components/git/GitStatus'
import { folderTemplates, initializeTemplateStructure } from '@/components/shared/folderTemplates'
import type { GitRepository } from '../types/git'

export const Route = createFileRoute('/explorer')({
  component: Explorer,
})

function Explorer() {
  const { isDarkMode, toggleTheme } = useTheme()
  const { activeTab, setActiveTab, isDesktop, showEditPanel, setShowEditPanel, showPreviewPanel, setShowPreviewPanel } = useEditor()
  
  // Enhanced workspace management
  const {
    currentWorkspaceId,
    currentWorkspace,
    allWorkspaces,
    isLoading: workspaceLoading,
    joinWorkspace,
    leaveWorkspace,
    createLocalWorkspace,
    createGitWorkspace,
    deleteWorkspace,
    renameWorkspace,
    refreshWorkspaces,
    hasGitSupport
  } = useEnhancedWorkspaceManager()

  // Integrated file system
  const {
    files,
    currentFile,
    isLoaded,
    isLoading,
    hasUnsavedChanges,
    workspaceType,
    selectFile,
    closeFile,
    updateFileContent,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    toggleFolder,
    saveWorkspace,
    createLocalWorkspace: createLocalWorkspaceFS,
    createGitWorkspace: createGitWorkspaceFS
  } = useIntegratedFileSystem()

  // Git-specific actions
  const {
    repositoryUrl,
    currentBranch,
    canCommit,
    canSync,
    syncStatus,
    isSyncing,
    commitChanges,
    syncWithRemote,
    switchBranch
  } = useWorkspaceActions()

  // Local state
  const [showGitWorkspaceCreator, setShowGitWorkspaceCreator] = useState(false)
  const [fileTreeCollapsed, setFileTreeCollapsed] = useState(false)

  // Auto-save for local workspaces
  const debouncedSave = useCallback(
    debounce(() => {
      if (workspaceType === 'local' && saveWorkspace) {
        saveWorkspace()
      }
    }, 1000),
    [workspaceType, saveWorkspace]
  )

  useEffect(() => {
    if (workspaceType === 'local' && hasUnsavedChanges) {
      debouncedSave()
    }
  }, [workspaceType, hasUnsavedChanges, debouncedSave])

  // Handle workspace operations
  const handleJoinWorkspace = useCallback(async (workspaceId: string) => {
    try {
      await joinWorkspace(workspaceId)
      toast.success('Workspace loaded successfully')
    } catch (error) {
      console.error('Failed to join workspace:', error)
      toast.error('Failed to load workspace')
    }
  }, [joinWorkspace])

  const handleCreateWorkspace = useCallback(async (name: string) => {
    try {
      await createLocalWorkspace(name)
      toast.success('Workspace created successfully')
    } catch (error) {
      console.error('Failed to create workspace:', error)
      toast.error('Failed to create workspace')
    }
  }, [createLocalWorkspace])

  const handleCreateGitWorkspace = useCallback(async (
    repository: GitRepository, 
    branch: string, 
    workspaceName: string
  ) => {
    try {
      await createGitWorkspace(workspaceName, repository, branch)
      toast.success(`Git workspace created from ${repository.name}`)
    } catch (error) {
      console.error('Failed to create Git workspace:', error)
      toast.error('Failed to create Git workspace')
    }
  }, [createGitWorkspace])

  const handleImportFromZip = useCallback(async (file: File) => {
    try {
      // TODO: Implement ZIP import
      toast.info('ZIP import coming soon!')
    } catch (error) {
      console.error('Failed to import from ZIP:', error)
      toast.error('Failed to import from ZIP')
    }
  }, [])

  const handleInitFromTemplate = useCallback(async (templateKey: string) => {
    try {
      const template = folderTemplates.find(t => t.id === templateKey)
      if (!template) {
        throw new Error('Template not found')
      }

      const workspaceName = `${template.name} Workspace`
      const workspaceId = await createLocalWorkspace(workspaceName)
      
      // Initialize template structure would need to be adapted for the new system
      toast.success(`Workspace created from ${template.name} template`)
    } catch (error) {
      console.error('Failed to create workspace from template:', error)
      toast.error('Failed to create workspace from template')
    }
  }, [createLocalWorkspace])

  // Handle Git operations
  const handleCommitChanges = useCallback(async (message: string) => {
    if (!commitChanges) return
    
    try {
      await commitChanges(message)
      toast.success('Changes committed successfully')
    } catch (error) {
      console.error('Failed to commit changes:', error)
      toast.error('Failed to commit changes')
    }
  }, [commitChanges])

  const handleSyncWithRemote = useCallback(async () => {
    if (!syncWithRemote) return
    
    try {
      await syncWithRemote()
      toast.success('Synced with remote repository')
    } catch (error) {
      console.error('Failed to sync with remote:', error)
      toast.error('Failed to sync with remote')
    }
  }, [syncWithRemote])

  // Handle folder toggling
  const handleToggleFolder = useCallback((path: string) => {
    toggleFolder(path)
  }, [toggleFolder])

  // Render workspace welcome if no workspace is selected
  if (!currentWorkspaceId || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {workspaceLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <WorkspaceWelcome
            workspaces={allWorkspaces}
            onJoinWorkspace={handleJoinWorkspace}
            onCreateWorkspace={handleCreateWorkspace}
            onImportFromZip={handleImportFromZip}
            onInitFromTemplate={handleInitFromTemplate}
            onCreateGitWorkspace={hasGitSupport ? () => setShowGitWorkspaceCreator(true) : undefined}
          />
        )}
        
        <GitWorkspaceCreator
          isOpen={showGitWorkspaceCreator}
          onClose={() => setShowGitWorkspaceCreator(false)}
          onCreateWorkspace={handleCreateGitWorkspace}
        />
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <EnhancedExplorerHeader
          workspaceName={currentWorkspace?.name || 'Unknown Workspace'}
          workspaceType={workspaceType}
          repositoryUrl={repositoryUrl}
          currentBranch={currentBranch}
          syncStatus={syncStatus}
          hasUnsavedChanges={hasUnsavedChanges}
          isSyncing={isSyncing}
          onLeaveWorkspace={leaveWorkspace}
          onSyncWithRemote={handleSyncWithRemote}
          fileTreeCollapsed={fileTreeCollapsed}
          onToggleFileTree={() => setFileTreeCollapsed(!fileTreeCollapsed)}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        {/* Mobile Navigation */}
        {!isDesktop && (
          <ExplorerMobileNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showEditPanel={showEditPanel}
            onToggleEditPanel={() => setShowEditPanel(!showEditPanel)}
            showPreviewPanel={showPreviewPanel}
            onTogglePreviewPanel={() => setShowPreviewPanel(!showPreviewPanel)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Panel */}
          {(isDesktop || activeTab === 'files') && !fileTreeCollapsed && (
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
              <FileTree
                items={files}
                selectedFile={currentFile?.path}
                onFileSelect={selectFile}
                onCreateFile={createFile}
                onCreateFolder={createFolder}
                onDeleteItem={deleteItem}
                onRenameItem={renameItem}
                onToggleFolder={handleToggleFolder}
              />
              
              {/* Git Status Panel */}
              {workspaceType === 'git' && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <GitStatus
                    workspaceName={currentWorkspace?.name || ''}
                    repositoryUrl={repositoryUrl}
                    currentBranch={currentBranch}
                    syncStatus={syncStatus}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isSyncing={isSyncing || false}
                    onCommit={handleCommitChanges}
                    onSync={handleSyncWithRemote}
                    onSwitchBranch={switchBranch}
                  />
                </div>
              )}
            </div>
          )}

          {/* Editor Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ExplorerEditorSection
              currentFile={currentFile}
              onUpdateContent={updateFileContent}
              onCloseFile={closeFile}
              showEditPanel={showEditPanel}
              showPreviewPanel={showPreviewPanel}
              isDesktop={isDesktop}
              activeTab={activeTab}
            />
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}