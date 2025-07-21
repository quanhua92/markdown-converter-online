import Dexie from 'dexie';

export interface StorageItem {
  id?: number;
  key: string;
  value: any;
  timestamp: number;
}

export class MarkdownDatabase extends Dexie {
  storage!: Dexie.Table<StorageItem, number>;

  constructor() {
    super('MarkdownFilesDB');
    
    this.version(1).stores({
      storage: '++id, &key, timestamp'
    });

    this.on('error', (error) => {
      console.error('Uncaught Dexie error:', error);
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