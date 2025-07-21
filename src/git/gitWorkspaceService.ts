import { db, type GitWorkspaceData } from '../db/db'
import type { GitHubAPI } from '../api/github'
import type { GitDataAPI } from '../api/gitData'
import type { 
  GitRepository, 
  GitBranch, 
  GitWorkspaceConfig,
  GitSyncStatus,
  GitFileMetadata
} from '../types/git'
import type { FileSystemItem } from '../components/shared/FileTree'

/**
 * Service for managing Git-backed workspaces
 */
export class GitWorkspaceService {
  constructor(
    private github: GitHubAPI,
    private gitData: GitDataAPI
  ) {}

  /**
   * Create a new Git workspace from a repository
   */
  async createGitWorkspace(
    name: string,
    repository: GitRepository,
    branch: string = 'main'
  ): Promise<GitWorkspaceData> {
    try {
      const workspaceId = `git-workspace-${Date.now()}`
      
      // Initialize Git configuration
      const gitConfig: GitWorkspaceConfig = {
        repositoryUrl: repository.clone_url,
        owner: repository.owner.login,
        repo: repository.name,
        branch,
        defaultBranch: repository.default_branch,
        lastSyncCommit: '',
        collaborators: []
      }

      // Load initial files from repository
      const files = await this.loadRepositoryFiles(
        repository.owner.login,
        repository.name,
        branch
      )

      // Initialize sync status
      const syncStatus: GitSyncStatus = {
        hasLocalChanges: false,
        hasRemoteChanges: false,
        lastSyncTime: new Date().toISOString(),
        conflictedFiles: [],
        aheadBy: 0,
        behindBy: 0
      }

      const workspace: GitWorkspaceData = {
        id: workspaceId,
        name,
        type: 'git',
        files,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        gitConfig,
        syncStatus
      }

      // Save to database
      await db.gitWorkspaces.put(workspace)
      
      // Cache files in git files table
      await this.cacheRepositoryFiles(workspaceId, files, branch)

      console.log('✅ Git workspace created:', workspaceId)
      return workspace
    } catch (error) {
      console.error('Failed to create Git workspace:', error)
      throw error
    }
  }

  /**
   * Load files from a GitHub repository
   */
  private async loadRepositoryFiles(
    owner: string,
    repo: string,
    branch: string,
    path: string = ''
  ): Promise<FileSystemItem[]> {
    try {
      const octokit = this.github.getOctokit()
      
      // Get repository contents
      const { data: contents } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      })

      const items: FileSystemItem[] = []

      // Handle both single file and directory responses
      const contentArray = Array.isArray(contents) ? contents : [contents]

      for (const item of contentArray) {
        if (item.type === 'dir') {
          // Recursively load directory contents
          const children = await this.loadRepositoryFiles(owner, repo, branch, item.path)
          
          items.push({
            id: this.generateId(),
            name: item.name,
            type: 'folder',
            path: `/${item.path}`,
            isExpanded: false,
            children,
            gitMetadata: {
              sha: item.sha,
              lastCommitSha: '',
              lastModified: new Date().toISOString(),
              isModified: false,
              isStaged: false,
              conflictStatus: 'none',
              size: 0
            }
          })
        } else if (item.type === 'file') {
          // Load file content for markdown and text files
          let content = ''
          if (this.isTextFile(item.name)) {
            try {
              const file = await this.github.getFile(owner, repo, item.path, branch)
              content = file.content
            } catch (error) {
              console.warn(`Failed to load content for ${item.path}:`, error)
            }
          }

          items.push({
            id: this.generateId(),
            name: item.name,
            type: 'file',
            path: `/${item.path}`,
            content,
            gitMetadata: {
              sha: item.sha,
              lastCommitSha: '',
              lastModified: new Date().toISOString(),
              isModified: false,
              isStaged: false,
              conflictStatus: 'none',
              size: item.size || 0
            }
          })
        }
      }

      return items
    } catch (error) {
      console.error(`Failed to load repository files from ${owner}/${repo}:`, error)
      throw error
    }
  }

  /**
   * Cache repository files in IndexedDB
   */
  private async cacheRepositoryFiles(
    workspaceId: string,
    files: FileSystemItem[],
    branch: string
  ): Promise<void> {
    try {
      for (const file of files) {
        if (file.type === 'file' && file.content !== undefined) {
          await db.gitFiles.put({
            path: file.path,
            workspaceId,
            content: file.content,
            metadata: file.gitMetadata!,
            lastModified: new Date().toISOString()
          })
        }

        // Recursively cache children
        if (file.children) {
          await this.cacheRepositoryFiles(workspaceId, file.children, branch)
        }
      }
    } catch (error) {
      console.error('Failed to cache repository files:', error)
    }
  }

  /**
   * Sync workspace with remote repository
   */
  async syncWorkspace(workspaceId: string): Promise<{
    hasConflicts: boolean
    conflictedFiles: string[]
    newCommits: number
  }> {
    try {
      const workspace = await db.gitWorkspaces.get(workspaceId)
      if (!workspace || workspace.type !== 'git' || !workspace.gitConfig) {
        throw new Error('Invalid Git workspace')
      }

      const { owner, repo, branch } = workspace.gitConfig

      // Get latest commits from remote
      const latestCommits = await this.github.getCommitHistory(owner, repo, {
        sha: branch,
        per_page: 10
      })

      if (latestCommits.length === 0) {
        return { hasConflicts: false, conflictedFiles: [], newCommits: 0 }
      }

      const latestRemoteCommit = latestCommits[0].sha
      const lastSyncCommit = workspace.gitConfig.lastSyncCommit

      // Check if we're behind remote
      let newCommits = 0
      if (lastSyncCommit !== latestRemoteCommit) {
        // Count new commits
        const commitsSinceSync = latestCommits.findIndex(c => c.sha === lastSyncCommit)
        newCommits = commitsSinceSync === -1 ? latestCommits.length : commitsSinceSync
      }

      // Detect conflicts by comparing local changes with remote
      const conflictedFiles = await this.detectConflicts(workspace)

      // Update sync status
      workspace.syncStatus = {
        hasLocalChanges: await this.hasLocalChanges(workspaceId),
        hasRemoteChanges: newCommits > 0,
        lastSyncTime: new Date().toISOString(),
        conflictedFiles,
        aheadBy: 0, // TODO: Calculate commits ahead
        behindBy: newCommits
      }

      // Update last sync commit if no conflicts
      if (conflictedFiles.length === 0) {
        workspace.gitConfig.lastSyncCommit = latestRemoteCommit
      }

      workspace.lastModified = new Date().toISOString()
      await db.gitWorkspaces.put(workspace)

      return {
        hasConflicts: conflictedFiles.length > 0,
        conflictedFiles,
        newCommits
      }
    } catch (error) {
      console.error('Failed to sync workspace:', error)
      throw error
    }
  }

  /**
   * Commit local changes to repository
   */
  async commitChanges(
    workspaceId: string,
    commitMessage: string,
    author?: { name: string; email: string }
  ): Promise<{ success: boolean; hasConflict: boolean }> {
    try {
      const workspace = await db.gitWorkspaces.get(workspaceId)
      if (!workspace || workspace.type !== 'git' || !workspace.gitConfig) {
        throw new Error('Invalid Git workspace')
      }

      const { owner, repo, branch } = workspace.gitConfig

      // Get all modified files
      const modifiedFiles = await this.getModifiedFiles(workspaceId)
      
      if (modifiedFiles.length === 0) {
        return { success: true, hasConflict: false }
      }

      // Prepare files for commit
      const files = modifiedFiles.map(file => ({
        path: file.path.startsWith('/') ? file.path.slice(1) : file.path,
        content: file.content,
        mode: '100644'
      }))

      // Commit using Git Data API
      const result = await this.gitData.commitMultipleFiles({
        owner,
        repo,
        branch,
        files,
        commitMessage,
        author
      })

      if (!result.hasConflict) {
        // Update workspace sync status
        workspace.syncStatus = {
          ...workspace.syncStatus!,
          hasLocalChanges: false,
          lastSyncTime: new Date().toISOString()
        }

        workspace.gitConfig.lastSyncCommit = result.commit.sha
        workspace.lastModified = new Date().toISOString()
        await db.gitWorkspaces.put(workspace)

        // Mark files as no longer modified
        await this.markFilesAsCommitted(workspaceId, modifiedFiles.map(f => f.path))
      }

      return {
        success: !result.hasConflict,
        hasConflict: result.hasConflict
      }
    } catch (error) {
      console.error('Failed to commit changes:', error)
      throw error
    }
  }

  /**
   * Switch to a different branch
   */
  async switchBranch(workspaceId: string, branchName: string): Promise<void> {
    try {
      const workspace = await db.gitWorkspaces.get(workspaceId)
      if (!workspace || workspace.type !== 'git' || !workspace.gitConfig) {
        throw new Error('Invalid Git workspace')
      }

      const { owner, repo } = workspace.gitConfig

      // Check if branch exists
      const branches = await this.github.listBranches(owner, repo)
      const targetBranch = branches.find(b => b.name === branchName)
      
      if (!targetBranch) {
        throw new Error(`Branch ${branchName} not found`)
      }

      // Load files from the new branch
      const newFiles = await this.loadRepositoryFiles(owner, repo, branchName)

      // Update workspace
      workspace.files = newFiles
      workspace.gitConfig.branch = branchName
      workspace.gitConfig.lastSyncCommit = targetBranch.commit.sha
      workspace.lastModified = new Date().toISOString()
      workspace.syncStatus = {
        hasLocalChanges: false,
        hasRemoteChanges: false,
        lastSyncTime: new Date().toISOString(),
        conflictedFiles: [],
        aheadBy: 0,
        behindBy: 0
      }

      await db.gitWorkspaces.put(workspace)

      // Update cached files
      await this.cacheRepositoryFiles(workspaceId, newFiles, branchName)

      console.log(`✅ Switched to branch ${branchName}`)
    } catch (error) {
      console.error(`Failed to switch to branch ${branchName}:`, error)
      throw error
    }
  }

  // Helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private isTextFile(filename: string): boolean {
    const textExtensions = ['.md', '.txt', '.json', '.js', '.ts', '.tsx', '.jsx', '.css', '.html', '.xml', '.yml', '.yaml']
    return textExtensions.some(ext => filename.toLowerCase().endsWith(ext))
  }

  private async detectConflicts(workspace: GitWorkspaceData): Promise<string[]> {
    // TODO: Implement conflict detection logic
    // This would compare local file SHAs with remote file SHAs
    return []
  }

  private async hasLocalChanges(workspaceId: string): Promise<boolean> {
    try {
      const modifiedFiles = await db.gitFiles
        .where('workspaceId')
        .equals(workspaceId)
        .and(file => file.metadata.isModified)
        .count()
      
      return modifiedFiles > 0
    } catch (error) {
      console.error('Failed to check for local changes:', error)
      return false
    }
  }

  private async getModifiedFiles(workspaceId: string) {
    try {
      return await db.gitFiles
        .where('workspaceId')
        .equals(workspaceId)
        .and(file => file.metadata.isModified)
        .toArray()
    } catch (error) {
      console.error('Failed to get modified files:', error)
      return []
    }
  }

  private async markFilesAsCommitted(workspaceId: string, filePaths: string[]): Promise<void> {
    try {
      for (const path of filePaths) {
        const file = await db.gitFiles.where({ workspaceId, path }).first()
        if (file) {
          file.metadata.isModified = false
          file.metadata.isStaged = false
          await db.gitFiles.put(file)
        }
      }
    } catch (error) {
      console.error('Failed to mark files as committed:', error)
    }
  }
}

/**
 * Factory function to create GitWorkspaceService
 */
export function createGitWorkspaceService(
  github: GitHubAPI,
  gitData: GitDataAPI
): GitWorkspaceService {
  return new GitWorkspaceService(github, gitData)
}