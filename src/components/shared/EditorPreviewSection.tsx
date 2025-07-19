import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Edit3, Eye } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'

type DraftSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface EditorPreviewSectionProps {
  isDesktop: boolean
  showEditPanel: boolean
  showPreviewPanel: boolean
  activeTab: string
  markdown: string
  onMarkdownChange: (value: string) => void
  draftSaveStatus: DraftSaveStatus
}

export function EditorPreviewSection({
  isDesktop,
  showEditPanel,
  showPreviewPanel,
  activeTab,
  markdown,
  onMarkdownChange,
  draftSaveStatus
}: EditorPreviewSectionProps) {
  return (
    <div className={`grid gap-6 mb-6 ${
      isDesktop 
        ? (showEditPanel && showPreviewPanel 
            ? 'grid-cols-2' 
            : 'grid-cols-1') 
        : 'grid-cols-1'
    }`}>
      <Card className={`shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300 ${
        isDesktop ? (!showEditPanel ? 'hidden' : '') : ''
      }`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Markdown Editor
            {draftSaveStatus === 'saving' && (
              <span className="text-xs text-gray-500 ml-2">Saving...</span>
            )}
            {draftSaveStatus === 'saved' && (
              <span className="text-xs text-green-600 ml-2">✓ Saved</span>
            )}
            {draftSaveStatus === 'error' && (
              <span className="text-xs text-red-500 ml-2">⚠ Save failed</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className={!isDesktop && activeTab === 'preview' ? 'hidden' : ''}>
          <Textarea
            value={markdown}
            onChange={(e) => onMarkdownChange(e.target.value)}
            placeholder="Enter your markdown here..."
            className="min-h-[600px] font-mono resize-none"
            style={{ fontSize: '14px' }}
          />
        </CardContent>
      </Card>

      <Card className={`shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300 ${
        isDesktop ? (!showPreviewPanel ? 'hidden' : '') : ''
      }`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
              <Badge variant="secondary" className="ml-2">Mermaid + Syntax</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className={!isDesktop && activeTab === 'edit' ? 'hidden' : ''}>
          <MarkdownRenderer
            content={markdown}
            className="min-h-[600px] overflow-auto prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h1:border-b prose-h2:border-b prose-h1:border-gray-300 prose-h2:border-gray-200 prose-h1:pb-2 prose-h2:pb-1"
          />
        </CardContent>
      </Card>
    </div>
  )
}