import { ipcMain } from 'electron'
import ytdl from '@distube/ytdl-core'
import fs from 'fs'
import path from 'path'
// FFmpeg removed: simpler, zero-dependency piping
// Using native formats (m4a/webm) directly from stream

const activeProcesses: Set<any> = new Set()

export function killAllDownloads() {
  console.log(`Cleaning up ${activeProcesses.size} active downloads...`)
  activeProcesses.forEach(stream => {
    try {
      if (!stream.destroyed) stream.destroy()
    } catch (e) {
      console.error('Failed to kill stream', e)
    }
  })
  activeProcesses.clear()
}

import { validateYoutubeUrl, sanitizeFilename } from './validator'

// ... imports

export function setupDownloader(downloadPath: string) {
  // Ensure directory exists
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true })
  }

  ipcMain.handle('download-video', async (event, url) => {
    try {
      console.log(`Starting download for: ${url}`)
      if (!validateYoutubeUrl(url)) throw new Error('Invalid YouTube URL')

      const info = await ytdl.getInfo(url)
      const title = sanitizeFilename(info.videoDetails.title)
      // Changed to .m4a (AAC) - native container for YouTube audio
      const filename = `${title}.m4a`
      const filePath = path.join(downloadPath, filename)

      if (fs.existsSync(filePath)) {
        return { status: 'exists', filePath, title, duration: info.videoDetails.lengthSeconds }
      }

      return new Promise((resolve, reject) => {
          // Direct stream without re-encoding
          const stream = ytdl(url, { quality: 'highestaudio', filter: 'audioonly' })
          


          stream.on('progress', (_chunkLength, downloaded, total) => {
            const percent = downloaded / total
            const progress = (percent * 100).toFixed(2)
             
            // Throttle updates slightly if needed, but simple is fine
            event.sender.send('download-progress', { progress: parseFloat(progress), status: 'downloading' })
          })

          stream.on('end', () => {
             activeProcesses.delete(stream)
             event.sender.send('download-progress', { progress: 100, status: 'completed' })
             resolve({ status: 'completed', filePath, title, duration: info.videoDetails.lengthSeconds })
          })

          stream.on('error', (err) => {
             activeProcesses.delete(stream)
             console.error('Stream Error:', err)
             event.sender.send('download-progress', { status: 'error', error: err.message })
             reject(err)
          })
            
          activeProcesses.add(stream)
          stream.pipe(fs.createWriteStream(filePath))
      })
    } catch (e: any) {
      console.error('Download Handler Error:', e)
      throw e
    }
  })
}
