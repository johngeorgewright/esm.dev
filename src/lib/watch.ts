import { watch as fsWatch } from 'node:fs'
import { republish } from './republish.js'
import { getPackageMeta } from './getPackageMeta.js'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { glob } from 'glob'
import { queue, queuedDebounce } from './queue.js'
import { getWatchIgnorer, type Ignorer } from './watchIgnoreList.js'
import { tempfile } from 'zx'

export async function watch(
  packagePath: string,
  opts: { registry: string; esmStoragePath: string; legacyMethod?: boolean },
): Promise<() => void> {
  const {
    name,
    packageRoot,
    private: prvte,
  } = await getPackageMeta(packagePath)

  if (prvte) {
    console.info(`${name} is a private package... ignoring`)
    return () => {}
  }

  console.info('Watching', packageRoot)

  const abortController = new AbortController()
  const { signal } = abortController

  const republishPackage = (filename: string = '') => {
    console.info(`Change detected at ${packageRoot}/${filename}`)
    return republish(packageRoot, opts).catch(console.error)
  }

  try {
    await queue(republishPackage, signal)
  } catch (error: any) {
    if (error.name === 'AbortError') return () => {}
    else throw error
  }

  return opts.legacyMethod
    ? legacyWatch(abortController, packageRoot, republishPackage)
    : modernWatch(
        abortController,
        packageRoot,
        queuedDebounce(republishPackage, 1_000, signal),
      )
}

async function modernWatch(
  abortController: AbortController,
  dirname: string,
  republish: (filename?: string | undefined) => Promise<void>,
) {
  abortController.signal.addEventListener('abort', () => {
    console.info('Stop watching', dirname)
    watcher.close()
  })

  const ignorer = await getWatchIgnorer(dirname)
  const watcher = fsWatch(
    dirname,
    { recursive: true, signal: abortController.signal },
    (_, filename) =>
      (filename && ignorer.ignores(filename)) ||
      republish(filename ?? '').catch((error) => {
        if (
          !(error instanceof Event && error.target instanceof AbortSignal) &&
          error.name !== 'AbortError'
        )
          throw error
      }),
  )

  return () => abortController.abort()
}

async function legacyWatch(
  abortController: AbortController,
  dirname: string,
  republish: (filename?: string) => Promise<void>,
) {
  const ignorer = await getWatchIgnorer(dirname)
  const filename = tempfile()
  await hashDirectory(dirname, ignorer, filename, () => {})

  abortController.signal.addEventListener('abort', () => {
    console.info('Stop (legacy) watching', dirname)
    clearTimeout(timer)
  })

  let timer: NodeJS.Timeout | undefined
  beginTimer()
  return () => abortController.abort()

  function beginTimer() {
    timer = setTimeout(
      () =>
        hashDirectory(dirname, ignorer, filename, republish)
          .catch(console.error)
          .finally(beginTimer),
      1_000,
    )
  }
}

async function hashDirectory(
  dirname: string,
  ignorer: Ignorer,
  filename: string,
  onChange: () => any,
) {
  const files = await glob(`${dirname}/**/*`, {
    nodir: true,
    ignore: { ignored: (path) => ignorer.ignores(path.fullpath()) },
  })
  const hashes = await Promise.all(
    files.map(async (file) => {
      const contents = await readFile(file)
      return createHash('sha256').update(contents).digest('hex')
    }),
  )
  const newHash = hashes.join('')

  let previousHash = ''

  try {
    previousHash = await readFile(filename, 'utf-8')
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error
  }

  if (newHash !== previousHash) {
    await Promise.all([writeFile(filename, newHash), onChange()])
  }
}
