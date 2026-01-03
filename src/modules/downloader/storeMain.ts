import { ipcMain } from 'electron'
import Store from 'electron-store'

const store = new Store()

export function setupStore() {
  ipcMain.handle('get-config', () => {
    return {
      volume: store.get('volume', 0.5),
      lastPlayedTrackId: store.get('lastPlayedTrackId', null),
      downloadPath: store.get('downloadPath', null)
    }
  })

  ipcMain.handle('set-config', (_event, key, value) => {
    store.set(key, value)
  })
}
