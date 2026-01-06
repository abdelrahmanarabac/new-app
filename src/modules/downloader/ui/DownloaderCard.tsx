import React, { useState } from 'react'
import { Link, Download, AlertCircle } from 'lucide-react'
import { useDownloader } from '../hooks/useDownloader'

export const DownloaderCard = (): React.JSX.Element => {
    const { status, downloadVideo, error } = useDownloader()
    const [url, setUrl] = useState('')

    const handleDownload = (): void => {
        if (url) {
            downloadVideo(url)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === 'Enter') {
            handleDownload()
        }
    }

    return (
        <div className="glass-panel rounded-2xl p-5 mb-8 shadow-glass relative group border border-white/10 bg-white/[0.03]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="flex flex-col gap-4 relative z-10">
                <div>
                    <h2 className="text-lg font-bold text-white mb-1">Download Media</h2>
                    <p className="text-xs text-white/50">Supports YouTube, Spotify & SoundCloud</p>
                </div>

                <div className="relative flex items-center">
                    <div className="absolute left-4 text-white/30 flex items-center">
                        <Link size={20} />
                    </div>
                    <input
                        className="w-full bg-[#000000]/40 text-white placeholder-white/30 border border-white/5 rounded-xl py-4 pl-12 pr-16 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all text-sm shadow-inner"
                        placeholder="Paste link here..."
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={status === 'downloading'}
                    />
                    <button
                        onClick={handleDownload}
                        disabled={status === 'downloading' || !url}
                        className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-lg bg-neon-gradient flex items-center justify-center text-background-dark shadow-neon hover:scale-105 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'downloading' ? (
                            <div className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Download size={20} className="font-bold" />
                        )}
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
