import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { GitHubAPI, createGitHubOAuthConfig, buildGitHubAuthUrl } from '../api/github'
import { AuthStorage } from './authStorage'
import type { GitUser, AuthTokenData } from '../types/git'

interface GitHubAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: GitUser | null
  api: GitHubAPI | null
  error: string | null
}

interface GitHubAuthActions {
  login: () => void
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
}

interface GitHubAuthContextType extends GitHubAuthState, GitHubAuthActions {}

const GitHubAuthContext = createContext<GitHubAuthContextType | null>(null)

interface GitHubAuthProviderProps {
  children: ReactNode
}

/**
 * GitHub Authentication Provider Component
 */
export function GitHubAuthProvider({ children }: GitHubAuthProviderProps) {
  const [state, setState] = useState<GitHubAuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    api: null,
    error: null
  })

  /**
   * Initialize authentication state from stored tokens
   */
  const initializeAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Check if we have OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')

      if (error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: `GitHub OAuth error: ${error}` 
        }))
        return
      }

      if (code && state) {
        // Handle OAuth callback
        await handleOAuthCallback(code, state)
        return
      }

      // Try to load existing token
      const storedToken = await AuthStorage.getToken('github', 'default-user')
      
      if (storedToken && Date.now() < storedToken.expiresAt) {
        const api = new GitHubAPI(storedToken.accessToken)
        const user = await api.getAuthenticatedUser()
        
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
          user,
          api,
          error: null
        }))
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          user: null,
          api: null,
          error: null
        }))
      }
    } catch (error) {
      console.error('Failed to initialize GitHub auth:', error)
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        api: null,
        error: error instanceof Error ? error.message : 'Authentication initialization failed'
      }))
    }
  }, [])

  /**
   * Handle OAuth callback from GitHub
   */
  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      // Verify state parameter (basic CSRF protection)
      const storedState = sessionStorage.getItem('github-oauth-state')
      if (state !== storedState) {
        throw new Error('Invalid state parameter - possible CSRF attack')
      }

      // Exchange code for access token
      // Note: In a real app, this should be done through your backend for security
      const tokenResponse = await exchangeCodeForToken(code)
      
      if (!tokenResponse.access_token) {
        throw new Error('Failed to obtain access token')
      }

      // Create token data
      const tokenData: AuthTokenData = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: Date.now() + (tokenResponse.expires_in * 1000 || 8 * 60 * 60 * 1000), // 8 hours default
        scopes: tokenResponse.scope?.split(',') || ['repo', 'user'],
        tokenType: 'bearer'
      }

      // Store token securely
      await AuthStorage.storeToken('github', 'default-user', tokenData)

      // Create API instance and get user info
      const api = new GitHubAPI(tokenData.accessToken)
      const user = await api.getAuthenticatedUser()

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        user,
        api,
        error: null
      }))

      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
      sessionStorage.removeItem('github-oauth-state')
      
    } catch (error) {
      console.error('OAuth callback failed:', error)
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        api: null,
        error: error instanceof Error ? error.message : 'OAuth authentication failed'
      }))
    }
  }

  /**
   * Exchange authorization code for access token
   * Note: This is a simplified implementation. In production, this should be done through your backend.
   */
  const exchangeCodeForToken = async (code: string): Promise<any> => {
    // This is where you'd typically call your backend endpoint
    // For now, we'll throw an error since we need backend support
    throw new Error('Token exchange requires backend implementation. Please set up GitHub OAuth app and backend endpoint.')
  }

  /**
   * Initiate GitHub OAuth login
   */
  const login = useCallback(() => {
    try {
      const config = createGitHubOAuthConfig()
      
      // Store state for CSRF protection
      sessionStorage.setItem('github-oauth-state', config.state)
      
      // Redirect to GitHub
      const authUrl = buildGitHubAuthUrl(config)
      window.location.href = authUrl
      
    } catch (error) {
      console.error('Failed to initiate GitHub login:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initiate login'
      }))
    }
  }, [])

  /**
   * Logout and clear stored tokens
   */
  const logout = useCallback(async () => {
    try {
      await AuthStorage.removeToken('github', 'default-user')
      
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        api: null,
        error: null
      }))
      
      console.log('✅ GitHub logout successful')
    } catch (error) {
      console.error('Failed to logout:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed'
      }))
    }
  }, [])

  /**
   * Refresh the access token
   */
  const refreshToken = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      const storedToken = await AuthStorage.getToken('github', 'default-user')
      
      if (!storedToken?.refreshToken) {
        throw new Error('No refresh token available')
      }

      // Refresh token logic would go here
      // This requires backend support for GitHub OAuth
      throw new Error('Token refresh requires backend implementation')
      
    } catch (error) {
      console.error('Failed to refresh token:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      }))
    }
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const contextValue: GitHubAuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError
  }

  return (
    <GitHubAuthContext.Provider value={contextValue}>
      {children}
    </GitHubAuthContext.Provider>
  )
}

/**
 * Hook to use GitHub authentication
 */
export function useGitHubAuth(): GitHubAuthContextType {
  const context = useContext(GitHubAuthContext)
  
  if (!context) {
    throw new Error('useGitHubAuth must be used within a GitHubAuthProvider')
  }
  
  return context
}

/**
 * Helper hook for authentication status
 */
export function useGitHubAuthStatus() {
  const { isAuthenticated, isLoading, user, error } = useGitHubAuth()
  
  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    hasError: !!error
  }
}

/**
 * Helper hook for GitHub API access
 */
export function useGitHubAPI() {
  const { api, isAuthenticated } = useGitHubAuth()
  
  if (!isAuthenticated || !api) {
    throw new Error('GitHub API not available - user not authenticated')
  }
  
  return api
}