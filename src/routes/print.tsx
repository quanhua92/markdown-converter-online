import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import mermaid from 'mermaid'
import { Moon, Sun, Printer, X } from 'lucide-react'

export const Route = createFileRoute('/print')({
  component: PrintPage,
})

interface MermaidProps {
  chart: string
}

function MermaidDiagram({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [uniqueId] = useState(() => `mermaid-diagram-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    if (ref.current) {
      // Always use light theme for print to match print CSS that forces white background
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      })
      
      mermaid.render(uniqueId, chart)
        .then((result) => {
          if (ref.current) {
            ref.current.innerHTML = result.svg
          }
        })
        .catch((err) => {
          console.error('Mermaid rendering error:', err)
          setError('Failed to render diagram')
        })
    }
  }, [chart, uniqueId])

  if (error) {
    return (
      <div style={{ color: 'red', border: '1px solid red', padding: '10px', margin: '10px 0' }}>
        Error rendering diagram: {error}
      </div>
    )
  }

  return <div ref={ref} className="mermaid-diagram" />
}

function PrintPage() {
  const [markdown, setMarkdown] = useState('')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    // Get markdown content from localStorage (fallback to URL parameters)
    const storedContent = localStorage.getItem('markdownDraft')
    if (storedContent) {
      setMarkdown(storedContent)
      // Don't clear the draft - keep it for the editor
    } else {
      // Fallback to URL parameters for backward compatibility
      const urlParams = new URLSearchParams(window.location.search)
      const content = urlParams.get('content')
      if (content) {
        setMarkdown(decodeURIComponent(content))
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const customComponents = {
    code(props: any) {
      const { children, className, ...rest } = props
      const match = /language-(\w+)/.exec(className || '')
      if (match && match[1] === 'mermaid') {
        return <MermaidDiagram chart={children as string} />
      }
      return <code {...rest} className={className}>{children}</code>
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Print-only CSS - minimal and focused */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          .no-print {
            display: none !important;
          }
          body, .print-content {
            font-family: 'Times New Roman', serif !important;
            font-size: 12pt !important;
            line-height: 1.6 !important;
            color: #000 !important;
            background: white !important;
          }
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid !important;
            color: #000 !important;
          }
          p {
            orphans: 3 !important;
            widows: 3 !important;
            color: #000 !important;
          }
          pre, code {
            background: #f5f5f5 !important;
            color: #000 !important;
            border: 1px solid #ddd !important;
          }
          pre {
            page-break-inside: avoid !important;
            font-family: 'Courier New', monospace !important;
            font-size: 10pt !important;
          }
          .mermaid-diagram {
            page-break-inside: avoid !important;
            max-width: 100% !important;
            max-height: 80vh !important;
            overflow: hidden !important;
          }
          .mermaid-diagram svg {
            max-width: 100% !important;
            max-height: 80vh !important;
            width: auto !important;
            height: auto !important;
          }
          table {
            page-break-inside: avoid !important;
          }
          /* KaTeX math rendering for print */
          .katex {
            font-size: 1.1em !important;
            color: #000 !important;
          }
          .katex-display {
            margin: 1em 0 !important;
            text-align: center !important;
          }
        }
      `}} />
      
      <div className="max-w-4xl mx-auto p-8">
        {/* Controls - only visible on screen */}
        <div className="no-print bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              📄 Print Preview
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Read-only view optimized for printing
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Printer className="w-4 h-4" />
              Print Document
            </button>
            
            <button 
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4" />
                  Light
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  Dark
                </>
              )}
            </button>
            
            <button 
              onClick={() => window.close()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="print-content prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h1:border-b prose-h2:border-b prose-h1:border-gray-300 dark:prose-h1:border-gray-600 prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h1:pb-2 prose-h2:pb-1">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]}
            rehypePlugins={[rehypeSlug, rehypeHighlight, [rehypeKatex, { strict: false }], rehypeRaw]}
            components={customComponents}
          >
            {markdown}
          </ReactMarkdown>
        </div>

        {/* Footer with GitHub link */}
        <div className="no-print mt-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p>
            <a 
              href="https://github.com/quanhua92/markdown-converter-online" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline hover:no-underline transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}