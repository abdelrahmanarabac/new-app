import { Track } from '@shared/types'
import { GlassPanel } from './GlassPanel'
import { cn } from '@ui/utils'
import { Play, Music2 } from 'lucide-react'

interface TrackListProps {
    tracks: Track[]
    currentTrack: Track | null
    isPlaying: boolean
    onPlay: (track: Track) => void
}

export const TrackList = ({ tracks, currentTrack, isPlaying, onPlay }: TrackListProps) => {
    if (tracks.length === 0) {
        return (
            <GlassPanel className="h-full flex flex-col items-center justify-center text-white/50 p-8">
                <Music2 className="w-12 h-12 mb-4 opacity-50" />
                <p>Drag & Drop your music here</p>
            </GlassPanel>
        )
    }

    return (
        <div className="flex flex-col gap-2 overflow-y-auto h-full pr-2 pb-32 scrollbar-hide">
            {tracks.map((track, i) => {
                const isActive = currentTrack?.id === track.id
                return (
                    <div
                        key={track.id}
                        onClick={() => onPlay(track)}
                        className={cn(
                            "flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 group relative overflow-hidden",
                            isActive ? "bg-white/10 shadow-[0_0_15px_rgba(0,243,255,0.1)] border border-primary/30" : "border border-transparent hover:bg-white/5"
                        )}
                    >
                        {/* Active Glow Background */}
                        {isActive && <div className="absolute inset-0 bg-primary/5 pointer-events-none" />}

                        <div className={cn("relative w-10 h-10 rounded-md bg-black/30 flex items-center justify-center mr-4 shrink-0 overflow-hidden", isActive && "shadow-[0_0_10px_rgba(0,243,255,0.3)]")}>
                            {isActive && isPlaying ? (
                                <div className="flex gap-0.5 items-end justify-center h-4 pb-1">
                                    <div className="w-1 bg-primary animate-[bounce_1s_infinite] h-2" />
                                    <div className="w-1 bg-primary animate-[bounce_1.2s_infinite] h-3" />
                                    <div className="w-1 bg-primary animate-[bounce_0.8s_infinite] h-2" />
                                </div>
                            ) : (
                                <span className="text-xs text-white/50 group-hover:hidden">{i + 1}</span>
                            )}
                            <Play size={16} className={cn("absolute text-white hidden", !isActive && "group-hover:block")} />
                        </div>

                        <div className="flex-1 min-w-0 z-10">
                            <div className={cn("font-medium truncate transition-colors", isActive ? "text-primary drop-shadow-neon" : "text-white group-hover:text-white", track.status === 'missing' && "text-red-400 line-through")}>
                                {track.title}
                            </div>
                            <div className="text-xs text-white/50 truncate">
                                {track.artist || 'Unknown Artist'}
                                {track.status === 'missing' && <span className="text-red-400 ml-2">(File Missing)</span>}
                            </div>
                        </div>

                        <div className="text-xs text-white/30 z-10">
                            {track.duration ? formatTime(track.duration) : '--:--'}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function formatTime(s: number) {
    if (!s || isNaN(s)) return '--:--'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
}
