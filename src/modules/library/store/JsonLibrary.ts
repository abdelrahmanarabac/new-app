import { app } from 'electron'
import fs from 'fs'
import path from 'path'

export interface Track {
  id: string
  url: string
  title: string
  artist?: string
  duration?: number
  albumArt?: string
  source: 'local' | 'youtube'
  status: 'ready' | 'missing' | 'corrupted'
  dateAdded: number
}

export class JsonLibrary {
  private filePath: string
  private tracks: Track[] = []

  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'library.json')
    this.load()
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8')
        this.tracks = JSON.parse(data)
      }
    } catch (err) {
      console.error('Failed to load library:', err)
      this.tracks = []
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.tracks, null, 2), 'utf-8')
    } catch (err) {
      console.error('Failed to save library:', err)
    }
  }

  getTracks(): Track[] {
    return this.tracks
  }

  addTrack(track: Track): void {
    // Avoid duplicates
    const exists = this.tracks.some((t) => t.id === track.id || t.url === track.url)
    if (!exists) {
      this.tracks.push(track)
      this.save()
    }
  }

  removeTrack(id: string): void {
    this.tracks = this.tracks.filter((t) => t.id !== id)
    this.save()
  }
}

// Singleton instance
export const libraryStore = new JsonLibrary()
