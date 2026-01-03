import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  downloadVideo: (url: string): Promise<any> => ipcRenderer.invoke('download-video', url),
  parseFile: (path: string): Promise<any> => ipcRenderer.invoke('parse-file', path),
  onDownloadProgress: (callback: (data: any) => void) => ipcRenderer.on('download-progress', (_, data) => callback(data)),
  removeDownloadProgressListener: () => ipcRenderer.removeAllListeners('download-progress'),
  getConfig: (): Promise<any> => ipcRenderer.invoke('get-config'),
  setConfig: (key: string, value: any) => ipcRenderer.invoke('set-config', key, value),
  selectAudioFile: (): Promise<string[]> => ipcRenderer.invoke('select-audio-file')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
