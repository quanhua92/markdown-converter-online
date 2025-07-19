import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import mermaid from 'mermaid'
import 'highlight.js/styles/github.css'

export const Route = createFileRoute('/print')({
  component: PrintPage,
})

interface MermaidProps {
  chart: string
}

function MermaidDiagram({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      })
      
      mermaid.render('mermaid-diagram', chart)
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
  }, [chart])

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

  useEffect(() => {
    // Get markdown content from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const content = urlParams.get('content')
    if (content) {
      setMarkdown(decodeURIComponent(content))
    }
  }, [])

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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          .print-container {
            font-family: 'Times New Roman', serif !important;
            font-size: 12pt !important;
            line-height: 1.6 !important;
            color: #000 !important;
            max-width: none !important;
          }
          .no-print {
            display: none !important;
          }
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid !important;
            color: #000 !important;
          }
          p {
            margin-bottom: 1em !important;
            orphans: 3 !important;
            widows: 3 !important;
            color: #000 !important;
          }
          pre {
            background: #f5f5f5 !important;
            padding: 1em !important;
            border-radius: 4px !important;
            overflow-wrap: break-word !important;
            white-space: pre-wrap !important;
            page-break-inside: avoid !important;
            font-family: 'Courier New', monospace !important;
            font-size: 10pt !important;
          }
          code {
            background: #f5f5f5 !important;
            padding: 0.2em 0.4em !important;
            border-radius: 3px !important;
            font-family: 'Courier New', monospace !important;
            font-size: 10pt !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 1em 0 !important;
            page-break-inside: avoid !important;
          }
          th, td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
            text-align: left !important;
          }
          th {
            background-color: #f2f2f2 !important;
            font-weight: bold !important;
          }
          blockquote {
            border-left: 4px solid #ddd !important;
            padding-left: 1em !important;
            margin: 1em 0 !important;
            font-style: italic !important;
          }
          .mermaid-diagram {
            text-align: center !important;
            margin: 2em 0 !important;
            page-break-inside: avoid !important;
          }
          .mermaid-diagram svg {
            max-width: 100% !important;
            height: auto !important;
          }
          ul, ol {
            margin: 1em 0 !important;
            padding-left: 2em !important;
          }
          li {
            margin-bottom: 0.5em !important;
          }
          strong {
            font-weight: bold !important;
          }
          em {
            font-style: italic !important;
          }
        }
        @media screen {
          .print-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }
          .print-controls {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 1rem;
            margin-bottom: 2rem;
            text-align: center;
          }
          .print-button {
            background: #007bff;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 0.5rem;
          }
          .print-button:hover {
            background: #0056b3;
          }
          .close-button {
            background: #6c757d;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          .close-button:hover {
            background: #545b62;
          }
        }
      `}} />
      
      <div className="print-container">
        <div className="print-controls no-print">
          <button 
            className="print-button" 
            onClick={() => window.print()}
          >
            🖨️ Print Document
          </button>
          <button 
            className="close-button" 
            onClick={() => window.close()}
          >
            ✕ Close
          </button>
        </div>

        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h1:border-b prose-h2:border-b prose-h1:border-gray-300 prose-h2:border-gray-200 prose-h1:pb-2 prose-h2:pb-1">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={customComponents}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </>
  )
}