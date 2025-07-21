import type { GitHubAPI } from './github'
import type { 
  GitCommit, 
  GitFile, 
  FileChange,
  MergeResult,
  GitBranch
} from '../types/git'

/**
 * Git Data API wrapper for advanced Git operations
 * Provides low-level control for committing multiple changes at once
 */
export class GitDataAPI {
  constructor(private github: GitHubAPI) {}

  /**
   * Commits multiple file changes (creations, updates, deletions).
   * This is the equivalent of: git add -> git commit -> git push
   */
  async commitMultipleFiles(options: {
    owner: string
    repo: string
    branch: string
    files: Array<{
      path: string
      content: string | null // null for deletions
      mode?: string
    }>
    commitMessage: string
    author?: {
      name: string
      email: string
    }
  }): Promise<{ commit: GitCommit; hasConflict: boolean }> {
    const { owner, repo, branch, files, commitMessage, author } = options
    const octokit = this.github.getOctokit()

    try {
      // 1. Get the current branch's latest commit SHA and tree SHA
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`
      })
      const latestCommitSha = refData.object.sha

      const { data: commitData } = await octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: latestCommitSha
      })
      const baseTreeSha = commitData.tree.sha

      // 2. Create blobs for all new or updated files
      const fileBlobs = await Promise.all(
        files
          .filter(f => f.content !== null)
          .map(async (file) => {
            const { data: blobData } = await octokit.rest.git.createBlob({
              owner,
              repo,
              content: file.content!,
              encoding: 'utf-8'
            })
            return { 
              path: file.path, 
              sha: blobData.sha, 
              mode: file.mode || '100644', 
              type: 'blob' as const 
            }
          })
      )

      // Include deletions in the tree by setting their sha to null
      const deletions = files
        .filter(f => f.content === null)
        .map(f => ({
          path: f.path,
          sha: null,
          mode: '100644',
          type: 'blob' as const
        }))

      // 3. Create a new tree with our changes
      const { data: newTree } = await octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: baseTreeSha,
        tree: [...fileBlobs, ...deletions]
      })

      // 4. Create a new commit pointing to our new tree
      const commitOptions: any = {
        owner,
        repo,
        message: commitMessage,
        tree: newTree.sha,
        parents: [latestCommitSha]
      }

      if (author) {
        commitOptions.author = author
      }

      const { data: newCommit } = await octokit.rest.git.createCommit(commitOptions)

      // 5. Update the branch reference to point to the new commit (the "push")
      try {
        await octokit.rest.git.updateRef({
          owner,
          repo,
          ref: `heads/${branch}`,
          sha: newCommit.sha
        })

        return {
          commit: this.mapToGitCommit(newCommit),
          hasConflict: false
        }
      } catch (error: any) {
        // This error indicates a non-fast-forward update, i.e., a conflict
        if (error.status === 422) {
          console.warn('Conflict detected: Branch has been updated on remote.')
          return {
            commit: this.mapToGitCommit(newCommit),
            hasConflict: true
          }
        }
        throw error
      }
    } catch (error) {
      console.error('Failed to commit multiple files:', error)
      throw error
    }
  }

  /**
   * Create a new branch from an existing branch or commit
   */
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    fromBranch: string = 'main'
  ): Promise<GitBranch> {
    const octokit = this.github.getOctokit()

    try {
      // Get the SHA of the source branch
      const { data: sourceRef } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${fromBranch}`
      })

      // Create the new branch
      const { data: newRef } = await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: sourceRef.object.sha
      })

      return {
        name: branchName,
        commit: {
          sha: newRef.object.sha,
          url: newRef.url
        },
        protected: false
      }
    } catch (error) {
      console.error(`Failed to create branch ${branchName}:`, error)
      throw error
    }
  }

  /**
   * Delete a branch
   */
  async deleteBranch(owner: string, repo: string, branchName: string): Promise<void> {
    const octokit = this.github.getOctokit()

    try {
      await octokit.rest.git.deleteRef({
        owner,
        repo,
        ref: `heads/${branchName}`
      })
    } catch (error) {
      console.error(`Failed to delete branch ${branchName}:`, error)
      throw error
    }
  }

  /**
   * Merge one branch into another
   */
  async mergeBranches(
    owner: string,
    repo: string,
    baseBranch: string,
    headBranch: string,
    commitMessage?: string
  ): Promise<MergeResult> {
    const octokit = this.github.getOctokit()

    try {
      const { data: mergeResult } = await octokit.rest.repos.merge({
        owner,
        repo,
        base: baseBranch,
        head: headBranch,
        commit_message: commitMessage || `Merge ${headBranch} into ${baseBranch}`
      })

      return {
        success: true,
        mergeCommit: this.mapToGitCommit(mergeResult)
      }
    } catch (error: any) {
      if (error.status === 409) {
        // Merge conflict
        return {
          success: false,
          error: 'Merge conflict detected'
        }
      }
      
      console.error(`Failed to merge ${headBranch} into ${baseBranch}:`, error)
      throw error
    }
  }

  /**
   * Get the difference between two commits/branches
   */
  async compareCommits(
    owner: string,
    repo: string,
    base: string,
    head: string
  ): Promise<FileChange[]> {
    const octokit = this.github.getOctokit()

    try {
      const { data: comparison } = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base,
        head
      })

      return comparison.files?.map(file => ({
        path: file.filename,
        status: file.status as FileChange['status'],
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch
      })) || []
    } catch (error) {
      console.error(`Failed to compare ${base}...${head}:`, error)
      throw error
    }
  }

  /**
   * Get a specific commit
   */
  async getCommit(owner: string, repo: string, sha: string): Promise<GitCommit> {
    const octokit = this.github.getOctokit()

    try {
      const { data: commit } = await octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: sha
      })

      return this.mapToGitCommit(commit)
    } catch (error) {
      console.error(`Failed to get commit ${sha}:`, error)
      throw error
    }
  }

  /**
   * Get the tree for a specific commit
   */
  async getTree(owner: string, repo: string, treeSha: string, recursive: boolean = false) {
    const octokit = this.github.getOctokit()

    try {
      const { data: tree } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: treeSha,
        recursive: recursive ? 'true' : undefined
      })

      return tree
    } catch (error) {
      console.error(`Failed to get tree ${treeSha}:`, error)
      throw error
    }
  }

  /**
   * Cherry-pick a commit to another branch
   */
  async cherryPick(
    owner: string,
    repo: string,
    targetBranch: string,
    commitSha: string,
    commitMessage?: string
  ): Promise<GitCommit> {
    const octokit = this.github.getOctokit()

    try {
      // Get the commit to cherry-pick
      const { data: sourceCommit } = await octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: commitSha
      })

      // Get the target branch's latest commit
      const { data: targetRef } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${targetBranch}`
      })

      // Create new commit with the same tree and new parent
      const { data: newCommit } = await octokit.rest.git.createCommit({
        owner,
        repo,
        message: commitMessage || sourceCommit.message,
        tree: sourceCommit.tree.sha,
        parents: [targetRef.object.sha],
        author: sourceCommit.author,
        committer: sourceCommit.committer
      })

      // Update the target branch
      await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${targetBranch}`,
        sha: newCommit.sha
      })

      return this.mapToGitCommit(newCommit)
    } catch (error) {
      console.error(`Failed to cherry-pick ${commitSha} to ${targetBranch}:`, error)
      throw error
    }
  }

  /**
   * Get the common ancestor of two commits
   */
  async getMergeBase(
    owner: string,
    repo: string,
    commit1: string,
    commit2: string
  ): Promise<string> {
    const octokit = this.github.getOctokit()

    try {
      const { data: comparison } = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base: commit1,
        head: commit2
      })

      return comparison.merge_base_commit.sha
    } catch (error) {
      console.error(`Failed to get merge base for ${commit1} and ${commit2}:`, error)
      throw error
    }
  }

  /**
   * Check if a fast-forward merge is possible
   */
  async canFastForward(
    owner: string,
    repo: string,
    baseBranch: string,
    headBranch: string
  ): Promise<boolean> {
    const octokit = this.github.getOctokit()

    try {
      const { data: comparison } = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base: baseBranch,
        head: headBranch
      })

      // Fast-forward is possible if base is behind head and base is an ancestor of head
      return comparison.status === 'behind' || comparison.status === 'identical'
    } catch (error) {
      console.error(`Failed to check fast-forward possibility:`, error)
      return false
    }
  }

  /**
   * Batch file operations for better performance
   */
  async batchFileOperations(operations: Array<{
    type: 'create' | 'update' | 'delete'
    path: string
    content?: string
    sha?: string
  }>, options: {
    owner: string
    repo: string
    branch: string
    commitMessage: string
  }): Promise<GitCommit[]> {
    const { owner, repo, branch, commitMessage } = options
    const commits: GitCommit[] = []

    // Group operations by type for optimization
    const creates = operations.filter(op => op.type === 'create')
    const updates = operations.filter(op => op.type === 'update')
    const deletes = operations.filter(op => op.type === 'delete')

    // Process operations in batches to avoid rate limits
    const batchSize = 10
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize)
      const files = batch.map(op => ({
        path: op.path,
        content: op.type === 'delete' ? null : (op.content || ''),
        mode: '100644'
      }))

      const result = await this.commitMultipleFiles({
        owner,
        repo,
        branch,
        files,
        commitMessage: `${commitMessage} (batch ${Math.floor(i / batchSize) + 1})`
      })

      commits.push(result.commit)

      // Add small delay to respect rate limits
      if (i + batchSize < operations.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return commits
  }

  private mapToGitCommit(commit: any): GitCommit {
    return {
      sha: commit.sha,
      message: commit.message,
      author: {
        name: commit.author?.name || '',
        email: commit.author?.email || '',
        date: commit.author?.date || ''
      },
      committer: {
        name: commit.committer?.name || '',
        email: commit.committer?.email || '',
        date: commit.committer?.date || ''
      },
      url: commit.url || '',
      html_url: commit.html_url || '',
      parents: commit.parents || [],
      tree: commit.tree || { sha: '', url: '' }
    }
  }
}

/**
 * Factory function to create GitDataAPI instance
 */
export function createGitDataAPI(github: GitHubAPI): GitDataAPI {
  return new GitDataAPI(github)
}