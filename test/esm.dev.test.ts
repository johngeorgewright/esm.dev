import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'bun:test'
import { readFile, watch as fsWatch, writeFile } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'
import { compose, T } from 'ramda'
import { serve } from '../src/lib/server.js'
import { watch } from '../src/lib/watch.js'
import { login } from '../src/lib/login.js'
import { until } from '../src/lib/until.js'

const esmOrigin = process.env.ESM_ORIGIN ?? 'http://localhost:8080'
const esmStoragePath = process.env.ESM_STORAGE_PATH ?? 'docker-storage/esm/esmd'
const port = Number(process.env.PORT ?? '3000')
const registry = process.env.REGISTRY ?? 'http://localhost:4873'

let stopServing: () => void
let stopWatching: () => void

beforeAll(async () => {
  if (
    !(await until({
      interval: 300,
      timeout: 10_000,
      async try(signal) {
        const response = await fetch(registry, { signal })
        return response.ok
      },
    }))
  )
    throw new Error('Registry not available')

  await login(registry)

  stopServing = serve(port, esmOrigin)

  stopWatching = compose(
    await watch('test/packages/package-1', {
      registry,
      esmStoragePath,
    }).catch(() => T),
    await watch('test/packages/package-2', {
      registry,
      esmStoragePath,
    }).catch(() => T),
  )
})

afterAll(() => {
  stopServing()
  stopWatching()
})

test('access to packages', async () => {
  const response1 = await fetch(
    `http://localhost:${port}/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
  )

  expect(await response1.text()).toMatchInlineSnapshot(`
    "/* esm.sh - @esm.dev/package-1@0.0.1 */
    function o(){return"foo"}export{o as foo};
    //# sourceMappingURL=package-1.mjs.map"
  `)

  const response2 = await fetch(`http://localhost:${port}/@esm.dev/package-2`)

  expect(await response2.text()).toMatchInlineSnapshot(`
    "/* esm.sh - @esm.dev/package-2@0.0.1 */
    export * from "/@esm.dev/package-2@0.0.1/node/package-2.mjs";
    "
  `)
})

describe('changed content', async () => {
  beforeEach(() => changeMainExport('./src/foos.ts'))

  afterEach(() => changeMainExport('./src/foo.ts'))

  test('is updated', async () => {
    const response1 = await fetch(
      `http://localhost:${port}/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
    )
    expect(await response1.text()).toMatchInlineSnapshot(`
      "/* esm.sh - @esm.dev/package-1@0.0.1 */
      function o(){return"foos"}export{o as foos};
      //# sourceMappingURL=package-1.mjs.map"
    `)
  })

  async function changeMainExport(to: string) {
    const filename = 'test/packages/package-1/package.json'
    const json = JSON.parse(await readFile(filename, 'utf-8'))
    json.exports['.'] = to
    await writeFile(filename, JSON.stringify(json, null, 2))
    await setTimeout(100)
  }
})
