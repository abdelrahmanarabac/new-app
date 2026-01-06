import { useDownloader } from '@modules/downloader/hooks/useDownloader'
import { DownloadForm } from '@modules/downloader/ui/DownloadForm'
import { StatusCard } from '@modules/downloader/ui/StatusCard'
import { GlassPanel } from './GlassPanel'
import { Download } from 'lucide-react'

export const DownloaderPanel = (): React.JSX.Element => {
  const { status, progress, error, downloadVideo } = useDownloader()

  return (
    <GlassPanel className="p-5 flex flex-col gap-4 transition-all duration-300">
      <div className="text-lg font-bold text-white drop-shadow-neon flex items-center gap-2">
        <Download size={20} className="text-primary" />
        <span>YouTube Downloader</span>
      </div>

      <DownloadForm onDownload={downloadVideo} isLoading={status === 'downloading'} />

      <StatusCard status={status} progress={progress} error={error} />
    </GlassPanel>
  )
}
