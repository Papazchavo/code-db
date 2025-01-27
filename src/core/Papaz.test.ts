/* eslint-disable @typescript-eslint/ban-ts-comment */
import { deepEqual, equal, throws } from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import lodash from 'lodash'
import { temporaryFile } from 'tempy'

import { Memory } from '../adapters/Memory.js'
import { JSONFile, JSONFileSync } from '../adapters/node/JSONFile.js'
import { Papaz, PapazSync } from './Papaz.js'

type Data = {
  a?: number
  b?: number
}

function createJSONFile(obj: unknown): string {
  const file = temporaryFile()
  fs.writeFileSync(file, JSON.stringify(obj))
  return file
}

function readJSONFile(file: string): unknown {
  return JSON.parse(fs.readFileSync(file).toString())
}

await test('CheckArgs', () => {
  const adapter = new Memory()
  // Ignoring TypeScript error and pass incorrect argument
  // @ts-ignore
  throws(() => new Papaz())
  // @ts-ignore
  throws(() => new PapazSync())
  // @ts-ignore
  throws(() => new Papaz(adapter))
  // @ts-ignore
  throws(() => new PapazSync(adapter))
})

await test('Papaz', async () => {
  // Create JSON file
  const obj = { a: 1 }
  const file = createJSONFile(obj)

  // Init
  const defaultData: Data = {}
  const adapter = new JSONFile<Data>(file)
  const Papaz = new Papaz(adapter, defaultData)
  await Papaz.read()

  // Data should equal file content
  deepEqual(Papaz.data, obj)

  // Write new data
  const newObj = { b: 2 }
  Papaz.data = newObj
  await Papaz.write()

  // File content should equal new data
  deepEqual(readJSONFile(file), newObj)

  // Write using update()
  await Papaz.update((data) => {
    data.b = 3
  })
  deepEqual(readJSONFile(file), { b: 3 })
})

await test('PapazSync', () => {
  // Create JSON file
  const obj = { a: 1 }
  const file = createJSONFile(obj)

  // Init
  const defaultData: Data = {}
  const adapter = new JSONFileSync<Data>(file)
  const Papaz = new PapazSync(adapter, defaultData)
  Papaz.read()

  // Data should equal file content
  deepEqual(Papaz.data, obj)

  // Write new data
  const newObj = { b: 2 }
  Papaz.data = newObj
  Papaz.write()

  // File content should equal new data
  deepEqual(readJSONFile(file), newObj)

  // Write using update()
  Papaz.update((data) => {
    data.b = 3
  })
  deepEqual(readJSONFile(file), { b: 3 })
})

await test('Lodash', async () => {
  // Extend with lodash
  class PapazWithLodash<T> extends Papaz<T> {
    chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
  }

  // Create JSON file
  const obj = { todos: ['foo', 'bar'] }
  const file = createJSONFile(obj)

  // Init
  const defaultData = { todos: [] }
  const adapter = new JSONFile<typeof obj>(file)
  const Papaz = new PapazWithLodash(adapter, defaultData)
  await Papaz.read()

  // Use lodash
  const firstTodo = Papaz.chain.get('todos').first().value()

  equal(firstTodo, 'foo')
})
