import React from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { NeonButton } from './NeonButton'

interface PlayerControlsProps {
    isPlaying: boolean
    onTogglePlay: () => void
    onNext?: () => void
    onPrev?: () => void
    progress: number // seconds
    duration: number // seconds
    onSeek: (time: number) => void
    volume: number
    onVolumeChange: (vol: number) => void
}

export const PlayerControls = ({
    isPlaying,
    onTogglePlay,
    onNext,
    onPrev,
    progress,
    duration,
    onSeek,
    volume,
    onVolumeChange,
}: PlayerControlsProps) => {

    const formatTime = (s: number) => {
        if (!s || isNaN(s)) return '0:00'
        const m = Math.floor(s / 60)
        const sec = Math.floor(s % 60)
        return `${m}:${sec.toString().padStart(2, '0')}`
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSeek(Number(e.target.value))
    }

    return (
        <div className="w-full h-20 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex items-center px-6 gap-6 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            {/* Glossy Reflection Top */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20 opacity-50" />

            {/* Controls Left */}
            <div className="flex items-center gap-4 shrink-0">
                <button onClick={onPrev} className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all">
                    <SkipBack size={20} fill="currentColor" />
                </button>

                <NeonButton
                    onClick={onTogglePlay}
                    className="w-12 h-12 flex items-center justify-center rounded-full !p-0 bg-white text-black hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] border-none"
                    glowColor="rgba(255,255,255,0.5)"
                >
                    {isPlaying ? (
                        <Pause size={20} fill="currentColor" className="text-black" />
                    ) : (
                        <Play size={20} fill="currentColor" className="ml-1 text-black" />
                    )}
                </NeonButton>

                <button onClick={onNext} className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all">
                    <SkipForward size={20} fill="currentColor" />
                </button>
            </div>

            {/* Scrubber & Info Center */}
            <div className="flex-1 flex flex-col justify-center gap-1 group/seek">
                <div className="flex justify-between text-xs font-medium text-white/40 px-1">
                    <span>{formatTime(progress)}</span>
                    <span className="hidden group-hover/seek:inline text-white/80 transition-opacity">Seek</span>
                    <span>{formatTime(duration)}</span>
                </div>

                <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group-hover/seek:h-2 transition-all">
                    {/* Progress Bar */}
                    <div
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] rounded-full"
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                    />
                    {/* Input Overlay */}
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={progress}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>

            {/* Volume Right */}
            <div className="flex items-center gap-2 shrink-0 w-32 ml-2">
                <button onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)} className="text-white/50 hover:text-white">
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-purple-400"
                />
            </div>
        </div>
    )
}
