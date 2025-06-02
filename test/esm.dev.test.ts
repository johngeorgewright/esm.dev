import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest'
import { readFile, writeFile } from 'node:fs/promises'
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
})

describe('access', () => {
  start()

  test('ESM server retreives watched packages', async () => {
    const response1 = await fetch(
      `http://localhost:${port}/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
    )
    expect(await response1.text()).matchSnapshot()
    const response2 = await fetch(`http://localhost:${port}/@esm.dev/package-2`)
    expect(await response2.text()).toMatchSnapshot()
  })
})

describe.for([
  { legacyMethod: false, name: 'modern', interval: 100 },
  { legacyMethod: true, name: 'legacy', interval: 3_000 },
])('watching with $name method', ({ legacyMethod, interval }) => {
  start(legacyMethod)

  beforeEach(() => changeMainExport('./src/foos.ts'))
  afterEach(() => changeMainExport('./src/foo.ts'))

  test('is updated', { timeout: interval + 5_000 }, async () => {
    const response1 = await fetch(
      `http://localhost:${port}/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
    )
    expect(await response1.text()).toMatchSnapshot()
  })

  async function changeMainExport(to: string) {
    const filename = 'test/packages/package-1/package.json'
    const json = JSON.parse(await readFile(filename, 'utf-8'))
    json.exports['.'] = to
    await writeFile(filename, JSON.stringify(json, null, 2))
    await setTimeout(interval)
  }
})

function start(legacyMethod?: boolean) {
  let stop: () => void

  beforeAll(async () => {
    stop = compose(
      serve(port, esmOrigin),
      await watch('test/packages/package-1', {
        registry,
        esmStoragePath,
        legacyMethod,
      }).catch(() => T),
      await watch('test/packages/package-2', {
        registry,
        esmStoragePath,
        legacyMethod,
      }).catch(() => T),
    )
  })

  afterAll(() => stop())
}
