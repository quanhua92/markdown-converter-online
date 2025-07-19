export const templates = {
  showcase: `# 📚 Ultimate Markdown & Mermaid Showcase
*The complete guide to markdown syntax and diagram creation*

---

## Table of Contents
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

## Text Formatting

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

Here's a sentence with **bold**, *italic*, \`code\`, and [links](https://github.com) all together.

### Escape Characters
Use backslashes to escape special characters: \\\\* \\\\_ \\\\# \\\\[ \\\\]

---

## Headers & Structure

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

## Lists & Organization

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

## Code & Syntax

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

---

## Mermaid Diagrams

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
[Visit GitHub](https://github.com)

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

export function useTemplates() {
  return { templates }
}