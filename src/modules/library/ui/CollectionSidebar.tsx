import { useCollections } from '../hooks/useCollections'
import { Track } from '@shared/types'
import { Folder, Clock, Music, Youtube, FileText } from 'lucide-react'

interface CollectionSidebarProps {
    tracks: Track[]
    onSelectCollection: (tracks: Track[]) => void
}

export const CollectionSidebar = ({ tracks, onSelectCollection }: CollectionSidebarProps) => {
    const { collections } = useCollections(tracks)

    const getIcon = (id: string) => {
        switch (id) {
            case 'recent': return <Clock size={16} />
            case 'long': return <Music size={16} />
            case 'web': return <Youtube size={16} />
            case 'local': return <FileText size={16} />
            default: return <Folder size={16} />
        }
    }

    return (
        <div className="w-64 bg-black/20 border-r border-white/5 p-4 flex flex-col gap-6 hidden md:flex">
            <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2">Smart Collections</h3>
                <div className="space-y-1">
                    {collections.map(col => (
                        <button
                            key={col.id}
                            onClick={() => onSelectCollection(col.tracks)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="group-hover:text-primary transition-colors">{getIcon(col.id)}</span>
                                <span>{col.name}</span>
                            </div>
                            <span className="text-xs text-white/20 group-hover:text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                                {col.tracks.length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
