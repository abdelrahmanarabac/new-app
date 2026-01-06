import React from 'react'
import { motion } from 'framer-motion'
import { SkipBack, SkipForward, Play, Pause } from 'lucide-react'
import { Track } from '@shared/types'

export const PlayerBar = ({
    currentTrack,
    playerState,
    progress,
    duration,
    togglePlay,
    playNext,
    playPrev,
    tracks
}: {
    currentTrack: Track | null
    playerState: 'playing' | 'paused' | 'stopped' | 'loading'
    progress: number
    duration: number
    togglePlay: () => void
    playNext: (tracks: Track[]) => void
    playPrev: (tracks: Track[]) => void
    tracks: Track[]
}): React.JSX.Element => {
    if (!currentTrack) return <></>

    const fmt = (s: number): string => {
        const mins = Math.floor(s / 60)
        const secs = Math.floor(s % 60)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50">
            <div className="glass-panel rounded-2xl p-3 shadow-glass relative overflow-hidden backdrop-blur-2xl bg-black/40 border border-white/10">
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
                    <motion.div
                        className="h-full bg-primary shadow-[0_0_10px_rgba(43,189,238,0.8)]"
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                            className="size-10 rounded-md bg-cover bg-center shrink-0 border border-white/10 relative overflow-hidden"
                            style={{ backgroundImage: currentTrack.albumArt ? `url(${currentTrack.albumArt})` : undefined }}
                        >
                            {!currentTrack.albumArt && <div className="absolute inset-0 bg-gray-800" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-white font-semibold text-sm truncate">{currentTrack.title}</p>
                                {playerState === 'playing' && (
                                    <span className="size-1 rounded-full bg-primary animate-pulse shrink-0" />
                                )}
                            </div>
                            <p className="text-xs text-white/50 truncate">
                                {currentTrack.artist || 'Unknown'} • {fmt(progress)} / {fmt(duration)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => playPrev(tracks)}
                            className="size-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <SkipBack size={24} fill="currentColor" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="size-10 flex items-center justify-center rounded-full bg-white text-background-dark shadow-neon hover:scale-105 active:scale-95 transition-transform"
                        >
                            {playerState === 'playing' ? (
                                <Pause size={24} fill="currentColor" />
                            ) : (
                                <Play size={24} fill="currentColor" />
                            )}
                        </button>
                        <button
                            onClick={() => playNext(tracks)}
                            className="size-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <SkipForward size={24} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
