import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, Plus, Trash2, Edit3, Sparkles } from 'lucide-react'
import { TemplateSelector } from './TemplateSelector'

export interface FileSystemItem {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  content?: string
  children?: FileSystemItem[]
  isExpanded?: boolean
}

interface FileTreeProps {
  items: FileSystemItem[]
  selectedFile?: string
  onFileSelect: (item: FileSystemItem) => void
  onCreateFile: (parentPath: string, name: string) => void
  onCreateFolder: (parentPath: string, name: string) => void
  onDeleteItem: (item: FileSystemItem) => void
  onRenameItem: (item: FileSystemItem, newName: string) => void
  onToggleFolder: (item: FileSystemItem) => void
  onInitializeTemplate?: (items: FileSystemItem[]) => void
  showTemplateOptions?: boolean
}

interface FileTreeItemProps {
  item: FileSystemItem
  level: number
  selectedFile?: string
  onFileSelect: (item: FileSystemItem) => void
  onCreateFile: (parentPath: string, name: string) => void
  onCreateFolder: (parentPath: string, name: string) => void
  onDeleteItem: (item: FileSystemItem) => void
  onRenameItem: (item: FileSystemItem, newName: string) => void
  onToggleFolder: (item: FileSystemItem) => void
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
      onRenameItem(item, newName.trim())
    }
    setIsRenaming(false)
    setNewName('')
  }

  const startRename = () => {
    setNewName(item.name)
    setIsRenaming(true)
  }

  const isSelected = selectedFile === item.path

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {item.type === 'folder' && (
          <button
            onClick={() => onToggleFolder(item)}
            className="p-0 w-4 h-4 flex items-center justify-center"
          >
            {item.isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}
        
        {item.type === 'file' && <div className="w-4" />}
        
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
            className="flex-1 text-sm"
            onClick={() => item.type === 'file' && onFileSelect(item)}
            data-testid={`file-tree-item-${item.name}`}
          >
            {item.name}
          </span>
        )}

        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
          {item.type === 'folder' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setIsCreating('file')}
                title="New file"
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setIsCreating('folder')}
                title="New folder"
              >
                <Folder className="w-3 h-3" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={startRename}
            title="Rename"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onDeleteItem(item)}
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
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

      {item.type === 'folder' && item.isExpanded && item.children && (
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
  showTemplateOptions = true
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
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            File Explorer
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