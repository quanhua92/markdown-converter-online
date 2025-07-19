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
  console.log('🔧 useWorkspaceManager: Hook initialized')
  
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(() => {
    const stored = localStorage.getItem(CURRENT_WORKSPACE_KEY) || 'default'
    console.log('🔧 useWorkspaceManager: Initial currentWorkspaceId:', stored)
    return stored
  })
  
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(() => {
    console.log('🔧 useWorkspaceManager: Initializing workspaceData')
    
    // Ensure default workspace exists
    const defaultWorkspaceKey = `${WORKSPACE_DATA_PREFIX}default`
    const existingDefault = localStorage.getItem(defaultWorkspaceKey)
    
    if (!existingDefault) {
      console.log('🔧 useWorkspaceManager: Creating default workspace')
      const defaultWorkspace: WorkspaceData = {
        id: 'default',
        name: 'Default Workspace',
        files: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      localStorage.setItem(defaultWorkspaceKey, JSON.stringify(defaultWorkspace))
    }
    
    // Load current workspace
    const currentId = localStorage.getItem(CURRENT_WORKSPACE_KEY) || 'default'
    const workspaceKey = `${WORKSPACE_DATA_PREFIX}${currentId}`
    const stored = localStorage.getItem(workspaceKey)
    
    if (stored) {
      try {
        const data = JSON.parse(stored) as WorkspaceData
        console.log('🔧 useWorkspaceManager: Loaded workspace:', data.name)
        return data
      } catch (error) {
        console.error('🔧 useWorkspaceManager: Error parsing workspace:', error)
      }
    }
    
    console.log('🔧 useWorkspaceManager: No workspace found, returning null')
    return null
  })

  // Initialize workspace manager
  useEffect(() => {
    // Get current workspace from localStorage
    const storedCurrentWorkspace = localStorage.getItem(CURRENT_WORKSPACE_KEY)
    const workspaceId = storedCurrentWorkspace || 'default'
    
    // Ensure default workspace exists
    ensureDefaultWorkspace()
    
    // Load the current workspace without dependency loop
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
        if (workspaceId !== 'default') {
          const defaultKey = `${WORKSPACE_DATA_PREFIX}default`
          const defaultStored = localStorage.getItem(defaultKey)
          if (defaultStored) {
            try {
              const defaultData = JSON.parse(defaultStored) as WorkspaceData
              setWorkspaceData(defaultData)
              setCurrentWorkspaceId('default')
              localStorage.setItem(CURRENT_WORKSPACE_KEY, 'default')
            } catch {
              // Create new default if corrupted
              const defaultWorkspace: WorkspaceData = {
                id: 'default',
                name: 'Default Workspace',
                files: [],
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
              }
              setWorkspaceData(defaultWorkspace)
              setCurrentWorkspaceId('default')
              localStorage.setItem(defaultKey, JSON.stringify(defaultWorkspace))
              localStorage.setItem(CURRENT_WORKSPACE_KEY, 'default')
            }
          }
        }
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
      const workspaceKey = `${WORKSPACE_DATA_PREFIX}${workspaceId}`
      const updatedWorkspace = {
        ...newWorkspace,
        lastModified: new Date().toISOString()
      }
      localStorage.setItem(workspaceKey, JSON.stringify(updatedWorkspace))
    }
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

  const saveWorkspace = useCallback((workspace: WorkspaceData) => {
    const workspaceKey = `${WORKSPACE_DATA_PREFIX}${workspace.id}`
    const updatedWorkspace = {
      ...workspace,
      lastModified: new Date().toISOString()
    }
    localStorage.setItem(workspaceKey, JSON.stringify(updatedWorkspace))
    setWorkspaceData(updatedWorkspace)
  }, [])

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
        // Fallback to default workspace - avoid infinite recursion
        if (workspaceId !== 'default') {
          loadWorkspace('default')
        }
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
  }, [saveWorkspace])

  const joinWorkspace = useCallback((workspaceId: string) => {
    // Save current workspace before switching
    if (workspaceData) {
      saveWorkspace(workspaceData)
    }
    
    // Load new workspace directly without dependency loop
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
      }
    }
  }, [workspaceData, saveWorkspace])

  const leaveWorkspace = useCallback(() => {
    // Save current workspace
    if (workspaceData) {
      saveWorkspace(workspaceData)
    }
    
    // Switch to default workspace directly
    const defaultKey = `${WORKSPACE_DATA_PREFIX}default`
    const stored = localStorage.getItem(defaultKey)
    
    if (stored) {
      try {
        const data = JSON.parse(stored) as WorkspaceData
        setWorkspaceData(data)
        setCurrentWorkspaceId('default')
        localStorage.setItem(CURRENT_WORKSPACE_KEY, 'default')
      } catch (error) {
        console.error('Error loading default workspace:', error)
      }
    }
  }, [workspaceData, saveWorkspace])

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
    const workspaceKey = `${WORKSPACE_DATA_PREFIX}${workspaceId}`
    const updatedWorkspace = {
      ...newWorkspace,
      lastModified: new Date().toISOString()
    }
    localStorage.setItem(workspaceKey, JSON.stringify(updatedWorkspace))
    setWorkspaceData(updatedWorkspace)
    setCurrentWorkspaceId(workspaceId)
    localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId)
    
    return workspaceId
  }, [workspaceData, saveWorkspace])

  const deleteWorkspace = useCallback((workspaceId: string) => {
    if (workspaceId === 'default') {
      console.warn('Cannot delete default workspace')
      return
    }
    
    const workspaceKey = `${WORKSPACE_DATA_PREFIX}${workspaceId}`
    localStorage.removeItem(workspaceKey)
    
    // If deleting current workspace, switch to default
    if (workspaceId === currentWorkspaceId) {
      const defaultKey = `${WORKSPACE_DATA_PREFIX}default`
      const stored = localStorage.getItem(defaultKey)
      
      if (stored) {
        try {
          const data = JSON.parse(stored) as WorkspaceData
          setWorkspaceData(data)
          setCurrentWorkspaceId('default')
          localStorage.setItem(CURRENT_WORKSPACE_KEY, 'default')
        } catch (error) {
          console.error('Error loading default workspace:', error)
        }
      }
    }
  }, [currentWorkspaceId])

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