import { useState, useEffect, useCallback } from 'react'
import { useGitHubAuth } from '../auth/useGitHubAuth'
import { db, type GitWorkspaceData } from '../db/db'
import { StorageService } from '../db/storage'
import type { FileSystemItem } from '../components/shared/FileTree'
import type { GitRepository } from '../types/git'
import { createGitHubAPI } from '../api/github'
import { createGitDataAPI } from '../api/gitData'
import { createGitWorkspaceService } from '../git/gitWorkspaceService'

// Legacy workspace interface for backward compatibility
interface LegacyWorkspaceData {
  id: string
  name: string
  files: FileSystemItem[]
  currentFilePath?: string
  createdAt: string
  lastModified: string
}

// Unified workspace interface
interface UnifiedWorkspace {
  id: string
  name: string
  type: 'local' | 'git'
  createdAt: string
  lastModified: string
  repositoryUrl?: string
  currentBranch?: string
}

// Legacy storage keys
const CURRENT_WORKSPACE_KEY = 'markdown-explorer-v2-current-workspace'
const WORKSPACE_PREFIX = 'markdown-explorer-v2-workspace-'

/**
 * Enhanced workspace manager that supports both local and Git workspaces
 */
export function useEnhancedWorkspaceManager() {
  const { api: githubAPI, isAuthenticated } = useGitHubAuth()
  
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<UnifiedWorkspace | null>(null)
  const [allWorkspaces, setAllWorkspaces] = useState<UnifiedWorkspace[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Git service
  const gitWorkspaceService = githubAPI ? createGitWorkspaceService(
    githubAPI,
    createGitDataAPI(githubAPI)
  ) : null

  /**
   * Load all workspaces from both storage systems
   */
  const loadAllWorkspaces = useCallback(async (): Promise<UnifiedWorkspace[]> => {
    const workspaces: UnifiedWorkspace[] = []
    
    try {
      // Load Git workspaces
      const gitWorkspaces = await db.gitWorkspaces.toArray()
      workspaces.push(...gitWorkspaces.map(gw => ({
        id: gw.id,
        name: gw.name,
        type: gw.type,
        createdAt: gw.createdAt,
        lastModified: gw.lastModified,
        repositoryUrl: gw.gitConfig?.repositoryUrl,
        currentBranch: gw.gitConfig?.branch
      })))
      
      // Load legacy local workspaces
      const allItems = await StorageService.getAllItems()
      for (const item of allItems) {
        if (item.key.startsWith(WORKSPACE_PREFIX)) {
          try {
            const workspace = item.value as LegacyWorkspaceData
            if (workspace && typeof workspace === 'object') {
              workspaces.push({
                id: workspace.id,
                name: workspace.name,
                type: 'local',
                createdAt: workspace.createdAt,
                lastModified: workspace.lastModified
              })
            }
          } catch (error) {
            console.warn('Failed to load legacy workspace:', item.key, error)
          }
        }
      }
      
      // Sort by last modified
      return workspaces.sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      )
      
    } catch (error) {
      console.error('Failed to load workspaces:', error)
      return []
    }
  }, [])

  /**
   * Initialize workspaces on mount
   */
  const initializeWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Load current workspace ID
      const currentId = await getCurrentWorkspaceId()
      setCurrentWorkspaceIdState(currentId)
      
      // Load all workspaces
      const workspaces = await loadAllWorkspaces()
      setAllWorkspaces(workspaces)
      
      // Set current workspace
      if (currentId) {
        const current = workspaces.find(w => w.id === currentId)
        setCurrentWorkspace(current || null)
      } else {
        setCurrentWorkspace(null)
      }
      
    } catch (error) {
      console.error('Failed to initialize workspaces:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadAllWorkspaces])

  // Initialize data on mount
  useEffect(() => {
    initializeWorkspaces()
  }, [])

  /**
   * Join an existing workspace
   */
  const joinWorkspace = useCallback(async (workspaceId: string) => {
    try {
      // Find workspace
      const workspace = allWorkspaces.find(w => w.id === workspaceId)
      if (!workspace) {
        throw new Error('Workspace not found')
      }
      
      // Set as current
      await setCurrentWorkspaceId(workspaceId)
      setCurrentWorkspaceIdState(workspaceId)
      setCurrentWorkspace(workspace)
      
      console.log('✅ Joined workspace:', workspaceId, workspace.type)
    } catch (error) {
      console.error('Failed to join workspace:', error)
      throw error
    }
  }, [allWorkspaces])

  /**
   * Leave current workspace
   */
  const leaveWorkspace = useCallback(async () => {
    try {
      await setCurrentWorkspaceId(null)
      setCurrentWorkspaceIdState(null)
      setCurrentWorkspace(null)
      
      console.log('✅ Left workspace')
    } catch (error) {
      console.error('Failed to leave workspace:', error)
    }
  }, [])

  /**
   * Create a new local workspace
   */
  const createLocalWorkspace = useCallback(async (name: string): Promise<string> => {
    try {
      const workspaceId = 'workspace-' + Date.now()
      const workspace: LegacyWorkspaceData = {
        id: workspaceId,
        name: name.trim(),
        files: getDefaultFiles(),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      
      // Save to legacy storage
      await StorageService.saveItem(WORKSPACE_PREFIX + workspaceId, workspace)
      
      // Create unified workspace representation
      const unifiedWorkspace: UnifiedWorkspace = {
        id: workspaceId,
        name: workspace.name,
        type: 'local',
        createdAt: workspace.createdAt,
        lastModified: workspace.lastModified
      }
      
      // Add to workspace list immediately
      setAllWorkspaces(prev => [...prev, unifiedWorkspace])
      
      // Set as current workspace
      await setCurrentWorkspaceId(workspaceId)
      setCurrentWorkspaceIdState(workspaceId)
      setCurrentWorkspace(unifiedWorkspace)
      
      console.log('✅ Created local workspace:', workspaceId)
      console.log('✅ Enhanced Manager: Current workspace set to:', unifiedWorkspace)
      console.log('✅ Enhanced Manager: State after creation:', {
        currentWorkspaceId: workspaceId,
        currentWorkspace: unifiedWorkspace.name,
        allWorkspacesCount: allWorkspaces.length + 1
      })
      return workspaceId
    } catch (error) {
      console.error('Failed to create local workspace:', error)
      throw error
    }
  }, [])

  /**
   * Create a new Git workspace
   */
  const createGitWorkspace = useCallback(async (
    name: string, 
    repository: GitRepository, 
    branch: string
  ): Promise<string> => {
    if (!gitWorkspaceService) {
      throw new Error('Git service not available')
    }
    
    try {
      const workspace = await gitWorkspaceService.createGitWorkspace(name, repository, branch)
      
      // Create unified workspace representation
      const unifiedWorkspace: UnifiedWorkspace = {
        id: workspace.id,
        name: workspace.name,
        type: 'git',
        createdAt: workspace.createdAt,
        lastModified: workspace.lastModified,
        repositoryUrl: workspace.repositoryUrl,
        currentBranch: workspace.currentBranch
      }
      
      // Add to workspace list immediately
      setAllWorkspaces(prev => [...prev, unifiedWorkspace])
      
      // Set as current workspace
      await setCurrentWorkspaceId(workspace.id)
      setCurrentWorkspaceIdState(workspace.id)
      setCurrentWorkspace(unifiedWorkspace)
      
      console.log('✅ Created Git workspace:', workspace.id)
      return workspace.id
    } catch (error) {
      console.error('Failed to create Git workspace:', error)
      throw error
    }
  }, [gitWorkspaceService])

  /**
   * Delete a workspace
   */
  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    try {
      const workspace = allWorkspaces.find(w => w.id === workspaceId)
      if (!workspace) {
        throw new Error('Workspace not found')
      }
      
      if (workspace.type === 'git') {
        // Delete Git workspace
        await db.gitWorkspaces.delete(workspaceId)
        // Also clean up related data
        await db.gitFiles.where('workspaceId').equals(workspaceId).delete()
        await db.gitCommits.where('workspaceId').equals(workspaceId).delete()
        await db.gitBranches.where('workspaceId').equals(workspaceId).delete()
      } else {
        // Delete legacy workspace
        await StorageService.removeItem(WORKSPACE_PREFIX + workspaceId)
      }
      
      // If deleting current workspace, leave it
      if (currentWorkspaceId === workspaceId) {
        await leaveWorkspace()
      }
      
      // Refresh workspace list
      await refreshWorkspaces()
      
      console.log('✅ Deleted workspace:', workspaceId)
    } catch (error) {
      console.error('Failed to delete workspace:', error)
      throw error
    }
  }, [allWorkspaces, currentWorkspaceId, leaveWorkspace])

  /**
   * Rename a workspace
   */
  const renameWorkspace = useCallback(async (workspaceId: string, newName: string) => {
    try {
      const workspace = allWorkspaces.find(w => w.id === workspaceId)
      if (!workspace) {
        throw new Error('Workspace not found')
      }
      
      if (workspace.type === 'git') {
        // Update Git workspace
        const gitWorkspace = await db.gitWorkspaces.get(workspaceId)
        if (gitWorkspace) {
          gitWorkspace.name = newName.trim()
          gitWorkspace.lastModified = new Date().toISOString()
          await db.gitWorkspaces.put(gitWorkspace)
        }
      } else {
        // Update legacy workspace
        const legacyWorkspace = await StorageService.loadItem(WORKSPACE_PREFIX + workspaceId)
        if (legacyWorkspace) {
          legacyWorkspace.name = newName.trim()
          legacyWorkspace.lastModified = new Date().toISOString()
          await StorageService.saveItem(WORKSPACE_PREFIX + workspaceId, legacyWorkspace)
        }
      }
      
      // Refresh workspace list
      await refreshWorkspaces()
      
      console.log('✅ Renamed workspace:', workspaceId)
    } catch (error) {
      console.error('Failed to rename workspace:', error)
      throw error
    }
  }, [allWorkspaces])

  /**
   * Refresh workspace list
   */
  const refreshWorkspaces = useCallback(async () => {
    try {
      const workspaces = await loadAllWorkspaces()
      setAllWorkspaces(workspaces)
      
      // Update current workspace if it exists
      if (currentWorkspaceId) {
        const current = workspaces.find(w => w.id === currentWorkspaceId)
        setCurrentWorkspace(current || null)
      }
    } catch (error) {
      console.error('Failed to refresh workspaces:', error)
    }
  }, [currentWorkspaceId, loadAllWorkspaces])

  /**
   * Get workspace details by ID
   */
  const getWorkspace = useCallback(async (workspaceId: string): Promise<GitWorkspaceData | LegacyWorkspaceData | null> => {
    try {
      const workspace = allWorkspaces.find(w => w.id === workspaceId)
      if (!workspace) return null
      
      if (workspace.type === 'git') {
        return await db.gitWorkspaces.get(workspaceId) || null
      } else {
        return await StorageService.loadItem(WORKSPACE_PREFIX + workspaceId) || null
      }
    } catch (error) {
      console.error('Failed to get workspace:', error)
      return null
    }
  }, [allWorkspaces])

  // Helper functions
  async function getCurrentWorkspaceId(): Promise<string | null> {
    try {
      return await StorageService.loadItem(CURRENT_WORKSPACE_KEY)
    } catch (error) {
      console.warn('Failed to get current workspace ID:', error)
      return null
    }
  }

  async function setCurrentWorkspaceId(workspaceId: string | null): Promise<void> {
    try {
      if (workspaceId) {
        await StorageService.saveItem(CURRENT_WORKSPACE_KEY, workspaceId)
      } else {
        await StorageService.removeItem(CURRENT_WORKSPACE_KEY)
      }
    } catch (error) {
      console.error('Failed to set current workspace ID:', error)
    }
  }

  function getDefaultFiles(): FileSystemItem[] {
    return [
      {
        id: 'welcome',
        name: 'Welcome.md',
        type: 'file',
        path: '/Welcome.md',
        content: '# Welcome\n\nThis is a minimal workspace with no infinite loops!'
      },
      {
        id: 'notes',
        name: 'Notes.md', 
        type: 'file',
        path: '/Notes.md',
        content: '# Notes\n\nAdd your notes here.'
      }
    ]
  }

  return {
    currentWorkspaceId,
    currentWorkspace,
    allWorkspaces,
    isLoading,
    
    // Actions
    joinWorkspace,
    leaveWorkspace,
    createLocalWorkspace,
    createGitWorkspace,
    deleteWorkspace,
    renameWorkspace,
    refreshWorkspaces,
    getWorkspace,
    
    // Utilities
    hasGitSupport: isAuthenticated && !!gitWorkspaceService
  }
}