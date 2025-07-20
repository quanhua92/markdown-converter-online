import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  ExternalLink, 
  Server, 
  Cloud, 
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Terminal,
  Globe
} from 'lucide-react'
import { useTheme } from '@/components/shared'

export const Route = createFileRoute('/deployment')({
  component: DeploymentGuide,
})

function DeploymentGuide() {
  const { isDarkMode } = useTheme()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Deployment Guide
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Set up your Markdown Converter with PDF and PowerPoint conversion capabilities
            </p>
          </div>
        </div>

        {/* Quick Status */}
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              Backend Configuration Required
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              To enable PDF and PowerPoint conversion, you need to deploy a backend service with Marp and Pandoc.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Architecture Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                Hybrid Deployment
                <Badge variant="default" className="ml-2">Recommended</Badge>
              </CardTitle>
              <CardDescription>
                Frontend on Vercel + Backend on any server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Benefits
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                  <li>• Global CDN performance</li>
                  <li>• Dedicated conversion infrastructure</li>
                  <li>• Auto-scaling</li>
                  <li>• Cost effective</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Setup Steps:</h4>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                  <li>1. Deploy backend to any server</li>
                  <li>2. Deploy frontend to Vercel</li>
                  <li>3. Set VITE_API_BASE_URL</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-purple-500" />
                Standalone Deployment
              </CardTitle>
              <CardDescription>
                Everything on a single server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Benefits
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                  <li>• Simple setup</li>
                  <li>• Full control</li>
                  <li>• No external dependencies</li>
                  <li>• Perfect for self-hosting</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Setup Steps:</h4>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                  <li>1. Run docker-compose up</li>
                  <li>2. Access on port 3000</li>
                  <li>3. Everything works!</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Commands */}
        <Card className="mb-8 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Quick Start Commands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                Hybrid Deployment
              </h4>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm space-y-2">
                <div className="text-gray-600 dark:text-gray-400"># Deploy backend</div>
                <div>docker-compose up -d --build</div>
                <div className="text-gray-600 dark:text-gray-400"># Deploy frontend to Vercel</div>
                <div>vercel --prod</div>
                <div>vercel env add VITE_API_BASE_URL production</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Server className="h-4 w-4 text-purple-500" />
                Standalone Deployment
              </h4>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm space-y-2">
                <div className="text-gray-600 dark:text-gray-400"># Single command deployment</div>
                <div>docker-compose up -d --build</div>
                <div className="text-gray-600 dark:text-gray-400"># Access at http://localhost:3000</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="mb-8 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Required Environment Variable:</h4>
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                  <div className="text-blue-600 dark:text-blue-400">VITE_API_BASE_URL</div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1">
                    Set this to your backend server URL (e.g., https://your-backend.com)
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Examples:</h4>
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div><span className="text-gray-600 dark:text-gray-400"># Production:</span> https://api.myapp.com</div>
                  <div><span className="text-gray-600 dark:text-gray-400"># Development:</span> http://localhost:3000</div>
                  <div><span className="text-gray-600 dark:text-gray-400"># Railway:</span> https://myapp.railway.app</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform-Specific Guides */}
        <Card className="mb-8 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>Platform-Specific Deployment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-black" />
                  Vercel (Frontend)
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Perfect for hosting the frontend with global CDN
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm font-mono">
                  vercel --prod
                </div>
              </div>
              
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Server className="h-4 w-4 text-purple-500" />
                  Railway (Backend)
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Easy backend deployment with auto-scaling
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm font-mono">
                  railway up
                </div>
              </div>
              
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-blue-500" />
                  DigitalOcean (Standalone)
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Full control with dedicated VPS
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm font-mono">
                  docker-compose up -d
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Links */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Need More Help?</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline"
              onClick={() => window.open('https://github.com/your-username/markdown-converter-online/tree/main/docs', '_blank')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Full Documentation
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.open('https://github.com/your-username/markdown-converter-online/issues', '_blank')}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Issues
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}