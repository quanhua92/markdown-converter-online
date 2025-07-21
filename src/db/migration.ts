import { StorageService } from './storage';

export interface MigrationProgress {
  total: number;
  current: number;
  currentKey?: string;
  status: 'starting' | 'migrating' | 'completed' | 'error';
  message: string;
  errors: string[];
}

export type MigrationProgressCallback = (progress: MigrationProgress) => void;

export class MigrationService {
  private static readonly MIGRATION_KEY = 'hasMigratedToIndexedDB';
  
  static async needsMigration(): Promise<boolean> {
    try {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        console.warn('IndexedDB not available');
        return false;
      }

      // Check if migration has already been completed
      const migrationFlag = await StorageService.loadItem(this.MIGRATION_KEY);
      if (migrationFlag) {
        return false;
      }

      // Check if there are any localStorage items to migrate
      return localStorage.length > 0;
    } catch (error) {
      console.warn('Error checking migration status:', error);
      return false;
    }
  }

  static async migrateFromLocalStorage(
    onProgress?: MigrationProgressCallback
  ): Promise<boolean> {
    const progress: MigrationProgress = {
      total: 0,
      current: 0,
      status: 'starting',
      message: 'Initializing migration...',
      errors: []
    };

    try {
      // Check if migration already completed
      if (!(await this.needsMigration())) {
        progress.status = 'completed';
        progress.message = 'Migration already completed or no data to migrate';
        onProgress?.(progress);
        return true;
      }

      // Count total items to migrate
      const localStorageKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== this.MIGRATION_KEY) {
          localStorageKeys.push(key);
        }
      }

      progress.total = localStorageKeys.length;
      progress.status = 'migrating';
      progress.message = `Found ${progress.total} items to migrate`;
      onProgress?.(progress);

      // Migrate each item
      for (let i = 0; i < localStorageKeys.length; i++) {
        const key = localStorageKeys[i];
        progress.current = i + 1;
        progress.currentKey = key;
        progress.message = `Migrating: ${key} (${progress.current}/${progress.total})`;
        onProgress?.(progress);

        try {
          const rawValue = localStorage.getItem(key);
          if (rawValue !== null) {
            let parsedValue;
            try {
              parsedValue = JSON.parse(rawValue);
            } catch {
              // If JSON parsing fails, store the raw string
              parsedValue = rawValue;
            }

            await StorageService.saveItem(key, parsedValue);
            
            // Add small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } catch (error: any) {
          const errorMsg = `Failed to migrate "${key}": ${error.message}`;
          progress.errors.push(errorMsg);
          console.warn(errorMsg, error);
        }
      }

      // Mark migration as completed
      await StorageService.saveItem(this.MIGRATION_KEY, {
        completed: true,
        timestamp: Date.now(),
        migratedItems: progress.current,
        errors: progress.errors
      });

      progress.status = 'completed';
      progress.message = progress.errors.length > 0 
        ? `Migration completed with ${progress.errors.length} errors`
        : 'Migration completed successfully!';
      
      onProgress?.(progress);
      return true;

    } catch (error: any) {
      progress.status = 'error';
      progress.message = `Migration failed: ${error.message}`;
      progress.errors.push(error.message);
      onProgress?.(progress);
      console.error('Migration failed:', error);
      return false;
    }
  }

  static async getMigrationStatus(): Promise<any> {
    try {
      return await StorageService.loadItem(this.MIGRATION_KEY);
    } catch (error) {
      console.warn('Error getting migration status:', error);
      return null;
    }
  }

  static async resetMigration(): Promise<void> {
    try {
      await StorageService.removeItem(this.MIGRATION_KEY);
    } catch (error) {
      console.warn('Error resetting migration:', error);
    }
  }
}