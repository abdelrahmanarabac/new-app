import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setupDownloader, killAllDownloads } from '../modules/downloader/ytdlMain'
import { setupMetadata } from '../modules/library/metadataMain'
import { setupStore } from '../modules/downloader/storeMain'
import { BinaryInstaller } from '../modules/infrastructure/BinaryInstaller'
import { setupLibrary } from '../modules/library/libraryMain'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 420,
    height: 780,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.vibe.player')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const downloadPath = app.getPath('downloads')
  setupDownloader(downloadPath)
  setupMetadata()
  setupStore()
  setupLibrary()

  // Native File Selection Dialog
  ipcMain.handle('select-audio-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac'] }]
    })
    return result.canceled ? [] : result.filePaths
  })

  // Self-Healing Infrastructure Check
  console.log('🔧 Checking critical binaries...')
  BinaryInstaller.ensureBinariesExist()
    .then((success) => {
      if (success) {
        console.log('✅ Binaries verified. Launching UI.')
        createWindow()
      } else {
        console.error('❌ Critical binary check failed.')
        dialog.showErrorBox(
          'Critical Error',
          'Failed to download necessary components (yt-dlp). Please check your internet connection and restart app.'
        )
        app.quit()
      }
    })
    .catch((err) => {
      console.error('❌ Binary check error:', err)
      dialog.showErrorBox('Critical Error', 'Startup check crashed: ' + err.message)
      app.quit()
    })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  killAllDownloads()
})
