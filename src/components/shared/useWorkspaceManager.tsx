import { useState, useEffect, useCallback, useMemo } from 'react'
import { FileSystemItem } from './FileTree'

export interface WorkspaceData {
  id: string
  name: string
  files: FileSystemItem[]
  currentFilePath?: string
  createdAt: string
  lastModified: string
}

const WORKSPACES_KEY = 'markdown-explorer-workspaces'
const WORKSPACE_DATA_PREFIX = 'markdown-explorer-workspace-'
const CURRENT_WORKSPACE_KEY = 'markdown-explorer-current-workspace'

export function useWorkspaceManager() {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('default')
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null)

  // Initialize workspace manager
  useEffect(() => {
    // Get current workspace from localStorage
    const storedCurrentWorkspace = localStorage.getItem(CURRENT_WORKSPACE_KEY)
    const workspaceId = storedCurrentWorkspace || 'default'
    
    // Ensure default workspace exists
    ensureDefaultWorkspace()
    
    // Load the current workspace
    loadWorkspace(workspaceId)
  }, [])

  const ensureDefaultWorkspace = () => {
    const defaultWorkspaceKey = `${WORKSPACE_DATA_PREFIX}default`
    const existingDefault = localStorage.getItem(defaultWorkspaceKey)
    
    if (!existingDefault) {
      const defaultWorkspace: WorkspaceData = {
        id: 'default',
        name: 'Default Workspace',
        files: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      localStorage.setItem(defaultWorkspaceKey, JSON.stringify(defaultWorkspace))
    }
  }

  const loadWorkspace = useCallback((workspaceId: string) => {
    const workspaceKey = `${WORKSPACE_DATA_PREFIX}${workspaceId}`
    const stored = localStorage.getItem(workspaceKey)
    
    if (stored) {
      try {
        const data = JSON.parse(stored) as WorkspaceData
        setWorkspaceData(data)
        setCurrentWorkspaceId(workspaceId)
        localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId)
      } catch (error) {
        console.error('Error loading workspace:', error)
        // Fallback to default workspace
        loadWorkspace('default')
      }
    } else {
      // Create new workspace if it doesn't exist
      const newWorkspace: WorkspaceData = {
        id: workspaceId,
        name: workspaceId === 'default' ? 'Default Workspace' : `Workspace ${workspaceId}`,
        files: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      setWorkspaceData(newWorkspace)
      setCurrentWorkspaceId(workspaceId)
      saveWorkspace(newWorkspace)
    }
  }, [])

  const saveWorkspace = useCallback((workspace: WorkspaceData) => {
    const workspaceKey = `${WORKSPACE_DATA_PREFIX}${workspace.id}`
    const updatedWorkspace = {
      ...workspace,
      lastModified: new Date().toISOString()
    }
    localStorage.setItem(workspaceKey, JSON.stringify(updatedWorkspace))
    setWorkspaceData(updatedWorkspace)
  }, [])

  const joinWorkspace = useCallback((workspaceId: string) => {
    // Save current workspace before switching
    if (workspaceData) {
      saveWorkspace(workspaceData)
    }
    
    // Load new workspace
    loadWorkspace(workspaceId)
  }, [workspaceData, saveWorkspace, loadWorkspace])

  const leaveWorkspace = useCallback(() => {
    // Save current workspace
    if (workspaceData) {
      saveWorkspace(workspaceData)
    }
    
    // Switch to default workspace
    loadWorkspace('default')
  }, [workspaceData, saveWorkspace, loadWorkspace])

  const createWorkspace = useCallback((name: string) => {
    // Save current workspace first
    if (workspaceData) {
      saveWorkspace(workspaceData)
    }
    
    const workspaceId = `workspace_${Date.now()}`
    const newWorkspace: WorkspaceData = {
      id: workspaceId,
      name,
      files: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    // Save and immediately join the new workspace
    saveWorkspace(newWorkspace)
    loadWorkspace(workspaceId)
    return workspaceId
  }, [workspaceData, saveWorkspace, loadWorkspace])

  const deleteWorkspace = useCallback((workspaceId: string) => {
    if (workspaceId === 'default') {
      console.warn('Cannot delete default workspace')
      return
    }
    
    const workspaceKey = `${WORKSPACE_DATA_PREFIX}${workspaceId}`
    localStorage.removeItem(workspaceKey)
    
    // If deleting current workspace, switch to default
    if (workspaceId === currentWorkspaceId) {
      loadWorkspace('default')
    }
  }, [currentWorkspaceId, loadWorkspace])

  const renameWorkspace = useCallback((workspaceId: string, newName: string) => {
    if (workspaceData && workspaceData.id === workspaceId) {
      const updatedWorkspace = {
        ...workspaceData,
        name: newName,
        lastModified: new Date().toISOString()
      }
      saveWorkspace(updatedWorkspace)
    } else {
      // Load workspace, rename, and save
      const workspaceKey = `${WORKSPACE_DATA_PREFIX}${workspaceId}`
      const stored = localStorage.getItem(workspaceKey)
      if (stored) {
        try {
          const data = JSON.parse(stored) as WorkspaceData
          const updatedWorkspace = {
            ...data,
            name: newName,
            lastModified: new Date().toISOString()
          }
          localStorage.setItem(workspaceKey, JSON.stringify(updatedWorkspace))
        } catch (error) {
          console.error('Error renaming workspace:', error)
        }
      }
    }
  }, [workspaceData, saveWorkspace])

  const updateWorkspaceFiles = useCallback((files: FileSystemItem[], currentFilePath?: string) => {
    if (workspaceData) {
      const updatedWorkspace = {
        ...workspaceData,
        files,
        currentFilePath,
        lastModified: new Date().toISOString()
      }
      saveWorkspace(updatedWorkspace)
    }
  }, [workspaceData, saveWorkspace])

  const getAllWorkspaces = useCallback((): WorkspaceData[] => {
    const workspaces: WorkspaceData[] = []
    
    // Get all workspace keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(WORKSPACE_DATA_PREFIX)) {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            const workspace = JSON.parse(data) as WorkspaceData
            workspaces.push(workspace)
          }
        } catch (error) {
          console.error('Error loading workspace:', key, error)
        }
      }
    }
    
    // Sort by last modified date (most recent first)
    return workspaces.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  }, [])

  const workspaceList = useMemo(() => {
    const workspaces = getAllWorkspaces()
    return workspaces.map(w => ({
      id: w.id,
      name: w.name,
      createdAt: w.createdAt,
      lastModified: w.lastModified
    }))
  }, [getAllWorkspaces])

  return {
    currentWorkspaceId,
    workspaceData,
    workspaces: workspaceList,
    joinWorkspace,
    leaveWorkspace,
    createWorkspace,
    deleteWorkspace,
    renameWorkspace,
    updateWorkspaceFiles,
    getAllWorkspaces
  }
}