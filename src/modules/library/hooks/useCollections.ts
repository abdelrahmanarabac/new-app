import { useMemo } from 'react'
import { Track } from '@shared/types'

export const useCollections = (tracks: Track[]) => {
    const collections = useMemo(() => {
        // Smart Filter Logic
        const recentlyAdded = tracks
            .sort((a, b) => b.dateAdded - a.dateAdded)
            .slice(0, 20)

        const longTracks = tracks.filter((t) => (t.duration || 0) > 300) // > 5 mins
        
        const youtubeTracks = tracks.filter((t) => t.source === 'youtube')
        const localTracks = tracks.filter((t) => t.source === 'local')

        return [
            { id: 'recent', name: 'Recently Added', tracks: recentlyAdded },
            { id: 'long', name: 'Deep Focus (>5m)', tracks: longTracks },
            { id: 'web', name: 'From Web', tracks: youtubeTracks },
            { id: 'local', name: 'Local Files', tracks: localTracks }
        ]
    }, [tracks])

    return { collections }
}
