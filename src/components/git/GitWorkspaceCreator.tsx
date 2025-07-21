import React, { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '../ui/dialog'
import { GitHubAuth, GitHubAuthRequired } from './GitHubAuth'
import { RepositoryBrowser } from './RepositoryBrowser'
import { useGitHubAuth } from '../../auth/useGitHubAuth'
import type { GitRepository } from '../../types/git'

interface GitWorkspaceCreatorProps {
  isOpen: boolean
  onClose: () => void
  onCreateWorkspace: (repository: GitRepository, branch: string, workspaceName: string) => Promise<void>
}

export function GitWorkspaceCreator({ 
  isOpen, 
  onClose, 
  onCreateWorkspace 
}: GitWorkspaceCreatorProps) {
  const { isAuthenticated } = useGitHubAuth()
  const [showRepositoryBrowser, setShowRepositoryBrowser] = useState(false)

  const handleAuthComplete = () => {
    // Once authenticated, show repository browser
    setShowRepositoryBrowser(true)
  }

  const handleRepositorySelect = async (repository: GitRepository, branch: string) => {
    try {
      // Generate workspace name from repository
      const workspaceName = `${repository.name} (${branch})`
      
      await onCreateWorkspace(repository, branch, workspaceName)
      
      // Close all dialogs
      setShowRepositoryBrowser(false)
      onClose()
    } catch (error) {
      console.error('Failed to create Git workspace:', error)
      // Keep dialogs open to show error state
    }
  }

  const handleClose = () => {
    setShowRepositoryBrowser(false)
    onClose()
  }

  return (
    <>
      {/* Main Git Workspace Creation Dialog */}
      <Dialog open={isOpen && !showRepositoryBrowser} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Git Workspace</DialogTitle>
            <DialogDescription>
              Connect to a GitHub repository to create a collaborative workspace
            </DialogDescription>
          </DialogHeader>

          <GitHubAuthRequired
            fallback={
              <GitHubAuth onAuthStateChange={(authenticated) => {
                if (authenticated) {
                  handleAuthComplete()
                }
              }} />
            }
          >
            <div className="space-y-4">
              <div className="text-center py-6">
                <h3 className="text-lg font-semibold mb-2">GitHub Connected!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You can now browse and select a repository to create your Git workspace.
                </p>
                
                <button
                  onClick={handleAuthComplete}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Browse Repositories
                </button>
              </div>
            </div>
          </GitHubAuthRequired>
        </DialogContent>
      </Dialog>

      {/* Repository Browser Dialog */}
      {isAuthenticated && (
        <RepositoryBrowser
          isOpen={showRepositoryBrowser}
          onClose={handleClose}
          onSelectRepository={handleRepositorySelect}
        />
      )}
    </>
  )
}