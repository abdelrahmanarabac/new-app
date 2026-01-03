import { ipcMain } from 'electron'
import * as mm from 'music-metadata'

export function setupMetadata() {
  ipcMain.handle('parse-file', async (_event, filePath) => {
    try {
      const metadata = await mm.parseFile(filePath)
      return {
        title: metadata.common.title,
        artist: metadata.common.artist,
        album: metadata.common.album,
        duration: metadata.format.duration,
        picture: metadata.common.picture?.[0] // If we want to support art later
      }
    } catch (e) {
      console.error('Metadata parse error', e)
      return {}
    }
  })
}
