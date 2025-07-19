import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu, 
  FolderOpen, 
  Save, 
  Download, 
  Printer, 
  Sun, 
  Moon 
} from 'lucide-react'
import { FileTree, FileSystemItem } from './FileTree'
import { useCallback, useMemo } from 'react'

interface ExplorerHeaderProps {
  isDarkMode: boolean
  toggleTheme: () => void
  currentFile: FileSystemItem | null
  saveStatus: 'idle' | 'saving' | 'saved'
  isMobileSheetOpen: boolean
  setIsMobileSheetOpen: (open: boolean) => void
  files: FileSystemItem[]
  onFileSelect: (item: FileSystemItem) => void
  onCreateFile: (parentPath: string, name: string) => void
  onCreateFolder: (parentPath: string, name: string) => void
  onDeleteItem: (path: string) => void
  onRenameItem: (path: string, newName: string) => void
  onToggleFolder: (path: string) => void
  onInitializeTemplate: (templateKey: string) => void
  onManualSave: () => void
  onExport: () => void
  onPrint: () => void
  // Workspace management props
  currentWorkspaceId?: string
  currentWorkspaceName?: string
  workspaces?: Array<{id: string, name: string, createdAt: string, lastModified: string}>
  onWorkspaceJoin?: (workspaceId: string) => void
  onWorkspaceLeave?: () => void
  onWorkspaceCreate?: (name: string) => void
}

export function ExplorerHeader({
  isDarkMode,
  toggleTheme,
  currentFile,
  saveStatus,
  isMobileSheetOpen,
  setIsMobileSheetOpen,
  files,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteItem,
  onRenameItem,
  onToggleFolder,
  onInitializeTemplate,
  onManualSave,
  onExport,
  onPrint,
  // Workspace management props
  currentWorkspaceId,
  currentWorkspaceName,
  workspaces,
  onWorkspaceJoin,
  onWorkspaceLeave,
  onWorkspaceCreate
}: ExplorerHeaderProps) {
  // Memoize handlers to prevent infinite re-renders in mobile sheet
  const handleFileSelect = useCallback((item: FileSystemItem) => {
    onFileSelect(item)
    setIsMobileSheetOpen(false)
  }, [onFileSelect, setIsMobileSheetOpen])

  // Create stable wrapper functions that match FileTree's expected interface
  const handleDeleteItem = useCallback((item: FileSystemItem) => {
    onDeleteItem(item.path)
  }, [onDeleteItem])

  const handleRenameItem = useCallback((item: FileSystemItem, newName: string) => {
    onRenameItem(item.path, newName)
  }, [onRenameItem])

  const handleToggleFolder = useCallback((item: FileSystemItem) => {
    onToggleFolder(item.path)
  }, [onToggleFolder])

  // Memoize workspace props to prevent unnecessary re-renders
  const memoizedWorkspaceProps = useMemo(() => {
    // Only include workspace props if they are fully defined to prevent partial renders
    if (currentWorkspaceId && currentWorkspaceName && workspaces && onWorkspaceJoin && onWorkspaceLeave && onWorkspaceCreate) {
      return {
        currentWorkspaceId,
        currentWorkspaceName,
        workspaces,
        onWorkspaceJoin,
        onWorkspaceLeave,
        onWorkspaceCreate
      }
    }
    return {}
  }, [currentWorkspaceId, currentWorkspaceName, workspaces, onWorkspaceJoin, onWorkspaceLeave, onWorkspaceCreate])

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-full mx-auto">
        {/* First line: Title and Theme toggle */}
        <div className="flex items-center justify-between mb-3 lg:mb-0">
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Mobile menu button */}
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  title="Open file tree"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 lg:hidden">
                <div className="p-4 h-full">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Files</h2>
                  <FileTree
                    items={files}
                    selectedFile={currentFile?.path}
                    onFileSelect={handleFileSelect}
                    onCreateFile={onCreateFile}
                    onCreateFolder={onCreateFolder}
                    onDeleteItem={handleDeleteItem}
                    onRenameItem={handleRenameItem}
                    onToggleFolder={handleToggleFolder}
                    onInitializeTemplate={onInitializeTemplate}
                    showTemplateOptions={files.length === 0}
                    {...memoizedWorkspaceProps}
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="hidden sm:inline">Markdown Explorer</span>
              <span className="sm:hidden">Explorer</span>
            </h1>
          </div>

          {/* Theme toggle always visible on first line */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        {/* Second line: Save status and desktop actions */}
        {currentFile && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 mb-2 lg:mb-0">
              {saveStatus === 'saving' && (
                <span className="text-xs text-yellow-600">Saving...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs text-green-600">✓ Saved</span>
              )}
            </div>

            {/* Desktop action buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onManualSave}
                disabled={!currentFile}
                title="Manual save"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                disabled={!currentFile}
                title="Export markdown"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrint}
                disabled={!currentFile}
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}