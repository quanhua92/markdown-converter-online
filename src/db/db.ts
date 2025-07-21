import Dexie from 'dexie';
import type { 
  GitWorkspaceConfig, 
  GitSyncStatus, 
  GitFileMetadata, 
  GitCommit, 
  GitBranch,
  EncryptedToken
} from '../types/git';
import type { FileSystemItem } from '../components/shared/FileTree';

export interface StorageItem {
  id?: number;
  key: string;
  value: any;
  timestamp: number;
}

export interface GitWorkspaceData {
  id: string;
  name: string;
  type: 'local' | 'git';
  files: FileSystemItem[];
  currentFilePath?: string;
  createdAt: string;
  lastModified: string;
  gitConfig?: GitWorkspaceConfig;
  syncStatus?: GitSyncStatus;
}

export interface GitFileData {
  id?: number;
  path: string;
  workspaceId: string;
  content: string;
  metadata: GitFileMetadata;
  lastModified: string;
  isTemporary?: boolean; // For conflict resolution
}

export interface GitCommitData {
  id?: number;
  sha: string;
  workspaceId: string;
  commit: GitCommit;
  timestamp: string;
}

export interface GitBranchData {
  id?: number;
  name: string;
  workspaceId: string;
  branch: GitBranch;
  lastCommit: string;
  isActive?: boolean;
}

export interface AuthTokenData {
  id?: number;
  provider: 'github';
  userId: string;
  token: EncryptedToken;
  expiresAt: number;
}

export class MarkdownDatabase extends Dexie {
  storage!: Dexie.Table<StorageItem, number>;
  gitWorkspaces!: Dexie.Table<GitWorkspaceData, string>;
  gitFiles!: Dexie.Table<GitFileData, number>;
  gitCommits!: Dexie.Table<GitCommitData, number>;
  gitBranches!: Dexie.Table<GitBranchData, number>;
  authTokens!: Dexie.Table<AuthTokenData, number>;

  constructor() {
    super('MarkdownFilesDB');
    
    // Version 1: Original storage table
    this.version(1).stores({
      storage: '++id, &key, timestamp'
    });

    // Version 2: Add Git integration tables
    this.version(2).stores({
      storage: '++id, &key, timestamp',
      gitWorkspaces: '&id, type, name, lastModified',
      gitFiles: '++id, &path, workspaceId, lastModified',
      gitCommits: '++id, &sha, workspaceId, timestamp',
      gitBranches: '++id, &name, workspaceId, lastCommit',
      authTokens: '++id, provider, userId, expiresAt'
    });

    // Migration logic for version 2
    this.version(2).upgrade(async trans => {
      console.log('🔄 Upgrading database to version 2 (Git integration)');
      
      // No migration needed for new tables, they start empty
      // Existing storage table data is preserved
      
      console.log('✅ Database upgrade to version 2 completed');
    });
  }
}

export const db = new MarkdownDatabase();

// Initialize database with error handling
db.open().catch((error) => {
  console.error('Failed to open IndexedDB:', error);
  // Fallback handling could be implemented here
});

// Export for testing
export default db;