# DİSCORD

<table>
  <tr>
    <td align="center" style="padding=0;width=50%;">

[![Discord Banner](https://api.weblutions.com/discord/invite/devcode/)](https://discord.gg/devcode)
</table>

papazchavo.,
ancientcim,
darkdaysdev,
shencim,
onlycmd,
ramalchavo.,

> If you know JavaScript, you know how to use codedb.

Read or create `db.json`

```js
const db = await JSONFilePreset('db.json', { posts: [] })
```

Use plain JavaScript to change data

```js
const post = { id: 1, title: 'codedb is awesome', views: 100 }

// In two steps
db.data.posts.push(post)
await db.write()

// Or in one
await db.update(({ posts }) => posts.push(post))
```

```js
// db.json
{
  "posts": [
    { "id": 1, "title": "codedb is awesome", "views": 100 }
  ]
}
```

In the same spirit, query using native `Array` functions:

```js
const { posts } = db.data

posts.at(0) // First post
posts.filter((post) => post.title.includes('codedb')) // Filter by title
posts.find((post) => post.id === 1) // Find by id
posts.toSorted((a, b) => a.views - b.views) // Sort by views
```

It's that simple. `db.data` is just a JavaScript object, no magic.

## Features

- **Lightweight**
- **Minimalist**
- **TypeScript**
- **Plain JavaScript**
- Safe atomic writes
- Hackable:
  - Change storage, file format (JSON, YAML, ...) or add encryption via [adapters](#adapters)
  - Extend it with lodash, ramda, ... for super powers!
- Automatically switches to fast in-memory mode during tests

## Install

```sh
npm install code.db
```

## Usage

_codedb is a pure ESM package. If you're having trouble using it in your project, please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)._

```js
import { JSONFilePreset } from 'codedb/node'

// Read or create db.json
const defaultData = { posts: [] }
const db = await JSONFilePreset('db.json', defaultData)

// Update db.json
await db.update(({ posts }) => posts.push('hello world'))

// Alternatively you can call db.write() explicitely later
// to write to db.json
db.data.posts.push('hello world')
await db.write()
```

```js
// db.json
{
  "posts": [ "hello world" ]
}
```

### TypeScript

You can use TypeScript to check your data types.

```ts
type Data = {
  messages: string[]
}

const defaultData: Data = { messages: [] }
const db = await JSONPreset<Data>('db.json', defaultData)

db.data.messages.push('foo') // ✅ Success
db.data.messages.push(1) // ❌ TypeScript error
```

### Lodash

You can extend codedb with Lodash (or other libraries). To be able to extend it, we're not using `JSONPreset` here. Instead, we're using lower components.

```ts
import { code } from 'codedb'
import { JSONFile } from 'codedb/node'
import lodash from 'lodash'

type Post = {
  id: number
  title: string
}

type Data = {
  posts: Post[]
}

// Extend Low class with a new `chain` field
class LowWithLodash<T> extends code<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}

const defaultData: Data = {
  posts: [],
}
const adapter = new JSONFile<Data>('db.json', defaultData)

const db = new LowWithLodash(adapter)
await db.read()

// Instead of db.data use db.chain to access lodash API
const post = db.chain.get('posts').find({ id: 1 }).value() // Important: value() must be called to execute chain
```

### CLI, Server, Browser and in tests usage

See [`src/examples/`](src/examples) directory.

## API

### Presets

codedb provides four presets for common cases.

- `JSONFilePreset(filename, defaultData)`
- `JSONFileSyncPreset(filename, defaultData)`
- `LocalStoragePreset(name, defaultData)`
- `SessionStoragePreset(name, defaultData)`

See [`src/examples/`](src/examples) directory for usage.

codedb is extremely flexible, if you need to extend it or modify its behavior, use the classes and adapters below instead of the presets.

### Classes

codedb has two classes (for asynchronous and synchronous adapters).

#### `new Low(adapter, defaultData)`

```js
import { code } from 'codedb'
import { JSONFile } from 'codedb/node'

const db = new Low(new JSONFile('file.json'), {})
await db.read()
await db.write()
```

#### `new LowSync(adapterSync, defaultData)`

```js
import { codeSync } from 'codedb'
import { JSONFileSync } from '/node'

const db = new LowSync(new JSONFileSync('file.json'), {})
db.read()
db.write()
```

### Methods

#### `db.read()`

Calls `adapter.read()` and sets `db.data`.

**Note:** `JSONFile` and `JSONFileSync` adapters will set `db.data` to `null` if file doesn't exist.

```js
db.data // === null
db.read()
db.data // !== null
```

#### `db.write()`

Calls `adapter.write(db.data)`.

```js
db.data = { posts: [] }
db.write() // file.json will be { posts: [] }
db.data = {}
db.write() // file.json will be {}
```

#### `db.update(fn)`

Calls `fn()` then `db.write()`.

```js
db.update((data) => {
  // make changes to data
  // ...
})
// files.json will be updated
```

### Properties

#### `db.data`

Holds your db content. If you're using the adapters coming with codedb, it can be any type supported by [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

For example:

```js
db.data = 'string'
db.data = [1, 2, 3]
db.data = { key: 'value' }
```

## Adapters

### codedb adapters

#### `JSONFile` `JSONFileSync`

Adapters for reading and writing JSON files.

```js
import { JSONFile, JSONFileSync } from 'codedb/node'

new code(new JSONFile(filename), {})
new codeSync(new JSONFileSync(filename), {})
```

#### `Memory` `MemorySync`

In-memory adapters. Useful for speeding up unit tests. See [`src/examples/`](src/examples) directory.

```js
import { Memory, MemorySync } from 'codedb'

new Low(new Memory(), {})
new LowSync(new MemorySync(), {})
```

#### `LocalStorage` `SessionStorage`

Synchronous adapter for `window.localStorage` and `window.sessionStorage`.

```js
import { LocalStorage, SessionStorage } from 'codedb/browser'
new codeSync(new LocalStorage(name), {})
new codeSync(new SessionStorage(name), {})
```

### Utility adapters

#### `TextFile` `TextFileSync`

Adapters for reading and writing text. Useful for creating custom adapters.

#### `DataFile` `DataFileSync`

Adapters for easily supporting other data formats or adding behaviors (encrypt, compress...).

```js
import { DataFile } from 'codedb/node'
new DataFile(filename, {
  parse: YAML.parse,
  stringify: YAML.stringify
})
new DataFile(filename, {
  parse: (data) => { decypt(JSON.parse(data)) },
  stringify: (str) => { encrypt(JSON.stringify(str)) }
})
```

### Third-party adapters

If you've published an adapter for codedb, feel free to create a PR to add it here.

### Writing your own adapter

You may want to create an adapter to write `db.data` to YAML, XML, encrypt data, a remote storage, ...

An adapter is a simple class that just needs to expose two methods:

```js
class AsyncAdapter {
  read() {
    /* ... */
  } // should return Promise<data>
  write(data) {
    /* ... */
  } // should return Promise<void>
}

class SyncAdapter {
  read() {
    /* ... */
  } // should return data
  write(data) {
    /* ... */
  } // should return nothing
}
```

For example, let's say you have some async storage and want to create an adapter for it:

```js
import { code } from 'codedb'
import { api } from './AsyncStorage'

class CustomAsyncAdapter {
  // Optional: your adapter can take arguments
  constructor(args) {
    // ...
  }

  async read() {
    const data = await api.read()
    return data
  }

  async write(data) {
    await api.write(data)
  }
}

const adapter = new CustomAsyncAdapter()
const db = new Low(adapter, {})
```

See [`src/adapters/`](src/adapters) for more examples.

#### Custom serialization

To create an adapter for another format than JSON, you can use `TextFile` or `TextFileSync`.

For example:

```js
import { Adapter, Low } from 'codedb'
import { TextFile } from 'codedb/node'
import YAML from 'yaml'

class YAMLFile {
  constructor(filename) {
    this.adapter = new TextFile(filename)
  }

  async read() {
    const data = await this.adapter.read()
    if (data === null) {
      return null
    } else {
      return YAML.parse(data)
    }
  }

  write(obj) {
    return this.adapter.write(YAML.stringify(obj))
  }
}

const adapter = new YAMLFile('file.yaml')
const db = new Low(adapter, {})
```

## Limits

codedb doesn't support Node's cluster module.

If you have large JavaScript objects (`~10-100MB`) you may hit some performance issues. This is because whenever you call `db.write`, the whole `db.data` is serialized using `JSON.stringify` and written to storage.

Depending on your use case, this can be fine or not. It can be mitigated by doing batch operations and calling `db.write` only when you need it.

If you plan to scale, it's highly recommended to use databases like PostgreSQL or MongoDB instead.
