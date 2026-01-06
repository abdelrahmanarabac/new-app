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

const LIBRARY_FILENAME = 'library.json'
const ENCODING = 'utf-8'

export class JsonLibrary {
  private readonly storagePath: string
  private tracks: Track[] = []

  constructor() {
    this.storagePath = this.resolveStoragePath()
    this.reload()
  }

  public getTracks(): Track[] {
    return this.tracks
  }

  public addTrack(track: Track): void {
    if (this.isTrackDuplicate(track)) {
      return
    }
    this.tracks.push(track)
    this.persist()
  }

  public removeTrack(id: string): void {
    this.tracks = this.tracks.filter((t) => t.id !== id)
    this.persist()
  }

  private resolveStoragePath(): string {
    return path.join(app.getPath('userData'), LIBRARY_FILENAME)
  }

  private reload(): void {
    try {
      this.attemptLoad()
    } catch (error) {
      this.handleError('Load failed', error)
      this.tracks = []
    }
  }

  private attemptLoad(): void {
    if (!this.fileAccessible()) {
      return
    }
    const data = this.readFileContent()
    this.tracks = this.parseTracks(data)
  }

  private persist(): void {
    try {
      this.attemptSave()
    } catch (error) {
      this.handleError('Save failed', error)
    }
  }

  private attemptSave(): void {
    const serialized = JSON.stringify(this.tracks, null, 2)
    fs.writeFileSync(this.storagePath, serialized, ENCODING)
  }

  private fileAccessible(): boolean {
    return fs.existsSync(this.storagePath)
  }

  private readFileContent(): string {
    return fs.readFileSync(this.storagePath, ENCODING)
  }

  private parseTracks(data: string): Track[] {
    return JSON.parse(data)
  }

  private isTrackDuplicate(track: Track): boolean {
    return this.tracks.some((t) => t.id === track.id || t.url === track.url)
  }

  private handleError(context: string, error: unknown): void {
    console.error(`${context}:`, error)
  }
}

// Singleton instance
export const libraryStore = new JsonLibrary()
