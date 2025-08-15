import { useState, useEffect, useCallback } from 'react'

interface BackendHealthState {
  isAvailable: boolean
  isChecking: boolean
  lastChecked: Date | null
  error: string | null
  apiBaseUrl: string | null
}

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return (window as any).__API_BASE_URL__ || ''
  }
  return import.meta.env.VITE_API_BASE_URL || ''
}

export function useBackendHealth() {
  const [state, setState] = useState<BackendHealthState>({
    isAvailable: false,
    isChecking: true,
    lastChecked: null,
    error: null,
    apiBaseUrl: null
  })

  const checkHealth = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl()
    
    setState(prev => ({ ...prev, isChecking: true, error: null, apiBaseUrl: apiBaseUrl || 'relative' }))

    try {
      // Use relative path if no API base URL configured (Docker setup)
      const healthUrl = apiBaseUrl ? `${apiBaseUrl}/api/health` : '/api/health'
      const controller = new AbortController()
      
      // Set timeout for health check
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data.status === 'OK') {
          setState(prev => ({
            ...prev,
            isAvailable: true,
            isChecking: false,
            lastChecked: new Date(),
            error: null
          }))
        } else {
          throw new Error('Invalid health response')
        }
      } else {
        throw new Error(`Health check failed: ${response.status}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.name === 'AbortError' 
          ? 'Request timeout'
          : error.message
        : 'Unknown error'

      setState(prev => ({
        ...prev,
        isAvailable: false,
        isChecking: false,
        lastChecked: new Date(),
        error: errorMessage
      }))
    }
  }, [])

  // Check health on mount and periodically
  useEffect(() => {
    checkHealth()
    
    // Check every 30 seconds if backend was previously available
    // Check every 2 minutes if backend was previously unavailable
    const interval = setInterval(() => {
      checkHealth()
    }, state.isAvailable ? 30000 : 120000)

    return () => clearInterval(interval)
  }, [checkHealth, state.isAvailable])

  // Manual retry function
  const retry = useCallback(() => {
    checkHealth()
  }, [checkHealth])

  return {
    ...state,
    retry
  }
}