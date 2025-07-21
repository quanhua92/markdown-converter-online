import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

/**
 * GitHub OAuth callback route
 * This route handles the redirect from GitHub after OAuth authorization
 */
export const Route = createFileRoute('/auth/github/callback')({
  component: GitHubCallback
})

function GitHubCallback() {
  useEffect(() => {
    // The actual OAuth handling is done in the GitHubAuthProvider
    // This component just ensures the route exists and can display a loading state
    
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    
    if (error) {
      console.error('GitHub OAuth error:', error)
    } else if (code) {
      console.log('GitHub OAuth code received, processing...')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Authenticating with GitHub
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please wait while we complete your authentication...
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You will be redirected automatically once authentication is complete.
          </p>
        </div>
      </div>
    </div>
  )
}