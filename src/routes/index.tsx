import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { toast, Toaster } from 'sonner'
import { Download, FileText, Presentation, File, Loader2, Edit3, Eye, Printer, Settings, Moon, Sun, ChevronDown, BookOpen, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import mermaid from 'mermaid'
import 'highlight.js/styles/github.css'

export const Route = createFileRoute('/')({
  component: Index,
})

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface MermaidProps {
  chart: string
}

function MermaidDiagram({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ref.current) {
      // Detect dark mode for Mermaid theme
      const isDark = document.documentElement.classList.contains('dark')
      mermaid.initialize({
        startOnLoad: true,
        theme: isDark ? 'dark' : 'default',
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
    return <div className="text-red-500 p-4 border border-red-200 rounded">{error}</div>
  }

  return <div ref={ref} className="mermaid-diagram" />
}

function Index() {
  // Git commit hash - prevent optimization
  const gitCommit = ['1', '5', '1', '0', 'd', 'f', 'c'].join('')
  
  const [markdown, setMarkdown] = useState('')
  const [draftSaveStatus, setDraftSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  
  const [selectedFormat, setSelectedFormat] = useState<string>('pptx')
  const [isConverting, setIsConverting] = useState(false)
  const [currentView, setCurrentView] = useState<'editor' | 'guides'>('editor')
  const [showConverterPreview, setShowConverterPreview] = useState(false)
  const [downloadResult, setDownloadResult] = useState<{
    success: boolean;
    downloadUrl: string;
    filename: string;
    format: string;
    timestamp: Date;
  } | null>(null)
  const [conversionError, setConversionError] = useState<{
    message: string;
    details?: string;
    stderr?: string;
    stdout?: string;
  } | null>(null)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [conversionOptions, setConversionOptions] = useState<{
    // Marp options
    theme?: string;
    imageScale?: number;
    browserTimeout?: number;
    browser?: string;
    // Pandoc options
    margin?: string;
    fontSize?: string;
    toc?: boolean;
    tocDepth?: number;
    colorLinks?: boolean;
    paperSize?: string;
    selfContained?: boolean;
    sectionDivs?: boolean;
    citeproc?: boolean;
  }>({
    theme: 'default',
    imageScale: 2,
    browserTimeout: 60000,
    browser: 'chrome',
    margin: '1in',
    fontSize: '12pt',
    toc: false,
    tocDepth: 2,
    colorLinks: true,
    paperSize: 'a4paper',
    selfContained: false,
    sectionDivs: false,
    citeproc: false
  })
  
  // Editor-specific state
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isDesktop, setIsDesktop] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState('light')
  const [fontSize, setFontSize] = useState('14')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [previewStyle, setPreviewStyle] = useState('github')

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
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('markdownDraft')
      if (savedDraft && savedDraft.trim()) {
        setMarkdown(savedDraft)
        setDraftSaveStatus('saved')
      }
    } catch (error) {
      console.warn('Failed to load draft from localStorage:', error)
      setDraftSaveStatus('error')
    }
  }, [])

  // Debounced draft save
  const saveDraft = useCallback(
    debounce((content: string) => {
      try {
        setDraftSaveStatus('saving')
        if (content.trim()) {
          localStorage.setItem('markdownDraft', content)
        } else {
          localStorage.removeItem('markdownDraft')
        }
        setDraftSaveStatus('saved')
        
        // Clear saved status after 2 seconds
        setTimeout(() => {
          setDraftSaveStatus('idle')
        }, 2000)
      } catch (error) {
        console.error('Failed to save draft:', error)
        setDraftSaveStatus('error')
        setTimeout(() => {
          setDraftSaveStatus('idle')
        }, 3000)
      }
    }, 1000),
    []
  )

  // Save draft when markdown changes
  useEffect(() => {
    if (markdown !== '') {
      saveDraft(markdown)
    }
  }, [markdown, saveDraft])

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

  const formatConfig = {
    pptx: { 
      label: 'PowerPoint', 
      icon: Presentation, 
      endpoint: '/api/convert/marp',
      description: 'Interactive presentation slides',
      badge: 'Popular'
    },
    html: { 
      label: 'HTML', 
      icon: FileText, 
      endpoint: '/api/convert/pandoc',
      description: 'Web-ready HTML document',
      badge: 'Fast'
    },
    docx: { 
      label: 'Word', 
      icon: File, 
      endpoint: '/api/convert/pandoc',
      description: 'Microsoft Word document',
      badge: 'Standard'
    },
    pdf: { 
      label: 'PDF', 
      icon: FileText, 
      endpoint: '/api/convert/pandoc',
      description: 'Portable document format',
      badge: 'Print-ready'
    }
  }

  const handleConvert = async () => {
    if (!markdown.trim()) {
      toast.error('Please enter some markdown content')
      return
    }

    setIsConverting(true)
    setConversionError(null) // Clear previous errors
    const config = formatConfig[selectedFormat as keyof typeof formatConfig]
    
    try {
      const payload = selectedFormat === 'pptx' 
        ? { markdown, options: conversionOptions }
        : { markdown, format: selectedFormat, options: conversionOptions }
      
      toast.info(`Converting to ${config.label}...`)
      
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Store detailed error information
        setConversionError({
          message: errorData.error || `Conversion failed (${response.status})`,
          details: errorData.details,
          stderr: errorData.stderr,
          stdout: errorData.stdout
        })
        
        throw new Error(errorData.error || `Conversion failed (${response.status})`)
      }

      const result = await response.json()
      
      if (result.success && result.downloadUrl) {
        // Store download result for UI display
        setDownloadResult({
          success: true,
          downloadUrl: result.downloadUrl,
          filename: result.filename,
          format: selectedFormat,
          timestamp: new Date()
        })
        
        toast.success(`${config.label} file ready for download!`)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Conversion error:', error)
      toast.error(error instanceof Error ? error.message : 'Conversion failed')
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = async () => {
    if (!downloadResult) return
    
    try {
      const downloadResponse = await fetch(downloadResult.downloadUrl)
      if (!downloadResponse.ok) {
        throw new Error('Failed to download file')
      }
      
      const blob = await downloadResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadResult.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('File downloaded successfully!')
    } catch (error) {
      toast.error('Download failed. Please try again.')
    }
  }

  const clearResult = () => {
    setDownloadResult(null)
    setConversionError(null)
  }

  const clearMarkdown = () => {
    setMarkdown('')
    // Clear draft from localStorage
    try {
      localStorage.removeItem('markdownDraft')
      setDraftSaveStatus('idle')
    } catch (error) {
      console.warn('Failed to clear draft from localStorage:', error)
    }
  }

  const handlePrint = () => {
    try {
      // Store content in localStorage using the same key as draft
      localStorage.setItem('markdownDraft', markdown)
      const printUrl = `/print`
      const newWindow = window.open(printUrl, '_blank')
      
      if (!newWindow) {
        toast.error('Failed to open print window. Please check your popup blocker settings.')
      }
    } catch (error) {
      console.error('Print error:', error)
      toast.error('Failed to prepare content for printing')
    }
  }

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Markdown file has been downloaded')
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


  const templates = {
    showcase: `# 📚 Ultimate Markdown & Mermaid Showcase
*The complete guide to markdown syntax and diagram creation*

---

## 🎯 Table of Contents
1. [Text Formatting](#text-formatting)
2. [Headers & Structure](#headers--structure)
3. [Lists & Organization](#lists--organization)
4. [Code & Syntax](#code--syntax)
5. [Links & Media](#links--media)
6. [Tables & Data](#tables--data)
7. [Blockquotes & Callouts](#blockquotes--callouts)
8. [Mermaid Diagrams](#mermaid-diagrams)
9. [Advanced Features](#advanced-features)

---

## ✍️ Text Formatting

### Basic Emphasis
- **Bold text** using \`**text**\` or \`__text__\`
- *Italic text* using \`*text*\` or \`_text_\`
- ***Bold and italic*** using \`***text***\`
- ~~Strikethrough~~ using \`~~text~~\`
- \`Inline code\` using backticks
- ==Highlighted text== (if supported)
- x^2^ superscript and H~2~O subscript (if supported)

### Advanced Text Features
> **💡 Pro Tip:** You can combine multiple formatting styles!

Here's a sentence with **bold**, *italic*, \`code\`, and [links](https://example.com) all together.

### Escape Characters
Use backslashes to escape special characters: \\* \\_ \\# \\[ \\]

---

## 📖 Headers & Structure

# Header Level 1 (H1)
## Header Level 2 (H2)
### Header Level 3 (H3)
#### Header Level 4 (H4)
##### Header Level 5 (H5)
###### Header Level 6 (H6)

### Alternative Header Syntax
Header 1
=========

Header 2
---------

---

## 📝 Lists & Organization

### Unordered Lists
- Primary item
- Another primary item
  - Nested item
  - Another nested item
    - Deep nested item
    - Another deep nested item
- Back to primary level

### Using Different Bullets
* Asterisk bullet
+ Plus bullet
- Dash bullet

### Ordered Lists
1. First item
2. Second item
   1. Nested numbered item
   2. Another nested numbered item
3. Third item
4. Fourth item

### Mixed Lists
1. First ordered item
   - Unordered sub-item
   - Another unordered sub-item
2. Second ordered item
   - More unordered items

### Task Lists (Checkboxes)
- [x] ✅ Completed task
- [x] ✅ Another completed task
- [ ] ⏳ Pending task
- [ ] ⏳ Another pending task
- [x] ✅ Task with **bold** text
- [ ] ⏳ Task with *italic* text

---

## 💻 Code & Syntax

### Inline Code
Use \`console.log()\` for JavaScript logging, or \`print()\` for Python output.

### Code Blocks with Language Highlighting

#### JavaScript
\`\`\`javascript
// Advanced JavaScript example
class DataProcessor {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
  }

  async processData(input) {
    if (this.cache.has(input)) {
      return this.cache.get(input);
    }

    const result = await this.transform(input);
    this.cache.set(input, result);
    return result;
  }

  transform(data) {
    return data
      .filter(item => item.isValid)
      .map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
      }));
  }
}
\`\`\`

#### Python
\`\`\`python
# Python data analysis example
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

class MLPipeline:
    def __init__(self, model_params=None):
        self.model = RandomForestClassifier(
            **(model_params or {'n_estimators': 100, 'random_state': 42})
        )
        self.is_trained = False
    
    def preprocess_data(self, df):
        """Clean and prepare data for training"""
        # Handle missing values
        df_clean = df.dropna()
        
        # Feature engineering
        df_clean['feature_interaction'] = (
            df_clean['feature1'] * df_clean['feature2']
        )
        
        return df_clean
    
    def train(self, X, y):
        """Train the model"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        return {
            'train_score': self.model.score(X_train, y_train),
            'test_score': self.model.score(X_test, y_test)
        }
\`\`\`

#### SQL
\`\`\`sql
-- Complex SQL query example
WITH monthly_sales AS (
  SELECT 
    DATE_TRUNC('month', order_date) as month,
    product_category,
    SUM(quantity * unit_price) as total_sales,
    COUNT(DISTINCT customer_id) as unique_customers
  FROM orders o
  JOIN order_items oi ON o.order_id = oi.order_id
  JOIN products p ON oi.product_id = p.product_id
  WHERE order_date >= '2023-01-01'
  GROUP BY month, product_category
),
category_growth AS (
  SELECT 
    *,
    LAG(total_sales) OVER (
      PARTITION BY product_category 
      ORDER BY month
    ) as prev_month_sales,
    (total_sales - LAG(total_sales) OVER (
      PARTITION BY product_category 
      ORDER BY month
    )) / LAG(total_sales) OVER (
      PARTITION BY product_category 
      ORDER BY month
    ) * 100 as growth_rate
  FROM monthly_sales
)
SELECT 
  month,
  product_category,
  total_sales,
  unique_customers,
  ROUND(growth_rate, 2) as growth_percentage
FROM category_growth
WHERE growth_rate IS NOT NULL
ORDER BY month DESC, total_sales DESC;
\`\`\`

#### Bash/Shell
\`\`\`bash
#!/bin/bash
# Advanced deployment script
set -euo pipefail

APP_NAME="my-application"
ENVIRONMENT="\${1:-staging}"
VERSION="\${2:-latest}"

# Color codes for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

log() {
  echo -e "\${GREEN}[INFO]\${NC} \$(date '+%Y-%m-%d %H:%M:%S') - \$1"
}

warn() {
  echo -e "\${YELLOW}[WARN]\${NC} \$(date '+%Y-%m-%d %H:%M:%S') - \$1"
}

error() {
  echo -e "\${RED}[ERROR]\${NC} \$(date '+%Y-%m-%d %H:%M:%S') - \$1"
  exit 1
}

# Pre-deployment checks
check_prerequisites() {
  log "Checking prerequisites..."
  
  command -v docker >/dev/null 2>&1 || error "Docker is required"
  command -v kubectl >/dev/null 2>&1 || error "kubectl is required"
  
  # Check if cluster is accessible
  kubectl cluster-info >/dev/null 2>&1 || error "Cannot connect to Kubernetes cluster"
}

# Deploy application
deploy() {
  log "Deploying \$APP_NAME version \$VERSION to \$ENVIRONMENT"
  
  # Update deployment
  kubectl set image deployment/\$APP_NAME \\
    \$APP_NAME=\$APP_NAME:\$VERSION \\
    --namespace=\$ENVIRONMENT
  
  # Wait for rollout
  kubectl rollout status deployment/\$APP_NAME \\
    --namespace=\$ENVIRONMENT \\
    --timeout=300s
  
  log "Deployment completed successfully!"
}

main() {
  check_prerequisites
  deploy
}

main "\$@"
\`\`\`

#### YAML
\`\`\`yaml
# Kubernetes deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-application
  namespace: production
  labels:
    app: web-application
    version: v1.2.3
    environment: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: web-application
  template:
    metadata:
      labels:
        app: web-application
        version: v1.2.3
    spec:
      containers:
      - name: web-app
        image: myregistry/web-application:v1.2.3
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: ENVIRONMENT
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: web-application-service
  namespace: production
spec:
  selector:
    app: web-application
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: ClusterIP
\`\`\`

### Code Without Language Highlighting
\`\`\`
This is a plain code block
without syntax highlighting.
You can use it for:
- Configuration files
- Plain text logs
- Generic content
\`\`\`

---

## 🔗 Links & Media

### Basic Links
- [Simple link](https://example.com)
- [Link with title](https://example.com "This is a title")
- [Reference link][1]
- [Another reference link][link-reference]

### URL Links
- Direct URL: https://www.example.com
- Email: contact@example.com

### Internal Links (Anchors)
- [Go to Text Formatting section](#text-formatting)
- [Jump to Mermaid Diagrams](#mermaid-diagrams)

### Images
![Alt text for image](https://via.placeholder.com/400x200?text=Sample+Image "Image title")

### Images with Links
[![Clickable image](https://via.placeholder.com/200x100?text=Click+Me)](https://example.com)

### Reference-style Links
This is a [reference link][1] and this is [another one][link-reference].

[1]: https://example.com
[link-reference]: https://example.com "Reference link with title"

---

## 📊 Tables & Data

### Basic Table
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |
| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |

### Aligned Tables
| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|--------------:|
| Left text    | Center text    | Right text    |
| More left    | More center    | More right    |

### Complex Table with Formatting
| Feature | Status | Priority | Assignee | Due Date |
|---------|:------:|:--------:|----------|----------|
| **User Authentication** | ✅ Done | 🔴 High | @john.doe | 2024-01-15 |
| *Dashboard Redesign* | 🔄 In Progress | 🟡 Medium | @jane.smith | 2024-01-30 |
| ~~Legacy Support~~ | ❌ Cancelled | 🟢 Low | - | - |
| \`API Documentation\` | 📝 Planning | 🟡 Medium | @dev.team | 2024-02-10 |

### Table with Code and Links
| Technology | Description | Link | Example |
|------------|-------------|------|---------|
| **React** | UI Library | [Official Site](https://reactjs.org) | \`<Component />\` |
| **Node.js** | Runtime | [Node.js](https://nodejs.org) | \`process.env\` |
| **TypeScript** | Language | [TypeScript](https://typescriptlang.org) | \`interface User {}\` |

---

## 💬 Blockquotes & Callouts

### Simple Blockquote
> This is a simple blockquote.
> It can span multiple lines.

### Nested Blockquotes
> This is the first level of quoting.
>
> > This is a nested blockquote.
> > It's inside the first level.
>
> Back to the first level.

### Blockquotes with Attribution
> "The best way to predict the future is to invent it."
> 
> — *Alan Kay*

### Multi-paragraph Blockquotes
> This is the first paragraph in the blockquote.
>
> This is the second paragraph. Notice the empty line above.
>
> ### Header in Blockquote
> 
> Even headers work inside blockquotes!

### Callout-style Blockquotes
> **💡 Tip:** Use meaningful variable names to make your code self-documenting.

> **⚠️ Warning:** Always validate user input before processing it in your application.

> **❌ Error:** This operation will permanently delete all data. This cannot be undone.

> **✅ Success:** Your configuration has been saved successfully.

> **📝 Note:** This feature requires Node.js version 16 or higher.

> **🔍 Example:**
> \`\`\`javascript
> const result = await processData(input);
> console.log('Processing complete:', result);
> \`\`\`

---

## 🎨 Mermaid Diagrams

### 1. Flowchart - System Architecture
\`\`\`mermaid
flowchart TD
    A[User Request] --> B{Authentication?}
    B -->|Valid| C[Load Balancer]
    B -->|Invalid| D[Error Response]
    C --> E[API Gateway]
    E --> F{Route Request}
    F -->|/users| G[User Service]
    F -->|/orders| H[Order Service]
    F -->|/payments| I[Payment Service]
    G --> J[(User Database)]
    H --> K[(Order Database)]
    I --> L[(Payment Database)]
    G --> M[Response]
    H --> M
    I --> M
    M --> N[Client Response]
    
    style A fill:#e1f5fe
    style D fill:#ffebee
    style N fill:#e8f5e8
    style J fill:#fff3e0
    style K fill:#fff3e0
    style L fill:#fff3e0
\`\`\`

### 2. Sequence Diagram - User Authentication Flow
\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as Client App
    participant A as Auth Service
    participant D as Database
    participant R as Redis Cache
    
    U->>C: Enter credentials
    C->>A: POST /login
    A->>D: Validate credentials
    D-->>A: User data
    
    alt Valid credentials
        A->>R: Store session
        R-->>A: Session ID
        A-->>C: JWT Token + Session ID
        C-->>U: Login successful
    else Invalid credentials
        A-->>C: 401 Unauthorized
        C-->>U: Login failed
    end
    
    Note over A,R: Session expires after 24h
    
    U->>C: Make authenticated request
    C->>A: Request + JWT Token
    A->>R: Validate session
    R-->>A: Session valid
    A-->>C: Authorized response
    C-->>U: Display data
\`\`\`

### 3. Class Diagram - E-commerce System
\`\`\`mermaid
classDiagram
    class User {
        -String id
        -String email
        -String passwordHash
        -Date createdAt
        -Boolean isActive
        +login(password) Boolean
        +updateProfile(data) void
        +deactivate() void
    }
    
    class Order {
        -String id
        -String userId
        -Date orderDate
        -OrderStatus status
        -Decimal totalAmount
        +addItem(product, quantity) void
        +removeItem(productId) void
        +calculateTotal() Decimal
        +updateStatus(status) void
    }
    
    class Product {
        -String id
        -String name
        -String description
        -Decimal price
        -Integer stockQuantity
        -String category
        +updateStock(quantity) void
        +isAvailable() Boolean
        +applyDiscount(percentage) void
    }
    
    class OrderItem {
        -String orderId
        -String productId
        -Integer quantity
        -Decimal unitPrice
        +getSubtotal() Decimal
    }
    
    class Payment {
        -String id
        -String orderId
        -PaymentMethod method
        -PaymentStatus status
        -Decimal amount
        -Date processedAt
        +process() Boolean
        +refund() Boolean
    }
    
    User --> Order
    Order --> OrderItem
    Product --> OrderItem
    Order --> Payment
    
    class OrderStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        SHIPPED
        DELIVERED
        CANCELLED
    }
    
    class PaymentStatus {
        <<enumeration>>
        PENDING
        COMPLETED
        FAILED
        REFUNDED
    }
\`\`\`

### 4. State Diagram - Order Processing
\`\`\`mermaid
stateDiagram-v2
    [*] --> Pending : Order Created
    
    Pending --> Confirmed : Payment Received
    Pending --> Cancelled : Payment Failed
    Pending --> Cancelled : Customer Cancellation
    
    Confirmed --> Processing : Inventory Allocated
    Confirmed --> Cancelled : Out of Stock
    
    Processing --> Shipped : Items Dispatched
    Processing --> Cancelled : Processing Error
    
    Shipped --> InTransit : Tracking Active
    InTransit --> Delivered : Customer Received
    InTransit --> Lost : Delivery Failed
    
    Delivered --> Completed : No Issues
    Delivered --> Returned : Customer Return
    
    Cancelled --> [*]
    Completed --> [*]
    Lost --> Refunded
    Returned --> Refunded
    Refunded --> [*]
    
    note right of Confirmed
        Inventory is reserved
        for 24 hours
    end note
    
    note right of Shipped
        Tracking number
        generated
    end note
\`\`\`

### 5. Entity Relationship Diagram
\`\`\`mermaid
erDiagram
    CUSTOMER {
        int customer_id PK
        string email UK
        string first_name
        string last_name
        string phone
        date created_at
        boolean is_active
    }
    
    ORDER {
        int order_id PK
        int customer_id FK
        date order_date
        string status
        decimal total_amount
        string shipping_address
        string billing_address
    }
    
    PRODUCT {
        int product_id PK
        string name
        string description
        decimal price
        int stock_quantity
        int category_id FK
        date created_at
        boolean is_active
    }
    
    ORDER_ITEM {
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal total_price
    }
    
    CATEGORY {
        int category_id PK
        string name
        string description
        int parent_category_id FK
    }
    
    PAYMENT {
        int payment_id PK
        int order_id FK
        string payment_method
        string payment_status
        decimal amount
        date processed_at
        string transaction_id
    }
    
    REVIEW {
        int review_id PK
        int customer_id FK
        int product_id FK
        int rating
        string comment
        date created_at
    }
    
    CUSTOMER ||--o{ ORDER : "places"
    ORDER ||--o{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "includes"
    PRODUCT }o--|| CATEGORY : "belongs_to"
    CATEGORY ||--o{ CATEGORY : "has_subcategory"
    ORDER ||--|| PAYMENT : "has"
    CUSTOMER ||--o{ REVIEW : "writes"
    PRODUCT ||--o{ REVIEW : "receives"
\`\`\`

### 6. Gantt Chart - Project Timeline
\`\`\`mermaid
gantt
    title Web Application Development Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements Gathering    :done, req, 2024-01-01, 2024-01-15
    System Design           :done, design, 2024-01-10, 2024-01-25
    Architecture Planning   :done, arch, 2024-01-20, 2024-02-05
    
    section Backend Development
    Database Schema         :done, db, 2024-01-25, 2024-02-10
    API Development         :active, api, 2024-02-05, 2024-03-15
    Authentication System   :auth, 2024-02-20, 2024-03-05
    Payment Integration     :payment, 2024-03-01, 2024-03-20
    
    section Frontend Development
    UI Components          :ui, 2024-02-15, 2024-03-10
    User Dashboard         :dashboard, 2024-03-05, 2024-03-25
    Admin Panel           :admin, 2024-03-15, 2024-04-05
    Mobile Responsive     :mobile, 2024-03-20, 2024-04-10
    
    section Testing & Deployment
    Unit Testing          :testing, 2024-03-25, 2024-04-15
    Integration Testing   :integration, 2024-04-05, 2024-04-20
    User Acceptance Testing :uat, 2024-04-15, 2024-04-30
    Production Deployment :deploy, 2024-04-25, 2024-05-05
    
    section Maintenance
    Bug Fixes             :bugs, 2024-05-01, 2024-05-31
    Performance Optimization :perf, 2024-05-15, 2024-06-15
\`\`\`

### 7. Flowchart - Development Workflow
\`\`\`mermaid
flowchart TD
    A[Start Development] --> B[Create Feature Branch]
    B --> C[Implement Feature]
    C --> D[Write Tests]
    D --> E[Code Review]
    E --> F{Review Approved?}
    F -->|No| G[Address Feedback]
    G --> C
    F -->|Yes| H[Merge to Develop]
    H --> I[Run Integration Tests]
    I --> J{Tests Pass?}
    J -->|No| K[Fix Issues]
    K --> I
    J -->|Yes| L[Deploy to Staging]
    L --> M[User Acceptance Testing]
    M --> N{UAT Pass?}
    N -->|No| O[Fix Issues]
    O --> L
    N -->|Yes| P[Merge to Main]
    P --> Q[Deploy to Production]
    Q --> R[Monitor & Release]
    R --> S[End]
    
    style A fill:#e1f5fe
    style S fill:#e8f5e8
    style F fill:#fff3e0
    style J fill:#fff3e0
    style N fill:#fff3e0
\`\`\`

### 8. User Journey Map
\`\`\`mermaid
journey
    title User Shopping Experience Journey
    section Discovery
      Visit Homepage        : 5: User
      Browse Categories     : 4: User
      Search Products       : 4: User
      View Product Details  : 5: User
    section Evaluation
      Read Reviews         : 4: User
      Compare Products     : 3: User
      Check Availability   : 5: User
      View Pricing         : 5: User
    section Purchase
      Add to Cart          : 5: User
      Review Cart          : 4: User
      Apply Coupon         : 3: User
      Proceed to Checkout  : 4: User
      Enter Shipping Info  : 3: User
      Select Payment       : 4: User
      Complete Order       : 5: User
    section Post-Purchase
      Receive Confirmation : 5: User
      Track Shipment       : 4: User
      Receive Product      : 5: User
      Leave Review         : 3: User
      Contact Support      : 2: User
\`\`\`

### 9. Network Diagram - Infrastructure
\`\`\`mermaid
graph TB
    subgraph "Public Internet"
        U[Users]
        CDN[Content Delivery Network]
    end
    
    subgraph "DMZ"
        LB[Load Balancer<br/>NGINX]
        WAF[Web Application<br/>Firewall]
    end
    
    subgraph "Application Tier"
        subgraph "Kubernetes Cluster"
            API1[API Server 1]
            API2[API Server 2]
            API3[API Server 3]
            WORKER1[Worker Node 1]
            WORKER2[Worker Node 2]
            WORKER3[Worker Node 3]
        end
    end
    
    subgraph "Data Tier"
        subgraph "Database Cluster"
            PGMASTER[(PostgreSQL<br/>Master)]
            PGSLAVE1[(PostgreSQL<br/>Slave 1)]
            PGSLAVE2[(PostgreSQL<br/>Slave 2)]
        end
        
        REDIS[(Redis Cache<br/>Cluster)]
        S3[(Object Storage<br/>S3)]
    end
    
    subgraph "External Services"
        PAYMENT[Payment Gateway]
        EMAIL[Email Service]
        MONITORING[Monitoring<br/>& Logging]
    end
    
    U --> CDN
    CDN --> WAF
    WAF --> LB
    LB --> API1
    LB --> API2
    LB --> API3
    
    API1 --> WORKER1
    API2 --> WORKER2
    API3 --> WORKER3
    
    WORKER1 --> PGMASTER
    WORKER2 --> PGMASTER
    WORKER3 --> PGMASTER
    
    PGMASTER --> PGSLAVE1
    PGMASTER --> PGSLAVE2
    
    WORKER1 --> REDIS
    WORKER2 --> REDIS
    WORKER3 --> REDIS
    
    WORKER1 --> S3
    WORKER2 --> S3
    WORKER3 --> S3
    
    API1 --> PAYMENT
    API2 --> EMAIL
    
    MONITORING --> API1
    MONITORING --> API2
    MONITORING --> API3
    MONITORING --> PGMASTER
    MONITORING --> REDIS
    
    style U fill:#e1f5fe
    style CDN fill:#f3e5f5
    style WAF fill:#fff3e0
    style LB fill:#e8f5e8
    style PGMASTER fill:#ffebee
    style REDIS fill:#e0f2f1
    style S3 fill:#fce4ec
\`\`\`

### 10. Mind Map - Software Architecture
\`\`\`mermaid
mindmap
  root((Software<br/>Architecture))
    Frontend
      React
        Components
        Hooks
        Context
        Router
      Styling
        CSS Modules
        Styled Components
        Tailwind
      State Management
        Redux
        Zustand
        Context API
    Backend
      API Design
        REST
        GraphQL
        gRPC
      Database
        PostgreSQL
        MongoDB
        Redis
      Authentication
        JWT
        OAuth2
        SAML
      Message Queue
        RabbitMQ
        Apache Kafka
        Redis Pub/Sub
    Infrastructure
      Cloud Providers
        AWS
        Google Cloud
        Azure
      Containerization
        Docker
        Kubernetes
        Docker Compose
      CI/CD
        GitHub Actions
        Jenkins
        GitLab CI
      Monitoring
        Prometheus
        Grafana
        ELK Stack
    Security
      Authentication
      Authorization
      Data Encryption
      Network Security
        HTTPS
        VPN
        Firewall
      Vulnerability Scanning
        OWASP
        Security Audits
        Penetration Testing
\`\`\`

---

## 🚀 Advanced Features

### HTML in Markdown
You can use <mark>HTML tags</mark> in markdown for <sup>advanced</sup> formatting.

<details>
<summary>Click to expand collapsible section</summary>

This content is hidden by default and can be expanded by clicking the summary.

You can include:
- Lists
- **Bold text**
- \`Code\`
- Links

</details>

### Keyboard Keys
Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy, or <kbd>Cmd</kbd> + <kbd>V</kbd> to paste on Mac.

### Mathematical Expressions (if supported)
- Inline math: \`$E = mc^2$\`
- Block math:
\`\`\`
$$
\\frac{n!}{k!(n-k)!} = \\binom{n}{k}
$$
\`\`\`

### Footnotes (if supported)
Here's a sentence with a footnote[^1].

Another sentence with another footnote[^note].

[^1]: This is the first footnote.
[^note]: This is a named footnote.

### Definition Lists (if supported)
Term 1
: Definition for term 1

Term 2
: Definition for term 2
: Another definition for term 2

### Abbreviations (if supported)
The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

---

## 📚 Summary & Best Practices

### ✅ Markdown Best Practices
1. **Consistency**: Use consistent formatting throughout your document
2. **Headers**: Create a logical hierarchy with headers
3. **White space**: Use blank lines to separate sections
4. **Links**: Use descriptive link text
5. **Images**: Always include alt text for accessibility
6. **Tables**: Keep tables simple and readable
7. **Code**: Always specify language for syntax highlighting

### 🎯 When to Use Different Diagram Types
- **Flowcharts**: Process flows, decision trees, workflows
- **Sequence Diagrams**: API interactions, user flows, message passing
- **Class Diagrams**: Object-oriented design, system structure
- **State Diagrams**: State machines, lifecycle management
- **ER Diagrams**: Database design, data relationships
- **Gantt Charts**: Project timelines, scheduling
- **Git Graphs**: Version control workflows
- **User Journeys**: UX design, customer experience mapping
- **Network Diagrams**: System architecture, infrastructure
- **Mind Maps**: Brainstorming, knowledge organization

### 🔧 Tools & Extensions
- **Editors**: VS Code, Typora, Mark Text, Notion
- **Extensions**: Markdown All in One, Mermaid Preview
- **Converters**: Pandoc, Marked, Remark
- **Live Preview**: Markdown Preview Enhanced
- **Linting**: markdownlint, remark-lint

---

**🎉 Congratulations!** You've now seen a comprehensive showcase of markdown syntax and Mermaid diagrams. This template demonstrates the power and versatility of markdown for creating rich, structured documents with beautiful visualizations.

*Happy documenting! 📝*`,
    
    presentation: `---
theme: default
paginate: true
---

# My Presentation
Welcome to my markdown converter!

---

## Features
- Convert markdown to PowerPoint
- Convert markdown to HTML
- Convert markdown to Word
- Convert markdown to PDF

---

## How to Use
1. Write your markdown content
2. Select output format
3. Click convert
4. Download your file

---

## Thank You!
Happy converting! 🎉`,
    
    document: `# Document Title

## Introduction
This is a sample markdown document that showcases various formatting options.

## Headers
You can create multiple levels of headers using # symbols.

### Subsection
This is a third-level header.

## Text Formatting
- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- \`inline code\` for technical terms
- ~~Strikethrough~~ for deleted content

## Lists
### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

## Code Blocks
\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

## Links and Images
[Visit our website](https://example.com)

## Tables
| Feature | Description | Status |
|---------|-------------|--------|
| PDF | Portable Document Format | ✅ |
| Word | Microsoft Word Document | ✅ |
| HTML | Web Page | ✅ |
| PowerPoint | Presentation Slides | ✅ |

## Conclusion
This template demonstrates the power of markdown for creating structured documents.`,

    article: `# Article Title: The Power of Markdown

**Published:** $(date)  
**Author:** Your Name

## Abstract
This article explores the versatility and power of Markdown as a lightweight markup language for creating formatted documents.

## Introduction
Markdown has revolutionized the way we write and format text. Its simplicity and readability make it an ideal choice for:

- Technical documentation
- Blog posts and articles
- README files
- Academic papers

## Key Benefits

### 1. Simplicity
Markdown syntax is intuitive and easy to learn. Unlike complex word processors, Markdown focuses on content over formatting.

### 2. Portability
Markdown files are plain text, making them:
- Version control friendly
- Platform independent
- Future-proof

### 3. Flexibility
Convert to multiple formats:
- **HTML** for web publishing
- **PDF** for sharing and printing
- **Word** for collaborative editing
- **PowerPoint** for presentations

## Technical Examples

### Code Snippet
\`\`\`python
def convert_markdown(content):
    """Convert markdown to various formats"""
    return processor.convert(content)
\`\`\`

### Mathematical Expressions
While not all converters support it, you can include LaTeX-style math:
\`$E = mc^2$\`

## Best Practices

> **Tip:** Keep your markdown files organized with clear hierarchical structure using headers.

1. **Use descriptive headers** - They become your document outline
2. **Keep paragraphs concise** - Break up long text blocks
3. **Use lists effectively** - They improve readability
4. **Include code examples** - When writing technical content

## Conclusion
Markdown strikes the perfect balance between simplicity and functionality. Whether you're writing documentation, articles, or presentations, Markdown provides a clean, efficient way to create professional content.

---

*Happy writing with Markdown!*`
  }

  const applyTemplate = (templateKey: string) => {
    setMarkdown(templates[templateKey as keyof typeof templates])
    toast.success(`${templateKey.charAt(0).toUpperCase() + templateKey.slice(1)} template applied!`)
  }

  const currentConfig = formatConfig[selectedFormat as keyof typeof formatConfig]
  const IconComponent = currentConfig.icon

  // Render different views based on currentView
  const renderEditor = () => (
    <>
      {/* Template Selection */}
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Select onValueChange={applyTemplate}>
              <SelectTrigger className="w-full sm:w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm">
                <SelectValue placeholder="Load Template" />
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
                onClick={clearMarkdown}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                disabled={!markdown.trim()}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300">
          <CardHeader>
            <div className="flex justify-between items-center">
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
              {!isDesktop && (
                <div className="flex gap-1">
                  <Button
                    variant={activeTab === 'edit' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab('edit')}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={activeTab === 'preview' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab('preview')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className={!isDesktop && activeTab === 'preview' ? 'hidden' : ''}>
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export MD and settings
              </Button>
            </div>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Enter your markdown here..."
              className="min-h-[600px] font-mono resize-none"
              style={{ fontSize: `${fontSize}px` }}
            />
          </CardContent>
        </Card>

        <Card className="shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
                <Badge variant="secondary" className="ml-2">Mermaid + Syntax</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print/PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={!isDesktop && activeTab === 'edit' ? 'hidden' : ''}>
            <div className="min-h-[600px] overflow-auto prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h1:border-b prose-h2:border-b prose-h1:border-gray-300 prose-h2:border-gray-200 prose-h1:pb-2 prose-h2:pb-1">
              <div className="markdown-preview">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={customComponents}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  onClick={() => setSelectedFormat(format)}
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
          <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
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
                      <Select value={conversionOptions.theme} onValueChange={(value) => setConversionOptions({...conversionOptions, theme: value})}>
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
                      <Select value={conversionOptions.imageScale?.toString()} onValueChange={(value) => setConversionOptions({...conversionOptions, imageScale: parseInt(value)})}>
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
                          <Select value={conversionOptions.margin} onValueChange={(value) => setConversionOptions({...conversionOptions, margin: value})}>
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
                          <Select value={conversionOptions.fontSize} onValueChange={(value) => setConversionOptions({...conversionOptions, fontSize: value})}>
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
                        onCheckedChange={(checked) => setConversionOptions({...conversionOptions, toc: checked})}
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
            onClick={handleConvert}
            disabled={isConverting || !markdown.trim()}
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
            onClick={clearResult}
            size="lg"
            className="w-full sm:w-auto px-8 py-3 h-12 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-lg hover:scale-105 rounded-full font-semibold text-lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            Convert Another File
          </Button>
        )}
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
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-1 sm:flex-none h-10 px-6 hover:scale-105"
                  size="default"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={clearResult}
                  size="default"
                  className="h-10 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <X className="h-4 w-4" />
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
              <X className="h-5 w-5" />
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
                  onClick={() => setConversionError(null)}
                  size="sm"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <X className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )


  const renderGuides = () => (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">Guides Coming Soon</h2>
      <p className="text-gray-600 dark:text-gray-300">Documentation and guides will be available here.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 py-4 sm:py-8 lg:py-12 px-4">
      
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Markdown Converter
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 mt-2 font-medium">
                ✨ Convert markdown to PowerPoint, HTML, Word, or PDF
              </p>
            </div>
            <div className="flex items-center">
              <Button
                onClick={toggleTheme}
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
                onClick={() => setCurrentView('editor')}
                variant={currentView === 'editor' ? 'default' : 'outline'}
                size="default"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${currentView === 'editor' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm'}`}
              >
                <Edit3 className="h-4 w-4" />
                Editor & Converter
              </Button>
              <Button
                onClick={() => setCurrentView('guides')}
                variant={currentView === 'guides' ? 'default' : 'outline'}
                size="default"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${currentView === 'guides' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm'}`}
              >
                <BookOpen className="h-4 w-4" />
                Guides
              </Button>
          </div>
        </div>

        {/* Editor settings for editor view */}
        {currentView === 'editor' && (
          <div className="mb-6">
            <Collapsible open={showSettings} onOpenChange={setShowSettings}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Editor Settings
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">

                <Card className="shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Theme</label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="w-4 h-4" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="w-4 h-4" />
                              Dark
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size</label>
                      <Select value={fontSize} onValueChange={setFontSize}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12px</SelectItem>
                          <SelectItem value="14">14px</SelectItem>
                          <SelectItem value="16">16px</SelectItem>
                          <SelectItem value="18">18px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Preview Style</label>
                      <Select value={previewStyle} onValueChange={setPreviewStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="lineNumbers"
                        checked={showLineNumbers}
                        onChange={(e) => setShowLineNumbers(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="lineNumbers" className="text-sm font-medium">
                        Show line numbers
                      </label>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Render content based on current view */}
        {currentView === 'editor' && renderEditor()}
        {currentView === 'guides' && renderGuides()}

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by Marp CLI and Pandoc • Built with React and Express • Git: {gitCommit} • {new Date().toISOString()}</p>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default Index