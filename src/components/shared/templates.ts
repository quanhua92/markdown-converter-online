export const templates = {
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
    
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : includes
    PRODUCT }o--|| CATEGORY : belongs_to
    CATEGORY ||--o{ CATEGORY : has_subcategory
    ORDER ||--|| PAYMENT : has
    CUSTOMER ||--o{ REVIEW : writes
    PRODUCT ||--o{ REVIEW : receives
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

### 7. Git Flow Diagram
\`\`\`mermaid
gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Setup project structure"
    commit id: "Add basic configuration"
    
    branch feature/user-auth
    checkout feature/user-auth
    commit id: "Implement login"
    commit id: "Add password validation"
    commit id: "Add JWT tokens"
    
    checkout develop
    merge feature/user-auth
    commit id: "Merge user authentication"
    
    branch feature/payment
    checkout feature/payment
    commit id: "Add payment gateway"
    commit id: "Implement refunds"
    
    checkout develop
    branch feature/notifications
    checkout feature/notifications
    commit id: "Email notifications"
    commit id: "SMS notifications"
    
    checkout develop
    merge feature/notifications
    commit id: "Merge notifications"
    
    checkout main
    merge develop
    commit id: "Release v1.0.0" tag: "v1.0.0"
    
    checkout develop
    merge feature/payment
    commit id: "Merge payment system"
    commit id: "Fix integration issues"
    
    checkout main
    merge develop
    commit id: "Release v1.1.0" tag: "v1.1.0"
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