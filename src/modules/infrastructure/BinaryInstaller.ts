import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'
import { app, BrowserWindow } from 'electron'
import os from 'os'

export class BinaryInstaller {
  private static readonly MAX_RETRIES = 3
  private static readonly BIN_DIR_NAME = 'bin'

  // Reliable sources
  private static readonly SOURCES = {
    ytDlp: {
      win32: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe',
      darwin: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos',
      linux: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp'
    }
  }

  static async ensureBinariesExist(window?: BrowserWindow): Promise<boolean> {
    const binPath = this.getBinaryPath()
    await fs.ensureDir(binPath)
    console.log('[BinaryInstaller] Checking binaries at:', binPath)

    const platform = os.platform()
    const ytDlpName = platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
    const ytDlpPath = path.join(binPath, ytDlpName)

    // 1. Check & Download yt-dlp
    if (!fs.existsSync(ytDlpPath)) {
      console.log('[BinaryInstaller] yt-dlp missing. Downloading...')
      this.notify(window, 'missing', 'yt-dlp')

      const url = this.SOURCES.ytDlp[platform as keyof typeof this.SOURCES.ytDlp]
      if (!url) throw new Error(`Platform ${platform} not supported for auto-download`)

      try {
        await this.downloadFile(url, ytDlpPath, (percent) => {
          this.notify(window, 'progress', 'yt-dlp', percent)
        })

        if (platform !== 'win32') {
          await fs.chmod(ytDlpPath, 0o755)
        }
        console.log('[BinaryInstaller] yt-dlp installed.')
      } catch (error) {
        console.error('[BinaryInstaller] Failed to download yt-dlp:', error)
        this.notify(window, 'error', 'yt-dlp')
        return false
      }
    }

    this.notify(window, 'completed', 'all')
    return true
  }

  static getBinaryPath(): string {
    // In dev: resources/bin
    // In prod: userData/bin (More robust for updates)
    return app.isPackaged
      ? path.join(app.getPath('userData'), this.BIN_DIR_NAME)
      : path.join(process.cwd(), 'resources', this.BIN_DIR_NAME)
  }

  private static notify(
    window: BrowserWindow | undefined,
    status: string,
    binary: string,
    percent?: number
  ) {
    if (window && !window.isDestroyed()) {
      window.webContents.send('binary-download-progress', { status, binary, percent })
    }
  }

  private static async downloadFile(
    url: string,
    dest: string,
    onProgress: (percent: number) => void
  ): Promise<void> {
    let attempt = 0
    while (attempt < this.MAX_RETRIES) {
      try {
        const writer = fs.createWriteStream(dest)
        const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream',
          timeout: 15000 // 15s timeout
        })

        const totalLength = parseInt(response.headers['content-length'] || '0', 10)
        let downloaded = 0

        response.data.on('data', (chunk: Buffer) => {
          downloaded += chunk.length
          if (totalLength > 0) {
            const percent = (downloaded / totalLength) * 100
            onProgress(parseFloat(percent.toFixed(1)))
          }
        })

        response.data.pipe(writer)

        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            // Verify size > 0
            const stats = fs.statSync(dest)
            if (stats.size > 0) resolve()
            else reject(new Error('Downloaded file is empty'))
          })
          writer.on('error', reject)
        })
      } catch (e) {
        attempt++
        console.warn(
          `[BinaryInstaller] Download failed (Attempt ${attempt}/${this.MAX_RETRIES})`,
          e
        )
        if (attempt >= this.MAX_RETRIES) throw e
        await new Promise((r) => setTimeout(r, 1000 * attempt)) // Backoff
      }
    }
  }
}
