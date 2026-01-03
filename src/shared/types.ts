export interface Track {
  id: string;
  url: string; // File path or URL
  title: string;
  artist?: string;
  duration?: number;
  albumArt?: string;
  source: 'local' | 'youtube';
  status: 'ready' | 'missing' | 'corrupted';
  dateAdded: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: string[]; // Track IDs
}

export type DownloadState = 'pending' | 'downloading' | 'processing' | 'completed' | 'error';

export interface DownloadJob {
  id: string;
  url: string;
  progress: number; // 0-100
  status: DownloadState;
  error?: string;
  trackId?: string; // ID of the track once downloaded
  filename?: string;
}

export interface AppConfig {
  volume: number;
  lastPlayedTrackId?: string;
  downloadPath: string;
}
