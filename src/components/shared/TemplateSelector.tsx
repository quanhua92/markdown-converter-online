import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { FolderPlus, Sparkles } from 'lucide-react'
import { folderTemplates, FolderTemplate, initializeTemplateStructure } from './folderTemplates'
import { FileSystemItem } from './FileTree'

interface TemplateSelectorProps {
  onTemplateSelect: (items: FileSystemItem[]) => void
  trigger?: React.ReactNode
  className?: string
}

interface TemplateCardProps {
  template: FolderTemplate
  onSelect: () => void
  isSelected: boolean
}

function TemplateCard({ template, onSelect, isSelected }: TemplateCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">{template.icon}</span>
          {template.name}
        </CardTitle>
        <CardDescription className="text-sm">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Includes:
          </div>
          <div className="flex flex-wrap gap-1">
            {template.structure.map((item, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {item.type === 'folder' ? '📁' : '📄'} {item.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TemplateSelector({ onTemplateSelect, trigger, className }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleConfirm = () => {
    if (selectedTemplate) {
      const template = folderTemplates[selectedTemplate]
      const items = initializeTemplateStructure(template)
      onTemplateSelect(items)
      setIsOpen(false)
      setSelectedTemplate(null)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setSelectedTemplate(null)
  }

  const defaultTrigger = (
    <Button variant="outline" className={className}>
      <FolderPlus className="w-4 h-4 mr-2" />
      Initialize from Template
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Choose a Template
          </DialogTitle>
          <DialogDescription>
            Select a template to initialize your workspace with a pre-built folder structure and sample content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {Object.values(folderTemplates).map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => handleTemplateSelect(template.id)}
              isSelected={selectedTemplate === template.id}
            />
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedTemplate ? (
              <span>✨ {folderTemplates[selectedTemplate].name} selected</span>
            ) : (
              <span>Select a template to continue</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedTemplate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Initialize Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TemplateQuickActions({ onTemplateSelect, className }: { onTemplateSelect: (items: FileSystemItem[]) => void, className?: string }) {
  const quickTemplates = ['project-notes', 'knowledge-base', 'blog-site']

  const handleQuickSelect = (templateId: string) => {
    const template = folderTemplates[templateId]
    const items = initializeTemplateStructure(template)
    onTemplateSelect(items)
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {quickTemplates.map((templateId) => {
        const template = folderTemplates[templateId]
        return (
          <Button
            key={templateId}
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect(templateId)}
            className="text-xs"
            data-testid={`quick-template-${templateId}`}
          >
            <span className="mr-1">{template.icon}</span>
            {template.name}
          </Button>
        )
      })}
    </div>
  )
}