import { useState, useEffect, useCallback } from 'react'
import { debounce } from './utils'
import { StorageService } from '../../db/storage'

type DraftSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useDraft() {
  const [markdown, setMarkdown] = useState('')
  const [draftSaveStatus, setDraftSaveStatus] = useState<DraftSaveStatus>('idle')

  // Load draft from storage on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedDraft = await StorageService.loadItem('markdownDraft')
        if (savedDraft && savedDraft.trim()) {
          setMarkdown(savedDraft)
          setDraftSaveStatus('saved')
        }
      } catch (error) {
        console.warn('Failed to load draft from storage:', error)
        setDraftSaveStatus('error')
      }
    }
    
    loadDraft()
  }, [])

  // Debounced draft save
  const saveDraft = useCallback(
    debounce(async (content: string) => {
      try {
        setDraftSaveStatus('saving')
        if (content.trim()) {
          await StorageService.saveItem('markdownDraft', content)
        } else {
          await StorageService.removeItem('markdownDraft')
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
  }, [markdown])

  const clearDraft = async () => {
    setMarkdown('')
    // Clear draft from storage
    try {
      await StorageService.removeItem('markdownDraft')
      setDraftSaveStatus('idle')
    } catch (error) {
      console.warn('Failed to clear draft from storage:', error)
    }
  }

  return {
    markdown,
    setMarkdown,
    draftSaveStatus,
    clearDraft
  }
}