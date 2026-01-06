import { IMediaDownloader } from '../core/IMediaDownloader'
import { DownloadJob, DownloadOptions, MediaMetadata } from '../core/types'
import { EventEmitter } from 'events'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs'

import { BinaryInstaller } from '../../infrastructure/BinaryInstaller'

export class YtDlpAdapter extends EventEmitter implements IMediaDownloader {
  private binaryPath: string
  private activeJobs: Map<string, ChildProcess> = new Map()

  constructor() {
    super()
    // Use the robust path from BinaryInstaller
    const binPath = BinaryInstaller.getBinaryPath()
    const isWin = process.platform === 'win32'
    this.binaryPath = path.join(binPath, isWin ? 'yt-dlp.exe' : 'yt-dlp')
  }

  async init(): Promise<void> {
    if (!fs.existsSync(this.binaryPath)) {
      // If still missing after app start, we try one last time or throw
      console.error('[YtDlpAdapter] Binary missing! Startup check should have handled this.')
      throw new Error(`yt-dlp binary missing at: ${this.binaryPath}`)
    }
  }

  async download(url: string, options: DownloadOptions): Promise<DownloadJob> {
    const jobId = crypto.randomUUID()
    const startTime = Date.now()

    // Construct arguments
    // Strict argument array to prevent injection
    const args = [
      '--progress',
      '--newline', // Essential for parsing
      '--no-playlist', // Default to single video for now unless playlist specific logic added
      '--output',
      options.filenameTemplate
        ? path.join(options.outputDir, `${options.filenameTemplate}.%(ext)s`)
        : path.join(options.outputDir, '%(title)s.%(ext)s'),
      '--no-warnings',
      '--ignore-errors', // Prevent crash if m4a is missing (rare)
      // Format selection - STRICT: Direct download only
      '-f',
      options.format === 'audio' ? 'bestaudio[ext=m4a]' : 'bestvideo[ext=mp4]+bestaudio[ext=m4a]',
      url
    ]

    // Debug: console.log(`[YtDlpAdapter] Spawning options:`, args);

    const child = spawn(this.binaryPath, args)
    this.activeJobs.set(jobId, child)

    const job: DownloadJob = {
      id: jobId,
      url,
      status: 'downloading',
      format: options.format === 'audio' ? 'm4a' : 'mp4', // Simplification for now
      createdAt: startTime
    }

    // Parse stdout for progress
    child.stdout.on('data', (data) => {
      const text = data.toString()
      this.parseProgress(text, jobId)
    })

    // Parse stderr for specific errors
    child.stderr.on('data', (data) => {
      console.error(`[YtDlpAdapter] stderr:`, data.toString())
    })

    child.on('close', (code) => {
      this.activeJobs.delete(jobId)
      if (code === 0) {
        this.emit('job-completed', jobId)
      } else {
        // Exit code 1 often means format not found in this strict mode
        const errorMsg =
          code === 1
            ? 'Format not available without conversion (No native M4A found)'
            : `Process exited with code ${code}`
        this.emit('job-failed', { id: jobId, error: errorMsg })
      }
    })

    return job
  }

  async cancel(jobId: string): Promise<void> {
    const child = this.activeJobs.get(jobId)
    if (child) {
      child.kill('SIGKILL') // Force kill
      this.activeJobs.delete(jobId)
    }
  }

  async getInfo(url: string): Promise<MediaMetadata> {
    const args = ['--dump-json', url]

    return new Promise((resolve, reject) => {
      const child = spawn(this.binaryPath, args)
      let output = ''
      let error = ''

      child.stdout.on('data', (d) => (output += d.toString()))
      child.stderr.on('data', (d) => (error += d.toString()))

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const json = JSON.parse(output)
            const metadata: MediaMetadata = {
              title: json.title,
              author: json.uploader,
              duration: json.duration,
              thumbnail: json.thumbnail,
              sourceUrl: url
            }
            resolve(metadata)
          } catch {
            reject(new Error('Failed to parse yt-dlp metadata'))
          }
        } else {
          reject(new Error(`yt-dlp getInfo failed: ${error}`))
        }
      })
    })
  }

  private parseProgress(text: string, jobId: string): void {
    // Regex for [download]  45.5% of 10.00MiB at 2.50MiB/s ETA 00:05
    const percentMatch = text.match(/\[download\]\s+(\d+\.\d+)%/)
    if (percentMatch) {
      const percent = parseFloat(percentMatch[1])
      this.emit('progress', { jobId, percent })
    }
  }
}
