// Re-export FileSystemItem from FileTree to avoid circular dependency
export type { FileSystemItem } from './FileTree'

// Workspace management types
export interface WorkspaceData {
  id: string
  name: string
  createdAt: string
  lastModified: string
  files: FileSystemItem[]
}

export interface Workspace {
  id: string
  name: string
  createdAt: string
  lastModified: string
}

// Template types
export interface FolderTemplate {
  id: string
  name: string
  description: string
  icon: string
  structure: Omit<FileSystemItem, 'id'>[]
}