import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { setupDownloader, killAllDownloads } from '../modules/downloader/ytdlMain'
import { setupMetadata } from '../modules/library/metadataMain'

import { setupStore } from '../modules/downloader/storeMain'
import { BinaryInstaller } from '../modules/infrastructure/BinaryInstaller'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  app.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // We can manually add this if needed, but skipping for now to fix crash.

  const downloadPath = app.getPath('downloads')
  setupDownloader(downloadPath)
  setupMetadata()
  setupStore()

  // Native File Selection Dialog
  ipcMain.handle('select-audio-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac'] }]
    })
    return result.canceled ? [] : result.filePaths
  })

  // Self-Healing Infrastructure Check
  // We block the main window until binaries are confirmed
  console.log('🔧 Checking critical binaries...')
  BinaryInstaller.ensureBinariesExist()
    .then((success) => {
      if (success) {
        console.log('✅ Binaries verified. Launching UI.')
        createWindow()
      } else {
        console.error('❌ Critical binary check failed. App might not function correctly.')
        // In a real app we might show a dialog here or quit.
        // For now, attempting to launch anyway is risky but allows debug.
        // But strict req says: "Block the main window until ensureBinaries() returns true."
        // So if failed, we probably shouldn't show the main window or show an error window.
        // Let's launch anyway but maybe with an error flag? checking prompt "Block... until returns true"
        // If it returns false, it means download failed even after retries.
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
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      // We re-check or just open? simpler to just open if we assume already checked.
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  killAllDownloads()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
