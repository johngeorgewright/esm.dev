import { assertSnapshot } from 'jsr:@std/testing/snapshot'
import { readFile, writeFile } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'
import { serve } from '../src/lib/server.ts'
import { watch } from '../src/lib/watch.ts'
import { login } from '../src/lib/login.ts'
import { waitForEndpoint } from '../src/lib/until.ts'
import { esmOrigin, esmStoragePath, port, registry } from './constants.ts'

Deno.test('dev environment', async (t) => {
  await t.step('setup', async () => {
    await waitForEndpoint({ endpoint: registry })
    await login(registry)
  })

  await t.step('access', async (t) => {
    await using _disposable = await start()

    for (
      const { endpoint, pckg } of [
        {
          endpoint: '/@esm.dev/package-1@0.0.1/es2022/package-1.mjs',
          pckg: 'pacakge-1',
        },
        { endpoint: '/@esm.dev/package-2', pckg: 'package-2' },
      ]
    ) {
      await t.step(`ESM server retreives watched ${pckg}`, async (t) => {
        const response = await fetch(`http://localhost:${port}${endpoint}`)
        await assertSnapshot(t, await response.text())
      })
    }
  })

  for (
    const { legacyMethod, interval, name } of [
      { legacyMethod: false, name: 'modern', interval: 100 },
      { legacyMethod: true, name: 'legacy', interval: 3_000 },
    ]
  ) {
    await t.step(`watching with ${name} method`, async (t) => {
      await using _disposable = await start(legacyMethod)
      await using _mainExport = await changeMainExportDisposable(interval)
      const response = await fetch(
        `http://localhost:${port}/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
      )
      await assertSnapshot(t, await response.text())
    })
  }
})

async function start(legacyMethod?: boolean): Promise<AsyncDisposable> {
  const disposableStack = new AsyncDisposableStack()
  disposableStack.adopt(await serve(port, esmOrigin), (stop) => stop())
  disposableStack.adopt(
    await watch('test/packages/package-1', {
      registry,
      esmStoragePath,
      legacyMethod,
    }),
    (stop) => stop(),
  )
  disposableStack.adopt(
    await watch('test/packages/package-2', {
      registry,
      esmStoragePath,
      legacyMethod,
    }),
    (stop) => stop(),
  )
  return disposableStack
}

async function changeMainExportDisposable(
  interval: number,
): Promise<AsyncDisposable> {
  await changeMainExport('./src/foos.ts', interval)
  return {
    [Symbol.asyncDispose]: () => changeMainExport('./src/foo.ts', interval),
  }
}

async function changeMainExport(to: string, interval: number) {
  const filename = 'test/packages/package-1/package.json'
  const json = JSON.parse(await readFile(filename, 'utf-8'))
  json.exports['.'] = to
  await writeFile(filename, JSON.stringify(json, null, 2))
  await setTimeout(interval)
}
