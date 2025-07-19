import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit3, Eye, Save, Download, Printer } from 'lucide-react'
import { FileSystemItem } from './FileTree'

interface ExplorerMobileNavigationProps {
  currentFile: FileSystemItem | null
  activeTab: string
  setActiveTab: (tab: string) => void
  onManualSave: () => void
  onExport: () => void
  onPrint: () => void
}

export function ExplorerMobileNavigation({
  currentFile,
  activeTab,
  setActiveTab,
  onManualSave,
  onExport,
  onPrint
}: ExplorerMobileNavigationProps) {
  return (
    <div className="mb-4 mx-2 lg:mx-0 space-y-3">
      {/* Tab buttons */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-white dark:bg-gray-800 shadow-md">
          <TabsTrigger value="edit" className="flex-1 text-xs lg:text-sm">
            <Edit3 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1 text-xs lg:text-sm">
            <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Mobile action buttons below tabs */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onManualSave}
          disabled={!currentFile}
          title="Manual save"
          className="flex items-center gap-1 text-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          disabled={!currentFile}
          title="Export markdown"
          className="flex items-center gap-1 text-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrint}
          disabled={!currentFile}
          title="Print"
          className="flex items-center gap-1 text-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </Button>
      </div>
    </div>
  )
}