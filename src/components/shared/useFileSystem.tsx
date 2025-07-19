import { useState, useEffect, useCallback } from 'react'
import { FileSystemItem } from './FileTree'
import { useWorkspaceManager } from './useWorkspaceManager'

const STORAGE_KEY = 'markdown-explorer-files'

interface FileSystemState {
  files: FileSystemItem[]
  currentFile: FileSystemItem | null
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function createPath(parentPath: string, name: string): string {
  if (parentPath === '/') return `/${name}`
  return `${parentPath}/${name}`
}

function getInitialFiles(): FileSystemItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Check if we have any indication that this should be a fresh start
    // If localStorage was explicitly cleared, don't show default files
    const hasBeenCleared = sessionStorage.getItem('explorer-cleared')
    if (hasBeenCleared) {
      return []
    }
  } catch (error) {
    console.warn('Failed to load files from localStorage:', error)
  }
  
  // Default structure with sample files
  return [
    {
      id: generateId(),
      name: 'Welcome.md',
      type: 'file',
      path: '/Welcome.md',
      content: `# Welcome to Markdown Explorer

This is your personal markdown workspace! 

## Features
- ✨ File tree navigation
- 📝 Live markdown editing
- 👀 Real-time preview
- 💾 Auto-save to localStorage
- 📁 Folder organization

## Getting Started
1. Create new files and folders using the + buttons
2. Click on files to edit them
3. Use the collapsible folders to organize your content
4. Everything is automatically saved!

Happy writing! 🚀`
    },
    {
      id: generateId(),
      name: 'notes',
      type: 'folder',
      path: '/notes',
      isExpanded: true,
      children: [
        {
          id: generateId(),
          name: 'ideas.md',
          type: 'file',
          path: '/notes/ideas.md',
          content: `# Ideas

## Project Ideas
- [ ] Build a note-taking app
- [ ] Create a knowledge base
- [ ] Write documentation

## Random Thoughts
- Markdown is powerful
- Organization is key
- Simple tools work best`
        }
      ]
    }
  ]
}

function saveFiles(files: FileSystemItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
  } catch (error) {
    console.warn('Failed to save files to localStorage:', error)
  }
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

function updateItemInTree(items: FileSystemItem[], targetPath: string, updater: (item: FileSystemItem) => FileSystemItem): FileSystemItem[] {
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

function addItemToTree(items: FileSystemItem[], parentPath: string, newItem: FileSystemItem): FileSystemItem[] {
  if (parentPath === '/') {
    return [...items, newItem]
  }
  
  return updateItemInTree(items, parentPath, (parent) => ({
    ...parent,
    children: [...(parent.children || []), newItem]
  }))
}

export function useFileSystem() {
  const {
    currentWorkspaceId,
    workspaceData,
    switchWorkspace,
    createWorkspace,
    deleteWorkspace,
    renameWorkspace,
    updateWorkspaceFiles,
    getAllWorkspaces
  } = useWorkspaceManager()

  const [files, setFiles] = useState<FileSystemItem[]>([])
  const [currentFile, setCurrentFile] = useState<FileSystemItem | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize files from workspace data
  useEffect(() => {
    if (workspaceData) {
      setFiles(workspaceData.files.length > 0 ? workspaceData.files : getInitialFiles())
      
      // Set current file from workspace or find default
      if (workspaceData.currentFilePath) {
        const savedCurrentFile = findItemByPath(workspaceData.files, workspaceData.currentFilePath)
        if (savedCurrentFile) {
          setCurrentFile(savedCurrentFile)
        }
      } else {
        // Set the first file as current
        const firstFile = findItemByPath(workspaceData.files.length > 0 ? workspaceData.files : getInitialFiles(), '/Welcome.md')
        if (firstFile) {
          setCurrentFile(firstFile)
        }
      }
      
      setIsLoaded(true)
    }
  }, [workspaceData])

  // Save files to workspace whenever they change
  useEffect(() => {
    if (isLoaded && workspaceData) {
      updateWorkspaceFiles(files, currentFile?.path)
    }
  }, [files, currentFile, isLoaded, workspaceData, updateWorkspaceFiles])

  const selectFile = useCallback((item: FileSystemItem) => {
    if (item.type === 'file') {
      setCurrentFile(item)
    }
  }, [])

  const updateFileContent = useCallback((path: string, content: string) => {
    setFiles(prevFiles => {
      const updated = updateItemInTree(prevFiles, path, (item) => ({
        ...item,
        content
      }))
      return updated
    })
    
    // Update current file if it's the one being edited
    setCurrentFile(prev => {
      if (prev && prev.path === path) {
        return { ...prev, content }
      }
      return prev
    })
  }, [])

  const createFile = useCallback((parentPath: string, name: string) => {
    const path = createPath(parentPath, name)
    const newFile: FileSystemItem = {
      id: generateId(),
      name,
      type: 'file',
      path,
      content: '# ' + name.replace('.md', '') + '\n\nStart writing here...'
    }
    
    setFiles(prevFiles => addItemToTree(prevFiles, parentPath, newFile))
    setCurrentFile(newFile)
  }, [])

  const createFolder = useCallback((parentPath: string, name: string) => {
    const path = createPath(parentPath, name)
    const newFolder: FileSystemItem = {
      id: generateId(),
      name,
      type: 'folder',
      path,
      isExpanded: true,
      children: []
    }
    
    setFiles(prevFiles => addItemToTree(prevFiles, parentPath, newFolder))
  }, [])

  const deleteItem = useCallback((item: FileSystemItem) => {
    setFiles(prevFiles => removeItemFromTree(prevFiles, item.path))
    
    // If the deleted item was current, clear current file
    if (currentFile && currentFile.path === item.path) {
      setCurrentFile(null)
    }
  }, [currentFile])

  const renameItem = useCallback((item: FileSystemItem, newName: string) => {
    const pathParts = item.path.split('/')
    pathParts[pathParts.length - 1] = newName
    const newPath = pathParts.join('/')
    
    setFiles(prevFiles => updateItemInTree(prevFiles, item.path, (existingItem) => ({
      ...existingItem,
      name: newName,
      path: newPath
    })))
    
    // Update current file if it's the one being renamed
    if (currentFile && currentFile.path === item.path) {
      setCurrentFile(prev => prev ? { ...prev, name: newName, path: newPath } : null)
    }
  }, [currentFile])

  const toggleFolder = useCallback((item: FileSystemItem) => {
    setFiles(prevFiles => updateItemInTree(prevFiles, item.path, (folder) => ({
      ...folder,
      isExpanded: !folder.isExpanded
    })))
  }, [])

  const clearAll = useCallback(() => {
    setFiles([])
    setCurrentFile(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const initializeFromTemplate = useCallback((templateItems: FileSystemItem[]) => {
    setFiles(templateItems)
    
    // Find the first markdown file to set as current
    const findFirstMarkdownFile = (items: FileSystemItem[]): FileSystemItem | null => {
      for (const item of items) {
        if (item.type === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.markdown'))) {
          return item
        }
        if (item.children) {
          const found = findFirstMarkdownFile(item.children)
          if (found) return found
        }
      }
      return null
    }
    
    const firstFile = findFirstMarkdownFile(templateItems)
    if (firstFile) {
      setCurrentFile(firstFile)
    }
  }, [])

  const appendTemplateItems = useCallback((templateItems: FileSystemItem[]) => {
    setFiles(prevFiles => [...prevFiles, ...templateItems])
  }, [])

  return {
    files,
    currentFile,
    selectFile,
    updateFileContent,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    toggleFolder,
    clearAll,
    initializeFromTemplate,
    appendTemplateItems,
    isLoaded,
    // Workspace management
    currentWorkspaceId,
    switchWorkspace,
    createWorkspace,
    deleteWorkspace,
    renameWorkspace,
    getAllWorkspaces
  }
}