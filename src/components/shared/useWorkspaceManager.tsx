import { useState, useEffect, useCallback } from 'react'
import type { FileSystemItem } from './FileTree'
import { StorageService } from '../../db/storage'

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

async function getAllWorkspacesFromStorage(): Promise<WorkspaceData[]> {
  const workspaces: WorkspaceData[] = []
  
  try {
    const allItems = await StorageService.getAllItems()
    
    for (const item of allItems) {
      if (item.key.startsWith(WORKSPACE_PREFIX)) {
        try {
          const workspace = item.value
          if (workspace && typeof workspace === 'object') {
            workspaces.push(workspace)
          }
        } catch (error) {
          console.warn('⚠️ Failed to load workspace from key:', item.key, error)
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to get all workspaces:', error)
  }
  
  return workspaces.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
}

async function loadWorkspaceData(workspaceId: string): Promise<WorkspaceData | null> {
  try {
    const stored = await StorageService.loadItem(WORKSPACE_PREFIX + workspaceId)
    if (stored) {
      console.log('📂 useWorkspaceManager: Loaded workspace', workspaceId)
      return stored
    }
  } catch (error) {
    console.warn('⚠️ useWorkspaceManager: Workspace load failed:', workspaceId, error)
  }
  return null
}

async function saveWorkspaceData(workspace: WorkspaceData): Promise<void> {
  try {
    const updatedWorkspace = {
      ...workspace,
      lastModified: new Date().toISOString()
    }
    await StorageService.saveItem(WORKSPACE_PREFIX + workspace.id, updatedWorkspace)
    console.log('✅ useWorkspaceManager: Saved workspace', workspace.id)
  } catch (error) {
    console.warn('⚠️ useWorkspaceManager: Workspace save failed:', workspace.id, error)
  }
}

async function getCurrentWorkspaceId(): Promise<string | null> {
  try {
    return await StorageService.loadItem(CURRENT_WORKSPACE_KEY)
  } catch (error) {
    console.warn('⚠️ useWorkspaceManager: Failed to get current workspace ID:', error)
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
    console.log('📝 useWorkspaceManager: Set current workspace to', workspaceId)
  } catch (error) {
    console.warn('⚠️ useWorkspaceManager: Failed to set current workspace ID:', error)
  }
}

export function useWorkspaceManager() {
  console.log('🚀 useWorkspaceManager: Hook called')
  
  // State management
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(null)
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null)
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true)
        const currentId = await getCurrentWorkspaceId()
        setCurrentWorkspaceIdState(currentId)
        
        if (currentId) {
          const workspace = await loadWorkspaceData(currentId)
          setWorkspaceData(workspace)
        }
        
        const allWorkspaces = await getAllWorkspacesFromStorage()
        setWorkspaces(allWorkspaces)
      } catch (error) {
        console.warn('⚠️ Failed to initialize workspace data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeData()
  }, [])

  // Update workspaces list when needed
  const refreshWorkspaces = useCallback(async () => {
    try {
      const allWorkspaces = await getAllWorkspacesFromStorage()
      setWorkspaces(allWorkspaces)
    } catch (error) {
      console.warn('⚠️ Failed to refresh workspaces:', error)
    }
  }, [])

  // Join an existing workspace
  const joinWorkspace = useCallback(async (workspaceId: string) => {
    console.log('📝 useWorkspaceManager: joinWorkspace called:', workspaceId)
    try {
      const workspace = await loadWorkspaceData(workspaceId)
      if (workspace) {
        setCurrentWorkspaceIdState(workspaceId)
        await setCurrentWorkspaceId(workspaceId)
        setWorkspaceData(workspace)
        console.log('✅ useWorkspaceManager: Switched to workspace', workspaceId)
      } else {
        console.warn('⚠️ useWorkspaceManager: Workspace not found:', workspaceId)
      }
    } catch (error) {
      console.warn('⚠️ useWorkspaceManager: Failed to join workspace:', workspaceId, error)
    }
  }, [])
  
  // Leave current workspace (go to no-workspace state)
  const leaveWorkspace = useCallback(async () => {
    console.log('📝 useWorkspaceManager: leaveWorkspace called')
    try {
      setCurrentWorkspaceIdState(null)
      await setCurrentWorkspaceId(null)
      setWorkspaceData(null)
      console.log('✅ useWorkspaceManager: Left workspace, now in no-workspace state')
    } catch (error) {
      console.warn('⚠️ useWorkspaceManager: Failed to leave workspace:', error)
    }
  }, [])
  
  // Create a new workspace
  const createWorkspace = useCallback(async (name: string) => {
    console.log('📝 useWorkspaceManager: createWorkspace called:', name)
    try {
      const newId = 'workspace-' + Date.now()
      const newWorkspace: WorkspaceData = {
        id: newId,
        name: name.trim(),
        files: getDefaultFiles(),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      
      await saveWorkspaceData(newWorkspace)
      setCurrentWorkspaceIdState(newId)
      await setCurrentWorkspaceId(newId)
      setWorkspaceData(newWorkspace)
      await refreshWorkspaces()
      
      console.log('✅ useWorkspaceManager: Created and joined workspace', newId)
      return newId
    } catch (error) {
      console.warn('⚠️ useWorkspaceManager: Failed to create workspace:', name, error)
      throw error
    }
  }, [refreshWorkspaces])
  
  // Delete a workspace
  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    console.log('📝 useWorkspaceManager: deleteWorkspace called:', workspaceId)
    try {
      await StorageService.removeItem(WORKSPACE_PREFIX + workspaceId)
      
      // If we're deleting the current workspace, leave it
      if (currentWorkspaceId === workspaceId) {
        await leaveWorkspace()
      }
      
      await refreshWorkspaces()
      console.log('✅ useWorkspaceManager: Deleted workspace', workspaceId)
    } catch (error) {
      console.warn('⚠️ useWorkspaceManager: Failed to delete workspace:', workspaceId, error)
    }
  }, [currentWorkspaceId, leaveWorkspace, refreshWorkspaces])
  
  // Rename a workspace
  const renameWorkspace = useCallback(async (workspaceId: string, newName: string) => {
    console.log('📝 useWorkspaceManager: renameWorkspace called:', workspaceId, newName)
    try {
      const workspace = await loadWorkspaceData(workspaceId)
      if (workspace) {
        const updatedWorkspace = { ...workspace, name: newName.trim() }
        await saveWorkspaceData(updatedWorkspace)
        
        // Update current workspace data if it's the one being renamed
        if (currentWorkspaceId === workspaceId) {
          setWorkspaceData(updatedWorkspace)
        }
        
        await refreshWorkspaces()
        console.log('✅ useWorkspaceManager: Renamed workspace', workspaceId)
      }
    } catch (error) {
      console.warn('⚠️ useWorkspaceManager: Failed to rename workspace:', workspaceId, error)
    }
  }, [currentWorkspaceId, refreshWorkspaces])
  
  // Create workspace from template
  const createWorkspaceFromTemplate = useCallback(async (name: string, templateFiles: FileSystemItem[]) => {
    console.log('📝 useWorkspaceManager: createWorkspaceFromTemplate called:', name)
    try {
      const newId = 'workspace-' + Date.now()
      const newWorkspace: WorkspaceData = {
        id: newId,
        name: name.trim(),
        files: templateFiles,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      
      await saveWorkspaceData(newWorkspace)
      setCurrentWorkspaceIdState(newId)
      await setCurrentWorkspaceId(newId)
      setWorkspaceData(newWorkspace)
      await refreshWorkspaces()
      
      console.log('✅ useWorkspaceManager: Created workspace from template', newId)
      return newId
    } catch (error) {
      console.warn('⚠️ useWorkspaceManager: Failed to create workspace from template:', name, error)
      throw error
    }
  }, [refreshWorkspaces])

  // Import workspace from ZIP
  const importWorkspaceFromZip = useCallback(async (name: string, file: File): Promise<string> => {
    console.log('📝 useWorkspaceManager: importWorkspaceFromZip called:', name)
    
    try {
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
      
      await saveWorkspaceData(newWorkspace)
      setCurrentWorkspaceIdState(newId)
      await setCurrentWorkspaceId(newId)
      setWorkspaceData(newWorkspace)
      await refreshWorkspaces()
      
      console.log('✅ useWorkspaceManager: Imported workspace from ZIP', newId)
      return newId
    } catch (error) {
      console.warn('⚠️ useWorkspaceManager: Failed to import workspace from ZIP:', name, error)
      throw error
    }
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
    isLoading,
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