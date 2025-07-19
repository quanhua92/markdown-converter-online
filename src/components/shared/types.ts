// Shared types for file system management
interface FileSystemItem {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  content?: string
  children?: FileSystemItem[]
  isExpanded?: boolean
}

// Workspace management types
interface WorkspaceData {
  id: string
  name: string
  createdAt: string
  lastModified: string
  files: FileSystemItem[]
}

interface Workspace {
  id: string
  name: string
  createdAt: string
  lastModified: string
}

// Template types
interface FolderTemplate {
  id: string
  name: string
  description: string
  icon: string
  structure: Omit<FileSystemItem, 'id'>[]
}

// Named exports
export type { FileSystemItem, WorkspaceData, Workspace, FolderTemplate }