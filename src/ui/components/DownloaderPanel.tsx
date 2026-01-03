import { useState, useEffect } from 'react'
import { GlassInput } from './GlassInput'
import { NeonButton } from './NeonButton'
import { GlassPanel } from './GlassPanel'
import { Download, AlertCircle, CheckCircle2, Loader2, FolderOpen } from 'lucide-react'

export const DownloaderPanel = () => {
    const [url, setUrl] = useState('')
    const [status, setStatus] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle')
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState('')

    useEffect(() => {
        const handleProgress = (data: any) => {
            console.log('Download progress:', data)
            if (data.status === 'downloading') {
                setStatus('downloading')
                // ytdl/ffmpeg progress can be unstable, ensure it goes forward
                setProgress(prev => Math.max(prev, data.progress || 0))
            } else if (data.status === 'completed') {
                setStatus('completed')
                setProgress(100)
                setUrl('')
                setTimeout(() => {
                    setStatus('idle')
                    setProgress(0)
                }, 3000)
            } else if (data.status === 'error') {
                setStatus('error')
                setError(data.error || 'Unknown error')
            } else if (data.progress) {
                // Fallback if status not set but progress exists
                setStatus('downloading')
                setProgress(data.progress)
            }
        }

        if (window.api) {
            window.api.onDownloadProgress(handleProgress)
        }

        return () => {
            if (window.api) window.api.removeDownloadProgressListener()
        }
    }, [])

    const handleDownload = async () => {
        if (!url) return

        // Basic Regex Validation for immediate feedback
        const ytRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/
        if (!ytRegex.test(url)) {
            setStatus('error')
            setError('Invalid YouTube URL')
            return
        }

        setStatus('downloading')
        setProgress(0)
        setError('')

        try {
            await window.api.downloadVideo(url)
        } catch (e: any) {
            console.error(e)
            setStatus('error')
            setError(e.message || 'Failed to start download')
        }
    }

    return (
        <GlassPanel className="p-5 flex flex-col gap-4 transition-all duration-300">
            <div className="text-lg font-bold text-white drop-shadow-neon flex items-center gap-2">
                <Download size={20} className="text-primary" />
                <span>YouTube Downloader</span>
            </div>

            <div className="flex gap-3">
                <GlassInput
                    value={url}
                    onChange={e => {
                        setUrl(e.target.value)
                        if (status === 'error') setStatus('idle')
                    }}
                    placeholder="Paste YouTube Link here..."
                    className="flex-1"
                    disabled={status === 'downloading'}
                    onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
                />
                <NeonButton
                    onClick={handleDownload}
                    disabled={status === 'downloading'}
                    className="w-32"
                    variant={status === 'error' ? 'secondary' : 'primary'}
                >
                    {status === 'downloading' ? <Loader2 className="w-5 h-5 animate-spin" /> :
                        (status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Download className="w-5 h-5" />)
                    }
                </NeonButton>
            </div>

            {/* Status Area */}
            <div className="h-6 relative">
                {status === 'downloading' && (
                    <div className="w-full flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-primary font-mono">
                            <span>DOWNLOADING...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_#00f3ff]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-400 text-sm animate-in slide-in-from-left-2">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}
                {status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-400 text-sm animate-in slide-in-from-left-2">
                        <CheckCircle2 size={14} />
                        <span>Download Complete! File added to library.</span>
                    </div>
                )}
            </div>
        </GlassPanel>
    )
}
