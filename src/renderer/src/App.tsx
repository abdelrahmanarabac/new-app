import { useState } from 'react'
import { Header } from '@modules/downloader/ui/Header'
import { DownloaderCard } from '@modules/downloader/ui/DownloaderCard'
import { TrackList } from '@modules/downloader/ui/TrackList'
import { PlayerBar } from '@modules/player/ui/PlayerBar'
import { DragDropZone } from '@modules/library/ui/DragDropZone'
import { usePlayer } from '@modules/player/hooks/usePlayer'
import { useLibrary } from '@modules/library/hooks/useLibrary'
import { CollectionSidebar } from '@modules/library/ui/CollectionSidebar'
import { ZenOverlay } from '@modules/player/ui/ZenOverlay'
import { Track } from '@shared/types'

function App(): React.JSX.Element {
    // Library Logic
    const { tracks, addTracks } = useLibrary()

    // View State
    const [viewData, setViewData] = useState<{ type: 'all' | 'collection', data: Track[] }>({ type: 'all', data: [] })
    const [isZenMode, setIsZenMode] = useState(false)

    // Player Logic
    const {
        playerState,
        progress,
        duration,
        currentTrack,
        togglePlay,
        play,
        playNext,
        playPrev
    } = usePlayer()

    const displayTracks = viewData.type === 'collection' ? viewData.data : tracks

    return (
        <DragDropZone
            onFilesDropped={addTracks}
            className="h-screen flex flex-col overflow-hidden bg-background-dark text-white font-display antialiased selection:bg-primary/30"
        >
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-b from-background-dark to-background-dark-end -z-10 pointer-events-none" />

            {/* Abstract ambient glow */}
            <div className="fixed top-[-20%] right-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            <ZenOverlay
                currentTrack={currentTrack}
                isVisible={isZenMode}
                onClose={() => setIsZenMode(false)}
            />

            <Header />

            <div className="flex-1 flex overflow-hidden">
                <CollectionSidebar
                    tracks={tracks}
                    onSelectCollection={(data) => setViewData({ type: 'collection', data })}
                />

                <main className="flex-1 overflow-y-auto pb-32 px-4 hide-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-6 pt-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white/90">
                                {viewData.type === 'all' ? 'All Tracks' : 'Collection View'}
                            </h2>
                            <button
                                onClick={() => setViewData({ type: 'all', data: [] })}
                                className={`text-xs px-3 py-1 rounded-full border border-white/10 hover:bg-white/5 transition-colors ${viewData.type === 'all' ? 'hidden' : ''}`}
                            >
                                Clear Filter
                            </button>
                        </div>

                        <DownloaderCard onFilesSelected={addTracks} />

                        <TrackList
                            tracks={displayTracks}
                            currentTrack={currentTrack}
                            onPlay={play}
                            isPlaying={playerState === 'playing'}
                        />
                    </div>
                </main>
            </div>

            <PlayerBar
                currentTrack={currentTrack}
                playerState={playerState}
                progress={progress}
                duration={duration}
                togglePlay={togglePlay}
                playNext={playNext}
                playPrev={playPrev}
                tracks={displayTracks}
            />

            {/* Zen Mode Toggle (Floating or integrated into PlayerBar? Let's add float for now or assume PlayerBar has it. 
                Actually, let's put a toggle in the Header or somewhere visible properly.
                Let's add a floating Zen Toggle button bottom right for "Vibe" feel.
            */}
            <button
                onClick={() => setIsZenMode(true)}
                className="fixed bottom-24 right-6 z-40 size-12 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/50 transition-all shadow-lg hover:shadow-primary/20 group"
                title="Zen Mode"
            >
                <div className="size-3 rounded-full bg-current group-hover:scale-125 transition-transform" />
            </button>

        </DragDropZone>
    )
}

export default App
