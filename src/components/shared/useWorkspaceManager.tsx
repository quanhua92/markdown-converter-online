import { useState, useCallback, useMemo } from 'react'

// Temporary inline interface to avoid circular import
interface FileSystemItem {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  content?: string
  children?: FileSystemItem[]
  isExpanded?: boolean
}

export interface WorkspaceData {
  id: string
  name: string
  files: FileSystemItem[]
  currentFilePath?: string
  createdAt: string
  lastModified: string
}

const WORKSPACE_DATA_PREFIX = 'markdown-explorer-workspace-'
const CURRENT_WORKSPACE_KEY = 'markdown-explorer-current-workspace'

// Simple workspace storage utility
const WorkspaceStorage = {
  saveWorkspace: (workspace: WorkspaceData) => {
    console.log('💾 WorkspaceStorage.saveWorkspace:', workspace.id, workspace.name)
    const key = `${WORKSPACE_DATA_PREFIX}${workspace.id}`
    const dataToSave = {
      ...workspace,
      lastModified: new Date().toISOString()
    }
    localStorage.setItem(key, JSON.stringify(dataToSave))
    localStorage.setItem(CURRENT_WORKSPACE_KEY, workspace.id)
    return dataToSave
  },

  loadWorkspace: (workspaceId: string): WorkspaceData | null => {
    console.log('📂 WorkspaceStorage.loadWorkspace:', workspaceId)
    const key = `${WORKSPACE_DATA_PREFIX}${workspaceId}`
    const stored = localStorage.getItem(key)
    
    if (!stored) {
      console.log('❌ WorkspaceStorage.loadWorkspace: No data found for', workspaceId)
      return null
    }
    
    try {
      const data = JSON.parse(stored) as WorkspaceData
      console.log('✅ WorkspaceStorage.loadWorkspace: Loaded', data.name)
      return data
    } catch (error) {
      console.error('💥 WorkspaceStorage.loadWorkspace: Parse error', error)
      return null
    }
  },

  deleteWorkspace: (workspaceId: string) => {
    console.log('🗑️ WorkspaceStorage.deleteWorkspace:', workspaceId)
    const key = `${WORKSPACE_DATA_PREFIX}${workspaceId}`
    localStorage.removeItem(key)
  },

  getCurrentWorkspaceId: (): string => {
    const stored = localStorage.getItem(CURRENT_WORKSPACE_KEY) || 'default'
    console.log('🎯 WorkspaceStorage.getCurrentWorkspaceId:', stored)
    return stored
  },

  getAllWorkspaces: (): WorkspaceData[] => {
    console.log('📋 WorkspaceStorage.getAllWorkspaces: Scanning localStorage')
    const workspaces: WorkspaceData[] = []
    
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
          console.error('💥 WorkspaceStorage.getAllWorkspaces: Parse error for', key, error)
        }
      }
    }
    
    console.log('📋 WorkspaceStorage.getAllWorkspaces: Found', workspaces.length, 'workspaces')
    return workspaces.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  },

  ensureDefaultWorkspace: () => {
    console.log('🛠️ WorkspaceStorage.ensureDefaultWorkspace: Checking...')
    const defaultKey = `${WORKSPACE_DATA_PREFIX}default`
    const existing = localStorage.getItem(defaultKey)
    
    if (!existing) {
      console.log('🛠️ WorkspaceStorage.ensureDefaultWorkspace: Creating default workspace')
      const defaultWorkspace: WorkspaceData = {
        id: 'default',
        name: 'Default Workspace',
        files: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      localStorage.setItem(defaultKey, JSON.stringify(defaultWorkspace))
      return defaultWorkspace
    } else {
      console.log('✅ WorkspaceStorage.ensureDefaultWorkspace: Default workspace exists')
      try {
        return JSON.parse(existing) as WorkspaceData
      } catch (error) {
        console.error('💥 WorkspaceStorage.ensureDefaultWorkspace: Parse error, recreating', error)
        const defaultWorkspace: WorkspaceData = {
          id: 'default',
          name: 'Default Workspace',
          files: [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
        localStorage.setItem(defaultKey, JSON.stringify(defaultWorkspace))
        return defaultWorkspace
      }
    }
  }
}

export function useWorkspaceManager() {
  console.log('🚀 useWorkspaceManager: Hook called')
  
  // Initialize state with actual data from localStorage
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(() => {
    console.log('🎯 useWorkspaceManager: Initializing currentWorkspaceId')
    WorkspaceStorage.ensureDefaultWorkspace()
    const id = WorkspaceStorage.getCurrentWorkspaceId()
    console.log('🎯 useWorkspaceManager: Initial workspace ID:', id)
    return id
  })

  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(() => {
    console.log('📦 useWorkspaceManager: Initializing workspaceData')
    const id = WorkspaceStorage.getCurrentWorkspaceId()
    const data = WorkspaceStorage.loadWorkspace(id)
    
    if (!data) {
      console.log('⚠️ useWorkspaceManager: No workspace data, falling back to default')
      const defaultData = WorkspaceStorage.ensureDefaultWorkspace()
      console.log('📦 useWorkspaceManager: Loaded default workspace:', defaultData.name)
      return defaultData
    }
    
    console.log('📦 useWorkspaceManager: Loaded workspace:', data.name)
    return data
  })

  // Simple save function
  const saveWorkspace = useCallback((workspace: WorkspaceData) => {
    console.log('💾 useWorkspaceManager.saveWorkspace:', workspace.id, workspace.name)
    const savedData = WorkspaceStorage.saveWorkspace(workspace)
    setWorkspaceData(savedData)
    console.log('💾 useWorkspaceManager.saveWorkspace: State updated')
  }, [])

  // Join workspace function
  const joinWorkspace = useCallback((workspaceId: string) => {
    console.log('🔄 useWorkspaceManager.joinWorkspace:', workspaceId)
    
    // Save current workspace first
    if (workspaceData) {
      console.log('💾 useWorkspaceManager.joinWorkspace: Saving current workspace first')
      WorkspaceStorage.saveWorkspace(workspaceData)
    }
    
    // Load new workspace
    const newData = WorkspaceStorage.loadWorkspace(workspaceId)
    if (newData) {
      console.log('✅ useWorkspaceManager.joinWorkspace: Switching to', newData.name)
      setCurrentWorkspaceId(workspaceId)
      setWorkspaceData(newData)
      localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId)
    } else {
      console.error('❌ useWorkspaceManager.joinWorkspace: Workspace not found:', workspaceId)
    }
  }, [workspaceData])

  // Leave workspace function
  const leaveWorkspace = useCallback(() => {
    console.log('🚪 useWorkspaceManager.leaveWorkspace: Leaving current workspace')
    
    // Save current workspace
    if (workspaceData) {
      console.log('💾 useWorkspaceManager.leaveWorkspace: Saving current workspace')
      WorkspaceStorage.saveWorkspace(workspaceData)
    }
    
    // Switch to default
    const defaultData = WorkspaceStorage.loadWorkspace('default')
    if (defaultData) {
      console.log('🏠 useWorkspaceManager.leaveWorkspace: Switching to default workspace')
      setCurrentWorkspaceId('default')
      setWorkspaceData(defaultData)
      localStorage.setItem(CURRENT_WORKSPACE_KEY, 'default')
    } else {
      console.error('❌ useWorkspaceManager.leaveWorkspace: Default workspace not found')
    }
  }, [workspaceData])

  // Create workspace function
  const createWorkspace = useCallback((name: string) => {
    console.log('➕ useWorkspaceManager.createWorkspace:', name)
    
    // Save current workspace first
    if (workspaceData) {
      console.log('💾 useWorkspaceManager.createWorkspace: Saving current workspace first')
      WorkspaceStorage.saveWorkspace(workspaceData)
    }
    
    // Create new workspace
    const workspaceId = `workspace_${Date.now()}`
    const newWorkspace: WorkspaceData = {
      id: workspaceId,
      name,
      files: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    console.log('➕ useWorkspaceManager.createWorkspace: Created workspace with ID:', workspaceId)
    
    // Save and switch to new workspace
    const savedData = WorkspaceStorage.saveWorkspace(newWorkspace)
    setCurrentWorkspaceId(workspaceId)
    setWorkspaceData(savedData)
    
    console.log('✅ useWorkspaceManager.createWorkspace: Switched to new workspace')
    return workspaceId
  }, [workspaceData])

  // Delete workspace function
  const deleteWorkspace = useCallback((workspaceId: string) => {
    console.log('🗑️ useWorkspaceManager.deleteWorkspace:', workspaceId)
    
    if (workspaceId === 'default') {
      console.warn('⚠️ useWorkspaceManager.deleteWorkspace: Cannot delete default workspace')
      return
    }
    
    WorkspaceStorage.deleteWorkspace(workspaceId)
    
    // If deleting current workspace, switch to default
    if (workspaceId === currentWorkspaceId) {
      console.log('🏠 useWorkspaceManager.deleteWorkspace: Switching to default workspace')
      const defaultData = WorkspaceStorage.loadWorkspace('default')
      if (defaultData) {
        setCurrentWorkspaceId('default')
        setWorkspaceData(defaultData)
        localStorage.setItem(CURRENT_WORKSPACE_KEY, 'default')
      }
    }
  }, [currentWorkspaceId])

  // Rename workspace function
  const renameWorkspace = useCallback((workspaceId: string, newName: string) => {
    console.log('✏️ useWorkspaceManager.renameWorkspace:', workspaceId, 'to', newName)
    
    if (workspaceData && workspaceData.id === workspaceId) {
      // Renaming current workspace
      const updatedWorkspace = {
        ...workspaceData,
        name: newName,
        lastModified: new Date().toISOString()
      }
      const savedData = WorkspaceStorage.saveWorkspace(updatedWorkspace)
      setWorkspaceData(savedData)
    } else {
      // Renaming other workspace
      const targetData = WorkspaceStorage.loadWorkspace(workspaceId)
      if (targetData) {
        const updatedWorkspace = {
          ...targetData,
          name: newName,
          lastModified: new Date().toISOString()
        }
        WorkspaceStorage.saveWorkspace(updatedWorkspace)
      }
    }
  }, [workspaceData])

  // Update workspace files
  const updateWorkspaceFiles = useCallback((files: FileSystemItem[], currentFilePath?: string) => {
    console.log('📁 useWorkspaceManager.updateWorkspaceFiles: Updating', files.length, 'files')
    
    if (workspaceData) {
      const updatedWorkspace = {
        ...workspaceData,
        files,
        currentFilePath,
        lastModified: new Date().toISOString()
      }
      const savedData = WorkspaceStorage.saveWorkspace(updatedWorkspace)
      setWorkspaceData(savedData)
      console.log('✅ useWorkspaceManager.updateWorkspaceFiles: Files updated')
    } else {
      console.warn('⚠️ useWorkspaceManager.updateWorkspaceFiles: No workspace data to update')
    }
  }, [workspaceData])

  // Get all workspaces
  const getAllWorkspaces = useCallback(() => {
    console.log('📋 useWorkspaceManager.getAllWorkspaces: Getting all workspaces')
    return WorkspaceStorage.getAllWorkspaces()
  }, [])

  // Memoized workspace list
  const workspaces = useMemo(() => {
    console.log('📋 useWorkspaceManager: Computing workspace list')
    const allWorkspaces = getAllWorkspaces()
    return allWorkspaces.map(w => ({
      id: w.id,
      name: w.name,
      createdAt: w.createdAt,
      lastModified: w.lastModified
    }))
  }, [getAllWorkspaces])

  console.log('📊 useWorkspaceManager: Returning state', {
    currentWorkspaceId,
    workspaceName: workspaceData?.name,
    workspaceCount: workspaces.length
  })

  return {
    currentWorkspaceId,
    workspaceData,
    workspaces,
    joinWorkspace,
    leaveWorkspace,
    createWorkspace,
    deleteWorkspace,
    renameWorkspace,
    updateWorkspaceFiles,
    getAllWorkspaces
  }
}