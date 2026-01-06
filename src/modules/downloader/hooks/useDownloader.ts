import { useState, useEffect, useCallback } from 'react'
import { DownloadState } from '@shared/types'

interface DownloadProgressData {
  status: DownloadState
  progress?: number
  error?: string
}

export const useDownloader = (): {
  status: DownloadState
  progress: number
  error: string | null
  downloadVideo: (url: string) => Promise<void>
  reset: () => void
} => {
  const [status, setStatus] = useState<DownloadState>('pending')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Listen for progress events from the main process
    const handleProgress = (data: DownloadProgressData) => {
      // console.log('HOOK Progress:', data) // Keep clean, remove in prod or use debug flag

      if (data.status === 'downloading') {
        setStatus('downloading')
        // Ensure progress never jumps backwards unless it's a restart
        setProgress((prev) => Math.max(prev, data.progress || 0))
      } else if (data.status === 'completed') {
        setStatus('completed')
        setProgress(100)
      } else if (data.status === 'error') {
        setStatus('error')
        setError(data.error || 'Unknown error occurred')
      }
    }

    if (window.api) {
      window.api.onDownloadProgress(handleProgress)
    }

    return () => {
      if (window.api) {
        window.api.removeDownloadProgressListener()
      }
    }
  }, [])

  const downloadVideo = useCallback(async (url: string) => {
    if (!url) return

    // Reset State
    setStatus('downloading') // Optimistic update or 'pending'? 'downloading' gives immediate feedback
    setProgress(0)
    setError(null)

    try {
      if (window.api && window.api.downloadVideo) {
        await window.api.downloadVideo({ url, format: 'm4a', quality: 'high' })
      } else {
        throw new Error('API not available')
      }
    } catch (err: any) {
      console.error('Download failed', err)
      setStatus('error')
      setError(err.message || 'Failed to initiate download')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('pending')
    setProgress(0)
    setError(null)
  }, [])

  return {
    status,
    progress,
    error,
    downloadVideo,
    reset
  }
}
