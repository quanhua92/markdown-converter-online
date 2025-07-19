import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Download,
  FileText,
  Printer,
  Settings,
  ChevronDown,
  Loader2,
  CheckCircle,
  Copy
} from 'lucide-react'
import type { ConversionOptions } from './index'

interface OutputFormatAndConversionSectionProps {
  selectedFormat: string
  onFormatChange: (format: string) => void
  formatConfig: Record<string, any>
  conversionOptions: ConversionOptions
  onConversionOptionsChange: (options: ConversionOptions) => void
  showAdvancedOptions: boolean
  onAdvancedOptionsToggle: (show: boolean) => void
  isConverting: boolean
  hasContent: boolean
  onConvert: () => void
  onPrint: () => void
  downloadResult: any
  onClearResult: () => void
  conversionError: any
  onDismissError: () => void
  onCopyToClipboard: () => void
  onDownload: () => void
}

export function OutputFormatAndConversionSection({
  selectedFormat,
  onFormatChange,
  formatConfig,
  conversionOptions,
  onConversionOptionsChange,
  showAdvancedOptions,
  onAdvancedOptionsToggle,
  isConverting,
  hasContent,
  onConvert,
  onPrint,
  downloadResult,
  onClearResult,
  conversionError,
  onDismissError,
  onCopyToClipboard,
  onDownload
}: OutputFormatAndConversionSectionProps) {
  const currentConfig = formatConfig[selectedFormat]
  const IconComponent = currentConfig.icon

  return (
    <>
      {/* Output Format Selection */}
      <Card className="mb-6 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            Output Format
          </CardTitle>
          <CardDescription>
            Choose the format you want to convert your markdown to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {Object.entries(formatConfig).map(([format, config]) => {
              const Icon = config.icon
              const isSelected = selectedFormat === format
              
              return (
                <Card 
                  key={format}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border ${
                    isSelected ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/40 dark:to-purple-900/40 scale-105 shadow-2xl' : 'border-gray-200/50 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                  }`}
                  onClick={() => onFormatChange(format)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs">
                        {config.badge}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base">{config.label}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                      {config.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvancedOptions} onOpenChange={onAdvancedOptionsToggle}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between mt-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Options
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {selectedFormat === 'pptx' ? (
                /* Marp Options */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={conversionOptions.theme} onValueChange={(value) => onConversionOptionsChange({...conversionOptions, theme: value})}>
                        <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="gaia">Gaia</SelectItem>
                          <SelectItem value="uncover">Uncover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="imageScale">Image Scale</Label>
                      <Select value={conversionOptions.imageScale?.toString()} onValueChange={(value) => onConversionOptionsChange({...conversionOptions, imageScale: parseInt(value)})}>
                        <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x (Standard)</SelectItem>
                          <SelectItem value="2">2x (High Quality)</SelectItem>
                          <SelectItem value="3">3x (Ultra High)</SelectItem>
                          <SelectItem value="4">4x (Maximum)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                /* Pandoc Options */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedFormat === 'pdf' && (
                      <>
                        <div>
                          <Label htmlFor="margin">Page Margins</Label>
                          <Select value={conversionOptions.margin} onValueChange={(value) => onConversionOptionsChange({...conversionOptions, margin: value})}>
                            <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.5in">0.5 inch</SelectItem>
                              <SelectItem value="1in">1 inch</SelectItem>
                              <SelectItem value="1.5in">1.5 inches</SelectItem>
                              <SelectItem value="2in">2 inches</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="fontSize">Font Size</Label>
                          <Select value={conversionOptions.fontSize} onValueChange={(value) => onConversionOptionsChange({...conversionOptions, fontSize: value})}>
                            <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10pt">10pt</SelectItem>
                              <SelectItem value="11pt">11pt</SelectItem>
                              <SelectItem value="12pt">12pt</SelectItem>
                              <SelectItem value="14pt">14pt</SelectItem>
                              <SelectItem value="16pt">16pt</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="toc" 
                        checked={conversionOptions.toc} 
                        onCheckedChange={(checked) => onConversionOptionsChange({...conversionOptions, toc: checked})}
                      />
                      <Label htmlFor="toc">Table of Contents</Label>
                    </div>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Convert Button */}
      <div className="text-center mb-6">
        {!downloadResult ? (
          <Button 
            onClick={onConvert}
            disabled={isConverting || !hasContent}
            size="lg"
            className="w-full sm:w-auto px-8 py-3 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-full font-semibold text-lg relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Convert to {currentConfig.label}
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={onClearResult}
            size="lg"
            className="w-full sm:w-auto px-8 py-3 h-12 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-lg hover:scale-105 rounded-full font-semibold text-lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            Convert Another File
          </Button>
        )}
      </div>

      {/* Print Button */}
      <div className="text-center mb-6">
        <Button 
          onClick={onPrint}
          disabled={!hasContent}
          size="lg"
          className="w-full sm:w-auto px-8 py-3 h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 rounded-full font-semibold text-lg relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Preview
        </Button>
      </div>

      {/* Download Result UI */}
      {downloadResult && (
        <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 shadow-xl">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-green-800 text-lg sm:text-xl">
              <Download className="h-5 w-5" />
              Conversion Complete!
            </CardTitle>
            <CardDescription className="text-green-700 text-sm sm:text-base">
              Your {formatConfig[downloadResult.format as keyof typeof formatConfig].label} file is ready for download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  {(() => {
                    const IconComponent = formatConfig[downloadResult.format as keyof typeof formatConfig].icon
                    return IconComponent ? <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" /> : null
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{downloadResult.filename}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Generated {downloadResult.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={onDownload}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-1 sm:flex-none h-10 px-6 hover:scale-105"
                  size="default"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={onClearResult}
                  size="default"
                  className="h-10 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  ✕
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Error Debug Section */}
      {conversionError && (
        <Card className="mb-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700 shadow-xl">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-red-800 text-lg sm:text-xl">
              ✕
              Conversion Failed
            </CardTitle>
            <CardDescription className="text-red-700 text-sm sm:text-base">
              {conversionError.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionError.details && (
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Details:</h4>
                  <pre className="bg-red-100 dark:bg-red-900/20 p-3 rounded text-sm overflow-x-auto text-red-700 dark:text-red-300">
                    {conversionError.details}
                  </pre>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={onDismissError}
                  size="sm"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  ✕ Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}