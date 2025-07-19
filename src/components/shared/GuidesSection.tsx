import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Code,
  Lightbulb,
  Clock,
  Users,
  Target,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'

export function GuidesSection() {
  const [activeSection, setActiveSection] = useState<string>('getting-started')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const CodeBlock = ({ children, onCopy }: { children: string; onCopy?: () => void }) => (
    <div className="relative bg-gray-800 dark:bg-gray-950 rounded-lg p-4 my-4">
      <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
        <code>{children}</code>
      </pre>
      {onCopy && (
        <button
          onClick={onCopy}
          className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
        >
          Copy
        </button>
      )}
    </div>
  )

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Two Powerful Ways to Use Markdown Converter</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📄 Preview & Print</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Render markdown with full Mermaid diagrams and LaTeX math support. Perfect for viewing and printing documents.
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Live preview with syntax highlighting</li>
                <li>• Mermaid diagrams (flowcharts, sequences, etc.)</li>
                <li>• LaTeX math rendering (KaTeX)</li>
                <li>• Print-optimized layout</li>
                <li>• Dark/light mode support</li>
              </ul>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">📁 Convert & Export</h4>
              <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                Transform markdown into multiple file formats for sharing and distribution.
              </p>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• PowerPoint (.pptx) with Marp</li>
                <li>• PDF documents with styling</li>
                <li>• Word documents (.docx)</li>
                <li>• HTML with embedded CSS</li>
                <li>• Advanced formatting options</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">🚀 Quick Start</h4>
            <ol className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 pl-4">
              <li>1. Click "Try Ultimate Template" to load example content</li>
              <li>2. Edit the markdown in the left panel</li>
              <li>3. Preview your content in the right panel</li>
              <li>4. Choose an output format and convert</li>
              <li>5. Download your file or print directly</li>
            </ol>
          </div>
        </div>
      )
    },
    'markdown-syntax': {
      title: 'Markdown Syntax',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Essential Markdown Syntax</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Headers</h4>
              <CodeBlock onCopy={() => copyToClipboard('# Heading 1\n## Heading 2\n### Heading 3')}>
{`# Heading 1
## Heading 2
### Heading 3`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Text Formatting</h4>
              <CodeBlock onCopy={() => copyToClipboard('**bold text**\n*italic text*\n~~strikethrough~~\n`inline code`')}>
{`**bold text**
*italic text*
~~strikethrough~~
\`inline code\``}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Lists</h4>
              <CodeBlock onCopy={() => copyToClipboard('- Unordered item 1\n- Unordered item 2\n  - Nested item\n\n1. Ordered item 1\n2. Ordered item 2')}>
{`- Unordered item 1
- Unordered item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Links and Images</h4>
              <CodeBlock onCopy={() => copyToClipboard('[Link text](https://example.com)\n![Image alt text](image-url.jpg)')}>
{`[Link text](https://example.com)
![Image alt text](image-url.jpg)`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tables</h4>
              <CodeBlock onCopy={() => copyToClipboard('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |')}>
{`| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Code Blocks</h4>
              <CodeBlock onCopy={() => copyToClipboard('```javascript\nfunction hello() {\n  console.log("Hello, world!");\n}\n```')}>
{`\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\``}
              </CodeBlock>
            </div>
          </div>
        </div>
      )
    },
    'mermaid-diagrams': {
      title: 'Mermaid Diagrams',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Create Beautiful Diagrams</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Flowchart</h4>
              <CodeBlock onCopy={() => copyToClipboard('```mermaid\nflowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n    C --> E[End]\n    D --> E\n```')}>
{`\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\``}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Sequence Diagram</h4>
              <CodeBlock onCopy={() => copyToClipboard('```mermaid\nsequenceDiagram\n    Alice->>Bob: Hello Bob, how are you?\n    Bob-->>John: How about you John?\n    Bob--x Alice: I am good thanks!\n    Bob-x John: I am good thanks!\n```')}>
{`\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>John: How about you John?
    Bob--x Alice: I am good thanks!
    Bob-x John: I am good thanks!
\`\`\``}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Class Diagram</h4>
              <CodeBlock onCopy={() => copyToClipboard('```mermaid\nclassDiagram\n    class Animal {\n        +String name\n        +int age\n        +makeSound()\n    }\n    class Dog {\n        +bark()\n    }\n    Animal <|-- Dog\n```')}>
{`\`\`\`mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog
\`\`\``}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Gantt Chart</h4>
              <CodeBlock onCopy={() => copyToClipboard('```mermaid\ngantt\n    title Project Timeline\n    dateFormat  YYYY-MM-DD\n    section Planning\n    Research    :done,    des1, 2024-01-01,2024-01-07\n    Design      :active,  des2, 2024-01-08, 3d\n    section Development\n    Coding      :         dev1, after des2, 5d\n    Testing     :         test1, after dev1, 3d\n```')}>
{`\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Research    :done,    des1, 2024-01-01,2024-01-07
    Design      :active,  des2, 2024-01-08, 3d
    section Development
    Coding      :         dev1, after des2, 5d
    Testing     :         test1, after dev1, 3d
\`\`\``}
              </CodeBlock>
            </div>
          </div>
        </div>
      )
    },
    'latex-math': {
      title: 'LaTeX Math',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Mathematical Expressions with KaTeX</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Inline Math</h4>
              <p className="mb-2">Use single dollar signs for inline math:</p>
              <CodeBlock onCopy={() => copyToClipboard('The equation $E = mc^2$ was discovered by Einstein.')}>
{`The equation $E = mc^2$ was discovered by Einstein.`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Block Math</h4>
              <p className="mb-2">Use double dollar signs for block math:</p>
              <CodeBlock onCopy={() => copyToClipboard('$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$')}>
{`$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Common Symbols</h4>
              <CodeBlock onCopy={() => copyToClipboard('$\\alpha, \\beta, \\gamma, \\delta$\n$\\sum_{i=1}^{n} x_i$\n$\\int_0^1 f(x) dx$\n$\\lim_{x \\to \\infty} f(x)$')}>
{`$\\alpha, \\beta, \\gamma, \\delta$
$\\sum_{i=1}^{n} x_i$
$\\int_0^1 f(x) dx$
$\\lim_{x \\to \\infty} f(x)$`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Matrices</h4>
              <CodeBlock onCopy={() => copyToClipboard('$$\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}$$')}>
{`$$\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}$$`}
              </CodeBlock>
            </div>
          </div>
        </div>
      )
    },
    'presentations': {
      title: 'Presentations with Marp',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Create Stunning Presentations</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Basic Slide Structure</h4>
              <CodeBlock onCopy={() => copyToClipboard('---\nmarp: true\ntheme: default\n---\n\n# Slide 1 Title\n\nYour content here\n\n---\n\n# Slide 2 Title\n\nMore content')}>
{`---
marp: true
theme: default
---

# Slide 1 Title

Your content here

---

# Slide 2 Title

More content`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Slide with Background</h4>
              <CodeBlock onCopy={() => copyToClipboard('<!-- _backgroundColor: #1e3a8a -->\n<!-- _color: white -->\n\n# Title Slide\n\n## Subtitle\n\nPresented by: Your Name')}>
{`<!-- _backgroundColor: #1e3a8a -->
<!-- _color: white -->

# Title Slide

## Subtitle

Presented by: Your Name`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Two-Column Layout</h4>
              <CodeBlock onCopy={() => copyToClipboard('<div class="columns">\n<div>\n\n## Left Column\n\n- Point 1\n- Point 2\n\n</div>\n<div>\n\n## Right Column\n\n![image](url)\n\n</div>\n</div>')}>
{`<div class="columns">
<div>

## Left Column

- Point 1
- Point 2

</div>
<div>

## Right Column

![image](url)

</div>
</div>`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Presenter Notes</h4>
              <CodeBlock onCopy={() => copyToClipboard('# Slide Content\n\nVisible content here\n\n<!-- \nThese are presenter notes that won\'t appear on slides\nbut can be useful for reference\n-->')}>
{`# Slide Content

Visible content here

<!-- 
These are presenter notes that won't appear on slides
but can be useful for reference
-->`}
              </CodeBlock>
            </div>
          </div>
        </div>
      )
    },
    'advanced-tips': {
      title: 'Advanced Tips',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Pro Tips & Best Practices</h3>
          
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🎨 Styling Tips</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Use consistent heading hierarchy (H1 → H2 → H3)</li>
                <li>• Add empty lines around code blocks and diagrams</li>
                <li>• Use blockquotes for important callouts</li>
                <li>• Keep line lengths reasonable for readability</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">⚡ Performance Tips</h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Large diagrams may slow down preview rendering</li>
                <li>• Complex math expressions are processed on each change</li>
                <li>• Use auto-save feature - your work is preserved locally</li>
                <li>• For long documents, consider breaking into sections</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">🔧 Troubleshooting</h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Mermaid not rendering? Check syntax with the online editor</li>
                <li>• Math not displaying? Ensure proper escaping of backslashes</li>
                <li>• Conversion failed? Try simpler content to isolate issues</li>
                <li>• Print issues? Use the dedicated print preview button</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">📚 Resources</h4>
              <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <li>• <a href="https://mermaid.js.org/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Mermaid Documentation</a></li>
                <li>• <a href="https://katex.org/docs/supported.html" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">KaTeX Supported Functions</a></li>
                <li>• <a href="https://marpit.marp.app/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Marp Theme Gallery</a></li>
                <li>• <a href="https://pandoc.org/MANUAL.html" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Pandoc User Guide</a></li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Card className="shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Guides & Documentation
          </CardTitle>
          <CardDescription>
            Learn how to make the most of Markdown Converter's features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(sections).map(([key, section]) => (
              <Button
                key={key}
                onClick={() => setActiveSection(key)}
                variant={activeSection === key ? 'default' : 'outline'}
                className="justify-start h-auto p-3 text-left"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center gap-2">
                    {key === 'getting-started' && <Target className="h-4 w-4" />}
                    {key === 'markdown-syntax' && <Code className="h-4 w-4" />}
                    {key === 'mermaid-diagrams' && <Lightbulb className="h-4 w-4" />}
                    {key === 'latex-math' && <Users className="h-4 w-4" />}
                    {key === 'presentations' && <Clock className="h-4 w-4" />}
                    {key === 'advanced-tips' && <ChevronRight className="h-4 w-4" />}
                    <span className="font-medium text-sm">{section.title}</span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {activeSection === 'getting-started' && <Target className="h-5 w-5" />}
              {activeSection === 'markdown-syntax' && <Code className="h-5 w-5" />}
              {activeSection === 'mermaid-diagrams' && <Lightbulb className="h-5 w-5" />}
              {activeSection === 'latex-math' && <Users className="h-5 w-5" />}
              {activeSection === 'presentations' && <Clock className="h-5 w-5" />}
              {activeSection === 'advanced-tips' && <ChevronRight className="h-5 w-5" />}
              {sections[activeSection as keyof typeof sections].title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Guide
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-none">
          {sections[activeSection as keyof typeof sections].content}
        </CardContent>
      </Card>
    </div>
  )
}