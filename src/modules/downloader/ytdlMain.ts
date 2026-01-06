import path from 'path'
import fs from 'fs'
import { registerSafeHandler } from '../../main/ipc/safeHandler'
import { IpcChannels, DownloadRequestSchema } from '../../shared/types'
import { DownloadManager } from './core/DownloadManager'
import { sanitizeFilename } from './validator'
import { libraryStore } from '../library/store/JsonLibrary'

// Singleton instance
const downloadManager = new DownloadManager()

export function killAllDownloads(): void {
  downloadManager.cancelAll().catch((err) => console.error('Failed to cancel all downloads:', err))
}

export function setupDownloader(downloadPath: string): void {
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true })
  }

  // Initialize the manager (binary check)
  downloadManager.initialize().catch((err) => {
    console.error('Failed to initialize DownloadManager:', err)
  })

  registerSafeHandler(IpcChannels.DOWNLOAD_VIDEO, DownloadRequestSchema, async (event, payload) => {
    const { url, format, quality } = payload
    try {
      // Zod already validated the URL format

      // 1. Get Info First (Restoring legacy behavior)
      const info = await downloadManager.getMediaInfo(url)
      const title = sanitizeFilename(info.title)

      const filename = `${title}.${format}`
      const filePath = path.join(downloadPath, filename)

      if (fs.existsSync(filePath)) {
        return { status: 'exists', filePath, title, duration: info.duration }
      }

      const job = await downloadManager.startDownload(url, {
        format: format === 'mp4' ? 'video' : 'audio',
        quality: quality === 'low' ? 'worst' : 'best',
        outputDir: downloadPath,
        filenameTemplate: title
      })

      return new Promise((resolve, reject) => {
        const onProgress = (data: { jobId: string; percent: number }): void => {
          if (data.jobId === job.id) {
            event.sender.send('download-progress', {
              progress: data.percent,
              status: 'downloading'
            })
          }
        }

        const onCompleted = (jobId: string): void => {
          if (jobId === job.id) {
            cleanup()

            // Save to Library
            const newTrack: any = {
              id: job.id,
              url: filePath,
              title: info.title,
              artist: info.artist || 'Unknown Artist',
              duration: info.duration,
              albumArt: info.thumbnail,
              source: 'youtube',
              status: 'ready',
              dateAdded: Date.now()
            }
            libraryStore.addTrack(newTrack)

            event.sender.send('download-progress', { progress: 100, status: 'completed' })
            resolve({
              status: 'completed',
              filePath,
              title: info.title,
              duration: info.duration
            })
          }
        }

        const onFailed = (data: { id: string; error: string }): void => {
          if (data.id === job.id) {
            cleanup()
            console.error('❌ Job Error:', data.error)
            event.sender.send('download-progress', { status: 'error', error: data.error })
            reject(new Error(data.error))
          }
        }

        // Forward events from DownloadManager

        downloadManager.on('progress', onProgress)
        downloadManager.on('job-completed', onCompleted)
        downloadManager.on('job-failed', onFailed)

        const cleanup = (): void => {
          downloadManager.off('progress', onProgress)
          downloadManager.off('job-completed', onCompleted)
          downloadManager.off('job-failed', onFailed)
        }
      })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      console.error('🔥 Critical Handler Error:', message)
      throw new Error(message || 'فشل التحميل لسبب غير معروف')
    }
  })
}
