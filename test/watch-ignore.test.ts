import { afterEach, beforeEach, describe, expect, Mock, vi, test } from 'vitest'
import * as path from 'node:path'
import { rm, writeFile } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'
import { queue } from '../src/lib/queue.js'

createTest(
  '.gitignore',
  path.join(import.meta.dirname, 'packages', 'git-ignore-test'),
)

createTest(
  '.npmignore',
  path.join(import.meta.dirname, 'packages', 'npm-ignore-test'),
)

function createTest(ignoreType: string, packageDir: string) {
  describe(ignoreType, () => {
    let stopWatching: () => void
    let republishMockFn: Mock<any>

    beforeEach(async () => {
      republishMockFn = vi.fn().mockResolvedValue(void 0)

      vi.doMock('../src/lib/republish.js', () => ({
        republish: republishMockFn,
      }))

      const { watch } = await import('../src/lib/watch.js')
      stopWatching = await watch(packageDir, {
        esmStoragePath: './docker-storage/esmd',
        registry: 'http://localhost:4873',
      })
    })

    afterEach(async () => {
      stopWatching()
      await rm(path.join(packageDir, 'src', '3.js'), { force: true })
      vi.resetModules()
    })

    test(`ignores files in the ${ignoreType} list`, async () => {
      await writeFile(path.join(packageDir, 'src', '3.js'), '')
      await setTimeout(100)
      await queue(async () => {
        expect(republishMockFn).toHaveBeenCalledTimes(1)
      })
    })
  })
}
