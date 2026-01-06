
import { z } from 'zod'
import { registerSafeHandler } from '../../main/ipc/safeHandler'
import { AddTrackSchema, IpcChannels, RemoveTrackSchema } from '../../shared/types'
import { libraryStore } from './store/JsonLibrary'

export function setupLibrary(): void {
  // GET LIBRARY
  registerSafeHandler(IpcChannels.GET_LIBRARY, z.void(), () => {
    return libraryStore.getTracks()
  })

  // ADD TRACK
  registerSafeHandler(IpcChannels.ADD_TRACK, AddTrackSchema, (_, track) => {
    libraryStore.addTrack(track)
  })

  // REMOVE TRACK
  registerSafeHandler(IpcChannels.REMOVE_TRACK, RemoveTrackSchema, (_, { id }) => {
    libraryStore.removeTrack(id)
  })
}
