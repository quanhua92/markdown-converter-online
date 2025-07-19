import { Download, FileText, Presentation, File } from 'lucide-react'

export const formatConfig = {
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

export interface ConversionOptions {
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
}

export const defaultConversionOptions: ConversionOptions = {
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
}