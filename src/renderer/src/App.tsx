import { useState, useEffect } from 'react'
import { MainLayout } from '@ui/layouts/MainLayout'
import { DragDropZone } from '@modules/library/DragDropZone'
import { TrackList } from '@ui/components/TrackList'
import { PlayerControls } from '@ui/components/PlayerControls'
import { DownloaderPanel } from '@ui/components/DownloaderPanel'
import { player, PlayerState } from '@modules/player/playerEngine'
import { Track } from '@shared/types'
import { FolderOpen } from 'lucide-react'

function App() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [playerState, setPlayerState] = useState<PlayerState>('stopped')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.5)

  useEffect(() => {
    // Subscribe to player state
    player.subscribe(
      (state) => setPlayerState(state),
      (seek, dur) => {
        setProgress(seek)
        setDuration(dur)
      }
    )

    // Load Config
    if (window.api && window.api.getConfig) {
      window.api.getConfig().then(config => {
        if (config.volume !== undefined) {
          setVolume(config.volume)
          player.setVolume(config.volume)
        }
      }).catch(err => console.error(err))
    } else {
      player.setVolume(volume)
    }
  }, [])

  const handleFilesDropped = async (paths: string[]) => {
    // Parse metadata via IPC
    try {
      const newTracks: Track[] = []

      for (const p of paths) {
        let meta: any = {}
        try {
          if (window.api && window.api.parseFile) {
            meta = await window.api.parseFile(p)
          }
        } catch (e) {
          console.error('Metadata parse failed', e)
        }

        const name = p.split('\\').pop() || p.split('/').pop() || 'Unknown'

        // Check for duplicates before adding
        const exists = tracks.some(t => t.url === p)
        if (!exists) {
          newTracks.push({
            id: Math.random().toString(36).substr(2, 9),
            url: p,
            title: meta.title || name,
            artist: meta.artist || 'Unknown Artist',
            duration: meta.duration || 0,
            source: 'local',
            status: 'ready',
            dateAdded: Date.now()
          })
        }
      }

      setTracks(prev => {
        // Double check against prev state
        const existingUrls = new Set(prev.map(t => t.url))
        const uniqueNew = newTracks.filter(t => !existingUrls.has(t.url))
        return [...prev, ...uniqueNew]
      })
    } catch (err) {
      console.error("File drop error", err)
    }
  }

  const handleBrowseFiles = async () => {
    if (window.api && window.api.selectAudioFile) {
      try {
        const paths = await window.api.selectAudioFile();
        if (paths && paths.length > 0) {
          await handleFilesDropped(paths);
        }
      } catch (error) {
        console.error("Failed to browse files:", error)
      }
    }
  }

  const handlePlay = (track: Track) => {
    setCurrentTrack(track)
    player.play(track)
  }

  const togglePlay = () => {
    if (playerState === 'playing') player.pause()
    else if (playerState === 'paused' || playerState === 'stopped') {
      if (currentTrack) player.resume()
      else if (tracks.length > 0) handlePlay(tracks[0])
    }
  }

  const handleNext = () => {
    if (!currentTrack || tracks.length === 0) return
    const idx = tracks.findIndex(t => t.id === currentTrack.id)
    if (idx !== -1 && idx < tracks.length - 1) {
      handlePlay(tracks[idx + 1])
    }
  }

  const handlePrev = () => {
    if (!currentTrack || tracks.length === 0) return
    const idx = tracks.findIndex(t => t.id === currentTrack.id)
    if (idx !== -1 && idx > 0) {
      handlePlay(tracks[idx - 1])
    }
  }

  return (
    <MainLayout>
      <DragDropZone onFilesDropped={handleFilesDropped} className="flex w-full h-full overflow-hidden">
        {/* SIDEBAR - Fixed Glass */}
        <aside className="w-[280px] shrink-0 h-full flex flex-col border-r border-white/5 bg-white/5 backdrop-blur-2xl z-20 pb-24">
          <div className="p-6 pb-2">
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-neon">VIBE</h1>
            <p className="text-xs text-white/40 tracking-widest uppercase">Music Player</p>
          </div>

          <div className="px-6 mb-4">
            <button
              onClick={handleBrowseFiles}
              className="w-full h-12 flex items-center justify-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white/80 font-medium tracking-wide transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95 group"
            >
              <FolderOpen size={18} className="text-purple-400 group-hover:text-purple-300 transition-colors drop-shadow-neon" />
              <span>Browse Files</span>
            </button>
          </div>

          {/* Library */}
          <div className="flex-1 overflow-hidden px-2">
            <TrackList
              tracks={tracks}
              currentTrack={currentTrack}
              onPlay={handlePlay}
              isPlaying={playerState === 'playing'}
            />
          </div>
        </aside>

        {/* MAIN STAGE - Center Visualization */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-8 pb-32 overflow-hidden">

          {/* Background Decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
          </div>

          {/* Downloader Widget (Absolute Top Right) */}
          <div className="absolute top-6 right-6 z-30 w-full max-w-sm">
            <DownloaderPanel />
          </div>

          {/* ALBUM ART - The "Vibe" Centerpiece */}
          <div className="relative z-10 group">
            {/* Main Art */}
            <div className={cn(
              "w-[320px] h-[320px] rounded-3xl bg-black/50 shadow-2xl relative overflow-hidden border border-white/10 transition-all duration-700 ease-in-out",
              playerState === 'playing' ? "animate-breathe shadow-[0_0_50px_rgba(139,92,246,0.3)]" : "scale-95 opacity-80"
            )}>
              {/* Placeholder Gradient Art */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
              {currentTrack ? (
                <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white/20 mix-blend-overlay">
                  {currentTrack.title.charAt(0)}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/10">
                  No Track
                </div>
              )}

              {/* Glass Sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Reflection Effect */}
            <div className="mt-4 w-[300px] h-[20px] mx-auto bg-black/20 blur-xl rounded-[100%] opacity-60" />
          </div>

          {/* Song Title (Large) */}
          {currentTrack && (
            <div className="mt-12 text-center z-10 space-y-2">
              <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">{currentTrack.title}</h2>
              <p className="text-xl text-white/60 font-medium">{currentTrack.artist}</p>
            </div>
          )}

        </main>

        {/* FLOATING PLAYER BAR */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50">
          <PlayerControls
            isPlaying={playerState === 'playing'}
            onTogglePlay={togglePlay}
            progress={progress}
            duration={duration || currentTrack?.duration || 0}
            onSeek={(t) => player.seek(t / (duration || 1))}
            volume={volume}
            onVolumeChange={(v) => {
              setVolume(v);
              player.setVolume(v);
              if (window.api) window.api.setConfig('volume', v)
            }}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>

      </DragDropZone>
    </MainLayout>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export default App
