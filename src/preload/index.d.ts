import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      downloadVideo: (url: string) => Promise<any>
      parseFile: (path: string) => Promise<any>
      onDownloadProgress: (callback: (data: any) => void) => void
      removeDownloadProgressListener: () => void
      getConfig: () => Promise<any>
      setConfig: (key: string, value: any) => Promise<void>
      selectAudioFile: () => Promise<string[]>
    }
  }
}
