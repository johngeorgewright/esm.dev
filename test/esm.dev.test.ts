import { equal } from 'jsr:@std/assert/equal'
import { setTimeout } from 'node:timers/promises'
import { serve } from '../src/lib/server.ts'
import { watch } from '../src/lib/watch.ts'
import { login } from '../src/lib/login.ts'
import { waitForEndpoint } from '../src/lib/until.ts'
import { esmOrigin, esmStoragePath, port, registry } from './constants.ts'
import { readJSONFile, writeJSONFile } from '../src/lib/fs.ts'
// for Node.js
import 'npm:disposablestack/auto'

Deno.test('dev environment', async (t) => {
  await t.step('setup', async () => {
    await waitForEndpoint({ endpoint: registry })
    await login(registry)
  })

  await t.step('access', async (t) => {
    await using _disposable = await start()

    await t.step('package-1', async () => {
      const response = await fetch(
        `http://localhost:${port}/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
      )
      equal(
        (await response.text()).split('\n'),
        [
          '/* esm.sh - @esm.dev/package-1@0.0.1 */',
          'function o(){return"foo"}export{o as foo};',
          '//# sourceMappingURL=package-1.mjs.map',
        ],
      )
    })

    await t.step('package-2', async () => {
      const response = await fetch(
        `http://localhost:${port}/@esm.dev/package-2`,
      )
      equal(
        (await response.text()).split('\n'),
        [
          '/* esm.sh - @esm.dev/package-2@0.0.1 */',
          'export * from "/@esm.dev/package-2@0.0.1/denonext/package-2.mjs";',
          '',
        ],
      )
    })
  })

  for (
    const { legacyMethod, interval, name } of [
      { legacyMethod: false, name: 'modern', interval: 100 },
      { legacyMethod: true, name: 'legacy', interval: 3_000 },
    ]
  ) {
    await t.step(`watching with ${name} method`, async (t) => {
      await using _disposable = await start(legacyMethod)
      await using _change = await changeMainExport(interval)
      const response = await fetch(
        `http://localhost:${port}/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
      )
      equal(
        (await response.text()).split('\n'),
        [
          '/* esm.sh - @esm.dev/package-1@0.0.1 */',
          'function o(){return"foo"}export{o as foo};',
          '//# sourceMappingURL=package-1.mjs.map',
        ],
      )
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

async function changeMainExport(interval: number): Promise<AsyncDisposable> {
  const filename = 'test/packages/package-1/package.json'
  const json = await readJSONFile(filename)
  await writeJSONFile(
    filename,
    { ...json, exports: { '.': json.exports['.'] + '-changed' } },
  )
  await setTimeout(interval)
  return {
    [Symbol.asyncDispose]: () =>
      Deno.writeTextFile(filename, JSON.stringify(json, null, 2)),
  }
}
