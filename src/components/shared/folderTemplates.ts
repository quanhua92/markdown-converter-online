import { FileSystemItem } from './FileTree'

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