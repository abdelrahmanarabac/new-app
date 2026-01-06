import { ElectronAPI } from '@electron-toolkit/preload'
import { DownloadRequestPayload } from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      downloadVideo: (payload: DownloadRequestPayload) => Promise<void>
      parseFile: (path: string) => Promise<any>
      onDownloadProgress: (callback: (data: any) => void) => void
      removeDownloadProgressListener: () => void
      getConfig: () => Promise<any>
      setConfig: (key: string, value: any) => Promise<void>
      selectAudioFile: () => Promise<string[]>
      getLibrary: () => Promise<any[]>
      addTrack: (track: any) => Promise<void>
      removeTrack: (id: string) => Promise<void>
    }
  }
}
