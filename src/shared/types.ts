export interface Track {
  id: string
  url: string // File path or URL
  title: string
  artist?: string
  duration?: number
  albumArt?: string
  source: 'local' | 'youtube'
  status: 'ready' | 'missing' | 'corrupted'
  dateAdded: number
}

export interface Playlist {
  id: string
  name: string
  tracks: string[] // Track IDs
}

export type DownloadState = 'pending' | 'downloading' | 'processing' | 'completed' | 'error'

export interface DownloadJob {
  id: string
  url: string
  progress: number // 0-100
  status: DownloadState
  error?: string
  trackId?: string // ID of the track once downloaded
  filename?: string
}

export interface AppConfig {
  volume: number
  lastPlayedTrackId?: string
  downloadPath: string
}

// -- SECURE IPC SCHEMAS --
import { z } from 'zod';

export const IpcChannels = {
  DOWNLOAD_VIDEO: 'download-video',
} as const;

export const DownloadRequestSchema = z.object({
  url: z.string().url("Invalid URL format").regex(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/, "Only YouTube URLs allowed"),
  format: z.enum(['mp3', 'm4a', 'mp4']).optional().default('m4a'),
  quality: z.enum(['high', 'medium', 'low']).optional().default('high'),
});

export type DownloadRequestPayload = z.infer<typeof DownloadRequestSchema>;
