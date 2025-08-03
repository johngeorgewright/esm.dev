import * as path from 'node:path'
import { rm, writeFile } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'
import { queue } from '../src/lib/queue.ts'
import { assertSpyCalls, type Spy, spy } from 'jsr:@std/testing/mock'
import { watch } from '../src/lib/watch.ts'
import {
  getRepublisher,
  type Republish,
  setRepublisher,
} from '../src/lib/republish.ts'
// for Node.js
import 'npm:disposablestack/auto'

Deno.test('Ignoring files when watching', async (t) => {
  for (
    const { ignoreType, packageDir } of [
      {
        ignoreType: '.gitignore',
        packageDir: path.join(
          import.meta.dirname ?? '',
          'packages',
          'git-ignore-test',
        ),
      },
      {
        ignoreType: '.npmignore',
        packageDir: path.join(
          import.meta.dirname ?? '',
          'packages',
          'npm-ignore-test',
        ),
      },
    ]
  ) {
    await t.step(ignoreType, async () => {
      using republish = disposableRepublishMock()
      using _watcher = await disposableWatch(packageDir)
      await using _file = await disposableFile(packageDir)

      await setTimeout(100)

      // deno-lint-ignore require-await
      await queue(async () => {
        assertSpyCalls(republish.spy, 1)
      })
    })
  }
})

function disposableRepublishMock(): Disposable & { spy: Spy } {
  const original = getRepublisher()
  const republishSpy = spy(() => Promise.resolve())
  setRepublisher(republishSpy as Republish)
  return {
    spy: republishSpy,
    [Symbol.dispose]: () => setRepublisher(original),
  }
}

async function disposableWatch(packageDir: string): Promise<Disposable> {
  const stopWatching = await watch(packageDir, {
    esmStoragePath: './docker-storage/esm/esmd',
    registry: 'http://localhost:4873',
  })
  return {
    [Symbol.dispose]: stopWatching,
  }
}

async function disposableFile(packageDir: string): Promise<AsyncDisposable> {
  const filename = path.join(packageDir, 'src', '3.js')
  await writeFile(filename, '')
  return {
    [Symbol.asyncDispose]: () => rm(filename, { force: true }),
  }
}
