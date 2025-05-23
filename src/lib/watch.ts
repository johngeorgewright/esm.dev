import { watch as fsWatch, watchFile, type StatsListener } from 'node:fs'
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

  console.info('Watching', packagePath)

  const abortController = new AbortController()
  const signal = abortController.signal

  const republishPackage = () =>
    republish(packagePath, opts).catch(console.error)

  const debounceRepublish = queuedDebounce(
    (filename: string = '') => {
      console.info(`Change detected at ${packagePath}/${filename}`)
      return republishPackage()
    },
    1_000,
    signal,
  )

  await queue(signal, republishPackage)

  if (opts.legacyMethod) {
    const close = await legacyWatch(packagePath, () => debounceRepublish())
    return () => {
      console.info('stop watching')
      close()
      abortController.abort()
    }
  } else {
    const ignorer = await getWatchIgnorer(packagePath)
    const watcher = fsWatch(
      packageRoot,
      { recursive: true },
      (_, filename) =>
        (filename && ignorer.ignores(filename)) ||
        debounceRepublish(filename ?? ''),
    )
    return () => {
      console.info('stop watching')
      watcher.close()
      abortController.abort()
    }
  }
}

async function legacyWatch(dirname: string, cb: StatsListener) {
  const ignorer = await getWatchIgnorer(dirname)
  const filename = await hashDirectory(dirname, ignorer)
  const watcher = watchFile(filename, cb)
  let timer: NodeJS.Timeout | undefined
  beginTimer()
  return () => {
    watcher.unref()
    clearTimeout(timer)
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
