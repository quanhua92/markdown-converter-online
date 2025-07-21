import { useState, useEffect, useCallback } from 'react'
import { useEnhancedWorkspaceManager } from './useEnhancedWorkspaceManager'
import { useGitFileSystem } from './useGitFileSystem'
import { useFileSystem } from '../components/shared/useFileSystem'
import type { FileSystemItem } from '../components/shared/FileTree'
import type { GitRepository, GitSyncStatus } from '../types/git'

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
export function useIntegratedFileSystem(): IntegratedFileSystemState & IntegratedFileSystemActions {
  const { currentWorkspace, hasGitSupport } = useEnhancedWorkspaceManager()
  
  // Local file system hook
  const localFS = useFileSystem()
  
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
    if (currentWorkspace && activeSystem) {
      if (activeSystem === 'git') {
        gitFS.loadGitWorkspace(currentWorkspace.id)
      }
      // Local workspaces are automatically loaded by useFileSystem
    }
  }, [currentWorkspace, activeSystem])

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
      return {
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
    } else if (activeSystem === 'local') {
      return {
        ...baseState,
        files: localFS.files,
        currentFile: localFS.currentFile,
        isLoaded: localFS.isLoaded,
        isLoading: false,
        hasUnsavedChanges: localFS.hasUnsavedChanges,
        syncStatus: null
      }
    } else {
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