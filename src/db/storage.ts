import { db } from './db';

export interface StorageError extends Error {
  code?: string;
  name: string;
}

export class StorageService {
  
  private static async ensureDbReady(): Promise<boolean> {
    try {
      if (!window.indexedDB) {
        throw new Error('IndexedDB not available');
      }
      
      // Test if database is accessible
      await db.storage.count();
      return true;
    } catch (error) {
      console.warn('Database not ready:', error);
      return false;
    }
  }
  
  static async saveItem(key: string, value: any): Promise<void> {
    if (!(await this.ensureDbReady())) {
      throw new Error('Database not available');
    }
    
    try {
      const item = {
        key,
        value: JSON.stringify(value),
        timestamp: Date.now()
      };
      
      await db.storage.put(item);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        const quotaError: StorageError = new Error(`Storage quota exceeded! Cannot save item [${key}]`);
        quotaError.name = 'QuotaExceededError';
        quotaError.code = 'QUOTA_EXCEEDED';
        throw quotaError;
      } else {
        const storageError: StorageError = new Error(`Failed to save item [${key}]: ${error.message}`);
        storageError.name = 'StorageError';
        storageError.code = 'SAVE_FAILED';
        throw storageError;
      }
    }
  }

  static async loadItem(key: string): Promise<any> {
    if (!(await this.ensureDbReady())) {
      return null; // Return null instead of throwing for load operations
    }
    
    try {
      const item = await db.storage.get({ key });
      if (!item) return null;
      
      try {
        return JSON.parse(item.value);
      } catch (parseError) {
        console.warn(`Failed to parse stored value for key [${key}]:`, parseError);
        return item.value; // Return raw value if JSON parsing fails
      }
    } catch (error: any) {
      const storageError: StorageError = new Error(`Failed to load item [${key}]: ${error.message}`);
      storageError.name = 'StorageError';
      storageError.code = 'LOAD_FAILED';
      throw storageError;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await db.storage.where({ key }).delete();
    } catch (error: any) {
      const storageError: StorageError = new Error(`Failed to remove item [${key}]: ${error.message}`);
      storageError.name = 'StorageError';
      storageError.code = 'REMOVE_FAILED';
      throw storageError;
    }
  }

  static async getAllItems(): Promise<Array<{key: string, value: any}>> {
    try {
      const items = await db.storage.toArray();
      return items.map(item => ({
        key: item.key,
        value: (() => {
          try {
            return JSON.parse(item.value);
          } catch {
            return item.value;
          }
        })()
      }));
    } catch (error: any) {
      const storageError: StorageError = new Error(`Failed to list all items: ${error.message}`);
      storageError.name = 'StorageError';
      storageError.code = 'LIST_FAILED';
      throw storageError;
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      const items = await db.storage.toArray();
      return items.map(item => item.key);
    } catch (error: any) {
      const storageError: StorageError = new Error(`Failed to get all keys: ${error.message}`);
      storageError.name = 'StorageError';
      storageError.code = 'KEYS_FAILED';
      throw storageError;
    }
  }

  static async clear(): Promise<void> {
    try {
      await db.storage.clear();
    } catch (error: any) {
      const storageError: StorageError = new Error(`Failed to clear storage: ${error.message}`);
      storageError.name = 'StorageError';
      storageError.code = 'CLEAR_FAILED';
      throw storageError;
    }
  }

  static async getStorageInfo(): Promise<{
    itemCount: number;
    estimatedSize: number;
    keys: string[];
  }> {
    try {
      const items = await db.storage.toArray();
      const estimatedSize = items.reduce((acc, item) => {
        return acc + (item.key.length + item.value.length) * 2; // Rough UTF-16 size estimation
      }, 0);

      return {
        itemCount: items.length,
        estimatedSize,
        keys: items.map(item => item.key)
      };
    } catch (error: any) {
      const storageError: StorageError = new Error(`Failed to get storage info: ${error.message}`);
      storageError.name = 'StorageError';
      storageError.code = 'INFO_FAILED';
      throw storageError;
    }
  }
}

// Export convenience functions for backwards compatibility
export const saveItem = StorageService.saveItem;
export const loadItem = StorageService.loadItem;
export const removeItem = StorageService.removeItem;
export const getAllItems = StorageService.getAllItems;
export const getAllKeys = StorageService.getAllKeys;
export const clearStorage = StorageService.clear;
export const getStorageInfo = StorageService.getStorageInfo;