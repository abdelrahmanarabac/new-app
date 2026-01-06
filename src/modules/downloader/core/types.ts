export type DownloadStatus =
  | 'pending'
  | 'downloading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface MediaMetadata {
  title: string
  author: string
  duration: number // in seconds
  thumbnail?: string
  sourceUrl: string
}

export interface DownloadProgress {
  percent: number
  downloadedBytes: number
  totalBytes: number
  eta: number // in seconds
  speed: string // e.g. "2.5 MiB/s"
}

export interface DownloadJob {
  id: string
  url: string
  status: DownloadStatus
  metadata?: MediaMetadata
  progress?: DownloadProgress
  error?: string
  outputPath?: string
  format: 'mp3' | 'mp4' | 'm4a' // restricted subset for now
  createdAt: number
}

export interface DownloadOptions {
  format: 'audio' | 'video'
  quality: 'best' | 'worst' | string
  outputDir: string
  filenameTemplate?: string
}
