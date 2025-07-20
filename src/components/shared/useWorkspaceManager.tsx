import { useState, useEffect, useCallback } from 'react'
import type { FileSystemItem } from './FileTree'

// Enhanced workspace manager with no-workspace state support
// Supports: no workspace state, multiple workspaces, import from zip

interface WorkspaceData {
  id: string
  name: string
  files: FileSystemItem[]
  currentFilePath?: string
  createdAt: string
  lastModified: string
}

// Multi-workspace storage functions
const CURRENT_WORKSPACE_KEY = 'markdown-explorer-v2-current-workspace'
const WORKSPACE_PREFIX = 'markdown-explorer-v2-workspace-'

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

function getAllWorkspacesFromStorage(): WorkspaceData[] {
  const workspaces: WorkspaceData[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(WORKSPACE_PREFIX)) {
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          const workspace = JSON.parse(stored)
          workspaces.push(workspace)
        }
      } catch (error) {
        console.warn('⚠️ Failed to load workspace from key:', key, error)
      }
    }
  }
  
  return workspaces.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
}

function loadWorkspaceData(workspaceId: string): WorkspaceData | null {
  try {
    const stored = localStorage.getItem(WORKSPACE_PREFIX + workspaceId)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('📂 useWorkspaceManager: Loaded workspace', workspaceId)
      return parsed
    }
  } catch (error) {
    console.warn('⚠️ useWorkspaceManager: Workspace load failed:', workspaceId, error)
  }
  return null
}

function saveWorkspaceData(workspace: WorkspaceData): void {
  try {
    const updatedWorkspace = {
      ...workspace,
      lastModified: new Date().toISOString()
    }
    localStorage.setItem(WORKSPACE_PREFIX + workspace.id, JSON.stringify(updatedWorkspace))
    console.log('✅ useWorkspaceManager: Saved workspace', workspace.id)
  } catch (error) {
    console.warn('⚠️ useWorkspaceManager: Workspace save failed:', workspace.id, error)
  }
}

function getCurrentWorkspaceId(): string | null {
  try {
    return localStorage.getItem(CURRENT_WORKSPACE_KEY)
  } catch (error) {
    console.warn('⚠️ useWorkspaceManager: Failed to get current workspace ID:', error)
    return null
  }
}

function setCurrentWorkspaceId(workspaceId: string | null): void {
  try {
    if (workspaceId) {
      localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId)
    } else {
      localStorage.removeItem(CURRENT_WORKSPACE_KEY)
    }
    console.log('📝 useWorkspaceManager: Set current workspace to', workspaceId)
  } catch (error) {
    console.warn('⚠️ useWorkspaceManager: Failed to set current workspace ID:', error)
  }
}

export function useWorkspaceManager() {
  console.log('🚀 useWorkspaceManager: Hook called')
  
  // State management
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(() => getCurrentWorkspaceId())
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(() => {
    const id = getCurrentWorkspaceId()
    return id ? loadWorkspaceData(id) : null
  })
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>(() => getAllWorkspacesFromStorage())

  // Update workspaces list when needed
  const refreshWorkspaces = useCallback(() => {
    setWorkspaces(getAllWorkspacesFromStorage())
  }, [])

  // Join an existing workspace
  const joinWorkspace = useCallback((workspaceId: string) => {
    console.log('📝 useWorkspaceManager: joinWorkspace called:', workspaceId)
    const workspace = loadWorkspaceData(workspaceId)
    if (workspace) {
      setCurrentWorkspaceIdState(workspaceId)
      setCurrentWorkspaceId(workspaceId)
      setWorkspaceData(workspace)
      console.log('✅ useWorkspaceManager: Switched to workspace', workspaceId)
    } else {
      console.warn('⚠️ useWorkspaceManager: Workspace not found:', workspaceId)
    }
  }, [])
  
  // Leave current workspace (go to no-workspace state)
  const leaveWorkspace = useCallback(() => {
    console.log('📝 useWorkspaceManager: leaveWorkspace called')
    setCurrentWorkspaceIdState(null)
    setCurrentWorkspaceId(null)
    setWorkspaceData(null)
    console.log('✅ useWorkspaceManager: Left workspace, now in no-workspace state')
  }, [])
  
  // Create a new workspace
  const createWorkspace = useCallback((name: string) => {
    console.log('📝 useWorkspaceManager: createWorkspace called:', name)
    const newId = 'workspace-' + Date.now()
    const newWorkspace: WorkspaceData = {
      id: newId,
      name: name.trim(),
      files: getDefaultFiles(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    saveWorkspaceData(newWorkspace)
    setCurrentWorkspaceIdState(newId)
    setCurrentWorkspaceId(newId)
    setWorkspaceData(newWorkspace)
    refreshWorkspaces()
    
    console.log('✅ useWorkspaceManager: Created and joined workspace', newId)
    return newId
  }, [refreshWorkspaces])
  
  // Delete a workspace
  const deleteWorkspace = useCallback((workspaceId: string) => {
    console.log('📝 useWorkspaceManager: deleteWorkspace called:', workspaceId)
    try {
      localStorage.removeItem(WORKSPACE_PREFIX + workspaceId)
      
      // If we're deleting the current workspace, leave it
      if (currentWorkspaceId === workspaceId) {
        leaveWorkspace()
      }
      
      refreshWorkspaces()
      console.log('✅ useWorkspaceManager: Deleted workspace', workspaceId)
    } catch (error) {
      console.warn('⚠️ useWorkspaceManager: Failed to delete workspace:', workspaceId, error)
    }
  }, [currentWorkspaceId, leaveWorkspace, refreshWorkspaces])
  
  // Rename a workspace
  const renameWorkspace = useCallback((workspaceId: string, newName: string) => {
    console.log('📝 useWorkspaceManager: renameWorkspace called:', workspaceId, newName)
    const workspace = loadWorkspaceData(workspaceId)
    if (workspace) {
      const updatedWorkspace = { ...workspace, name: newName.trim() }
      saveWorkspaceData(updatedWorkspace)
      
      // Update current workspace data if it's the one being renamed
      if (currentWorkspaceId === workspaceId) {
        setWorkspaceData(updatedWorkspace)
      }
      
      refreshWorkspaces()
      console.log('✅ useWorkspaceManager: Renamed workspace', workspaceId)
    }
  }, [currentWorkspaceId, refreshWorkspaces])
  
  // Create workspace from template
  const createWorkspaceFromTemplate = useCallback((name: string, templateFiles: FileSystemItem[]) => {
    console.log('📝 useWorkspaceManager: createWorkspaceFromTemplate called:', name)
    const newId = 'workspace-' + Date.now()
    const newWorkspace: WorkspaceData = {
      id: newId,
      name: name.trim(),
      files: templateFiles,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    saveWorkspaceData(newWorkspace)
    setCurrentWorkspaceIdState(newId)
    setCurrentWorkspaceId(newId)
    setWorkspaceData(newWorkspace)
    refreshWorkspaces()
    
    console.log('✅ useWorkspaceManager: Created workspace from template', newId)
    return newId
  }, [refreshWorkspaces])

  // Import workspace from ZIP
  const importWorkspaceFromZip = useCallback(async (name: string, file: File): Promise<string> => {
    console.log('📝 useWorkspaceManager: importWorkspaceFromZip called:', name)
    
    // TODO: Implement ZIP extraction logic
    // For now, create empty workspace
    const newId = 'workspace-' + Date.now()
    const newWorkspace: WorkspaceData = {
      id: newId,
      name: name + ' (Imported)',
      files: [{
        id: 'imported-readme',
        name: 'README.md',
        type: 'file',
        path: '/README.md',
        content: `# ${name}\n\nThis workspace was imported from: ${file.name}\n\n_ZIP import functionality coming soon..._`
      }],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    saveWorkspaceData(newWorkspace)
    setCurrentWorkspaceIdState(newId)
    setCurrentWorkspaceId(newId)
    setWorkspaceData(newWorkspace)
    refreshWorkspaces()
    
    console.log('✅ useWorkspaceManager: Imported workspace from ZIP', newId)
    return newId
  }, [refreshWorkspaces])
  
  // COMPLETELY DISABLED to eliminate infinite loop as per user request
  const updateWorkspaceFiles = useCallback((files: FileSystemItem[], currentFilePath?: string) => {
    console.log('🚫 useWorkspaceManager: updateWorkspaceFiles COMPLETELY DISABLED')
    console.log('🚫 Following user directive: "completely remove auto save shit"')
    // NO-OP: Completely disabled to eliminate infinite loop 
    // User explicitly requested: "completely remove auto save shit"
  }, []) // Empty dependencies - completely stable function
  
  const getAllWorkspaces = useCallback(() => {
    console.log('📝 useWorkspaceManager: getAllWorkspaces called')
    return workspaces
  }, [workspaces])
  
  console.log('📊 useWorkspaceManager: Returning state', {
    currentWorkspaceId,
    workspaceName: workspaceData?.name,
    workspaceCount: workspaces.length,
    hasWorkspace: !!workspaceData
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
    createWorkspaceFromTemplate,
    importWorkspaceFromZip,
    updateWorkspaceFiles,
    getAllWorkspaces,
    refreshWorkspaces
  }
}