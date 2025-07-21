import { Octokit } from 'octokit'
import type { 
  GitRepository, 
  GitUser, 
  GitBranch, 
  GitCommit, 
  GitFile,
  GitHubOAuthConfig,
  RateLimitInfo
} from '../types/git'

/**
 * GitHub API configuration and utilities
 */
export class GitHubAPI {
  private octokit: Octokit
  private rateLimitInfo: RateLimitInfo | null = null

  constructor(authToken: string) {
    this.octokit = new Octokit({
      auth: authToken,
      userAgent: 'markdown-converter-online/1.0.0',
      baseUrl: 'https://api.github.com',
      log: {
        debug: (message) => console.debug('🐙 GitHub API Debug:', message),
        info: (message) => console.info('🐙 GitHub API Info:', message),
        warn: (message) => console.warn('🐙 GitHub API Warning:', message),
        error: (message) => console.error('🐙 GitHub API Error:', message)
      }
    })

    // Set up rate limit monitoring
    this.setupRateLimitMonitoring()
  }

  private setupRateLimitMonitoring() {
    // Monitor rate limit headers in responses
    this.octokit.hook.after('request', async (response) => {
      const rateLimitRemaining = response.headers['x-ratelimit-remaining']
      const rateLimitLimit = response.headers['x-ratelimit-limit']
      const rateLimitReset = response.headers['x-ratelimit-reset']
      const rateLimitUsed = response.headers['x-ratelimit-used']
      const rateLimitResource = response.headers['x-ratelimit-resource']

      if (rateLimitRemaining && rateLimitLimit && rateLimitReset) {
        this.rateLimitInfo = {
          remaining: parseInt(rateLimitRemaining),
          limit: parseInt(rateLimitLimit),
          reset: parseInt(rateLimitReset),
          used: parseInt(rateLimitUsed || '0'),
          resource: rateLimitResource || 'core'
        }

        // Warn if rate limit is getting low
        if (this.rateLimitInfo.remaining < 100) {
          console.warn('⚠️ GitHub API rate limit getting low:', this.rateLimitInfo)
        }
      }
    })
  }

  /**
   * Get current rate limit status
   */
  async getRateLimit(): Promise<RateLimitInfo> {
    try {
      const response = await this.octokit.rest.rateLimit.get()
      const coreLimit = response.data.rate
      
      this.rateLimitInfo = {
        limit: coreLimit.limit,
        remaining: coreLimit.remaining,
        reset: coreLimit.reset,
        used: coreLimit.used,
        resource: 'core'
      }
      
      return this.rateLimitInfo
    } catch (error) {
      console.error('Failed to get rate limit:', error)
      throw error
    }
  }

  /**
   * Get authenticated user information
   */
  async getAuthenticatedUser(): Promise<GitUser> {
    try {
      const response = await this.octokit.rest.users.getAuthenticated()
      return this.mapToGitUser(response.data)
    } catch (error) {
      console.error('Failed to get authenticated user:', error)
      throw error
    }
  }

  /**
   * List repositories for the authenticated user
   */
  async listRepositories(options: {
    visibility?: 'all' | 'public' | 'private'
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  } = {}): Promise<GitRepository[]> {
    try {
      const response = await this.octokit.rest.repos.listForAuthenticatedUser({
        visibility: options.visibility || 'all',
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      })
      
      return response.data.map(repo => this.mapToGitRepository(repo))
    } catch (error) {
      console.error('Failed to list repositories:', error)
      throw error
    }
  }

  /**
   * Get a specific repository
   */
  async getRepository(owner: string, repo: string): Promise<GitRepository> {
    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo
      })
      
      return this.mapToGitRepository(response.data)
    } catch (error) {
      console.error(`Failed to get repository ${owner}/${repo}:`, error)
      throw error
    }
  }

  /**
   * List branches for a repository
   */
  async listBranches(owner: string, repo: string): Promise<GitBranch[]> {
    try {
      const response = await this.octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100
      })
      
      return response.data.map(branch => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha,
          url: branch.commit.url
        },
        protected: branch.protected
      }))
    } catch (error) {
      console.error(`Failed to list branches for ${owner}/${repo}:`, error)
      throw error
    }
  }

  /**
   * Get a specific file from a repository
   */
  async getFile(owner: string, repo: string, path: string, ref?: string): Promise<GitFile> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: ref || 'HEAD'
      })

      // Handle the case where the response is an array (directory) or single file
      if (Array.isArray(response.data)) {
        throw new Error(`Path ${path} is a directory, not a file`)
      }

      const fileData = response.data
      
      // Decode base64 content if needed
      let content = ''
      if (fileData.encoding === 'base64' && fileData.content) {
        content = atob(fileData.content.replace(/\s/g, ''))
      } else if (fileData.content) {
        content = fileData.content
      }

      return {
        path: fileData.path,
        content,
        sha: fileData.sha,
        size: fileData.size,
        encoding: (fileData.encoding as 'base64' | 'utf-8') || 'utf-8',
        type: fileData.type as 'file' | 'dir',
        mode: '100644', // Default file mode
        url: fileData.url,
        git_url: fileData.git_url || '',
        html_url: fileData.html_url || '',
        download_url: fileData.download_url
      }
    } catch (error) {
      console.error(`Failed to get file ${path} from ${owner}/${repo}:`, error)
      throw error
    }
  }

  /**
   * Create or update a file in a repository
   */
  async createOrUpdateFile(
    owner: string, 
    repo: string, 
    path: string, 
    content: string, 
    message: string,
    sha?: string,
    branch?: string
  ): Promise<{ commit: GitCommit; content: GitFile }> {
    try {
      const response = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: btoa(content), // Base64 encode content
        sha, // Required for updates
        branch
      })

      return {
        commit: this.mapToGitCommit(response.data.commit),
        content: this.mapToGitFile(response.data.content)
      }
    } catch (error) {
      console.error(`Failed to create/update file ${path} in ${owner}/${repo}:`, error)
      throw error
    }
  }

  /**
   * Delete a file from a repository
   */
  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch?: string
  ): Promise<GitCommit> {
    try {
      const response = await this.octokit.rest.repos.deleteFile({
        owner,
        repo,
        path,
        message,
        sha,
        branch
      })

      return this.mapToGitCommit(response.data.commit)
    } catch (error) {
      console.error(`Failed to delete file ${path} from ${owner}/${repo}:`, error)
      throw error
    }
  }

  /**
   * Get commit history for a repository
   */
  async getCommitHistory(
    owner: string, 
    repo: string, 
    options: {
      sha?: string
      path?: string
      per_page?: number
      page?: number
    } = {}
  ): Promise<GitCommit[]> {
    try {
      const response = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        sha: options.sha,
        path: options.path,
        per_page: options.per_page || 20,
        page: options.page || 1
      })

      return response.data.map(commit => this.mapToGitCommit(commit))
    } catch (error) {
      console.error(`Failed to get commit history for ${owner}/${repo}:`, error)
      throw error
    }
  }

  // Mapping functions to convert GitHub API responses to our types
  private mapToGitUser(user: any): GitUser {
    return {
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url
    }
  }

  private mapToGitRepository(repo: any): GitRepository {
    return {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      owner: this.mapToGitUser(repo.owner),
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      default_branch: repo.default_branch,
      permissions: repo.permissions
    }
  }

  private mapToGitCommit(commit: any): GitCommit {
    return {
      sha: commit.sha,
      message: commit.commit?.message || commit.message || '',
      author: {
        name: commit.commit?.author?.name || commit.author?.login || '',
        email: commit.commit?.author?.email || '',
        date: commit.commit?.author?.date || commit.created_at || ''
      },
      committer: {
        name: commit.commit?.committer?.name || commit.committer?.login || '',
        email: commit.commit?.committer?.email || '',
        date: commit.commit?.committer?.date || commit.created_at || ''
      },
      url: commit.url || '',
      html_url: commit.html_url || '',
      parents: commit.parents || [],
      tree: commit.commit?.tree || { sha: '', url: '' }
    }
  }

  private mapToGitFile(file: any): GitFile {
    return {
      path: file.path,
      content: file.content ? atob(file.content.replace(/\s/g, '')) : '',
      sha: file.sha,
      size: file.size,
      encoding: file.encoding || 'utf-8',
      type: file.type,
      mode: file.mode || '100644',
      url: file.url,
      git_url: file.git_url || '',
      html_url: file.html_url || '',
      download_url: file.download_url
    }
  }

  /**
   * Get the underlying Octokit instance for advanced operations
   */
  getOctokit(): Octokit {
    return this.octokit
  }

  /**
   * Get current rate limit info
   */
  getCurrentRateLimit(): RateLimitInfo | null {
    return this.rateLimitInfo
  }
}

/**
 * Create GitHub OAuth configuration
 */
export function createGitHubOAuthConfig(): GitHubOAuthConfig {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
  
  if (!clientId) {
    throw new Error('VITE_GITHUB_CLIENT_ID environment variable is required')
  }

  return {
    clientId,
    redirectUri: `${window.location.origin}/auth/github/callback`,
    scopes: ['repo', 'user', 'read:org'],
    state: generateSecureState()
  }
}

/**
 * Generate a secure state parameter for OAuth
 */
function generateSecureState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Build GitHub OAuth authorization URL
 */
export function buildGitHubAuthUrl(config: GitHubOAuthConfig): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state: config.state,
    response_type: 'code'
  })

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

/**
 * Factory function to create a GitHubAPI instance
 */
export function createGitHubAPI(authToken: string): GitHubAPI {
  return new GitHubAPI(authToken)
}