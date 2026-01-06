import { useState, KeyboardEvent } from 'react'
import { GlassInput } from '@ui/components/GlassInput'
import { NeonButton } from '@ui/components/NeonButton'
import { Download, Loader2 } from 'lucide-react'

interface DownloadFormProps {
  onDownload: (url: string) => void
  isLoading: boolean
}

export const DownloadForm = ({ onDownload, isLoading }: DownloadFormProps) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isValidUrl = (testUrl: string) => {
    // Basic Regex Validation for visual feedback
    // Matches youtube.com and youtu.be
    const ytRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/
    return ytRegex.test(testUrl)
  }

  const handleSubmit = () => {
    if (!url) return
    if (!isValidUrl(url)) {
      setError('Invalid YouTube URL')
      return
    }
    setError(null)
    onDownload(url)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    if (error) setError(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <GlassInput
          value={url}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Paste YouTube Link here..."
          className={`flex-1 ${error ? 'border-red-500/50 focus:border-red-500' : ''}`}
          disabled={isLoading}
        />
        <NeonButton
          onClick={handleSubmit}
          disabled={isLoading || !url}
          className="w-32"
          variant={error ? 'secondary' : 'primary'}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
        </NeonButton>
      </div>
      {error && (
        <span className="text-red-400 text-xs px-2 animate-in slide-in-from-top-1">{error}</span>
      )}
    </div>
  )
}
