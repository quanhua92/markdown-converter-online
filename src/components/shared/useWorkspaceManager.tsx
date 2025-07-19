import { useState, useEffect, useCallback } from 'react'
import { FileSystemItem } from './FileTree'

// Minimal workspace manager - step by step rewrite
// Step 3: Add basic file management with simple localStorage

interface WorkspaceData {
  id: string
  name: string
  files: FileSystemItem[]
  currentFilePath?: string
  createdAt: string
  lastModified: string
}

// Simple storage functions
const STORAGE_KEY = 'workspace-minimal'

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

function loadWorkspaceData(): WorkspaceData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('📂 useWorkspaceManager-minimal: Loaded from storage')
      return parsed
    }
  } catch (error) {
    console.warn('⚠️ useWorkspaceManager-minimal: Storage load failed:', error)
  }
  
  const defaultData = {
    id: 'default',
    name: 'Default Workspace',
    files: getDefaultFiles(),
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
  console.log('📂 useWorkspaceManager-minimal: Using default data')
  return defaultData
}

export function useWorkspaceManager() {
  console.log('🚀 useWorkspaceManager-minimal: Hook called')
  
  // State with actual file data - now mutable for workspace switching
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState('default')
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>(() => loadWorkspaceData())
  
  // Minimal workspace list
  const workspaces = [{
    id: 'default',
    name: 'Default Workspace',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }]
  
  // Basic workspace switching functions
  const joinWorkspace = useCallback((workspaceId: string) => {
    console.log('📝 useWorkspaceManager-minimal: joinWorkspace called:', workspaceId)
    if (workspaceId === 'default') {
      setCurrentWorkspaceId('default')
      const defaultData = loadWorkspaceData()
      setWorkspaceData(defaultData)
      console.log('✅ useWorkspaceManager-minimal: Switched to default workspace')
    } else {
      console.log('⚠️ useWorkspaceManager-minimal: Only default workspace supported for now')
    }
  }, [])
  
  const leaveWorkspace = useCallback(() => {
    console.log('📝 useWorkspaceManager-minimal: leaveWorkspace called (no-op)')
  }, [])
  
  const createWorkspace = useCallback((name: string) => {
    console.log('📝 useWorkspaceManager-minimal: createWorkspace called:', name, '(no-op)')
    return 'new-id'
  }, [])
  
  const deleteWorkspace = useCallback(() => {
    console.log('📝 useWorkspaceManager-minimal: deleteWorkspace called (no-op)')
  }, [])
  
  const renameWorkspace = useCallback(() => {
    console.log('📝 useWorkspaceManager-minimal: renameWorkspace called (no-op)')
  }, [])
  
  // Simple manual save function - only called explicitly, no state changes
  const updateWorkspaceFiles = useCallback((files: FileSystemItem[], currentFilePath?: string) => {
    console.log('📝 useWorkspaceManager-minimal: Manual save triggered')
    try {
      const updatedData = {
        ...workspaceData,
        files,
        currentFilePath,
        lastModified: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
      console.log('✅ useWorkspaceManager-minimal: Save completed')
    } catch (error) {
      console.warn('⚠️ useWorkspaceManager-minimal: Save failed:', error)
    }
    // IMPORTANT: No state updates here to avoid infinite loops
  }, [workspaceData])
  
  const getAllWorkspaces = useCallback(() => {
    console.log('📝 useWorkspaceManager-minimal: getAllWorkspaces called')
    return workspaces
  }, [workspaces])
  
  console.log('📊 useWorkspaceManager-minimal: Returning state', {
    currentWorkspaceId,
    workspaceName: workspaceData.name,
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