import { motion, AnimatePresence } from 'framer-motion'
import { Track } from '@shared/types'
import { SpectrumCanvas } from '../../visualizer/ui/SpectrumCanvas'
import { Minimize2 } from 'lucide-react'

interface ZenOverlayProps {
    currentTrack: Track | null
    onClose: () => void
    isVisible: boolean
}

export const ZenOverlay = ({ currentTrack, onClose, isVisible }: ZenOverlayProps) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl"
                >
                    {/* Background Album Art Blur */}
                    {currentTrack?.albumArt && (
                        <div
                            className="absolute inset-0 opacity-30 bg-cover bg-center pointer-events-none"
                            style={{ backgroundImage: `url(${currentTrack.albumArt})` }}
                        />
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
                    >
                        <Minimize2 size={24} />
                    </button>

                    <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl px-8 text-center">
                        {/* Huge Visualizer */}
                        <div className="w-full h-64 opacity-80 mask-image-gradient-b">
                            <SpectrumCanvas />
                        </div>

                        {/* Song Info */}
                        <div className="space-y-4">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-white to-white/60 tracking-tighter"
                            >
                                {currentTrack?.title || 'No Track Playing'}
                            </motion.h1>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl text-primary font-medium tracking-widest uppercase"
                            >
                                {currentTrack?.artist || 'Unknown Artist'}
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
