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
  onPrint
}: ExplorerHeaderProps) {
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
                    onFileSelect={(item) => {
                      onFileSelect(item)
                      setIsMobileSheetOpen(false)
                    }}
                    onCreateFile={onCreateFile}
                    onCreateFolder={onCreateFolder}
                    onDeleteItem={onDeleteItem}
                    onRenameItem={onRenameItem}
                    onToggleFolder={onToggleFolder}
                    onInitializeTemplate={onInitializeTemplate}
                    showTemplateOptions={files.length === 0}
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

        {/* Second line: File info and desktop actions */}
        {currentFile && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 mb-2 lg:mb-0">
              <span className="text-sm text-gray-500 dark:text-gray-400">Editing:</span>
              <Badge variant="secondary">{currentFile.name}</Badge>
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