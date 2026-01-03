import React from 'react'
import { cn } from '@ui/utils'

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    intensity?: 'low' | 'medium' | 'high'
    hoverEffect?: boolean
}

export const GlassPanel = ({ children, className, intensity = 'medium', hoverEffect = false, ...props }: GlassPanelProps) => {
    const intensityMap = {
        low: 'bg-white/5 backdrop-blur-md border-white/5',
        medium: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
        high: 'bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl'
    }

    return (
        <div
            className={cn(
                "rounded-2xl transition-all duration-300 text-white", // Changed rounded-xl to rounded-2xl as per recipe
                intensityMap[intensity],
                hoverEffect && "hover:bg-white/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:border-white/20",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
