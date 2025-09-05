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
import { T } from 'ramda'
import { serve } from '../src/lib/server.js'
import { watch } from '../src/lib/watch.js'
import { login } from '../src/lib/login.js'
import { waitForEndpoint } from '../src/lib/until.js'
import { esmOrigin, esmStoragePath, port, registry } from './constants.ts'

beforeAll(async () => {
  await waitForEndpoint({ endpoint: registry })
  await login(registry)
})

describe('access', () => {
  start()

  test.for([
    {
      endpoint: '/@esm.dev/package-1@0.0.1/es2022/package-1.mjs',
      pckg: 'pacakge-1',
    },
    { endpoint: '/@esm.dev/package-2', pckg: 'package-2' },
  ])('ESM server retreives watched $pckg', async ({ endpoint }) => {
    const response = await fetch(`http://localhost:${port}${endpoint}`)
    expect(await response.text()).matchSnapshot()
  })
})

describe.for([
  { legacyMethod: false, name: 'modern', interval: 100 },
  { legacyMethod: true, name: 'legacy', interval: 3_000 },
])(
  'watching with $name method',
  { concurrent: false },
  ({ legacyMethod, interval }) => {
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
  },
)

function start(legacyMethod?: boolean) {
  let stopServe: () => Promise<void>
  let stopWatch1: () => void
  let stopWatch2: () => void

  beforeAll(async () => {
    stopServe = await serve(port, esmOrigin)
    stopWatch1 = await watch('test/packages/package-1', {
      registry,
      esmStoragePath,
      legacyMethod,
    }).catch(() => T)
    stopWatch2 = await watch('test/packages/package-2', {
      registry,
      esmStoragePath,
      legacyMethod,
    }).catch(() => T)
  })

  afterAll(async () => {
    await stopServe?.()
    stopWatch1?.()
    stopWatch2?.()
  })
}
