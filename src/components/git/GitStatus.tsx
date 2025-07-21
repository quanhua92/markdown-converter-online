import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '../ui/dialog'
import {
  GitBranch,
  GitCommit,
  RefreshCw,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  FileText,
  Users
} from 'lucide-react'
import type { GitSyncStatus } from '../../types/git'

interface GitStatusProps {
  workspaceName: string
  repositoryUrl?: string
  currentBranch?: string
  syncStatus: GitSyncStatus | null
  hasUnsavedChanges: boolean
  isSyncing: boolean
  onCommit: (message: string) => Promise<void>
  onSync: () => Promise<void>
  onSwitchBranch?: (branchName: string) => Promise<void>
  className?: string
}

export function GitStatus({
  workspaceName,
  repositoryUrl,
  currentBranch,
  syncStatus,
  hasUnsavedChanges,
  isSyncing,
  onCommit,
  onSync,
  onSwitchBranch,
  className
}: GitStatusProps) {
  const [showCommitDialog, setShowCommitDialog] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [isCommitting, setIsCommitting] = useState(false)

  const handleCommit = async () => {
    if (!commitMessage.trim()) return

    try {
      setIsCommitting(true)
      await onCommit(commitMessage.trim())
      setCommitMessage('')
      setShowCommitDialog(false)
    } catch (error) {
      console.error('Commit failed:', error)
    } finally {
      setIsCommitting(false)
    }
  }

  const getSyncStatusColor = () => {
    if (isSyncing) return 'blue'
    if (syncStatus?.conflictedFiles.length) return 'red'
    if (hasUnsavedChanges) return 'yellow'
    if (syncStatus?.hasRemoteChanges) return 'orange'
    return 'green'
  }

  const getSyncStatusText = () => {
    if (isSyncing) return 'Syncing...'
    if (syncStatus?.conflictedFiles.length) return `${syncStatus.conflictedFiles.length} conflicts`
    if (hasUnsavedChanges) return 'Unsaved changes'
    if (syncStatus?.hasRemoteChanges) return `${syncStatus.behindBy} commits behind`
    return 'Up to date'
  }

  const getSyncIcon = () => {
    if (isSyncing) return <Loader2 className="h-4 w-4 animate-spin" />
    if (syncStatus?.conflictedFiles.length) return <AlertCircle className="h-4 w-4" />
    if (hasUnsavedChanges) return <Clock className="h-4 w-4" />
    if (syncStatus?.hasRemoteChanges) return <Download className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const formatLastSync = () => {
    if (!syncStatus?.lastSyncTime) return 'Never'
    
    const lastSync = new Date(syncStatus.lastSyncTime)
    const now = new Date()
    const diffMs = now.getTime() - lastSync.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return lastSync.toLocaleDateString()
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Git Status
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Repository Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Repository:</span>
              <span className="font-medium truncate ml-2" title={repositoryUrl}>
                {repositoryUrl?.split('/').slice(-2).join('/') || 'Unknown'}
              </span>
            </div>
            
            {currentBranch && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Branch:</span>
                <Badge variant="outline" className="gap-1">
                  <GitBranch className="h-3 w-3" />
                  {currentBranch}
                </Badge>
              </div>
            )}
          </div>

          {/* Sync Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getSyncIcon()}
              <span className={`text-sm font-medium ${
                getSyncStatusColor() === 'red' ? 'text-red-600 dark:text-red-400' :
                getSyncStatusColor() === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                getSyncStatusColor() === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                getSyncStatusColor() === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {getSyncStatusText()}
              </span>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last sync: {formatLastSync()}
            </div>
          </div>

          {/* Conflict Warning */}
          {syncStatus?.conflictedFiles.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Merge conflicts detected</span>
              </div>
              <div className="mt-1 text-xs text-red-700 dark:text-red-300">
                Files: {syncStatus.conflictedFiles.slice(0, 2).join(', ')}
                {syncStatus.conflictedFiles.length > 2 && ` +${syncStatus.conflictedFiles.length - 2} more`}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {/* Commit Button */}
            <Button
              onClick={() => setShowCommitDialog(true)}
              disabled={!hasUnsavedChanges || isSyncing}
              className="w-full gap-2"
              variant={hasUnsavedChanges ? "default" : "outline"}
            >
              <GitCommit className="h-4 w-4" />
              {hasUnsavedChanges ? 'Commit Changes' : 'No Changes'}
            </Button>

            {/* Sync Button */}
            <Button
              onClick={onSync}
              disabled={isSyncing}
              variant="outline"
              className="w-full gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync with Remote'}
            </Button>
          </div>

          {/* Quick Stats */}
          {syncStatus && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Upload className="h-3 w-3" />
                <span>Ahead: {syncStatus.aheadBy}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Download className="h-3 w-3" />
                <span>Behind: {syncStatus.behindBy}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commit Dialog */}
      <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commit Changes</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="commit-message">Commit Message</Label>
              <Input
                id="commit-message"
                placeholder="Describe your changes..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    handleCommit()
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Press ⌘+Enter to commit quickly
              </p>
            </div>

            {hasUnsavedChanges && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Changes ready to commit</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Your local changes will be committed to the {currentBranch} branch.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCommitDialog(false)}
              disabled={isCommitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCommit}
              disabled={!commitMessage.trim() || isCommitting}
              className="gap-2"
            >
              {isCommitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GitCommit className="h-4 w-4" />
              )}
              {isCommitting ? 'Committing...' : 'Commit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Compact Git status for headers/toolbars
 */
export function GitStatusCompact({
  syncStatus,
  hasUnsavedChanges,
  isSyncing,
  onSync
}: Pick<GitStatusProps, 'syncStatus' | 'hasUnsavedChanges' | 'isSyncing' | 'onSync'>) {
  const getSyncStatusColor = () => {
    if (isSyncing) return 'blue'
    if (syncStatus?.conflictedFiles.length) return 'destructive'
    if (hasUnsavedChanges) return 'secondary'
    if (syncStatus?.hasRemoteChanges) return 'outline'
    return 'default'
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getSyncStatusColor() as any} className="gap-1">
        {isSyncing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : syncStatus?.conflictedFiles.length ? (
          <AlertCircle className="h-3 w-3" />
        ) : hasUnsavedChanges ? (
          <Clock className="h-3 w-3" />
        ) : (
          <CheckCircle className="h-3 w-3" />
        )}
        <span className="text-xs">
          {isSyncing ? 'Syncing' : 
           syncStatus?.conflictedFiles.length ? 'Conflict' :
           hasUnsavedChanges ? 'Modified' : 'Synced'}
        </span>
      </Badge>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onSync}
        disabled={isSyncing}
        className="h-7 w-7 p-0"
      >
        <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}