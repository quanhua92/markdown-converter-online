import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
  forPrint?: boolean
}

export function MermaidDiagram({ chart, forPrint = false }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [uniqueId] = useState(() => `mermaid-diagram-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    if (ref.current) {
      // Detect dark mode for Mermaid theme, but use light theme for print
      const isDark = !forPrint && document.documentElement.classList.contains('dark')
      
      mermaid.initialize({
        startOnLoad: true,
        theme: isDark ? 'dark' : 'default',
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
  }, [chart, uniqueId, forPrint])

  if (error) {
    if (forPrint) {
      return (
        <div style={{ color: 'red', border: '1px solid red', padding: '10px', margin: '10px 0' }}>
          Error rendering diagram: {error}
        </div>
      )
    }
    return <div className="text-red-500 p-4 border border-red-200 rounded">{error}</div>
  }

  return <div ref={ref} className="mermaid-diagram" />
}