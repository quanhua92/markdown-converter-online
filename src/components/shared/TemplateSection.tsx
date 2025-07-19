import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookOpen, Presentation, FileText, File, X } from 'lucide-react'

interface TemplateSectionProps {
  onApplyTemplate: (templateKey: string) => void
  onClearDraft: () => void
  hasContent: boolean
}

export function TemplateSection({ 
  onApplyTemplate, 
  onClearDraft, 
  hasContent 
}: TemplateSectionProps) {
  return (
    <Card className="mb-6 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Templates
        </CardTitle>
        <CardDescription>
          Start with a pre-built template or create your own markdown content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Attractive Ultimate Template Button */}
          <div className="text-center">
            <Button
              onClick={() => onApplyTemplate('showcase')}
              size="lg"
              className="w-full sm:w-auto px-8 py-4 h-14 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-xl font-bold text-lg relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
            >
              <BookOpen className="mr-3 h-6 w-6" />
              ✨ Try Ultimate Template ✨
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Complete showcase with examples, diagrams & best practices
            </p>
          </div>
          
          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400 px-2">or choose manually</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          
          {/* Template Selection and Clear Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Select onValueChange={onApplyTemplate}>
              <SelectTrigger className="w-full sm:w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
                <SelectValue placeholder="Load Other Templates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="showcase">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Ultimate Showcase
                  </div>
                </SelectItem>
                <SelectItem value="presentation">
                  <div className="flex items-center gap-2">
                    <Presentation className="h-4 w-4" />
                    Presentation
                  </div>
                </SelectItem>
                <SelectItem value="document">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document
                  </div>
                </SelectItem>
                <SelectItem value="article">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    Article
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                onClick={onClearDraft}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                disabled={!hasContent}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}