import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { LogOut, LogIn, Plus, Folder } from 'lucide-react'

export interface Workspace {
  id: string
  name: string
  createdAt: string
  lastModified: string
}

interface WorkspaceSelectorProps {
  currentWorkspace: string
  currentWorkspaceName: string
  workspaces?: Workspace[]
  onWorkspaceLeave: () => void
  onWorkspaceJoin: (workspaceId: string) => void
  onWorkspaceCreate: (name: string) => void
}

export function WorkspaceSelector({
  currentWorkspace,
  currentWorkspaceName,
  workspaces = [],
  onWorkspaceLeave,
  onWorkspaceJoin,
  onWorkspaceCreate
}: WorkspaceSelectorProps) {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      onWorkspaceCreate(newWorkspaceName.trim())
      setNewWorkspaceName('')
      setIsCreateDialogOpen(false)
    }
  }

  const handleJoinWorkspace = (workspaceId: string) => {
    onWorkspaceJoin(workspaceId)
    setIsJoinDialogOpen(false)
  }

  const availableWorkspaces = workspaces.filter(w => w.id !== currentWorkspace)

  return (
    <div className="space-y-3 mb-4">
      {/* Current Workspace Display */}
      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {currentWorkspaceName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Current workspace
            </div>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onWorkspaceLeave}
          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
          title="Leave workspace"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Leave
        </Button>
      </div>

      {/* Join/Create Actions */}
      <div className="flex gap-2">
        {/* Join Existing Workspace */}
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex-1">
              <LogIn className="w-4 h-4 mr-1" />
              Join Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Workspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {availableWorkspaces.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select a workspace to join:
                  </p>
                  {availableWorkspaces.map((workspace) => (
                    <div 
                      key={workspace.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        <span>{workspace.name}</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleJoinWorkspace(workspace.id)}
                      >
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No other workspaces available to join.
                </p>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create New Workspace */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex-1">
              <Plus className="w-4 h-4 mr-1" />
              Create New
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
                  Create & Join
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}