import React from 'react'
import { useGitHubAuth } from '../../auth/useGitHubAuth'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { GitBranch, Github, LogOut, AlertCircle, Loader2 } from 'lucide-react'

interface GitHubAuthProps {
  onAuthStateChange?: (isAuthenticated: boolean) => void
}

/**
 * GitHub authentication component with status display and controls
 */
export function GitHubAuth({ onAuthStateChange }: GitHubAuthProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    error, 
    login, 
    logout, 
    clearError 
  } = useGitHubAuth()

  // Notify parent of auth state changes
  React.useEffect(() => {
    onAuthStateChange?.(isAuthenticated)
  }, [isAuthenticated, onAuthStateChange])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Checking GitHub authentication...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearError}
            className="ml-2"
          >
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="text-center p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <Github className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Connect to GitHub</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Connect your GitHub account to create Git-backed workspaces, collaborate on repositories, and sync your markdown files.
          </p>
          <Button onClick={login} className="gap-2">
            <Github className="h-4 w-4" />
            Sign in with GitHub
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><strong>Required permissions:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Access to your repositories (repo)</li>
            <li>Read your profile information (user)</li>
            <li>Read organization membership (read:org)</li>
          </ul>
          <p className="mt-2">
            Your tokens are encrypted and stored securely in your browser.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* User Info */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
        <img 
          src={user?.avatar_url} 
          alt={user?.name || user?.login} 
          className="h-10 w-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-green-900 dark:text-green-100">
              {user?.name || user?.login}
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              <Github className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
          {user?.email && (
            <span className="text-sm text-green-700 dark:text-green-300">
              {user.email}
            </span>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="gap-2 border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>

      {/* Features Available */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-2">Available features:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-green-600" />
            <span>Create Git workspaces</span>
          </div>
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-green-600" />
            <span>Access your repositories</span>
          </div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-green-600" />
            <span>Branch management</span>
          </div>
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-green-600" />
            <span>Collaborative editing</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact GitHub auth status component for headers/toolbars
 */
export function GitHubAuthStatus() {
  const { isAuthenticated, isLoading, user, login, logout } = useGitHubAuth()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" onClick={login} className="gap-2">
        <Github className="h-4 w-4" />
        Connect GitHub
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <img 
        src={user?.avatar_url} 
        alt={user?.name || user?.login} 
        className="h-6 w-6 rounded-full"
      />
      <span className="text-sm font-medium">{user?.login}</span>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={logout}
        className="h-6 w-6 p-0"
      >
        <LogOut className="h-3 w-3" />
      </Button>
    </div>
  )
}

/**
 * Authentication required wrapper component
 */
interface AuthRequiredProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function GitHubAuthRequired({ children, fallback }: AuthRequiredProps) {
  const { isAuthenticated, isLoading } = useGitHubAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        {fallback || <GitHubAuth />}
      </div>
    )
  }

  return <>{children}</>
}