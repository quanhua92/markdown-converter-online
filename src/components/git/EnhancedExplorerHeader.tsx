import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Sun,
  Moon,
  Github,
  GitBranch
} from 'lucide-react'
import { GitHubAuthStatus } from './GitHubAuth'
import { GitStatusCompact } from './GitStatus'
import type { GitSyncStatus } from '../../types/git'

interface EnhancedExplorerHeaderProps {
  workspaceName: string
  workspaceType: 'local' | 'git' | null
  repositoryUrl?: string
  currentBranch?: string
  syncStatus?: GitSyncStatus | null
  hasUnsavedChanges?: boolean
  isSyncing?: boolean
  onLeaveWorkspace: () => void
  onSyncWithRemote?: () => Promise<void>
  fileTreeCollapsed: boolean
  onToggleFileTree: () => void
  isDarkMode: boolean
  onToggleTheme: () => void
}

export function EnhancedExplorerHeader({
  workspaceName,
  workspaceType,
  repositoryUrl,
  currentBranch,
  syncStatus,
  hasUnsavedChanges = false,
  isSyncing = false,
  onLeaveWorkspace,
  onSyncWithRemote,
  fileTreeCollapsed,
  onToggleFileTree,
  isDarkMode,
  onToggleTheme
}: EnhancedExplorerHeaderProps) {
  
  const getWorkspaceTypeIcon = () => {
    switch (workspaceType) {
      case 'git':
        return <Github className="h-4 w-4" />
      case 'local':
        return <PanelLeftOpen className="h-4 w-4" />
      default:
        return null
    }
  }

  const getWorkspaceTypeBadge = () => {
    switch (workspaceType) {
      case 'git':
        return (
          <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700">
            <Github className="h-3 w-3" />
            Git
          </Badge>
        )
      case 'local':
        return (
          <Badge variant="outline" className="gap-1">
            Local
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* File Tree Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFileTree}
            className="p-2"
          >
            {fileTreeCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          {/* Workspace Info */}
          <div className="flex items-center gap-2">
            {getWorkspaceTypeIcon()}
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-48">
              {workspaceName}
            </h1>
            {getWorkspaceTypeBadge()}
          </div>

          {/* Git Repository Info */}
          {workspaceType === 'git' && repositoryUrl && (
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>/</span>
              <span className="truncate max-w-32">
                {repositoryUrl.split('/').slice(-2).join('/')}
              </span>
              {currentBranch && (
                <>
                  <span>:</span>
                  <Badge variant="secondary" className="gap-1">
                    <GitBranch className="h-3 w-3" />
                    {currentBranch}
                  </Badge>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Git Status */}
          {workspaceType === 'git' && onSyncWithRemote && (
            <GitStatusCompact
              syncStatus={syncStatus}
              hasUnsavedChanges={hasUnsavedChanges}
              isSyncing={isSyncing}
              onSync={onSyncWithRemote}
            />
          )}

          {/* GitHub Auth Status */}
          {workspaceType === 'git' && (
            <GitHubAuthStatus />
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            className="p-2"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Leave Workspace */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeaveWorkspace}
            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Git Info */}
      {workspaceType === 'git' && repositoryUrl && (
        <div className="md:hidden mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Github className="h-3 w-3" />
          <span className="truncate">
            {repositoryUrl.split('/').slice(-2).join('/')}
          </span>
          {currentBranch && (
            <>
              <span>•</span>
              <Badge variant="secondary" className="gap-1 text-xs py-0">
                <GitBranch className="h-2 w-2" />
                {currentBranch}
              </Badge>
            </>
          )}
        </div>
      )}
    </header>
  )
}