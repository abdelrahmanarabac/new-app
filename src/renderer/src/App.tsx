import { useState, useEffect } from 'react'
import { Header } from '@modules/downloader/ui/Header'
import { DownloaderCard } from '@modules/downloader/ui/DownloaderCard'
import { TrackList } from '@modules/downloader/ui/TrackList'
import { PlayerBar } from '@modules/player/ui/PlayerBar'
import { DragDropZone } from '@modules/library/DragDropZone'
import { usePlayer } from '@modules/player/hooks/usePlayer'
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

function App(): React.JSX.Element {
    // Local track state (Library)
    const [tracks, setTracks] = useState<Track[]>([])

    const fetchLibrary = async (): Promise<void> => {
        try {
            const lib = await window.api.getLibrary()
            setTracks(lib)
        } catch (e) {
            console.error('Failed to fetch library', e)
        }
    }

    useEffect(() => {
        fetchLibrary()

        // Listen for download completion to refresh library
        window.api.onDownloadProgress((data: any) => {
            if (data.status === 'completed') {
                fetchLibrary()
            }
        })
        return () => {
            window.api.removeDownloadProgressListener()
        }
    }, [])

    // Player Logic
    const {
        playerState,
        progress,
        duration,
        currentTrack,
        togglePlay,
        play, // We need play for TrackList
        playNext,
        playPrev
    } = usePlayer()

    const handleFilesDropped = async (paths: string[]): Promise<void> => {
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
            // Refresh after adding
            fetchLibrary()
        } catch (err) {
            console.error('File drop error', err)
        }
    }

    return (
        <DragDropZone
            onFilesDropped={handleFilesDropped}
            className="h-screen flex flex-col overflow-hidden bg-background-dark text-white font-display antialiased selection:bg-primary/30"
        >
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-b from-background-dark to-background-dark-end -z-10 pointer-events-none" />

            {/* Abstract ambient glow */}
            <div className="fixed top-[-20%] right-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            <Header />

            <main className="flex-1 overflow-y-auto pb-32 px-4 hide-scrollbar">
                <DownloaderCard onFilesSelected={handleFilesDropped} />
                <TrackList
                    tracks={tracks}
                    currentTrack={currentTrack}
                    onPlay={play}
                    isPlaying={playerState === 'playing'}
                />
            </main>

            <PlayerBar
                currentTrack={currentTrack}
                playerState={playerState}
                progress={progress}
                duration={duration}
                togglePlay={togglePlay}
                playNext={playNext}
                playPrev={playPrev}
                tracks={tracks}
            />
        </DragDropZone>
    )
}

export default App
