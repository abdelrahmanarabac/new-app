import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { validateYoutubeUrl } from './validator'
import { DownloadManager } from './core/DownloadManager'
import { sanitizeFilename } from './validator'

// Singleton instance
const downloadManager = new DownloadManager()

export function killAllDownloads() {
  downloadManager.cancelAll().catch(err => console.error('Failed to cancel all downloads:', err))
}

export function setupDownloader(downloadPath: string) {
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true })
  }

  // Initialize the manager (binary check)
  downloadManager.initialize().catch(err => {
      console.error('Failed to initialize DownloadManager:', err);
  });

  ipcMain.handle('download-video', async (event, url) => {
    try {
      console.log(`📡 Analyzing with yt-dlp: ${url}`)
      if (!validateYoutubeUrl(url)) throw new Error('رابط يوتيوب غير صالح')

      // 1. Get Info First (Restoring legacy behavior)
      const info = await downloadManager.getMediaInfo(url);
      const title = sanitizeFilename(info.title);
      const filename = `${title}.m4a`;
      const filePath = path.join(downloadPath, filename);

      if (fs.existsSync(filePath)) {
        return { status: 'exists', filePath, title, duration: info.duration }
      }

      console.log(`🚀 Starting Download Job for: ${title}`);
      
      const job = await downloadManager.startDownload(url, {
          format: 'audio', // Defaulting to audio as per legacy behavior
          quality: 'best',
          outputDir: downloadPath,
          filenameTemplate: title // Pass title to ensure filename matches expectations?
          // Note: Adapter uses simple template. We might need to ensure filename matches.
          // Adapter uses: path.join(options.outputDir, '%(title)s.%(ext)s')
          // This should match title mostly, but sanitization might differ.
          // Ideally pass the filename template to yt-dlp.
      });

      return new Promise((resolve, reject) => {
          const onProgress = (data: { jobId: string, percent: number }) => {
              if (data.jobId === job.id) {
                 event.sender.send('download-progress', { progress: data.percent, status: 'downloading' });
              }
          };

          const onCompleted = (jobId: string) => {
              if (jobId === job.id) {
                  cleanup();
                  
                  event.sender.send('download-progress', { progress: 100, status: 'completed' });
                  resolve({ 
                      status: 'completed', 
                      filePath, 
                      title: info.title, 
                      duration: info.duration
                  });
              }
          };

          const onFailed = (data: { id: string, error: string }) => {
              if (data.id === job.id) {
                  cleanup();
                  console.error('❌ Job Error:', data.error);
                  event.sender.send('download-progress', { status: 'error', error: data.error });
                  reject(new Error(data.error));
              }
          };

          // Attach listeners to the private adapter (hacky but effective for migration)
          // Ideally DownloadManager should re-emit these
          // For now, we'll trust the DownloadManager to be the event source if we updated it,
          // but currently `DownloadManager` subscribes to its adapter but doesn't re-emit to us easily.
          // Let's rely on the internal adapter logic or just modify DownloadManager to be an EventEmitter.
          // Actually, DownloadManager setupListeners() logs but doesn't bubble events. 
          // FIX: We need DownloadManager to emit events.
          
          
          downloadManager.on('progress', onProgress);
          downloadManager.on('job-completed', onCompleted);
          downloadManager.on('job-failed', onFailed);

          const cleanup = () => {
              downloadManager.off('progress', onProgress);
              downloadManager.off('job-completed', onCompleted);
              downloadManager.off('job-failed', onFailed);
          };
      });

    } catch (e: any) {
      console.error('🔥 Critical Handler Error:', e.message)
      throw new Error(e.message || 'فشل التحميل لسبب غير معروف')
    }
  })
}
