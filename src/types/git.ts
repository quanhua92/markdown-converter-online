// Git integration types for the markdown converter app

export interface GitUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

export interface GitRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  owner: GitUser
  html_url: string
  clone_url: string
  ssh_url: string
  default_branch: string
  permissions?: {
    admin: boolean
    maintain: boolean
    push: boolean
    triage: boolean
    pull: boolean
  }
}

export interface GitBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface GitCommit {
  sha: string
  message: string
  author: {
    name: string
    email: string
    date: string
  }
  committer: {
    name: string
    email: string
    date: string
  }
  url: string
  html_url: string
  parents: Array<{ sha: string; url: string }>
  tree: {
    sha: string
    url: string
  }
}

export interface GitFile {
  path: string
  content: string
  sha: string
  size: number
  encoding: 'base64' | 'utf-8'
  type: 'file' | 'dir'
  mode: string
  url: string
  git_url: string
  html_url: string
  download_url: string | null
}

export interface GitTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree' | 'commit'
  size?: number
  sha: string
  url: string
}

export interface GitTree {
  sha: string
  url: string
  tree: GitTreeItem[]
  truncated: boolean
}

export interface ConflictMarker {
  startLine: number
  endLine: number
  type: 'conflict' | 'incoming' | 'current' | 'base'
  content: string
}

export interface ConflictSection {
  startLine: number
  endLine: number
  localContent: string
  remoteContent: string
  baseContent?: string
  type: 'content' | 'deletion' | 'addition' | 'modification'
}

export interface ConflictResult {
  hasConflicts: boolean
  conflictedSections: ConflictSection[]
  autoMergeableChanges: Change[]
}

export interface Change {
  type: 'add' | 'delete' | 'modify'
  line: number
  content: string
  oldContent?: string
}

export interface GitWorkspaceConfig {
  repositoryUrl: string
  owner: string
  repo: string
  branch: string
  defaultBranch: string
  lastSyncCommit: string
  accessToken?: string // Will be encrypted in storage
  collaborators?: GitUser[]
}

export interface GitSyncStatus {
  hasLocalChanges: boolean
  hasRemoteChanges: boolean
  lastSyncTime: string
  conflictedFiles: string[]
  aheadBy: number
  behindBy: number
}

export interface GitFileMetadata {
  sha: string
  lastCommitSha: string
  lastModified: string
  isModified: boolean
  isStaged: boolean
  conflictStatus?: 'conflicted' | 'resolved' | 'none'
  size: number
}

export interface GitOperation {
  type: 'commit' | 'push' | 'pull' | 'merge' | 'branch_create' | 'branch_switch'
  timestamp: string
  status: 'pending' | 'success' | 'error' | 'conflict'
  details?: any
  error?: string
}

export interface MergeResult {
  success: boolean
  conflictFiles?: string[]
  mergeCommit?: GitCommit
  error?: string
}

export interface RebaseResult {
  success: boolean
  conflictFiles?: string[]
  newCommits?: GitCommit[]
  error?: string
}

export interface AuthTokenData {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  scopes: string[]
  tokenType: 'bearer'
}

export interface EncryptedToken {
  provider: 'github'
  userId: string
  encryptedData: string
  expiresAt: number
  createdAt: string
}

export interface GitHubOAuthConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
  state: string
}

export interface CollaboratorPresence {
  user: GitUser
  file: string
  lastSeen: string
  isActive: boolean
  cursor?: {
    line: number
    column: number
  }
}

export interface FileLock {
  path: string
  lockedBy: GitUser
  lockedAt: string
  expiresAt: string
  reason?: string
}

export interface Comment {
  id: number
  user: GitUser
  body: string
  path: string
  line: number
  createdAt: string
  updatedAt: string
}

export interface ReviewRequest {
  id: number
  reviewers: GitUser[]
  changes: FileChange[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface FileChange {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  changes: number
  patch?: string
}

// API Response types
export interface GitHubApiError {
  message: string
  errors?: Array<{
    resource: string
    field: string
    code: string
  }>
  documentation_url?: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  used: number
  resource: string
}

export interface PaginationInfo {
  total_count?: number
  incomplete_results?: boolean
}

// Utility types for operations
export type GitOperationType = GitOperation['type']
export type GitOperationStatus = GitOperation['status']
export type ConflictType = ConflictSection['type']
export type FileChangeStatus = FileChange['status']