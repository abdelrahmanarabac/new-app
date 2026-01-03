import { ipcMain } from 'electron'
import ytdl from '@distube/ytdl-core'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

// Basic FFmpeg setup
// Fix for production ASAR archive access
const fixPathForAsarUnpack = (path: string) => {
    return path.replace('app.asar', 'app.asar.unpacked')
}

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(fixPathForAsarUnpack(ffmpegPath))
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
