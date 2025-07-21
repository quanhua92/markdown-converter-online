import { useState, useEffect } from 'react'
import { StorageService } from '../../db/storage'

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  // Initialize theme from storage or system preference
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedTheme = await StorageService.loadItem('theme')
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
          setIsDarkMode(true)
          document.documentElement.classList.add('dark')
        } else {
          setIsDarkMode(false)
          document.documentElement.classList.remove('dark')
        }
      } catch (error) {
        console.warn('Failed to load theme from storage:', error)
        // Fallback to system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(systemPrefersDark)
        if (systemPrefersDark) {
          document.documentElement.classList.add('dark')
        }
      }
    }
    
    initializeTheme()
  }, [])

  const toggleTheme = async () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    
    try {
      if (newTheme) {
        document.documentElement.classList.add('dark')
        await StorageService.saveItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        await StorageService.saveItem('theme', 'light')
      }
    } catch (error) {
      console.warn('Failed to save theme to storage:', error)
    }
  }

  return { isDarkMode, toggleTheme }
}