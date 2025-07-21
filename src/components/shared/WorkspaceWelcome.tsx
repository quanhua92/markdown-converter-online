import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FolderPlus, 
  Users, 
  FileArchive, 
  Sparkles,
  Folder,
  Briefcase,
  Github,
  GitBranch
} from 'lucide-react'
import { TemplateQuickActions } from './TemplateSelector'

interface WorkspaceWelcomeProps {
  workspaces: Array<{
    id: string
    name: string
    createdAt: string
    lastModified: string
  }>
  onJoinWorkspace: (workspaceId: string) => void
  onCreateWorkspace: (name: string) => void
  onImportFromZip: (file: File) => void
  onInitFromTemplate: (templateKey: string) => void
  onCreateGitWorkspace?: () => void
}

export function WorkspaceWelcome({
  workspaces,
  onJoinWorkspace,
  onCreateWorkspace, 
  onImportFromZip,
  onInitFromTemplate,
  onCreateGitWorkspace
}: WorkspaceWelcomeProps) {
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName.trim())
      setNewWorkspaceName('')
      setShowCreateDialog(false)
    }
  }

  const handleImportZip = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.zip'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        onImportFromZip(file)
      }
    }
    input.click()
  }

  const availableWorkspaces = workspaces.filter(w => w.id !== 'current')

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
            <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl lg:text-3xl">Welcome to Markdown Explorer</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Get started by choosing how you'd like to work with your markdown files
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Join Existing Workspace */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200 dark:hover:border-blue-800"
                  onClick={() => setShowJoinDialog(true)}
                  data-testid="join-workspace-card">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Join Existing Workspace</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect to a workspace you've worked with before
                </p>
                <div className="mt-4">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    {availableWorkspaces.length} available
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Create New Workspace */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-200 dark:hover:border-green-800"
                  onClick={() => setShowCreateDialog(true)}
                  data-testid="create-workspace-card">
              <CardContent className="p-6 text-center">
                <FolderPlus className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Create New Workspace</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start fresh with a new empty workspace
                </p>
              </CardContent>
            </Card>

            {/* Create Git Workspace */}
            {onCreateGitWorkspace && (
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-indigo-200 dark:hover:border-indigo-800"
                    onClick={onCreateGitWorkspace}
                    data-testid="create-git-workspace-card">
                <CardContent className="p-6 text-center">
                  <div className="relative">
                    <Github className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                    <GitBranch className="w-6 h-6 text-indigo-500 absolute -top-1 -right-1" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Create Git Workspace</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connect to a GitHub repository for collaborative editing
                  </p>
                  <div className="mt-3">
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                      Requires GitHub
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Import from ZIP */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200 dark:hover:border-purple-800"
                  onClick={handleImportZip}
                  data-testid="import-zip-card">
              <CardContent className="p-6 text-center">
                <FileArchive className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Import from ZIP</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload and extract a ZIP file containing markdown files
                </p>
              </CardContent>
            </Card>

            {/* Initialize from Template */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-200 dark:hover:border-orange-800">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Initialize from Template</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Start with pre-built markdown templates
                </p>
                <TemplateQuickActions 
                  onTemplateSelect={(templateKey) => onInitFromTemplate(templateKey)}
                  className="justify-center"
                  variant="compact"
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Join Workspace Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join Existing Workspace</DialogTitle>
            <DialogDescription>
              Select a workspace to continue working with your files
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {availableWorkspaces.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No existing workspaces found</p>
                <p className="text-sm">Create a new workspace to get started</p>
              </div>
            ) : (
              availableWorkspaces.map((workspace) => (
                <Card 
                  key={workspace.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    onJoinWorkspace(workspace.id)
                    setShowJoinDialog(false)
                  }}
                  data-testid={`workspace-item-${workspace.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div className="flex-1">
                        <h4 className="font-medium">{workspace.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last modified: {new Date(workspace.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Workspace Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Give your new workspace a name to get started
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="My Project"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
                data-testid="workspace-name-input"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim()}
              data-testid="create-workspace-btn"
            >
              Create Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}