import { watch as fsWatch, watchFile } from 'node:fs'
import { republish } from './republish.js'
import { getPackageMeta } from './getPackageMeta.js'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { glob } from 'glob'
import { queue, queuedDebounce } from './queue.js'
import { getWatchIgnorer, type Ignorer } from './watchIgnoreList.js'

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
  const signal = abortController.signal

  const republishPackage = () =>
    republish(packageRoot, opts).catch(console.error)

  const debounceRepublish = queuedDebounce(
    async (filename: string = '') => {
      console.info(`Change detected at ${packageRoot}/${filename}`)
      await republishPackage()
    },
    1_000,
    signal,
  )

  await queue(signal, republishPackage)

  return opts.legacyMethod
    ? legacyWatch(abortController, packageRoot, debounceRepublish)
    : modernWatch(abortController, packageRoot, debounceRepublish)
}

async function modernWatch(
  abortController: AbortController,
  dirname: string,
  debounceRepublish: (filename?: string | undefined) => Promise<void>,
) {
  const ignorer = await getWatchIgnorer(dirname)
  const watcher = fsWatch(
    dirname,
    { recursive: true },
    (_, filename) =>
      (filename && ignorer.ignores(filename)) ||
      debounceRepublish(filename ?? ''),
  )
  return () => {
    console.info('Stop watching')
    watcher.close()
    abortController.abort()
  }
}

async function legacyWatch(
  abortController: AbortController,
  dirname: string,
  debounceRepublish: (filename?: string | undefined) => Promise<void>,
) {
  const ignorer = await getWatchIgnorer(dirname)
  const filename = await hashDirectory(dirname, ignorer)
  const watcher = watchFile(filename, () => debounceRepublish())
  let timer: NodeJS.Timeout | undefined
  beginTimer()
  return () => {
    console.info('Stop watching')
    watcher.unref()
    clearTimeout(timer)
    abortController.abort()
  }
  function beginTimer() {
    timer = setTimeout(
      () =>
        hashDirectory(dirname, ignorer)
          .catch(console.error)
          .finally(beginTimer),
      1_000,
    )
  }
}

async function hashDirectory(dirname: string, ignorer: Ignorer) {
  const filename = `/tmp/${dirname.replace(/\//g, '-')}.hash.txt`
  const files = ignorer.filter(await glob(`${dirname}/**/*`, { nodir: true }))
  const hashes = await Promise.all(
    files.map(async (file) => {
      const contents = await readFile(file, 'utf-8')
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

  if (newHash !== previousHash) await writeFile(filename, newHash)
  return filename
}
