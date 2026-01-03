import { ipcMain } from 'electron'
import ytdl from '@distube/ytdl-core'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
// Dynamic FFmpeg Path Resolver for Production/Dev
const getFfmpegPath = () => {
    const isPackaged = app.isPackaged
    let ffmpegPath = ''
    
    if (isPackaged) {
        ffmpegPath = path.join(process.resourcesPath, 'bin', 'ffmpeg.exe')
    } else {
        ffmpegPath = path.join(process.cwd(), 'resources', 'bin', 'ffmpeg.exe')
    }
    
    return ffmpegPath
}

if (process.platform === 'win32') {
    ffmpeg.setFfmpegPath(getFfmpegPath())
} else {
    // Fallback or handle linux/mac pathing if needed
    ffmpeg.setFfmpegPath(getFfmpegPath())
}

const activeProcesses: Set<any> = new Set()

export function killAllDownloads() {
  console.log(`Cleaning up ${activeProcesses.size} active downloads...`)
  activeProcesses.forEach(proc => {
    try {
      proc.kill('SIGKILL')
    } catch (e) {
      console.error('Failed to kill process', e)
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
      const filename = `${title}.mp3`
      const filePath = path.join(downloadPath, filename)

      if (fs.existsSync(filePath)) {
        return { status: 'exists', filePath, title, duration: info.videoDetails.lengthSeconds }
      }

      // We return a promise that resolves when download completes
      return new Promise((resolve, reject) => {
          const stream = ytdl(url, { quality: 'highestaudio' })
          
          let proc: any = ffmpeg(stream)
            .audioBitrate(128)
            .format('mp3')
            .on('progress', (p) => {
               if (p.percent) {
                 event.sender.send('download-progress', { progress: p.percent, status: 'downloading' })
               }
            })
            .on('end', () => {
               activeProcesses.delete(proc)
               event.sender.send('download-progress', { progress: 100, status: 'completed' })
               resolve({ status: 'completed', filePath, title, duration: info.videoDetails.lengthSeconds })
            })
            .on('error', (err) => {
               activeProcesses.delete(proc)
               console.error('FFmpeg Error:', err)
               // Don't reject if killed manually (app exit)
               if (err.message.includes('SIGKILL')) return
               
               event.sender.send('download-progress', { status: 'error', error: err.message })
               reject(err)
            })
            
          activeProcesses.add(proc)
          proc.save(filePath)
      })
    } catch (e: any) {
      console.error('Download Handler Error:', e)
      throw e
    }
  })
}
