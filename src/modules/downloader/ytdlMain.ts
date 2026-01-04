import { ipcMain } from 'electron'
import ytdl from '@distube/ytdl-core'
import fs from 'fs'
import path from 'path'
import { validateYoutubeUrl, sanitizeFilename } from './validator'

const activeProcesses: Set<any> = new Set()

export function killAllDownloads() {
  activeProcesses.forEach(req => {
    try { req.destroy() } catch (e) { }
  })
  activeProcesses.clear()
}


export function setupDownloader(downloadPath: string) {
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true })
  }

  ipcMain.handle('download-video', async (event, url) => {
    try {
      console.log(`📡 Analyzing: ${url}`)
      if (!validateYoutubeUrl(url)) throw new Error('رابط يوتيوب غير صالح')

      // 1. Get Info First
      const info = await ytdl.getInfo(url, {
        requestOptions: {
            headers: {
                // التخفي: بنقول ليوتيوب إحنا جوجل كروم ويندوز
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        }
      })

      const title = sanitizeFilename(info.videoDetails.title)
      const filename = `${title}.m4a`
      const filePath = path.join(downloadPath, filename)

      if (fs.existsSync(filePath)) {
        return { status: 'exists', filePath, title, duration: info.videoDetails.lengthSeconds }
      }

      // 2. Smart Format Selection: Find real M4A/MP4 audio
      // لو ملقاش m4a صريح، هيرضى بأي حاجة صوت
      const format = ytdl.chooseFormat(info.formats, { 
        quality: 'highestaudio', 
        filter: (f) => f.hasAudio && !f.hasVideo && (f.container === 'mp4' || (f.container as string) === 'm4a') 
      }) || ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' })

      if (!format) throw new Error('لم يتم العثور على صيغة صوت مناسبة')

      console.log(`🚀 Starting Stealth Download: ${title} [${format.container}]`)

      return new Promise((resolve, reject) => {
          const stream = ytdl.downloadFromInfo(info, { format: format })
          const fileWriter = fs.createWriteStream(filePath)

          let lastPercent = 0

          stream.on('progress', (_, downloaded, total) => {
             const percent = (downloaded / total) * 100
             if (percent - lastPercent > 2 || percent === 100) {
                 lastPercent = percent
                 event.sender.send('download-progress', { progress: percent, status: 'downloading' })
             }
          })

          stream.pipe(fileWriter)

          fileWriter.on('finish', () => {
             console.log('✅ Download Finished')
             event.sender.send('download-progress', { progress: 100, status: 'completed' })
             resolve({ status: 'completed', filePath, title, duration: info.videoDetails.lengthSeconds })
          })

          stream.on('error', (err) => {
             console.error('❌ Stream Error:', err.message)
             // مسح الملف المعطوب لو فشل
             if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
             
             event.sender.send('download-progress', { status: 'error', error: err.message })
             reject(err)
          })
          
          activeProcesses.add(stream)
      })

    } catch (e: any) {
      console.error('🔥 Critical Handler Error:', e.message)
      // ابعت الخطأ للواجهة عشان نشوفه
      throw new Error(e.message || 'فشل التحميل لسبب غير معروف')
    }
  })
}
