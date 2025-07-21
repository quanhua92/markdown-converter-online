import { useState, useEffect, useCallback } from 'react'
import { useEnhancedWorkspaceManager } from './useEnhancedWorkspaceManager'
import { useGitFileSystem } from './useGitFileSystem'
// import { useFileSystem } from '../components/shared/useFileSystem' // Removed to avoid dual workspace managers
import type { FileSystemItem } from '../components/shared/FileTree'
import type { GitRepository, GitSyncStatus } from '../types/git'
import { StorageService } from '../db/storage'

interface IntegratedFileSystemState {
  files: FileSystemItem[]
  currentFile: FileSystemItem | null
  isLoaded: boolean
  isLoading: boolean
  isSyncing?: boolean
  hasUnsavedChanges: boolean
  syncStatus?: GitSyncStatus | null
  error?: string | null
  workspaceType: 'local' | 'git' | null
}

interface IntegratedFileSystemActions {
  // Common file operations
  selectFile: (item: FileSystemItem) => void
  closeFile: () => void
  updateFileContent: (path: string, content: string) => void
  createFile: (parentPath: string, name: string) => void
  createFolder: (parentPath: string, name: string) => void
  deleteItem: (path: string) => void
  renameItem: (item: FileSystemItem, newName: string) => void
  toggleFolder: (path: string) => void
  
  // Save operations
  saveWorkspace?: () => void
  commitChanges?: (message: string) => Promise<void>
  
  // Git-specific operations (only available for Git workspaces)
  syncWithRemote?: () => Promise<void>
  switchBranch?: (branchName: string) => Promise<void>
  
  // Workspace operations
  loadWorkspace: (workspaceId: string) => Promise<void>
  createLocalWorkspace: (name: string) => Promise<string>
  createGitWorkspace: (repository: GitRepository, branch: string, name: string) => Promise<string>
}

/**
 * Integrated file system hook that automatically handles both local and Git workspaces
 */
// Simple local file system state for integrated system
interface LocalFileSystemState {
  files: FileSystemItem[]
  currentFile: FileSystemItem | null
  isLoaded: boolean
  hasUnsavedChanges: boolean
}

// Create a simple local file system hook that works with enhanced workspace manager
function useSimpleLocalFS(currentWorkspace: any): LocalFileSystemState & {
  selectFile: (item: FileSystemItem) => void
  closeFile: () => void
  updateFileContent: (path: string, content: string) => void
  createFile: (parentPath: string, name: string) => void
  createFolder: (parentPath: string, name: string) => void
  deleteItem: (path: string) => void
  renameItem: (item: FileSystemItem, newName: string) => void
  toggleFolder: (path: string) => void
  saveWorkspace: () => void
  joinWorkspace: (workspaceId: string) => void
} {
  const [files, setFiles] = useState<FileSystemItem[]>([])
  const [currentFile, setCurrentFile] = useState<FileSystemItem | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load workspace files when workspace changes
  useEffect(() => {
    const loadWorkspaceFiles = async () => {
      if (!currentWorkspace) {
        setFiles([])
        setCurrentFile(null)
        setIsLoaded(true)
        return
      }

      try {
        console.log('🔄 SimpleLocalFS: Loading workspace files for:', currentWorkspace.id)
        const workspaceKey = `markdown-explorer-v2-workspace-${currentWorkspace.id}`
        const workspaceData = await StorageService.loadItem(workspaceKey)
        
        if (workspaceData && workspaceData.files) {
          console.log('✅ SimpleLocalFS: Loaded files:', workspaceData.files.length)
          setFiles(workspaceData.files)
          if (workspaceData.currentFilePath) {
            const currentFile = findFileByPath(workspaceData.files, workspaceData.currentFilePath)
            setCurrentFile(currentFile)
          }
        } else {
          console.log('⚠️ SimpleLocalFS: No files found, using default')
          // Set default files
          const defaultFiles = [
            {
              id: 'welcome',
              name: 'Welcome.md',
              type: 'file' as const,
              path: '/Welcome.md',
              content: '# Welcome to your workspace!\n\nStart editing this file or create new ones.'
            }
          ]
          setFiles(defaultFiles)
        }
        setIsLoaded(true)
      } catch (error) {
        console.error('❌ SimpleLocalFS: Failed to load workspace files:', error)
        setFiles([])
        setIsLoaded(true)
      }
    }

    loadWorkspaceFiles()
  }, [currentWorkspace?.id])

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

  const selectFile = useCallback((item: FileSystemItem) => {
    console.log('📄 SimpleLocalFS: Selecting file:', item.name)
    setCurrentFile(item)
  }, [])

  const closeFile = useCallback(() => {
    setCurrentFile(null)
  }, [])

  const updateFileContent = useCallback((path: string, content: string) => {
    console.log('✏️ SimpleLocalFS: Updating file content:', path)
    setFiles(prev => updateFileInTree(prev, path, (file) => ({ ...file, content })))
    setHasUnsavedChanges(true)
  }, [])

  const createFile = useCallback((parentPath: string, name: string) => {
    console.log('📄 SimpleLocalFS: Creating file:', name, 'in', parentPath)
    // Implementation would go here
  }, [])

  const createFolder = useCallback((parentPath: string, name: string) => {
    console.log('📁 SimpleLocalFS: Creating folder:', name, 'in', parentPath)
    // Implementation would go here
  }, [])

  const deleteItem = useCallback((path: string) => {
    console.log('🗑️ SimpleLocalFS: Deleting item:', path)
    // Implementation would go here
  }, [])

  const renameItem = useCallback((item: FileSystemItem, newName: string) => {
    console.log('✏️ SimpleLocalFS: Renaming item:', item.name, 'to', newName)
    // Implementation would go here
  }, [])

  const toggleFolder = useCallback((path: string) => {
    console.log('📁 SimpleLocalFS: Toggling folder:', path)
    setFiles(prev => updateFileInTree(prev, path, (folder) => ({ 
      ...folder, 
      isExpanded: !folder.isExpanded 
    })))
  }, [])

  const saveWorkspace = useCallback(async () => {
    if (!currentWorkspace) return
    
    try {
      console.log('💾 SimpleLocalFS: Saving workspace:', currentWorkspace.id)
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
      console.log('✅ SimpleLocalFS: Workspace saved')
    } catch (error) {
      console.error('❌ SimpleLocalFS: Failed to save workspace:', error)
    }
  }, [currentWorkspace, files, currentFile])

  const joinWorkspace = useCallback((workspaceId: string) => {
    console.log('🔄 SimpleLocalFS: Join workspace called:', workspaceId)
    // This will trigger the useEffect above through currentWorkspace change
  }, [])

  return {
    files,
    currentFile,
    isLoaded,
    hasUnsavedChanges,
    selectFile,
    closeFile,
    updateFileContent,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    toggleFolder,
    saveWorkspace,
    joinWorkspace
  }
}

function updateFileInTree(
  files: FileSystemItem[], 
  targetPath: string, 
  updater: (file: FileSystemItem) => FileSystemItem
): FileSystemItem[] {
  return files.map(file => {
    if (file.path === targetPath) {
      return updater(file)
    }
    if (file.children) {
      return {
        ...file,
        children: updateFileInTree(file.children, targetPath, updater)
      }
    }
    return file
  })
}

export function useIntegratedFileSystem(): IntegratedFileSystemState & IntegratedFileSystemActions {
  const { currentWorkspace, hasGitSupport } = useEnhancedWorkspaceManager()
  
  // Simple local file system 
  const localFS = useSimpleLocalFS(currentWorkspace)
  
  // Git file system hook
  const gitFS = useGitFileSystem()
  
  const [activeSystem, setActiveSystem] = useState<'local' | 'git' | null>(null)

  // Determine which system to use based on current workspace
  useEffect(() => {
    if (!currentWorkspace) {
      setActiveSystem(null)
    } else if (currentWorkspace.type === 'git') {
      setActiveSystem('git')
    } else {
      setActiveSystem('local')
    }
  }, [currentWorkspace])

  // Auto-load workspace when it changes
  useEffect(() => {
    console.log('🔄 IntegratedFS: Workspace changed:', {
      currentWorkspace: currentWorkspace?.id,
      activeSystem,
      hasLocalFS: !!localFS,
      hasGitFS: !!gitFS
    })
    
    if (currentWorkspace && activeSystem) {
      if (activeSystem === 'git') {
        console.log('🔄 IntegratedFS: Loading Git workspace:', currentWorkspace.id)
        gitFS.loadGitWorkspace(currentWorkspace.id)
      } else if (activeSystem === 'local') {
        // For local workspaces, we need to trigger the useFileSystem to load the workspace
        console.log('🔄 IntegratedFS: Loading local workspace:', currentWorkspace.id)
        localFS.joinWorkspace(currentWorkspace.id)
      }
    }
  }, [currentWorkspace, activeSystem, gitFS, localFS])

  /**
   * Load a workspace (auto-detects type)
   */
  const loadWorkspace = useCallback(async (workspaceId: string) => {
    // This will be handled by the workspace manager and useEffect above
    // We just need to make sure the workspace is set as current
  }, [])

  /**
   * Create a local workspace
   */
  const createLocalWorkspace = useCallback(async (name: string): Promise<string> => {
    return await localFS.createWorkspace(name)
  }, [localFS])

  /**
   * Create a Git workspace
   */
  const createGitWorkspace = useCallback(async (
    repository: GitRepository, 
    branch: string, 
    name: string
  ): Promise<string> => {
    if (!hasGitSupport) {
      throw new Error('Git support not available')
    }
    return await gitFS.createGitWorkspace(repository, branch, name)
  }, [gitFS, hasGitSupport])

  // Select the appropriate state and actions based on active system
  const getActiveState = (): IntegratedFileSystemState => {
    const baseState = {
      workspaceType: activeSystem,
      error: undefined
    }

    if (activeSystem === 'git') {
      const state = {
        ...baseState,
        files: gitFS.files,
        currentFile: gitFS.currentFile,
        isLoaded: !gitFS.isLoading,
        isLoading: gitFS.isLoading,
        isSyncing: gitFS.isSyncing,
        hasUnsavedChanges: gitFS.hasUnsavedChanges,
        syncStatus: gitFS.syncStatus,
        error: gitFS.error
      }
      console.log('🔄 IntegratedFS: Git state:', {
        filesCount: state.files.length,
        currentFile: state.currentFile?.name,
        isLoaded: state.isLoaded
      })
      return state
    } else if (activeSystem === 'local') {
      const state = {
        ...baseState,
        files: localFS.files,
        currentFile: localFS.currentFile,
        isLoaded: localFS.isLoaded,
        isLoading: false,
        hasUnsavedChanges: localFS.hasUnsavedChanges,
        syncStatus: null
      }
      console.log('🔄 IntegratedFS: Local state:', {
        filesCount: state.files.length,
        currentFile: state.currentFile?.name,
        isLoaded: state.isLoaded,
        localFSState: {
          files: localFS.files.length,
          isLoaded: localFS.isLoaded,
          currentWorkspaceId: localFS.currentWorkspaceId
        }
      })
      return state
    } else {
      console.log('🔄 IntegratedFS: No active system')
      return {
        ...baseState,
        files: [],
        currentFile: null,
        isLoaded: true,
        isLoading: false,
        hasUnsavedChanges: false,
        syncStatus: null
      }
    }
  }

  const getActiveActions = (): Omit<IntegratedFileSystemActions, 'loadWorkspace' | 'createLocalWorkspace' | 'createGitWorkspace'> => {
    if (activeSystem === 'git') {
      return {
        selectFile: gitFS.selectFile,
        closeFile: () => {}, // TODO: Implement closeFile for Git
        updateFileContent: gitFS.updateFileContent,
        createFile: gitFS.createFile,
        createFolder: gitFS.createFolder,
        deleteItem: gitFS.deleteItem,
        renameItem: gitFS.renameItem,
        toggleFolder: (path: string) => {
          // For Git files, we need to update the gitFS state
          // This is a simplified implementation - ideally this would be in gitFS
          console.log('Git folder toggle:', path)
        },
        commitChanges: gitFS.commitChanges,
        syncWithRemote: gitFS.syncWithRemote,
        switchBranch: gitFS.switchBranch
      }
    } else if (activeSystem === 'local') {
      return {
        selectFile: localFS.selectFile,
        closeFile: localFS.closeFile,
        updateFileContent: localFS.updateFileContent,
        createFile: localFS.createFile,
        createFolder: localFS.createFolder,
        deleteItem: localFS.deleteItem,
        renameItem: localFS.renameItem,
        toggleFolder: localFS.toggleFolder,
        saveWorkspace: localFS.saveWorkspace
      }
    } else {
      // No-op functions when no workspace is active
      return {
        selectFile: () => {},
        closeFile: () => {},
        updateFileContent: () => {},
        createFile: () => {},
        createFolder: () => {},
        deleteItem: () => {},
        renameItem: () => {},
        toggleFolder: () => {}
      }
    }
  }

  const state = getActiveState()
  const actions = getActiveActions()

  return {
    ...state,
    ...actions,
    loadWorkspace,
    createLocalWorkspace,
    createGitWorkspace
  }
}

/**
 * Hook to get workspace-specific actions and status
 */
export function useWorkspaceActions() {
  const { currentWorkspace, hasGitSupport } = useEnhancedWorkspaceManager()
  const fs = useIntegratedFileSystem()

  return {
    workspaceType: currentWorkspace?.type || null,
    repositoryUrl: currentWorkspace?.repositoryUrl,
    currentBranch: currentWorkspace?.currentBranch,
    hasGitSupport,
    canCommit: currentWorkspace?.type === 'git' && fs.hasUnsavedChanges,
    canSync: currentWorkspace?.type === 'git',
    syncStatus: fs.syncStatus,
    isSyncing: fs.isSyncing || false,
    
    // Actions
    commitChanges: fs.commitChanges,
    syncWithRemote: fs.syncWithRemote,
    switchBranch: fs.switchBranch,
    saveWorkspace: fs.saveWorkspace
  }
}

// Helper function for updating items in file tree
function updateItemInTree(
  items: FileSystemItem[], 
  targetPath: string, 
  updater: (item: FileSystemItem) => FileSystemItem
): FileSystemItem[] {
  return items.map(item => {
    if (item.path === targetPath) {
      return updater(item)
    }
    if (item.children) {
      return {
        ...item,
        children: updateItemInTree(item.children, targetPath, updater)
      }
    }
    return item
  })
}