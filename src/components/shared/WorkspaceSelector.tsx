import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Folder, Trash2, Edit3 } from 'lucide-react'

export interface Workspace {
  id: string
  name: string
  createdAt: string
  lastModified: string
}

interface WorkspaceSelectorProps {
  currentWorkspace: string
  workspaces?: Workspace[]
  onWorkspaceChange: (workspaceId: string) => void
  onWorkspaceCreate: (name: string) => void
  onWorkspaceDelete: (workspaceId: string) => void
  onWorkspaceRename: (workspaceId: string, newName: string) => void
}

export function WorkspaceSelector({
  currentWorkspace,
  workspaces = [],
  onWorkspaceChange,
  onWorkspaceCreate,
  onWorkspaceDelete,
  onWorkspaceRename
}: WorkspaceSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [renamingWorkspace, setRenamingWorkspace] = useState<string | null>(null)

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      onWorkspaceCreate(newWorkspaceName.trim())
      setNewWorkspaceName('')
      setIsCreateDialogOpen(false)
    }
  }

  const handleDeleteWorkspace = (workspaceId: string) => {
    if (workspaces.length > 1) {
      onWorkspaceDelete(workspaceId)
    }
  }

  const handleRenameWorkspace = () => {
    if (renamingWorkspace && newWorkspaceName.trim()) {
      onWorkspaceRename(renamingWorkspace, newWorkspaceName.trim())
      setNewWorkspaceName('')
      setRenamingWorkspace(null)
      setIsRenameDialogOpen(false)
    }
  }

  const startRename = (workspace: Workspace) => {
    setRenamingWorkspace(workspace.id)
    setNewWorkspaceName(workspace.name)
    setIsRenameDialogOpen(true)
  }

  const currentWorkspaceData = workspaces.find(w => w.id === currentWorkspace)

  return (
    <div className="flex items-center gap-2 mb-4">
      <Select value={currentWorkspace} onValueChange={onWorkspaceChange}>
        <SelectTrigger className="flex-1">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              <span className="truncate">{currentWorkspaceData?.name || 'Select Workspace'}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  <span>{workspace.name}</span>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      startRename(workspace)
                    }}
                    className="h-6 w-6 p-0"
                    title="Rename workspace"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  {workspaces.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteWorkspace(workspace.id)
                      }}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      title="Delete workspace"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Create New Workspace Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" title="Create new workspace">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="workspace-name" className="text-sm font-medium">
                Workspace Name
              </label>
              <Input
                id="workspace-name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Enter workspace name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateWorkspace()
                  if (e.key === 'Escape') setIsCreateDialogOpen(false)
                }}
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Workspace Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="rename-workspace-name" className="text-sm font-medium">
                Workspace Name
              </label>
              <Input
                id="rename-workspace-name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Enter new workspace name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameWorkspace()
                  if (e.key === 'Escape') setIsRenameDialogOpen(false)
                }}
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRenameWorkspace} disabled={!newWorkspaceName.trim()}>
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}