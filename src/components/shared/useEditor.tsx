import { useState, useEffect } from 'react'

export function useEditor() {
  // Editor-specific state
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isDesktop, setIsDesktop] = useState(false)
  const [showEditPanel, setShowEditPanel] = useState(true)
  const [showPreviewPanel, setShowPreviewPanel] = useState(true)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  return {
    activeTab,
    setActiveTab,
    isDesktop,
    showEditPanel,
    setShowEditPanel,
    showPreviewPanel,
    setShowPreviewPanel
  }
}