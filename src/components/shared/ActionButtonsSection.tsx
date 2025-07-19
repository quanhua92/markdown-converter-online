import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit3, Eye, Download, Printer } from 'lucide-react'

interface ActionButtonsSectionProps {
  isDesktop: boolean
  showEditPanel: boolean
  showPreviewPanel: boolean
  activeTab: string
  onToggleEditPanel: () => void
  onTogglePreviewPanel: () => void
  onSetActiveTab: (tab: string) => void
  onExport: () => void
  onPrint: () => void
}

export function ActionButtonsSection({
  isDesktop,
  showEditPanel,
  showPreviewPanel,
  activeTab,
  onToggleEditPanel,
  onTogglePreviewPanel,
  onSetActiveTab,
  onExport,
  onPrint
}: ActionButtonsSectionProps) {
  return (
    <Card className="mb-6 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Edit Button */}
          <Button
            variant={isDesktop ? (showEditPanel ? "default" : "outline") : (activeTab === 'edit' ? "default" : "outline")}
            size="sm"
            onClick={() => {
              if (isDesktop) {
                onToggleEditPanel()
              } else {
                onSetActiveTab('edit')
              }
            }}
            className="flex items-center justify-center gap-2 h-12"
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </Button>
          
          {/* Preview Button */}
          <Button
            variant={isDesktop ? (showPreviewPanel ? "default" : "outline") : (activeTab === 'preview' ? "default" : "outline")}
            size="sm"
            onClick={() => {
              if (isDesktop) {
                onTogglePreviewPanel()
              } else {
                onSetActiveTab('preview')
              }
            }}
            className="flex items-center justify-center gap-2 h-12"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">Preview</span>
          </Button>
          
          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center justify-center gap-2 h-12"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </Button>
          
          {/* Print Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="flex items-center justify-center gap-2 h-12"
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm">Print</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}