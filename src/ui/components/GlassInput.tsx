import React from 'react'
import { cn } from '@ui/utils'

export const GlassInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 backdrop-blur-md outline-none transition-all duration-300',
        'focus:border-primary/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(0,243,255,0.2)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
})

GlassInput.displayName = 'GlassInput'
