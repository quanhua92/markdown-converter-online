import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { toast, Toaster } from 'sonner'
import {
  useTheme,
  useEditor,
  debounce
} from '@/components/shared'
import type { FileSystemItem } from '@/components/shared/FileTree'
import { StorageService } from '../db/storage'
import { useEnhancedWorkspaceManager } from '../hooks/useEnhancedWorkspaceManager'
import { EnhancedExplorerHeader } from '../components/git/EnhancedExplorerHeader'
import { ExplorerMobileNavigation } from '@/components/shared/ExplorerMobileNavigation'
import { FileTree } from '@/components/shared/FileTree'
import { ExplorerEditorSection } from '@/components/shared/ExplorerEditorSection'
import { WorkspaceWelcome } from '@/components/shared/WorkspaceWelcome'
import { GitWorkspaceCreator } from '../components/git/GitWorkspaceCreator'
import { GitStatus } from '../components/git/GitStatus'
import { folderTemplates } from '@/components/shared/folderTemplates'
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
    hasGitSupport,
    setAllWorkspaces,
    setCurrentWorkspaceIdState,
    setCurrentWorkspace,
    setCurrentWorkspaceId
  } = useEnhancedWorkspaceManager()

  // Simple file system state for current workspace
  const [files, setFiles] = useState<FileSystemItem[]>([])
  const [currentFile, setCurrentFile] = useState<FileSystemItem | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load files when workspace changes
  useEffect(() => {
    if (!currentWorkspace) {
      setFiles([])
      setCurrentFile(null)
      return
    }

    if (currentWorkspace.type === 'local') {
      loadLocalWorkspaceFiles(currentWorkspace.id)
    }
  }, [currentWorkspace?.id])

  const loadLocalWorkspaceFiles = async (workspaceId: string) => {
    try {
      const workspaceKey = `markdown-explorer-v2-workspace-${workspaceId}`
      const workspaceData = await StorageService.loadItem(workspaceKey)
      
      if (workspaceData && workspaceData.files) {
        setFiles(workspaceData.files)
        if (workspaceData.currentFilePath) {
          const currentFile = findFileByPath(workspaceData.files, workspaceData.currentFilePath)
          setCurrentFile(currentFile)
        }
      }
    } catch (error) {
      console.error('Failed to load workspace files:', error)
    }
  }

  const findFileByPath = (files: FileSystemItem[], path: string): FileSystemItem | null => {
    for (const file of files) {
      if (file.path === path) return file
      if (file.children) {
        const found = findFileByPath(file.children, path)
        if (found) return found
      }
    }
    return null
  }

  // Simple file operations
  const selectFile = useCallback((item: FileSystemItem) => {
    setCurrentFile(item)
  }, [])

  const closeFile = useCallback(() => {
    setCurrentFile(null)
  }, [])

  const updateFileContent = useCallback((path: string, content: string) => {
    setFiles(prev => updateFileInTree(prev, path, (file) => ({ ...file, content })))
    setHasUnsavedChanges(true)
  }, [])

  const updateFileInTree = (files: FileSystemItem[], path: string, updater: (file: FileSystemItem) => FileSystemItem): FileSystemItem[] => {
    return files.map(file => {
      if (file.path === path) {
        return updater(file)
      }
      if (file.children) {
        return { ...file, children: updateFileInTree(file.children, path, updater) }
      }
      return file
    })
  }

  // Placeholder implementations for file operations
  const createFile = useCallback((parentPath: string, name: string) => {
    // TODO: Implement file creation
    console.log('Create file:', name, 'in', parentPath)
  }, [])

  const createFolder = useCallback((parentPath: string, name: string) => {
    // TODO: Implement folder creation
    console.log('Create folder:', name, 'in', parentPath)
  }, [])

  const deleteItem = useCallback((path: string) => {
    // TODO: Implement item deletion
    console.log('Delete item:', path)
  }, [])

  const renameItem = useCallback((item: FileSystemItem, newName: string) => {
    // TODO: Implement item rename
    console.log('Rename item:', item.name, 'to', newName)
  }, [])

  const toggleFolder = useCallback((path: string) => {
    setFiles(prev => updateFileInTree(prev, path, file => ({ 
      ...file, 
      isExpanded: !file.isExpanded 
    })))
  }, [])

  // Local state
  const [showGitWorkspaceCreator, setShowGitWorkspaceCreator] = useState(false)
  const [fileTreeCollapsed, setFileTreeCollapsed] = useState(false)

  // Auto-save for local workspaces
  const saveWorkspace = useCallback(async () => {
    if (!currentWorkspace || currentWorkspace.type !== 'local') return
    
    try {
      const workspaceKey = `markdown-explorer-v2-workspace-${currentWorkspace.id}`
      const workspaceData = {
        id: currentWorkspace.id,
        name: currentWorkspace.name,
        files,
        currentFilePath: currentFile?.path,
        createdAt: currentWorkspace.createdAt,
        lastModified: new Date().toISOString()
      }
      
      await StorageService.saveItem(workspaceKey, workspaceData)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save workspace:', error)
    }
  }, [currentWorkspace, files, currentFile])

  const debouncedSave = useCallback(
    debounce(() => {
      if (currentWorkspace?.type === 'local' && hasUnsavedChanges) {
        saveWorkspace()
      }
    }, 1000),
    [currentWorkspace?.type, hasUnsavedChanges, saveWorkspace]
  )

  useEffect(() => {
    if (currentWorkspace?.type === 'local' && hasUnsavedChanges) {
      debouncedSave()
    }
  }, [currentWorkspace?.type, hasUnsavedChanges, debouncedSave])

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
      const template = folderTemplates[templateKey]
      if (!template) {
        throw new Error('Template not found')
      }

      const workspaceName = `${template.name} Workspace`
      
      // Create workspace with template structure
      const workspaceId = 'workspace-' + Date.now()
      const templateFiles = template.structure.map(item => ({
        ...item,
        id: generateId()
      }))
      
      const workspace = {
        id: workspaceId,
        name: workspaceName,
        files: templateFiles,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      
      // Save to storage
      await StorageService.saveItem(`markdown-explorer-v2-workspace-${workspaceId}`, workspace)
      
      // Update enhanced workspace manager state
      const unifiedWorkspace = {
        id: workspaceId,
        name: workspaceName,
        type: 'local' as const,
        createdAt: workspace.createdAt,
        lastModified: workspace.lastModified
      }
      
      // Add to workspace list immediately
      setAllWorkspaces(prev => [...prev, unifiedWorkspace])
      
      // Set as current workspace
      await setCurrentWorkspaceId(workspaceId)
      setCurrentWorkspaceIdState(workspaceId)
      setCurrentWorkspace(unifiedWorkspace)
      
      toast.success(`Workspace created from ${template.name} template`)
    } catch (error) {
      console.error('Failed to create workspace from template:', error)
      toast.error('Failed to create workspace from template')
    }
  }, [setAllWorkspaces])

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Placeholder Git operations (TODO: Re-implement with enhanced workspace manager)
  const handleCommitChanges = useCallback(async (message: string) => {
    console.log('TODO: Implement Git commit:', message)
  }, [])

  const handleSyncWithRemote = useCallback(async () => {
    console.log('TODO: Implement Git sync')
  }, [])

  // Handle folder toggling
  const handleToggleFolder = useCallback((path: string) => {
    toggleFolder(path)
  }, [toggleFolder])

  // Render workspace welcome if no workspace is selected
  if (!currentWorkspaceId) {
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
  if (workspaceLoading) {
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
          workspaceType={currentWorkspace?.type || 'local'}
          repositoryUrl={currentWorkspace?.repositoryUrl}
          currentBranch={currentWorkspace?.currentBranch}
          syncStatus={null}
          hasUnsavedChanges={hasUnsavedChanges}
          isSyncing={false}
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
              {currentWorkspace?.type === 'git' && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <GitStatus
                    workspaceName={currentWorkspace?.name || ''}
                    repositoryUrl={currentWorkspace?.repositoryUrl}
                    currentBranch={currentWorkspace?.currentBranch}
                    syncStatus={null}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isSyncing={false}
                    onCommit={handleCommitChanges}
                    onSync={handleSyncWithRemote}
                    onSwitchBranch={() => console.log('TODO: Switch branch')}
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