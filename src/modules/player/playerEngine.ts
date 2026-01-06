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

  // Expose Web Audio Context for Visualizer
  getAudioContext(): AudioContext | null {
    return Howler.ctx
  }

  // Hook for React to subscribe
  subscribe(
    onStateChange: (state: PlayerState) => void,
    onProgress: (seek: number, duration: number) => void
  ): void {
    this.stateCb = onStateChange
    this.progressCb = onProgress
  }

  play(track: Track): void {
    if (this.currentTrack?.id === track.id && this.sound) {
      this.sound.play()
      this.notifyState('playing')
      this.startProgressLoop()
      return
    }

    this.stop()
    this.currentTrack = track
    this.notifyState('loading')

    // For local files, we use Web Audio API (html5: false) to allow visualization.
    // For remote URLs, we use HTML5 Audio (html5: true) to support streaming and CORS.
    const isLocal = track.source === 'local'
    const src = isLocal ? `file://${track.url}` : track.url

    this.sound = new Howl({
      src: [src],
      html5: !isLocal,
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
      },
      onloaderror: (_id, err) => {
        console.error('Load Error', err)
        this.notifyState('stopped')
      }
    })

    this.sound.play()
  }

  pause(): void {
    this.sound?.pause()
  }

  resume(): void {
    this.sound?.play()
  }

  stop(): void {
    this.sound?.stop()
    this.sound?.unload()
    this.sound = null
    this.stopProgressLoop()
    this.notifyState('stopped')
  }

  seek(per: number): void {
    if (this.sound) {
      const duration = this.sound.duration()
      this.sound.seek(duration * per)
    }
  }

  setVolume(vol: number): void {
    Howler.volume(vol)
  }

  private notifyState(state: PlayerState): void {
    this.stateCb?.(state)
  }

  private startProgressLoop(): void {
    this.stopProgressLoop()
    const loop = (): void => {
      if (this.sound && this.sound.playing()) {
        const seek = this.sound.seek()
        const duration = this.sound.duration()
        this.progressCb?.(seek, duration)
        this.animationFrame = requestAnimationFrame(loop)
      }
    }
    loop()
  }

  private stopProgressLoop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }
}

export const player = new PlayerEngine()
