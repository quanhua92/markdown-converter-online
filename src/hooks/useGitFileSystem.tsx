import { useState, useEffect, useCallback, useRef } from 'react'
import { useGitHubAuth } from '../auth/useGitHubAuth'
import { createGitHubAPI } from '../api/github'
import { createGitDataAPI } from '../api/gitData'
import { createGitWorkspaceService } from '../git/gitWorkspaceService'
import { db, type GitWorkspaceData } from '../db/db'
import type { FileSystemItem } from '../components/shared/FileTree'
import type { GitRepository, GitSyncStatus, GitFileMetadata } from '../types/git'

interface GitFileSystemState {
  files: FileSystemItem[]
  currentFile: FileSystemItem | null
  workspace: GitWorkspaceData | null
  syncStatus: GitSyncStatus | null
  isLoading: boolean
  isSyncing: boolean
  hasUnsavedChanges: boolean
  error: string | null
}

interface GitFileSystemActions {
  // File operations
  selectFile: (item: FileSystemItem) => void
  updateFileContent: (path: string, content: string) => void
  createFile: (parentPath: string, name: string) => void
  createFolder: (parentPath: string, name: string) => void
  deleteItem: (path: string) => void
  renameItem: (item: FileSystemItem, newName: string) => void
  
  // Git operations
  commitChanges: (message: string) => Promise<void>
  syncWithRemote: () => Promise<void>
  switchBranch: (branchName: string) => Promise<void>
  
  // Workspace operations
  loadGitWorkspace: (workspaceId: string) => Promise<void>
  createGitWorkspace: (repository: GitRepository, branch: string, name: string) => Promise<string>
}

/**
 * Enhanced file system hook with Git integration
 */
export function useGitFileSystem(): GitFileSystemState & GitFileSystemActions {
  const { api: githubAPI, isAuthenticated } = useGitHubAuth()
  
  const [state, setState] = useState<GitFileSystemState>({
    files: [],
    currentFile: null,
    workspace: null,
    syncStatus: null,
    isLoading: false,
    isSyncing: false,
    hasUnsavedChanges: false,
    error: null
  })

  // Services
  const gitDataAPI = useRef<ReturnType<typeof createGitDataAPI> | null>(null)
  const gitWorkspaceService = useRef<ReturnType<typeof createGitWorkspaceService> | null>(null)
  
  // Auto-sync timer
  const syncTimer = useRef<NodeJS.Timeout | null>(null)
  const pendingChanges = useRef<Map<string, string>>(new Map())

  // Initialize services when GitHub API is available
  useEffect(() => {
    if (githubAPI && isAuthenticated) {
      gitDataAPI.current = createGitDataAPI(githubAPI)
      gitWorkspaceService.current = createGitWorkspaceService(githubAPI, gitDataAPI.current)
    } else {
      gitDataAPI.current = null
      gitWorkspaceService.current = null
    }
  }, [githubAPI, isAuthenticated])

  // Auto-sync timer setup
  useEffect(() => {
    if (state.workspace?.type === 'git' && gitWorkspaceService.current) {
      // Set up periodic sync check every 30 seconds
      syncTimer.current = setInterval(() => {
        if (!state.isSyncing) {
          performBackgroundSync()
        }
      }, 30000)

      return () => {
        if (syncTimer.current) {
          clearInterval(syncTimer.current)
        }
      }
    }
  }, [state.workspace, state.isSyncing])

  /**
   * Load a Git workspace
   */
  const loadGitWorkspace = useCallback(async (workspaceId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const workspace = await db.gitWorkspaces.get(workspaceId)
      if (!workspace) {
        throw new Error('Git workspace not found')
      }

      // Load files with Git metadata
      const filesWithMetadata = await loadFilesWithGitMetadata(workspace.files, workspaceId)

      setState(prev => ({
        ...prev,
        workspace,
        files: filesWithMetadata,
        syncStatus: workspace.syncStatus || null,
        isLoading: false,
        currentFile: workspace.currentFilePath 
          ? findItemByPath(filesWithMetadata, workspace.currentFilePath)
          : null
      }))

      console.log('✅ Git workspace loaded:', workspaceId)
    } catch (error) {
      console.error('Failed to load Git workspace:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load workspace'
      }))
    }
  }, [])

  /**
   * Create a new Git workspace
   */
  const createGitWorkspace = useCallback(async (
    repository: GitRepository, 
    branch: string, 
    name: string
  ): Promise<string> => {
    if (!gitWorkspaceService.current) {
      throw new Error('Git service not available')
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const workspace = await gitWorkspaceService.current!.createGitWorkspace(name, repository, branch)
      
      // Load the new workspace
      await loadGitWorkspace(workspace.id)
      
      console.log('✅ Git workspace created:', workspace.id)
      return workspace.id
    } catch (error) {
      console.error('Failed to create Git workspace:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create workspace'
      }))
      throw error
    }
  }, [loadGitWorkspace])

  /**
   * Select a file
   */
  const selectFile = useCallback((item: FileSystemItem) => {
    if (item.type === 'file') {
      setState(prev => ({ ...prev, currentFile: item }))
      
      // Update workspace current file path
      if (state.workspace) {
        updateWorkspaceCurrentFile(state.workspace.id, item.path)
      }
    }
  }, [state.workspace])

  /**
   * Update file content
   */
  const updateFileContent = useCallback((path: string, content: string) => {
    setState(prev => {
      const updatedFiles = updateItemInTree(prev.files, path, (item) => ({
        ...item,
        content,
        gitMetadata: item.gitMetadata ? {
          ...item.gitMetadata,
          isModified: true,
          lastModified: new Date().toISOString()
        } : undefined
      }))

      return {
        ...prev,
        files: updatedFiles,
        hasUnsavedChanges: true,
        currentFile: prev.currentFile?.path === path 
          ? { ...prev.currentFile, content }
          : prev.currentFile
      }
    })

    // Track pending changes for auto-commit
    pendingChanges.current.set(path, content)
    
    // Trigger auto-commit after delay
    scheduleAutoCommit()
  }, [])

  /**
   * Create a new file
   */
  const createFile = useCallback((parentPath: string, name: string) => {
    const path = createPath(parentPath, name)
    const newFile: FileSystemItem = {
      id: generateId(),
      name,
      type: 'file',
      path,
      content: `# ${name.replace('.md', '')}\n\nStart writing here...`,
      gitMetadata: {
        sha: '',
        lastCommitSha: '',
        lastModified: new Date().toISOString(),
        isModified: true,
        isStaged: false,
        conflictStatus: 'none',
        size: 0
      }
    }

    setState(prev => ({
      ...prev,
      files: addItemToTree(prev.files, parentPath, newFile),
      currentFile: newFile,
      hasUnsavedChanges: true
    }))

    // Track as new file
    pendingChanges.current.set(path, newFile.content || '')
    scheduleAutoCommit()
  }, [])

  /**
   * Create a new folder
   */
  const createFolder = useCallback((parentPath: string, name: string) => {
    const path = createPath(parentPath, name)
    const newFolder: FileSystemItem = {
      id: generateId(),
      name,
      type: 'folder',
      path,
      isExpanded: true,
      children: [],
      gitMetadata: {
        sha: '',
        lastCommitSha: '',
        lastModified: new Date().toISOString(),
        isModified: true,
        isStaged: false,
        conflictStatus: 'none',
        size: 0
      }
    }

    setState(prev => ({
      ...prev,
      files: addItemToTree(prev.files, parentPath, newFolder),
      hasUnsavedChanges: true
    }))
  }, [])

  /**
   * Delete an item
   */
  const deleteItem = useCallback((path: string) => {
    setState(prev => ({
      ...prev,
      files: removeItemFromTree(prev.files, path),
      hasUnsavedChanges: true,
      currentFile: prev.currentFile?.path === path ? null : prev.currentFile
    }))

    // Track deletion for auto-commit
    pendingChanges.current.set(path, null as any) // null indicates deletion
    scheduleAutoCommit()
  }, [])

  /**
   * Rename an item
   */
  const renameItem = useCallback((item: FileSystemItem, newName: string) => {
    const pathParts = item.path.split('/')
    pathParts[pathParts.length - 1] = newName
    const newPath = pathParts.join('/')

    setState(prev => ({
      ...prev,
      files: updateItemInTree(prev.files, item.path, (existingItem) => ({
        ...existingItem,
        name: newName,
        path: newPath,
        gitMetadata: existingItem.gitMetadata ? {
          ...existingItem.gitMetadata,
          isModified: true,
          lastModified: new Date().toISOString()
        } : undefined
      })),
      hasUnsavedChanges: true,
      currentFile: prev.currentFile?.path === item.path 
        ? { ...prev.currentFile, name: newName, path: newPath }
        : prev.currentFile
    }))

    // Track rename as delete + create
    pendingChanges.current.set(item.path, null as any) // Delete old
    pendingChanges.current.set(newPath, item.content || '') // Create new
    scheduleAutoCommit()
  }, [])

  /**
   * Commit changes to Git
   */
  const commitChanges = useCallback(async (message: string) => {
    if (!gitWorkspaceService.current || !state.workspace) {
      throw new Error('Git service or workspace not available')
    }

    try {
      setState(prev => ({ ...prev, isSyncing: true, error: null }))

      const result = await gitWorkspaceService.current.commitChanges(
        state.workspace.id,
        message,
        {
          name: 'Markdown Converter User', // TODO: Get from user profile
          email: 'user@markdown-converter.local'
        }
      )

      if (result.success) {
        // Clear pending changes
        pendingChanges.current.clear()
        
        // Update files to mark as not modified
        setState(prev => ({
          ...prev,
          files: markFilesAsCommitted(prev.files),
          hasUnsavedChanges: false,
          isSyncing: false
        }))

        console.log('✅ Changes committed successfully')
      } else if (result.hasConflict) {
        setState(prev => ({
          ...prev,
          isSyncing: false,
          error: 'Conflict detected. Please resolve conflicts and try again.'
        }))
      }
    } catch (error) {
      console.error('Failed to commit changes:', error)
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to commit changes'
      }))
    }
  }, [state.workspace])

  /**
   * Sync with remote repository
   */
  const syncWithRemote = useCallback(async () => {
    if (!gitWorkspaceService.current || !state.workspace) {
      throw new Error('Git service or workspace not available')
    }

    try {
      setState(prev => ({ ...prev, isSyncing: true, error: null }))

      const syncResult = await gitWorkspaceService.current.syncWorkspace(state.workspace.id)
      
      setState(prev => ({
        ...prev,
        isSyncing: false,
        syncStatus: {
          hasLocalChanges: prev.hasUnsavedChanges,
          hasRemoteChanges: syncResult.newCommits > 0,
          lastSyncTime: new Date().toISOString(),
          conflictedFiles: syncResult.conflictedFiles,
          aheadBy: 0, // TODO: Calculate
          behindBy: syncResult.newCommits
        },
        error: syncResult.hasConflicts 
          ? `Conflicts detected in ${syncResult.conflictedFiles.length} files`
          : null
      }))

      console.log('✅ Sync completed:', syncResult)
    } catch (error) {
      console.error('Failed to sync with remote:', error)
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to sync'
      }))
    }
  }, [state.workspace, state.hasUnsavedChanges])

  /**
   * Switch to a different branch
   */
  const switchBranch = useCallback(async (branchName: string) => {
    if (!gitWorkspaceService.current || !state.workspace) {
      throw new Error('Git service or workspace not available')
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      await gitWorkspaceService.current.switchBranch(state.workspace.id, branchName)
      
      // Reload workspace to get new files
      await loadGitWorkspace(state.workspace.id)
      
      console.log(`✅ Switched to branch: ${branchName}`)
    } catch (error) {
      console.error('Failed to switch branch:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to switch branch'
      }))
    }
  }, [state.workspace, loadGitWorkspace])

  // Helper functions
  const performBackgroundSync = useCallback(async () => {
    if (state.workspace?.type === 'git' && !state.isSyncing) {
      try {
        await syncWithRemote()
      } catch (error) {
        console.warn('Background sync failed:', error)
      }
    }
  }, [state.workspace, state.isSyncing, syncWithRemote])

  const scheduleAutoCommit = useCallback(() => {
    // TODO: Implement auto-commit logic based on user preferences
    // For now, just mark as having unsaved changes
  }, [])

  const updateWorkspaceCurrentFile = async (workspaceId: string, filePath: string) => {
    try {
      const workspace = await db.gitWorkspaces.get(workspaceId)
      if (workspace) {
        workspace.currentFilePath = filePath
        workspace.lastModified = new Date().toISOString()
        await db.gitWorkspaces.put(workspace)
      }
    } catch (error) {
      console.warn('Failed to update workspace current file:', error)
    }
  }

  return {
    ...state,
    selectFile,
    updateFileContent,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    commitChanges,
    syncWithRemote,
    switchBranch,
    loadGitWorkspace,
    createGitWorkspace
  }
}

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function createPath(parentPath: string, name: string): string {
  if (parentPath === '/') return `/${name}`
  return `${parentPath}/${name}`
}

function findItemByPath(items: FileSystemItem[], path: string): FileSystemItem | null {
  for (const item of items) {
    if (item.path === path) {
      return item
    }
    if (item.children) {
      const found = findItemByPath(item.children, path)
      if (found) return found
    }
  }
  return null
}

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

function removeItemFromTree(items: FileSystemItem[], targetPath: string): FileSystemItem[] {
  return items.filter(item => {
    if (item.path === targetPath) {
      return false
    }
    if (item.children) {
      item.children = removeItemFromTree(item.children, targetPath)
    }
    return true
  })
}

function addItemToTree(
  items: FileSystemItem[], 
  parentPath: string, 
  newItem: FileSystemItem
): FileSystemItem[] {
  if (parentPath === '/') {
    return [...items, newItem]
  }
  
  return updateItemInTree(items, parentPath, (parent) => ({
    ...parent,
    children: [...(parent.children || []), newItem]
  }))
}

async function loadFilesWithGitMetadata(
  files: FileSystemItem[], 
  workspaceId: string
): Promise<FileSystemItem[]> {
  const result: FileSystemItem[] = []
  
  for (const file of files) {
    if (file.type === 'file') {
      // Try to load Git metadata from cache
      try {
        const cachedFile = await db.gitFiles.where({ workspaceId, path: file.path }).first()
        if (cachedFile) {
          result.push({
            ...file,
            content: cachedFile.content,
            gitMetadata: cachedFile.metadata
          })
        } else {
          result.push(file)
        }
      } catch (error) {
        console.warn(`Failed to load metadata for ${file.path}:`, error)
        result.push(file)
      }
    } else if (file.type === 'folder' && file.children) {
      result.push({
        ...file,
        children: await loadFilesWithGitMetadata(file.children, workspaceId)
      })
    } else {
      result.push(file)
    }
  }
  
  return result
}

function markFilesAsCommitted(files: FileSystemItem[]): FileSystemItem[] {
  return files.map(file => ({
    ...file,
    gitMetadata: file.gitMetadata ? {
      ...file.gitMetadata,
      isModified: false,
      isStaged: false
    } : file.gitMetadata,
    children: file.children ? markFilesAsCommitted(file.children) : file.children
  }))
}