import { Button } from '@/components/ui/button'
import { LogOut, Folder } from 'lucide-react'

export interface Workspace {
  id: string
  name: string
  createdAt: string
  lastModified: string
}

interface WorkspaceSelectorProps {
  currentWorkspace: string
  currentWorkspaceName: string
  onWorkspaceLeave: () => void
}

export function WorkspaceSelector({
  currentWorkspace,
  currentWorkspaceName,
  onWorkspaceLeave
}: WorkspaceSelectorProps) {

  return (
    <div className="space-y-3 mb-4">
      {/* Current Workspace Display */}
      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Folder className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {currentWorkspaceName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Current workspace
            </div>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onWorkspaceLeave}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2 px-2 py-1 h-auto text-xs flex-shrink-0"
          title="Leave workspace"
        >
          <LogOut className="w-3 h-3 mr-1" />
          Leave
        </Button>
      </div>

    </div>
  )
}