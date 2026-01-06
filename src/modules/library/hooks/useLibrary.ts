import { useState, useEffect, useCallback } from 'react'
import { Track } from '@shared/types'

interface FileMetadata {
    title?: string
    artist?: string
    duration?: number
    picture?: {
        format: string
        data: string
    }
}

export const useLibrary = () => {
    const [tracks, setTracks] = useState<Track[]>([])

    const fetchLibrary = useCallback(async (): Promise<void> => {
        try {
            const lib = await window.api.getLibrary()
            setTracks(lib)
        } catch (e) {
            console.error('Failed to fetch library', e)
        }
    }, [])

    useEffect(() => {
        fetchLibrary()

        // Listen for download completion to refresh library
        window.api.onDownloadProgress((data: any) => {
            if (data.status === 'completed') {
                fetchLibrary()
            }
        })
        
        // Note: The original code didn't use the return value of onDownloadProgress which is void.
        // But checking preload types: onDownloadProgress: (callback) => void.
        // So we need to handle cleanup manually if onDownloadProgress doesn't return unsubscribe.
        // The preload definition seems to match removing listener separately.
        
        return () => {
            window.api.removeDownloadProgressListener()
        }
    }, [fetchLibrary])

    const addTracks = async (paths: string[]): Promise<void> => {
        try {
            for (const p of paths) {
                let meta: FileMetadata = {}
                try {
                    if (window.api && window.api.parseFile) {
                        meta = (await window.api.parseFile(p)) as FileMetadata
                    }
                } catch (e) {
                    console.error('Metadata parse failed', e)
                }

                const name = p.split('\\').pop() || p.split('/').pop() || 'Unknown'
                const newTrack: any = {
                    id: Math.random().toString(36).substr(2, 9),
                    url: p,
                    title: meta.title || name,
                    artist: meta.artist || 'Unknown Artist',
                    duration: meta.duration || 0,
                    source: 'local',
                    status: 'ready',
                    dateAdded: Date.now(),
                    albumArt: meta.picture
                        ? `data:${meta.picture.format};base64,${meta.picture.data}`
                        : undefined
                }

                await window.api.addTrack(newTrack)
            }
            await fetchLibrary()
        } catch (err) {
            console.error('File drop error', err)
        }
    }

    return {
        tracks,
        refreshLibrary: fetchLibrary,
        addTracks
    }
}
