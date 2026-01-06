import React from 'react'
import { Zap, Wifi, BatteryFull } from 'lucide-react'

export const Header = (): React.JSX.Element => {
    return (
        <header className="flex items-center justify-between px-6 pt-12 pb-4 flex-shrink-0 z-10">
            <div className="flex items-center gap-2">
                <Zap className="text-primary" size={20} fill="currentColor" />
                <h1 className="text-sm font-semibold tracking-wide uppercase text-white/90">
                    Media Downloader
                </h1>
            </div>
            <div className="flex items-center gap-3">
                <Wifi className="text-white/40" size={20} />
                <BatteryFull className="text-white/40" size={20} />
            </div>
        </header>
    )
}
