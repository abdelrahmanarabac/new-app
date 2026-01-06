import fs from 'fs'
import path from 'path'
import { DownloadManager } from './core/DownloadManager'
import { sanitizeFilename } from './validator'
import { registerSafeHandler } from '../../main/ipc/safeHandler'
import { DownloadRequestSchema, IpcChannels } from '../../shared/types'

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
      console.log(`📡 Analyzing with yt-dlp: ${url}`)
      // Zod already validated the URL format

      // 1. Get Info First (Restoring legacy behavior)
      const info = await downloadManager.getMediaInfo(url)
      const title = sanitizeFilename(info.title)

      const filename = `${title}.${format}`
      const filePath = path.join(downloadPath, filename)

      if (fs.existsSync(filePath)) {
        return { status: 'exists', filePath, title, duration: info.duration }
      }

      console.log(`🚀 Starting Download Job for: ${title}`)

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
        // TODO: Refactor DownloadManager to bubble events naturally

        downloadManager.on('progress', onProgress)
        downloadManager.on('job-completed', onCompleted)
        downloadManager.on('job-failed', onFailed)

        const cleanup = (): void => {
          downloadManager.off('progress', onProgress)
          downloadManager.off('job-completed', onCompleted)
          downloadManager.off('job-failed', onFailed)
        }
      })
    } catch (e: any) {
      console.error('🔥 Critical Handler Error:', e.message)
      throw new Error(e.message || 'فشل التحميل لسبب غير معروف')
    }
  })
}
