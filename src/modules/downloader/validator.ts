export const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/

export function validateYoutubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url)
}

export function sanitizeFilename(title: string): string {
  // Removes < > : " / \ | ? *
  return title.replace(/[<>:"/\\|?*]/g, '').trim()
}
