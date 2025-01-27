import { PathLike } from 'node:fs'

import { Memory, MemorySync } from '../adapters/Memory.js'
import { JSONFile, JSONFileSync } from '../adapters/node/JSONFile.js'
import { Papaz, PapazSync } from '../core/Papaz.js'

export async function JSONFilePreset<Data>(
  filename: PathLike,
  defaultData: Data,
): Promise<Papaz<Data>> {
  const adapter =
    process.env.NODE_ENV === 'test'
      ? new Memory<Data>()
      : new JSONFile<Data>(filename)
  const db = new Papaz<Data>(adapter, defaultData)
  await db.read()
  return db
}

export function JSONFileSyncPreset<Data>(
  filename: PathLike,
  defaultData: Data,
): PapazSync<Data> {
  const adapter =
    process.env.NODE_ENV === 'test'
      ? new MemorySync<Data>()
      : new JSONFileSync<Data>(filename)
  const db = new PapazSync<Data>(adapter, defaultData)
  db.read()
  return db
}
