import React, { useCallback, useState } from 'react'
import { cn } from '@ui/utils'

interface DragDropZoneProps {
  onFilesDropped: (paths: string[]) => void
  children: React.ReactNode
  className?: string
}

export const DragDropZone = ({ onFilesDropped, children, className }: DragDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const paths: string[] = []
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i]
          // In Electron renderer with contextIsolation: false or Node integration, 'path' exposes real path.
          // With strict separation, 'webUtils' or similar might be needed, but usually 'File' object in Electron has 'path' property.
          // We will assume 'path' is available on the File object (standard behavior in Electron).
          const filePath = (file as any).path
          if (filePath) paths.push(filePath)
        }
        if (paths.length > 0) {
          onFilesDropped(paths)
        }
      }
    },
    [onFilesDropped]
  )

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn('relative w-full h-full', className)}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/20 backdrop-blur-sm border-2 border-primary border-dashed rounded-xl flex items-center justify-center animate-pulse pointer-events-none">
          <div className="text-2xl font-bold text-white drop-shadow-neon">DROP FILES HERE</div>
        </div>
      )}
      {children}
    </div>
  )
}
