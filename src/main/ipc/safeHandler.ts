import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { z } from 'zod'

/**
 * Registers an IPC handler with strict Zod schema validation.
 * @param channel The IPC channel name.
 * @param schema The Zod schema to validate the payload.
 * @param handler The function to execute if validation passes.
 */
export function registerSafeHandler<T extends z.ZodType>(
  channel: string,
  schema: T,
  handler: (event: IpcMainInvokeEvent, data: z.infer<T>) => Promise<unknown> | unknown
): void {
  ipcMain.handle(channel, async (event, rawData) => {
    // 1. Validate Input (The Guard)
    const result = schema.safeParse(rawData)

    if (!result.success) {
      console.error(`[IPC Security] Validation Failed on ${channel}:`, result.error.issues)
      // Return a clean error to the renderer
      throw new Error(
        `Validation Error: ${result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      )
    }

    // 2. Execute Logic
    try {
      return await handler(event, result.data)
    } catch (error: unknown) {
      console.error(`[IPC Error] ${channel}:`, error)
      throw error
    }
  })
}
