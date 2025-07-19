import { Button } from '@/components/ui/button'
import { Edit3, BookOpen, Sun, Moon, FolderOpen } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface HeaderSectionProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  currentView: 'editor' | 'guides'
  onViewChange: (view: 'editor' | 'guides') => void
}

export function HeaderSection({
  isDarkMode,
  onToggleTheme,
  currentView,
  onViewChange
}: HeaderSectionProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Markdown Converter
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 mt-2 font-medium">
            ✨ Convert & preview markdown with Mermaid/LaTeX • Export to PowerPoint, PDF, Word, HTML
          </p>
        </div>
        <div className="flex items-center">
          <Button
            onClick={onToggleTheme}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-md rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <>
                <Sun className="h-4 w-4" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
        <Button
          onClick={() => onViewChange('editor')}
          variant={currentView === 'editor' ? 'default' : 'outline'}
          size="default"
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            currentView === 'editor' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm'
          }`}
        >
          <Edit3 className="h-4 w-4" />
          Converter
        </Button>
        <Link to="/explorer">
          <Button
            variant="outline"
            size="default"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-900/30"
          >
            <FolderOpen className="h-4 w-4" />
            Explorer
          </Button>
        </Link>
        <Button
          onClick={() => onViewChange('guides')}
          variant={currentView === 'guides' ? 'default' : 'outline'}
          size="default"
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            currentView === 'guides' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Guides
        </Button>
      </div>
    </div>
  )
}