import { IMediaDownloader } from '../core/IMediaDownloader';
import { DownloadJob, DownloadOptions, DownloadProgress } from '../core/types';
import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export class YtDlpAdapter extends EventEmitter implements IMediaDownloader {
  private binaryPath: string;
  private activeJobs: Map<string, ChildProcess> = new Map();

  constructor() {
    super();
    // Determine binary path based on environment (dev vs prod)
    // In dev: resources/bin/yt-dlp.exe
    // In prod: resources/bin/yt-dlp.exe (unpacked)
    const isDev = !app.isPackaged;
    const resourcesPath = isDev 
      ? path.join(process.cwd(), 'resources') 
      : process.resourcesPath;
      
    this.binaryPath = path.join(resourcesPath, 'bin', 'yt-dlp.exe');
  }

  async init(): Promise<void> {
    console.log('[YtDlpAdapter] Initializing with binary:', this.binaryPath);
    if (!fs.existsSync(this.binaryPath)) {
      console.log('[YtDlpAdapter] Binary missing. Attempting to download...');
      try {
        await this.downloadBinary();
        console.log('[YtDlpAdapter] Binary downloaded successfully.');
      } catch (e) {
        console.error('[YtDlpAdapter] Failed to download binary:', e);
        throw new Error(`yt-dlp binary missing and auto-download failed. Please install manually at: ${this.binaryPath}`);
      }
    }
  }

  private async downloadBinary(): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.binaryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
    
    return new Promise((resolve, reject) => {
        const command = `powershell -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${this.binaryPath}'"`;
        const downloadProcess = spawn(command, { shell: true });
        
        downloadProcess.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Download process exited with code ${code}`));
        });
        
        // Timeout protection
        setTimeout(() => {
            downloadProcess.kill();
            reject(new Error('Download timed out'));
        }, 60000); // 1 minute timeout
    });
  }

  async download(url: string, options: DownloadOptions): Promise<DownloadJob> {
    const jobId = crypto.randomUUID();
    const startTime = Date.now();
    
    // Construct arguments
    // Strict argument array to prevent injection
    const args = [
      '--progress',
      '--newline', // Essential for parsing
      '--no-playlist', // Default to single video for now unless playlist specific logic added
      '--output', path.join(options.outputDir, '%(title)s.%(ext)s'),
      // Format selection
      '-f', options.format === 'audio' ? 'bestaudio' : 'bestvideo+bestaudio',
      url
    ];

    console.log(`[YtDlpAdapter] Spawning options:`, args);

    const child = spawn(this.binaryPath, args);
    this.activeJobs.set(jobId, child);

    const job: DownloadJob = {
      id: jobId,
      url,
      status: 'downloading',
      format: options.format === 'audio' ? 'm4a' : 'mp4', // Simplification for now
      createdAt: startTime
    };

    // Parse stdout for progress
    child.stdout.on('data', (data) => {
      const text = data.toString();
      this.parseProgress(text, jobId);
    });

    // Parse stderr for specific errors
    child.stderr.on('data', (data) => {
      console.error(`[YtDlpAdapter] stderr:`, data.toString());
    });

    child.on('close', (code) => {
      this.activeJobs.delete(jobId);
      if (code === 0) {
        this.emit('job-completed', jobId);
      } else {
        this.emit('job-failed', { id: jobId, error: `Process exited with code ${code}` });
      }
    });

    return job;
  }

  async cancel(jobId: string): Promise<void> {
    const child = this.activeJobs.get(jobId);
    if (child) {
      child.kill('SIGKILL'); // Force kill
      this.activeJobs.delete(jobId);
    }
  }

  async getInfo(url: string): Promise<MediaMetadata> {
    const args = ['--dump-json', url];
    
    return new Promise((resolve, reject) => {
        const child = spawn(this.binaryPath, args);
        let output = '';
        let error = '';

        child.stdout.on('data', (d) => output += d.toString());
        child.stderr.on('data', (d) => error += d.toString());

        child.on('close', (code) => {
            if (code === 0) {
                try {
                    const json = JSON.parse(output);
                    const metadata: MediaMetadata = {
                        title: json.title,
                        author: json.uploader,
                        duration: json.duration,
                        thumbnail: json.thumbnail,
                        sourceUrl: url
                    };
                    resolve(metadata);
                } catch (_e) {
                    reject(new Error('Failed to parse yt-dlp metadata'));
                }
            } else {
                reject(new Error(`yt-dlp getInfo failed: ${error}`));
            }
        });
    });
  }

  private parseProgress(text: string, jobId: string) {
    // Regex for [download]  45.5% of 10.00MiB at 2.50MiB/s ETA 00:05
    const percentMatch = text.match(/\[download\]\s+(\d+\.\d+)%/);
    if (percentMatch) {
      const percent = parseFloat(percentMatch[1]);
      this.emit('progress', { jobId, percent });
    }
  }
}
