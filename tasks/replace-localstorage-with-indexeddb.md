# Replace localStorage with IndexedDB - Action Plan

## Overview
Replace localStorage with IndexedDB using Dexie.js library for better performance, larger storage capacity, and robust error handling in the markdown converter application.

## Phase 1: Setup and Initialization ⚙️

### Task 1.1: Install Dexie.js
- [ ] Add Dexie.js dependency to package.json
- [ ] Update Docker build process if needed

### Task 1.2: Create Database Configuration
- [ ] Create `src/db/db.js` - Database instance and schema definition
- [ ] Define 'files' store with proper indexing
- [ ] Add global error handler for IndexedDB operations
- [ ] Implement database opening with error handling

## Phase 2: Create Data Access Layer 💾

### Task 2.1: Storage Wrapper Functions
- [ ] Create `src/db/storage.js` - Data access wrapper
- [ ] Implement `saveFile(key, value)` - Replace localStorage.setItem()
- [ ] Implement `loadFile(key)` - Replace localStorage.getItem()
- [ ] Implement `deleteFile(key)` - Replace localStorage.removeItem()
- [ ] Implement `listAllFiles()` - Replace localStorage.keys() iteration
- [ ] Add comprehensive error handling for each function

### Task 2.2: Error Handling Strategy
- [ ] Handle QuotaExceededError scenarios
- [ ] Add user-friendly error messaging
- [ ] Implement fallback strategies for failed operations
- [ ] Add logging for debugging and monitoring

## Phase 3: Data Migration 🔄

### Task 3.1: Migration Script
- [ ] Create `src/db/migration.js` - One-time migration from localStorage
- [ ] Implement migration detection (avoid duplicate migrations)
- [ ] Handle JSON parsing errors gracefully
- [ ] Add migration progress tracking
- [ ] Test migration with existing localStorage data

### Task 3.2: Migration Integration
- [ ] Call migration on application startup
- [ ] Add UI feedback during migration process
- [ ] Plan cleanup of old localStorage data post-migration

## Phase 4: Application Refactoring ♻️

### Task 4.1: Identify localStorage Usage
- [ ] Audit codebase for all localStorage.setItem() calls
- [ ] Audit codebase for all localStorage.getItem() calls
- [ ] Audit codebase for all localStorage.removeItem() calls
- [ ] Document current localStorage key patterns

### Task 4.2: Workspace Management Updates
- [ ] Update `useWorkspaceManager.tsx` to use async storage
- [ ] Refactor workspace loading/saving operations
- [ ] Update workspace switching logic
- [ ] Handle async operations in workspace selector

### Task 4.3: File System Updates
- [ ] Update `useFileSystem.tsx` to use async storage
- [ ] Refactor file operations (create, read, update, delete)
- [ ] Update auto-save functionality for async operations
- [ ] Handle concurrent file operations

### Task 4.4: Component Updates
- [ ] Update React components to handle async storage operations
- [ ] Add loading states for storage operations
- [ ] Update error handling in UI components
- [ ] Ensure proper cleanup in useEffect hooks

## Phase 5: Testing and Validation 🧪

### Task 5.1: Unit Testing
- [ ] Write tests for database wrapper functions
- [ ] Test error handling scenarios
- [ ] Test migration functionality
- [ ] Test concurrent operation handling

### Task 5.2: Integration Testing
- [ ] Update existing Playwright tests for async operations
- [ ] Test workspace creation/switching with IndexedDB
- [ ] Test file operations with large content
- [ ] Test application performance with IndexedDB

### Task 5.3: Cross-browser Testing
- [ ] Test IndexedDB compatibility across browsers
- [ ] Verify Dexie.js polyfill functionality
- [ ] Test private/incognito mode behavior
- [ ] Test storage quota limits

## Phase 6: Performance and Optimization 🚀

### Task 6.1: Performance Monitoring
- [ ] Add performance metrics for storage operations
- [ ] Monitor IndexedDB vs localStorage performance
- [ ] Optimize large file handling
- [ ] Implement efficient batch operations

### Task 6.2: User Experience
- [ ] Add progress indicators for large operations
- [ ] Implement offline capability indicators
- [ ] Add storage quota usage display
- [ ] Provide clear error messages to users

## Phase 7: Documentation and Cleanup 📚

### Task 7.1: Documentation Updates
- [ ] Update CLAUDE.md with IndexedDB information
- [ ] Document new storage architecture
- [ ] Update troubleshooting guide
- [ ] Create migration rollback procedures

### Task 7.2: Code Cleanup
- [ ] Remove deprecated localStorage code
- [ ] Clean up temporary migration code
- [ ] Update type definitions
- [ ] Optimize bundle size

## Risk Mitigation

### High Priority Risks
- [ ] Browser compatibility issues with IndexedDB
- [ ] Data loss during migration
- [ ] Performance degradation during transition
- [ ] User experience disruption

### Mitigation Strategies
- [ ] Implement feature detection and fallbacks
- [ ] Create backup/restore functionality
- [ ] Gradual rollout with feature flags
- [ ] Comprehensive testing before production

## Success Criteria

- [ ] All localStorage usage replaced with IndexedDB
- [ ] No data loss during migration
- [ ] Improved performance for large datasets
- [ ] Better error handling and user feedback
- [ ] Successful cross-browser compatibility
- [ ] All existing tests passing
- [ ] User experience maintained or improved

## Estimated Timeline

- **Phase 1-2**: 2-3 days (Setup and core functions)
- **Phase 3**: 1 day (Migration implementation)
- **Phase 4**: 3-4 days (Application refactoring)
- **Phase 5-6**: 2-3 days (Testing and optimization)
- **Phase 7**: 1 day (Documentation and cleanup)

**Total Estimated Time**: 9-14 days

## Dependencies

- Dexie.js library installation
- Understanding of current localStorage usage patterns
- Access to test environments
- Browser testing capabilities

## Implementation Code Templates

### 1. Database Setup (`src/db/db.js`)
```javascript
import Dexie from 'dexie';

export const db = new Dexie('MarkdownFilesDB');

db.version(1).stores({
  files: '++id, &key',
});

db.on('error', (error) => {
  console.error("Uncaught Dexie error:", error);
});

db.open().catch((error) => {
  console.error("Failed to open db:", error);
});
```

### 2. Storage Wrapper (`src/db/storage.js`)
```javascript
import { db } from './db';

export async function saveFile(key, value) {
  try {
    await db.files.put({ key, value });
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded! Cannot save file.');
    } else {
      console.error(`Failed to save file [${key}]:`, error);
    }
    throw error;
  }
}

export async function loadFile(key) {
  try {
    const file = await db.files.get({ key });
    return file ? file.value : undefined;
  } catch (error) {
    console.error(`Failed to load file [${key}]:`, error);
    throw error;
  }
}

export async function deleteFile(key) {
  try {
    await db.files.where({ key }).delete();
  } catch (error) {
    console.error(`Failed to delete file [${key}]:`, error);
    throw error;
  }
}

export async function listAllFiles() {
  try {
    return await db.files.toArray();
  } catch (error) {
    console.error('Failed to list all files:', error);
    throw error;
  }
}
```

### 3. Migration Script (`src/db/migration.js`)
```javascript
import { saveFile } from './storage';

export function migrateFromLocalStorage() {
  const migrationKey = 'hasMigratedToIndexedDB';
  if (localStorage.getItem(migrationKey)) {
    return;
  }

  console.log('Starting migration from localStorage to IndexedDB...');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key !== migrationKey) {
      try {
        const value = JSON.parse(localStorage.getItem(key));
        saveFile(key, value);
      } catch (e) {
        console.warn(`Could not migrate item with key: ${key}`);
      }
    }
  }
  
  localStorage.setItem(migrationKey, 'true');
  console.log('Migration complete.');
}
```

## Current localStorage Usage Analysis

Based on the codebase structure, key areas to audit:
- `useWorkspaceManager.tsx` - Workspace data storage
- `useFileSystem.tsx` - File operations
- Any components using storage for preferences or state

## Next Steps

1. Start with Phase 1: Install Dexie.js and create initial database setup
2. Audit current localStorage usage patterns in the codebase
3. Begin implementation of storage wrapper functions
4. Test each phase incrementally before moving to the next