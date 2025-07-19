import { useState, useEffect, useCallback } from 'react'
import { debounce } from './utils'

type DraftSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useDraft() {
  const [markdown, setMarkdown] = useState('')
  const [draftSaveStatus, setDraftSaveStatus] = useState<DraftSaveStatus>('idle')

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('markdownDraft')
      if (savedDraft && savedDraft.trim()) {
        setMarkdown(savedDraft)
        setDraftSaveStatus('saved')
      }
    } catch (error) {
      console.warn('Failed to load draft from localStorage:', error)
      setDraftSaveStatus('error')
    }
  }, [])

  // Debounced draft save
  const saveDraft = useCallback(
    debounce((content: string) => {
      try {
        setDraftSaveStatus('saving')
        if (content.trim()) {
          localStorage.setItem('markdownDraft', content)
        } else {
          localStorage.removeItem('markdownDraft')
        }
        setDraftSaveStatus('saved')
        
        // Clear saved status after 2 seconds
        setTimeout(() => {
          setDraftSaveStatus('idle')
        }, 2000)
      } catch (error) {
        console.error('Failed to save draft:', error)
        setDraftSaveStatus('error')
        setTimeout(() => {
          setDraftSaveStatus('idle')
        }, 3000)
      }
    }, 1000),
    []
  )

  // Save draft when markdown changes
  useEffect(() => {
    if (markdown !== '') {
      saveDraft(markdown)
    }
  }, [markdown, saveDraft])

  const clearDraft = () => {
    setMarkdown('')
    // Clear draft from localStorage
    try {
      localStorage.removeItem('markdownDraft')
      setDraftSaveStatus('idle')
    } catch (error) {
      console.warn('Failed to clear draft from localStorage:', error)
    }
  }

  return {
    markdown,
    setMarkdown,
    draftSaveStatus,
    clearDraft
  }
}