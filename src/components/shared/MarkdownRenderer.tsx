import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import { MermaidDiagram } from './MermaidDiagram'

interface MarkdownRendererProps {
  content: string
  forPrint?: boolean
  className?: string
}

export function MarkdownRenderer({ content, forPrint = false, className }: MarkdownRendererProps) {
  const customComponents = {
    code(props: any) {
      const { children, className, ...rest } = props
      const match = /language-(\w+)/.exec(className || '')
      if (match && match[1] === 'mermaid') {
        return <MermaidDiagram chart={children as string} forPrint={forPrint} />
      }
      return <code {...rest} className={className}>{children}</code>
    },
    table(props: any) {
      return (
        <div className="table-container">
          <table {...props} />
        </div>
      )
    }
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]}
        rehypePlugins={[rehypeSlug, rehypeHighlight, [rehypeKatex, { strict: false }], rehypeRaw]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}