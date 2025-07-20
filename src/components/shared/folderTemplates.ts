import type { FileSystemItem } from './FileTree'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export interface FolderTemplate {
  id: string
  name: string
  description: string
  icon: string
  structure: Omit<FileSystemItem, 'id'>[]
}

export const folderTemplates: Record<string, FolderTemplate> = {
  'project-notes': {
    id: 'project-notes',
    name: 'Project Notes',
    description: 'Organized structure for project documentation',
    icon: '📂',
    structure: [
      {
        name: 'README.md',
        type: 'file',
        path: '/README.md',
        content: `# Project Name

## Overview
Brief description of your project.

## Getting Started
Instructions on how to get started.

## Documentation
Link to detailed documentation.

## Contributing
Guidelines for contributing to the project.
`
      },
      {
        name: 'docs',
        type: 'folder',
        path: '/docs',
        isExpanded: true,
        children: [
          {
            name: 'architecture.md',
            type: 'file',
            path: '/docs/architecture.md',
            content: `# Architecture

## System Overview
High-level architecture description.

## System Diagram

\`\`\`mermaid
graph TD
    A[Frontend] --> B[API Gateway]
    B --> C[Backend Services]
    C --> D[Database]
    
    style A fill:#e1f5fe
    style C fill:#e8f5e8
\`\`\`

## Components
- Component 1: Description
- Component 2: Description

## Data Flow
Describe how data flows through the system.
`
          },
          {
            name: 'api.md',
            type: 'file',
            path: '/docs/api.md',
            content: `# API Documentation

## Endpoints

### GET /api/example
Description of the endpoint.

**Parameters:**
- \`param1\`: Description

**Response:**
\`\`\`json
{
  "status": "success",
  "data": {}
}
\`\`\`
`
          }
        ]
      },
      {
        name: 'ultimate-showcase.md',
        type: 'file',
        path: '/ultimate-showcase.md',
        content: `# 🎯 Ultimate Markdown & Mermaid Showcase
*Complete demonstration of all markdown features and diagram types*

## 📋 Table of Contents
1. [Text Formatting](#text-formatting)
2. [Code Examples](#code-examples)
3. [Project Diagrams](#project-diagrams)
4. [Best Practices](#best-practices)

## ✍️ Text Formatting

### Basic Emphasis
- **Bold text** for important information
- *Italic text* for emphasis
- ***Bold and italic*** for strong emphasis
- ~~Strikethrough~~ for deleted content
- \`Inline code\` for technical terms

### Task Lists
- [x] ✅ Project setup completed
- [x] ✅ Architecture designed
- [ ] ⏳ Frontend development in progress
- [ ] ⏳ Backend API development
- [ ] ⏳ Testing and deployment

## 💻 Code Examples

### JavaScript/TypeScript
\`\`\`typescript
interface ProjectData {
  id: string;
  name: string;
  status: 'planning' | 'development' | 'testing' | 'completed';
  progress: number;
}

const ProjectDashboard: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  
  return (
    <div className="project-dashboard">
      <h1>Project Dashboard</h1>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <span>Status: {project.status}</span>
        </div>
      ))}
    </div>
  );
};
\`\`\`

## 📊 Project Diagrams

### Project Workflow
\`\`\`mermaid
flowchart TD
    A[Project Start] --> B[Requirements]
    B --> C[Development]
    C --> D[Testing]
    D --> E[Deployment]
    
    style A fill:#e1f5fe
    style E fill:#e8f5e8
\`\`\`

### Team Collaboration
\`\`\`mermaid
sequenceDiagram
    participant PM as Project Manager
    participant DEV as Developer
    participant QA as QA Engineer
    
    PM->>DEV: Assign task
    DEV->>PM: Complete task
    PM->>QA: Submit for testing
    QA->>PM: Approve
\`\`\`

## 📋 Advanced Tables

| Project | Status | Progress | Due Date |
|---------|:------:|:--------:|----------|
| **User Portal** | 🔄 Active | 75% | 2024-03-15 |
| **Mobile App** | 🔄 Active | 45% | 2024-04-01 |
| **API Gateway** | ✅ Complete | 100% | ✅ Done |

## 🎯 Best Practices

### Code Quality
> **💡 Pro Tip:** Consistency is key to maintainable code!

1. Use descriptive variable names
2. Write clear documentation
3. Include comprehensive tests

### Project Management
- Define clear requirements upfront
- Break down large tasks
- Regular stakeholder communication

### Deployment Checklist
- [ ] Code review completed
- [ ] All tests passing
- [ ] Security scan passed
- [ ] Documentation updated

## 🚀 Conclusion

This showcase demonstrates the power of markdown with Mermaid diagrams for documentation.

*Happy documenting! 📝*
`
      },
      {
        name: 'notes',
        type: 'folder',
        path: '/notes',
        isExpanded: true,
        children: [
          {
            name: 'meeting-notes.md',
            type: 'file',
            path: '/notes/meeting-notes.md',
            content: `# Meeting Notes

## 2024-01-01 - Project Kickoff

**Attendees:**
- Person 1
- Person 2

**Topics Discussed:**
- Topic 1
- Topic 2

**Action Items:**
- [ ] Action item 1
- [ ] Action item 2
`
          },
          {
            name: 'ideas.md',
            type: 'file',
            path: '/notes/ideas.md',
            content: `# Ideas & Brainstorming

## Feature Ideas
- [ ] Feature idea 1
- [ ] Feature idea 2

## Improvements
- [ ] Improvement 1
- [ ] Improvement 2

## Research Topics
- Topic 1
- Topic 2
`
          }
        ]
      }
    ]
  },
  'knowledge-base': {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    description: 'Personal knowledge management system',
    icon: '🧠',
    structure: [
      {
        name: 'index.md',
        type: 'file',
        path: '/index.md',
        content: `# Knowledge Base

Welcome to your personal knowledge base!

## Quick Navigation
- [[learning/]] - Learning notes and courses
- [[references/]] - Quick reference materials
- [[projects/]] - Project-specific knowledge
- [[daily/]] - Daily notes and thoughts

## Recent Updates
- Date: Latest update

---
*This knowledge base uses markdown linking for easy navigation.*
`
      },
      {
        name: 'ultimate-learning-showcase.md',
        type: 'file',
        path: '/ultimate-learning-showcase.md',
        content: `# 🎓 Ultimate Learning & Knowledge Showcase

## 📚 Learning Journey

\`\`\`mermaid
journey
    title My Learning Journey 2024
    section Q1 Foundations
      Learn Markdown: 5: Me
      Master Git: 4: Me
      React Basics: 5: Me
    section Q2 Development
      Advanced React: 4: Me
      Node.js Backend: 5: Me
      Database Design: 3: Me
    section Q3 Specialization
      System Design: 3: Me
      Performance: 4: Me
      Security: 5: Me
    section Q4 Mastery
      Architecture: 4: Me
      Leadership: 3: Me
      Mentoring: 5: Me
\`\`\`

## 💻 Code Learning Examples

### TypeScript Patterns
\`\`\`typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}

class UserRepository implements Repository<User> {
  async findById(id: string): Promise<User | null> {
    // Implementation here
    return null;
  }
}
\`\`\`

## 📊 Learning Progress

### Skill Development
\`\`\`mermaid
gitGraph
    commit id: "Start Learning"
    branch frontend
    commit id: "HTML/CSS"
    commit id: "JavaScript"
    commit id: "React"
    checkout main
    merge frontend
    commit id: "Full Stack"
\`\`\`

## 📈 Learning Goals

| Technology | Progress | Status |
|------------|:--------:|--------|
| React | 85% | 🎯 Active |
| TypeScript | 70% | 🎯 Active |
| Node.js | 95% | ✅ Complete |

*Keep learning, keep growing! 🌱*
`
      },
      {
        name: 'learning',
        type: 'folder',
        path: '/learning',
        isExpanded: true,
        children: [
          {
            name: 'programming.md',
            type: 'file',
            path: '/learning/programming.md',
            content: `# Programming Notes

## Languages
### JavaScript
- Key concepts
- Best practices

### TypeScript
- Type system
- Advanced features

## Frameworks
### React
- Hooks
- State management

### Node.js
- Server development
- API design
`
          },
          {
            name: 'courses.md',
            type: 'file',
            path: '/learning/courses.md',
            content: `# Course Notes

## Active Courses
- [ ] Course 1: Progress 50%
- [ ] Course 2: Progress 25%

## Completed Courses
- [x] Course A: Completed on 2024-01-01
- [x] Course B: Completed on 2024-01-15

## Course Templates
### Course: [Name]
**Duration:** X weeks
**Progress:** 0%
**Key Learnings:**
- Learning 1
- Learning 2
`
          }
        ]
      },
      {
        name: 'references',
        type: 'folder',
        path: '/references',
        isExpanded: true,
        children: [
          {
            name: 'cheatsheets.md',
            type: 'file',
            path: '/references/cheatsheets.md',
            content: `# Cheat Sheets

## Git Commands
\`\`\`bash
git status
git add .
git commit -m "message"
git push
\`\`\`

## Linux Commands
\`\`\`bash
ls -la
cd directory
mkdir folder
rm file
\`\`\`

## Markdown Syntax
- **Bold text**
- *Italic text*
- \`code\`
- [Link](url)
`
          }
        ]
      },
      {
        name: 'daily',
        type: 'folder',
        path: '/daily',
        isExpanded: false,
        children: [
          {
            name: '2024-01-01.md',
            type: 'file',
            path: '/daily/2024-01-01.md',
            content: `# Daily Note - 2024-01-01

## Today's Goals
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## Thoughts & Ideas
- Idea 1
- Idea 2

## Learnings
- Learning 1
- Learning 2

## Tomorrow's Focus
- Focus area 1
- Focus area 2
`
          }
        ]
      }
    ]
  },
  'blog-site': {
    id: 'blog-site',
    name: 'Blog/Website',
    description: 'Structure for blog or website content',
    icon: '📝',
    structure: [
      {
        name: 'about.md',
        type: 'file',
        path: '/about.md',
        content: `# About

## Who I Am
Introduction about yourself.

## What I Do
Description of your work or interests.

## Contact
- Email: your@email.com
- Website: yourwebsite.com
- Social: @yourusername
`
      },
      {
        name: 'ultimate-content-showcase.md',
        type: 'file',
        path: '/ultimate-content-showcase.md',
        content: `# 📝 Ultimate Content Creation Showcase

## 📈 Content Strategy Flow

\`\`\`mermaid
flowchart TD
    A[Content Idea] --> B[Research]
    B --> C[Outline] 
    C --> D[Write]
    D --> E[Edit]
    E --> F[Publish]
    F --> G[Promote]
    
    style A fill:#e1f5fe
    style F fill:#e8f5e8
\`\`\`

## ✍️ Content Types

### Blog Performance
\`\`\`mermaid
pie title Content Performance
    "Blog Posts" : 45
    "Videos" : 25  
    "Social" : 20
    "Podcasts" : 10
\`\`\`

### Editorial Calendar
\`\`\`mermaid
gantt
    title Content Schedule
    dateFormat YYYY-MM-DD
    section Planning
    Research    :2024-01-01, 3d
    Outline     :2024-01-03, 2d
    section Creation  
    Writing     :2024-01-05, 3d
    Editing     :2024-01-07, 2d
    section Publishing
    Publish     :2024-01-09, 1d
    Promote     :2024-01-10, 3d
\`\`\`

## 📊 Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Views | 10K | 8.5K | 🔄 Growing |
| Engagement | 5% | 4.2% | 🔄 Improving |
| Shares | 500 | 750 | ✅ Exceeded |

## 🚀 Best Practices

### Content Checklist
- [ ] Research audience needs
- [ ] Create compelling headlines  
- [ ] Write engaging introductions
- [ ] Include clear examples
- [ ] Add visual elements
- [ ] Optimize for SEO
- [ ] Proofread content
- [ ] Plan promotion strategy

*Create engaging content that resonates with your audience! 📝*
`
      },
      {
        name: 'posts',
        type: 'folder',
        path: '/posts',
        isExpanded: true,
        children: [
          {
            name: '2024-01-01-hello-world.md',
            type: 'file',
            path: '/posts/2024-01-01-hello-world.md',
            content: `---
title: "Hello World"
date: 2024-01-01
tags: ["introduction", "blog"]
---

# Hello World

Welcome to my blog! This is my first post.

## What to Expect
- Regular updates on [topic]
- Insights about [area of expertise]
- Personal thoughts and experiences

## Stay Connected
Follow me for updates and feel free to reach out!
`
          },
          {
            name: '2024-01-15-getting-started.md',
            type: 'file',
            path: '/posts/2024-01-15-getting-started.md',
            content: `---
title: "Getting Started with Markdown"
date: 2024-01-15
tags: ["markdown", "tutorial"]
---

# Getting Started with Markdown

Markdown is a lightweight markup language that's perfect for writing.

## Basic Syntax
- **Bold** and *italic* text
- Lists and links
- Code blocks
- Images

## Why Use Markdown?
1. Simple to learn
2. Platform independent
3. Version control friendly
4. Widely supported
`
          }
        ]
      },
      {
        name: 'drafts',
        type: 'folder',
        path: '/drafts',
        isExpanded: false,
        children: [
          {
            name: 'draft-post.md',
            type: 'file',
            path: '/drafts/draft-post.md',
            content: `---
title: "Draft Post"
date: 
tags: []
draft: true
---

# Draft Post

This is a work in progress...

## Outline
1. Introduction
2. Main points
3. Conclusion

## Notes
- Remember to add examples
- Check grammar
- Add images if needed
`
          }
        ]
      }
    ]
  }
}

export function initializeTemplateStructure(template: FolderTemplate, basePath: string = '/'): FileSystemItem[] {
  const processItem = (item: Omit<FileSystemItem, 'id'>, parentPath: string): FileSystemItem => {
    const fullPath = parentPath === '/' ? `/${item.name}` : `${parentPath}/${item.name}`
    
    const processedItem: FileSystemItem = {
      ...item,
      id: generateId(),
      path: fullPath,
    }

    if (item.children) {
      processedItem.children = item.children.map(child => processItem(child, fullPath))
    }

    return processedItem
  }

  return template.structure.map(item => processItem(item, basePath.endsWith('/') ? basePath.slice(0, -1) : basePath))
}