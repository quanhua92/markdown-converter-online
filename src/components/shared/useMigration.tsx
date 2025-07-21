import { useState, useEffect } from 'react';
import { MigrationService } from '../../db/migration';

export const useMigration = () => {
  const [needsMigration, setNeedsMigration] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      setIsChecking(true);
      
      // Check if IndexedDB is available first
      if (!window.indexedDB) {
        console.warn('IndexedDB not available, skipping migration');
        setNeedsMigration(false);
        setShowDialog(false);
        return;
      }
      
      const needs = await MigrationService.needsMigration();
      setNeedsMigration(needs);
      setShowDialog(needs);
    } catch (error) {
      console.error('Error checking migration status:', error);
      // Don't show dialog if there's an error
      setNeedsMigration(false);
      setShowDialog(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleMigrationComplete = (success: boolean) => {
    setShowDialog(false);
    setNeedsMigration(false);
    
    if (success) {
      console.log('Migration completed successfully');
    } else {
      console.warn('Migration completed with errors');
    }
  };

  const resetMigration = async () => {
    try {
      await MigrationService.resetMigration();
      await checkMigrationStatus();
    } catch (error) {
      console.error('Error resetting migration:', error);
    }
  };

  return {
    needsMigration,
    showDialog,
    isChecking,
    handleMigrationComplete,
    resetMigration,
    checkMigrationStatus
  };
};