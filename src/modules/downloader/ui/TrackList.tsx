import React from 'react'
import { Play, MoreVertical, FileAudio } from 'lucide-react'
import { Track } from '@shared/types'

interface TrackListProps {
    tracks: Track[]
    currentTrack: Track | null
    onPlay: (track: Track) => void
    isPlaying: boolean
}

export const TrackList = ({
    tracks,
    currentTrack,
    onPlay,
    isPlaying
}: TrackListProps): React.JSX.Element => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-medium text-white/80">Downloads & Library</h3>
                <button className="text-xs text-primary font-medium hover:text-white transition-colors">
                    View All
                </button>
            </div>

            {tracks.length === 0 && (
                <div className="text-center text-white/30 py-8 text-sm">No tracks found.</div>
            )}

            {tracks.map((track) => {
                const isCurrent = currentTrack?.id === track.id

                return (
                    <div
                        key={track.id}
                        onClick={() => onPlay(track)}
                        className={`group flex items-center justify-between p-3 rounded-xl transition-colors border border-transparent cursor-pointer
                ${isCurrent ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 hover:border-white/5'}
            `}
                    >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative shrink-0">
                                <div
                                    className="size-14 rounded-lg bg-cover bg-center shadow-lg bg-gray-800"
                                    style={{
                                        backgroundImage: track.albumArt ? `url(${track.albumArt})` : undefined
                                    }}
                                >
                                    {!track.albumArt && (
                                        <div className="flex items-center justify-center h-full">
                                            <FileAudio size={20} className="text-white/20" />
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center backdrop-blur-[1px] ${isCurrent && isPlaying ? 'flex' : 'hidden group-hover:flex'}`}
                                >
                                    <Play size={24} className="text-white fill-white" />
                                </div>
                            </div>

                            <div className="flex flex-col min-w-0">
                                <p
                                    className={`font-medium text-base truncate pr-2 ${isCurrent ? 'text-primary' : 'text-white'}`}
                                >
                                    {track.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/70 uppercase">
                                        {track.source === 'youtube' ? 'Web' : 'Local'}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {track.duration
                                            ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                                            : '--:--'}
                                    </span>
                                    <span>•</span>
                                    <span className={isCurrent ? 'text-primary/80' : ''}>
                                        {isCurrent ? 'Playing' : 'Ready'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
