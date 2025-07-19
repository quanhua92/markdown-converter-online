import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FileTree, FileSystemItem } from './FileTree'

interface ExplorerFileTreePanelsProps {
  isFileTreeCollapsed: boolean
  setIsFileTreeCollapsed: (collapsed: boolean) => void
  files: FileSystemItem[]
  currentFile: FileSystemItem | null
  onFileSelect: (item: FileSystemItem) => void
  onCreateFile: (parentPath: string, name: string) => void
  onCreateFolder: (parentPath: string, name: string) => void
  onDeleteItem: (path: string) => void
  onRenameItem: (path: string, newName: string) => void
  onToggleFolder: (path: string) => void
  onInitializeTemplate: (templateKey: string) => void
  // Workspace management props
  currentWorkspaceId?: string
  workspaces?: Array<{id: string, name: string, createdAt: string, lastModified: string}>
  onWorkspaceJoin?: (workspaceId: string) => void
  onWorkspaceLeave?: () => void
  onWorkspaceCreate?: (name: string) => void
}

export function ExplorerFileTreePanels({
  isFileTreeCollapsed,
  setIsFileTreeCollapsed,
  files,
  currentFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteItem,
  onRenameItem,
  onToggleFolder,
  onInitializeTemplate,
  currentWorkspaceId,
  workspaces,
  onWorkspaceJoin,
  onWorkspaceLeave,
  onWorkspaceCreate
}: ExplorerFileTreePanelsProps) {
  return (
    <Collapsible
      open={!isFileTreeCollapsed}
      onOpenChange={setIsFileTreeCollapsed}
      className="hidden lg:block border-r border-gray-200 dark:border-gray-700"
    >
      <div className={`transition-all duration-300 ${isFileTreeCollapsed ? 'w-12' : 'w-80'}`}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-1/2 -right-4 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full w-8 h-8 p-0"
            data-testid="file-tree-toggle"
          >
            {isFileTreeCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="h-full">
          <div className="p-4 h-full">
            <FileTree
              items={files}
              selectedFile={currentFile?.path}
              onFileSelect={onFileSelect}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDeleteItem={onDeleteItem}
              onRenameItem={onRenameItem}
              onToggleFolder={onToggleFolder}
              onInitializeTemplate={onInitializeTemplate}
              showTemplateOptions={files.length === 0}
              currentWorkspaceId={currentWorkspaceId}
              workspaces={workspaces}
              onWorkspaceJoin={onWorkspaceJoin}
              onWorkspaceLeave={onWorkspaceLeave}
              onWorkspaceCreate={onWorkspaceCreate}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}