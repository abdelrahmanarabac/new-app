import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { DownloadState } from '@shared/types'

interface StatusCardProps {
  status: DownloadState
  progress: number
  error: string | null
}

export const StatusCard = ({ status, progress, error }: StatusCardProps) => {
  if (status === 'pending' || status === 'processing') return null

  return (
    <div className="h-12 relative flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300">
      {status === 'downloading' && (
        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between text-xs text-primary font-mono tracking-wider">
            <span>DOWNLOADING...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          <AlertCircle size={16} />
          <span className="font-medium">{error || 'Unknown error occurred'}</span>
        </div>
      )}

      {status === 'completed' && (
        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-2 rounded-lg border border-green-500/20">
          <CheckCircle2 size={16} />
          <span className="font-medium">Download Complete! Added to library.</span>
        </div>
      )}
    </div>
  )
}
