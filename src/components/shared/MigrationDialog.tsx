import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { MigrationService } from '../../db/migration';

interface MigrationProgress {
  total: number;
  current: number;
  currentKey?: string;
  status: 'starting' | 'migrating' | 'completed' | 'error';
  message: string;
  errors: string[];
}

interface MigrationDialogProps {
  isOpen: boolean;
  onComplete: (success: boolean) => void;
}

export const MigrationDialog: React.FC<MigrationDialogProps> = ({
  isOpen,
  onComplete
}) => {
  const [progress, setProgress] = useState<MigrationProgress>({
    total: 0,
    current: 0,
    status: 'starting',
    message: 'Preparing migration...',
    errors: []
  });
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; type: 'info' | 'error' | 'warn' }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: 'info' | 'error' | 'warn' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleProgressUpdate = (newProgress: MigrationProgress) => {
    setProgress(newProgress);
    
    // Add progress updates to logs
    if (newProgress.currentKey) {
      addLog(`Processing: ${newProgress.currentKey}`);
    } else {
      addLog(newProgress.message);
    }

    // Add errors to logs
    newProgress.errors.forEach(error => {
      addLog(error, 'error');
    });
  };

  const startMigration = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('Starting localStorage to IndexedDB migration...');
    
    try {
      const success = await MigrationService.migrateFromLocalStorage(handleProgressUpdate);
      
      if (success) {
        addLog('Migration completed successfully!', 'info');
      } else {
        addLog('Migration completed with errors. Check console for details.', 'warn');
      }
      
      setTimeout(() => {
        onComplete(success);
      }, 2000);
    } catch (error: any) {
      addLog(`Migration failed: ${error.message}`, 'error');
      setTimeout(() => {
        onComplete(false);
      }, 2000);
    } finally {
      setIsRunning(false);
    }
  };

  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col" data-testid="migration-dialog">
        <DialogHeader>
          <DialogTitle>Data Migration</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span data-testid="migration-progress">{progress.current}/{progress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{progress.message}</p>
          </div>

          {/* Console Section */}
          <div className="flex-1 border rounded-lg bg-gray-900 text-green-400 font-mono text-xs overflow-hidden flex flex-col">
            <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
              <span className="text-gray-300">Migration Console</span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto max-h-64">
              {logs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'warn' ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              progress.status === 'starting' ? 'bg-yellow-500' :
              progress.status === 'migrating' ? 'bg-blue-500 animate-pulse' :
              progress.status === 'completed' ? 'bg-green-500' :
              'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {progress.status === 'starting' ? 'Initializing...' :
               progress.status === 'migrating' ? 'Migrating data...' :
               progress.status === 'completed' ? 'Complete' :
               'Error occurred'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            {!isRunning && progress.status !== 'completed' && progress.status !== 'error' && (
              <Button onClick={startMigration}>
                Start Migration
              </Button>
            )}
            {(progress.status === 'completed' || progress.status === 'error') && (
              <Button onClick={() => onComplete(progress.status === 'completed')}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MigrationDialog;