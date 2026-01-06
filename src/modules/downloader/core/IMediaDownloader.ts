import { DownloadJob, DownloadOptions } from './types'
import { EventEmitter } from 'events'

export interface IMediaDownloader extends EventEmitter {
  /**
   * Initialize resources (check binaries, etc.)
   */
  init(): Promise<void>

  /**
   * Start a new download
   */
  download(url: string, options: DownloadOptions): Promise<DownloadJob>

  /**
   * Cancel an active download by Job ID
   */
  cancel(jobId: string): Promise<void>

  /**
   * Get metadata info without downloading
   */
  getInfo(url: string): Promise<any> // Using any for now, refine later
}
