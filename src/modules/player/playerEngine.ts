import { Howl, Howler } from 'howler'
import { Track } from '@shared/types'

export type PlayerState = 'playing' | 'paused' | 'stopped' | 'loading'

class PlayerEngine {
  private sound: Howl | null = null
  private currentTrack: Track | null = null
  private stateCb: ((state: PlayerState) => void) | null = null
  private progressCb: ((seek: number, duration: number) => void) | null = null
  private animationFrame: number | null = null

  constructor() {
    // Initial volume
    Howler.volume(0.5)
  }

  // Hook for React to subscribe
  subscribe(onStateChange: (state: PlayerState) => void, onProgress: (seek: number, duration: number) => void) {
    this.stateCb = onStateChange
    this.progressCb = onProgress
  }

  play(track: Track) {
    if (this.currentTrack?.id === track.id && this.sound) {
      this.sound.play()
      this.notifyState('playing')
      this.startProgressLoop()
      return
    }

    this.stop()
    this.currentTrack = track
    this.notifyState('loading')

    // Handle file protocol
    // Note: In production, might need to use a custom protocol or blob URL from Main
    const src = track.source === 'local' ? `file://${track.url}` : track.url

    this.sound = new Howl({
      src: [src],
      html5: true, // Specific for large files and ensuring no XHR CORS issues on local files sometimes
      format: ['mp3', 'm4a', 'webm'],
      onplay: () => {
        this.notifyState('playing')
        this.startProgressLoop()
      },
      onpause: () => {
        this.notifyState('paused')
        this.stopProgressLoop()
      },
      onend: () => {
        this.notifyState('stopped')
        this.stopProgressLoop()
        // Here we would trigger "next track" logic, probably via a callback or event
      },
      onloaderror: (_id, err) => {
        console.error('Load Error', err)
        this.notifyState('stopped')
      }
    })

    this.sound.play()
  }

  pause() {
    this.sound?.pause()
  }

  resume() {
    this.sound?.play()
  }

  stop() {
    this.sound?.stop()
    this.sound?.unload()
    this.sound = null
    this.stopProgressLoop()
    this.notifyState('stopped')
  }

  seek(per: number) {
    if (this.sound) {
        const duration = this.sound.duration()
        this.sound.seek(duration * per)
    }
  }

  setVolume(vol: number) {
    Howler.volume(vol)
  }

  private notifyState(state: PlayerState) {
    this.stateCb?.(state)
  }

  private startProgressLoop() {
    this.stopProgressLoop()
    const loop = () => {
      if (this.sound && this.sound.playing()) {
        const seek = this.sound.seek()
        const duration = this.sound.duration()
        this.progressCb?.(seek, duration)
        this.animationFrame = requestAnimationFrame(loop)
      }
    }
    loop()
  }

  private stopProgressLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }
}

export const player = new PlayerEngine()
