import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Server, 
  RefreshCw, 
  BookOpen, 
  ExternalLink,
  CheckCircle,
  Clock
} from 'lucide-react'

interface BackendStatusAlertProps {
  isAvailable: boolean
  isChecking: boolean
  lastChecked: Date | null
  error: string | null
  apiBaseUrl: string | null
  onRetry: () => void
}

export function BackendStatusAlert({
  isAvailable,
  isChecking,
  lastChecked,
  error,
  apiBaseUrl,
  onRetry
}: BackendStatusAlertProps) {
  // Don't show anything if backend is available
  if (isAvailable) {
    return null
  }

  const getStatusInfo = () => {
    if (isChecking) {
      return {
        variant: 'default' as const,
        icon: Clock,
        title: 'Checking Backend Connection...',
        description: 'Verifying conversion services availability'
      }
    }

    if (!apiBaseUrl) {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        title: 'Backend Not Configured',
        description: 'No backend URL configured for conversion services'
      }
    }

    return {
      variant: 'destructive' as const,
      icon: Server,
      title: 'Backend Unavailable',
      description: error || 'Cannot connect to conversion services'
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Alert 
      variant={statusInfo.variant} 
      className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 shadow-xl"
    >
      <StatusIcon className="h-5 w-5" />
      <AlertTitle className="flex items-center gap-2">
        {statusInfo.title}
        {isChecking && <RefreshCw className="h-4 w-4 animate-spin" />}
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-4">
          <p>{statusInfo.description}</p>
          
          {!isChecking && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {apiBaseUrl ? `Backend: ${apiBaseUrl}` : 'No backend configured'}
                </Badge>
                {lastChecked && (
                  <Badge variant="secondary" className="text-xs">
                    Last checked: {lastChecked.toLocaleTimeString()}
                  </Badge>
                )}
              </div>

              <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Conversion Features Disabled
                </h4>
                <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                  PDF and PowerPoint conversion requires a backend server. The editor, preview, and explorer features work offline.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={onRetry}
                    size="sm"
                    variant="outline"
                    className="bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-300 dark:border-amber-600"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Connection
                  </Button>
                  
                  <Button
                    onClick={() => {
                      // Navigate to deployment documentation
                      window.open('/deployment', '_blank')
                    }}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Setup Instructions
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                  <p><strong>API URL:</strong> {apiBaseUrl || 'Not configured'}</p>
                  <p><strong>Error:</strong> {error || 'Connection failed'}</p>
                  <p><strong>Health Endpoint:</strong> {apiBaseUrl ? `${apiBaseUrl}/api/health` : 'N/A'}</p>
                  <p><strong>Required Env:</strong> VITE_API_BASE_URL</p>
                </div>
              </details>
            </>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Optional: Compact status indicator for header/footer
export function BackendStatusIndicator({
  isAvailable,
  isChecking,
  apiBaseUrl
}: Pick<BackendStatusAlertProps, 'isAvailable' | 'isChecking' | 'apiBaseUrl'>) {
  if (isChecking) {
    return (
      <Badge variant="secondary" className="text-xs">
        <Clock className="mr-1 h-3 w-3 animate-pulse" />
        Checking...
      </Badge>
    )
  }

  if (isAvailable) {
    return (
      <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
        <CheckCircle className="mr-1 h-3 w-3" />
        Backend Online
      </Badge>
    )
  }

  return (
    <Badge variant="destructive" className="text-xs">
      <AlertTriangle className="mr-1 h-3 w-3" />
      {apiBaseUrl ? 'Backend Offline' : 'No Backend'}
    </Badge>
  )
}