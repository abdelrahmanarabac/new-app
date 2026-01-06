import { useState, useEffect, useCallback } from 'react'
import { player, PlayerState } from '../playerEngine'
import { Track } from '@shared/types'

export const usePlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>('stopped')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [volume, setVolume] = useState(0.5)

  useEffect(() => {
    if (window.api && window.api.getConfig) {
      window.api.getConfig().then((config) => {
        if (config.volume !== undefined) {
          setVolume(config.volume)
          player.setVolume(config.volume)
        }
      })
    }

    const onStateChange = (state: PlayerState) => {
      setPlayerState(state)
    }

    const onProgress = (seek: number, dur: number) => {
      setProgress(seek)
      setDuration(dur)
    }

    player.subscribe(onStateChange, onProgress)

    return () => {
      // No unsubscribe method in engine yet
    }
  }, [])

  const play = useCallback((track: Track) => {
    setCurrentTrack(track)
    player.play(track)
  }, [])

  const togglePlay = useCallback(() => {
    if (playerState === 'playing') {
      player.pause()
    } else {
      player.resume()
    }
  }, [playerState])

  const seek = useCallback(
    (time: number) => {
      player.seek(time / (duration || 1))
    },
    [duration]
  )

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v)
    player.setVolume(v)
    if (window.api) window.api.setConfig('volume', v)
  }, [])

  const playNext = useCallback(
    (tracks: Track[]) => {
      if (!currentTrack || tracks.length === 0) return
      const idx = tracks.findIndex((t) => t.id === currentTrack.id)
      if (idx !== -1 && idx < tracks.length - 1) {
        play(tracks[idx + 1])
      }
    },
    [currentTrack, play]
  )

  const playPrev = useCallback(
    (tracks: Track[]) => {
      if (!currentTrack || tracks.length === 0) return
      const idx = tracks.findIndex((t) => t.id === currentTrack.id)
      if (idx !== -1 && idx > 0) {
        play(tracks[idx - 1])
      }
    },
    [currentTrack, play]
  )

  return {
    playerState,
    progress,
    duration,
    currentTrack,
    volume,
    play,
    togglePlay,
    seek,
    setVolume: handleVolumeChange,
    playNext,
    playPrev
  }
}
