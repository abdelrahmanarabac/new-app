import { IMediaDownloader } from './IMediaDownloader'
import { DownloadJob, DownloadOptions } from './types'
import { YtDlpAdapter } from '../adapters/YtDlpAdapter'
import { EventEmitter } from 'events'

export class DownloadManager extends EventEmitter {
  private adapter: IMediaDownloader
  private jobs: Map<string, DownloadJob> = new Map()

  constructor() {
    super()
    this.adapter = new YtDlpAdapter()
    this.setupListeners()
  }

  async initialize() {
    await this.adapter.init()
  }

  private setupListeners() {
    this.adapter.on('progress', (event) => {
      this.emit('progress', event)
    })

    this.adapter.on('job-completed', (jobId) => {
      const job = this.jobs.get(jobId)
      if (job) {
        job.status = 'completed'
      }
      this.emit('job-completed', jobId)
    })

    this.adapter.on('job-failed', (event) => {
      const job = this.jobs.get(event.id)
      if (job) {
        job.status = 'failed'
        job.error = event.error
      }
      this.emit('job-failed', event)
    })
  }

  async getMediaInfo(url: string) {
    return this.adapter.getInfo(url)
  }

  async startDownload(url: string, options: DownloadOptions): Promise<DownloadJob> {
    const job = await this.adapter.download(url, options)
    this.jobs.set(job.id, job)
    return job
  }

  async cancelDownload(jobId: string) {
    await this.adapter.cancel(jobId)
    const job = this.jobs.get(jobId)
    if (job) {
      job.status = 'cancelled'
    }
  }

  async cancelAll() {
    const promises = Array.from(this.jobs.keys()).map((id) => this.cancelDownload(id))
    await Promise.all(promises)
  }
}
