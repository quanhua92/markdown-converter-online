import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, Plus, Trash2, Edit3, Sparkles, MoreVertical } from 'lucide-react'
// Remove TemplateSelector import to avoid circular dependency
import { WorkspaceSelector } from './WorkspaceSelector'
// Define FileSystemItem interface here to be exported
export interface FileSystemItem {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  content?: string
  children?: FileSystemItem[]
  isExpanded?: boolean
}

// Export a concrete value to ensure the interface is properly exported
export const FileSystemItemType = 'FileSystemItem' as const

interface FileTreeProps {
  items: FileSystemItem[]
  selectedFile?: string
  onFileSelect: (item: FileSystemItem) => void
  onCreateFile: (parentPath: string, name: string) => void
  onCreateFolder: (parentPath: string, name: string) => void
  onDeleteItem: (path: string) => void
  onRenameItem: (path: string, newName: string) => void
  onToggleFolder: (path: string) => void
  onInitializeTemplate?: (items: FileSystemItem[]) => void
  showTemplateOptions?: boolean
  // Workspace management props
  currentWorkspaceId?: string
  currentWorkspaceName?: string
  workspaces?: Array<{id: string, name: string, createdAt: string, lastModified: string}>
  onWorkspaceJoin?: (workspaceId: string) => void
  onWorkspaceLeave?: () => void
  onWorkspaceCreate?: (name: string) => void
}

interface FileTreeItemProps {
  item: FileSystemItem
  level: number
  selectedFile?: string
  onFileSelect: (item: FileSystemItem) => void
  onCreateFile: (parentPath: string, name: string) => void
  onCreateFolder: (parentPath: string, name: string) => void
  onDeleteItem: (path: string) => void
  onRenameItem: (path: string, newName: string) => void
  onToggleFolder: (path: string) => void
}

function FileTreeItem({
  item,
  level,
  selectedFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteItem,
  onRenameItem,
  onToggleFolder
}: FileTreeItemProps) {
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleCreate = (type: 'file' | 'folder') => {
    if (newName.trim()) {
      if (type === 'file') {
        onCreateFile(item.path, newName.trim())
      } else {
        onCreateFolder(item.path, newName.trim())
      }
      setNewName('')
      setIsCreating(null)
    }
  }

  const handleRename = () => {
    if (newName.trim() && newName !== item.name) {
      onRenameItem(item.path, newName.trim())
    }
    setIsRenaming(false)
    setNewName('')
  }

  const startRename = () => {
    setNewName(item.name)
    setIsRenaming(true)
  }

  const isSelected = selectedFile === item.path

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleMenuAction = (action: string) => {
    setIsMenuOpen(false)
    switch (action) {
      case 'toggle':
        console.log('🔧 handleMenuAction: toggle called for item', item)
        console.log('🔧 handleMenuAction: item.path is', item.path)
        console.log('🔧 handleMenuAction: item.name is', item.name)
        console.log('🔧 handleMenuAction: item keys:', Object.keys(item))
        console.log('🔧 handleMenuAction: item type:', item.type)
        console.log('🔧 handleMenuAction: item id:', item.id)
        onToggleFolder(item.path)
        break
      case 'rename':
        startRename()
        break
      case 'delete':
        onDeleteItem(item.path)
        break
      case 'newFile':
        setIsCreating('file')
        break
      case 'newFolder':
        setIsCreating('folder')
        break
    }
  }

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {item.type === 'folder' && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFolder(item.path)
            }}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded touch-manipulation"
            title="Toggle folder"
          >
            {item.isExpanded ? (
              <ChevronDown className="w-4 h-4 pointer-events-none" />
            ) : (
              <ChevronRight className="w-4 h-4 pointer-events-none" />
            )}
          </button>
        )}
        
        {item.type === 'file' && <div className="min-w-[44px]" />}
        
        {item.type === 'folder' ? (
          item.isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-600" />
          ) : (
            <Folder className="w-4 h-4 text-blue-600" />
          )
        ) : (
          <File className="w-4 h-4 text-gray-600" />
        )}

        {isRenaming ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') {
                setIsRenaming(false)
                setNewName('')
              }
            }}
            onBlur={handleRename}
            className="h-6 text-sm flex-1"
            autoFocus
          />
        ) : (
          <span
            className="flex-1 text-sm cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              if (item.type === 'file') {
                onFileSelect(item)
              } else if (item.type === 'folder') {
                onToggleFolder(item.path)
              }
            }}
            data-testid={`file-tree-item-${item.name}`}
          >
            {item.name}
          </span>
        )}

        <div className="relative" ref={menuRef}>
          <Button
            size="sm"
            variant="ghost"
            className="min-h-[44px] min-w-[44px] p-2 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
            title="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[100] min-w-[140px]">
              <div className="py-1">
                {item.type === 'folder' && (
                  <>
                    <button
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 touch-manipulation min-h-[44px]"
                      onClick={() => handleMenuAction('toggle')}
                    >
                      {item.isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      {item.isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                    <button
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 touch-manipulation min-h-[44px]"
                      onClick={() => handleMenuAction('newFile')}
                    >
                      <Plus className="w-4 h-4" />
                      New File
                    </button>
                    <button
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 touch-manipulation min-h-[44px]"
                      onClick={() => handleMenuAction('newFolder')}
                    >
                      <Folder className="w-4 h-4" />
                      New Folder
                    </button>
                  </>
                )}
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 touch-manipulation min-h-[44px]"
                  onClick={() => handleMenuAction('rename')}
                >
                  <Edit3 className="w-4 h-4" />
                  Rename
                </button>
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-red-600 dark:text-red-400 touch-manipulation min-h-[44px]"
                  onClick={() => handleMenuAction('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCreating && (
        <div
          className="flex items-center gap-2 py-1 px-2"
          style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
        >
          {isCreating === 'file' ? (
            <File className="w-4 h-4 text-gray-600" />
          ) : (
            <Folder className="w-4 h-4 text-blue-600" />
          )}
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate(isCreating)
              if (e.key === 'Escape') {
                setIsCreating(null)
                setNewName('')
              }
            }}
            onBlur={() => handleCreate(isCreating)}
            placeholder={`New ${isCreating}...`}
            className="h-6 text-sm flex-1"
            autoFocus
          />
        </div>
      )}

      {item.type === 'folder' && item.isExpanded === true && item.children && (
        <div className="group">
          {item.children.map((child) => (
            <FileTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDeleteItem={onDeleteItem}
              onRenameItem={onRenameItem}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree({
  items,
  selectedFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteItem,
  onRenameItem,
  onToggleFolder,
  onInitializeTemplate,
  showTemplateOptions = true,
  currentWorkspaceId,
  currentWorkspaceName,
  workspaces,
  onWorkspaceJoin,
  onWorkspaceLeave,
  onWorkspaceCreate
}: FileTreeProps) {
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null)
  const [newName, setNewName] = useState('')

  const handleRootCreate = (type: 'file' | 'folder') => {
    if (newName.trim()) {
      if (type === 'file') {
        onCreateFile('/', newName.trim())
      } else {
        onCreateFolder('/', newName.trim())
      }
      setNewName('')
      setIsCreating(null)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        {/* Workspace Selector */}
        {currentWorkspaceId && onWorkspaceLeave && (
          <WorkspaceSelector
            currentWorkspace={currentWorkspaceId}
            currentWorkspaceName={currentWorkspaceName || 'Default Workspace'}
            onWorkspaceLeave={onWorkspaceLeave}
          />
        )}
        
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Files
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreating('file')}
              title="New file"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreating('folder')}
              title="New folder"
            >
              <Folder className="w-4 h-4" />
            </Button>
            {/* Temporarily disabled to avoid circular dependency
            {showTemplateOptions && onInitializeTemplate && (
              <TemplateSelector
                onTemplateSelect={onInitializeTemplate}
                trigger={
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Initialize from template"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                }
              />
            )}
            */}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 max-h-[600px] overflow-auto">
          {isCreating && (
            <div className="flex items-center gap-2 py-1 px-2">
              {isCreating === 'file' ? (
                <File className="w-4 h-4 text-gray-600" />
              ) : (
                <Folder className="w-4 h-4 text-blue-600" />
              )}
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRootCreate(isCreating)
                  if (e.key === 'Escape') {
                    setIsCreating(null)
                    setNewName('')
                  }
                }}
                onBlur={() => handleRootCreate(isCreating)}
                placeholder={`New ${isCreating}...`}
                className="h-6 text-sm flex-1"
                autoFocus
              />
            </div>
          )}
          
          <div className="group">
            {items.map((item) => (
              <FileTreeItem
                key={item.id}
                item={item}
                level={0}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
                onDeleteItem={onDeleteItem}
                onRenameItem={onRenameItem}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}