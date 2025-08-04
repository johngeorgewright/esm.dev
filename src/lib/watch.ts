import { getPackageMeta } from './getPackageMeta.ts'
import { glob } from 'glob'
import { queue, queuedDebounce } from './queue.ts'
import { getWatchIgnorer, type Ignorer } from './watchIgnoreList.ts'
import { tempfile } from 'zx'
import * as pathHelper from 'node:path'
import { encodeHex } from '@std/encoding'
import { getRepublisher } from './republish.ts'

export async function watch(
  packagePath: string,
  opts: {
    registry: string
    esmStoragePath: string
    legacyMethod?: boolean
  },
): Promise<() => void> {
  const {
    name,
    packageRoot,
    private: prvte,
  } = await getPackageMeta(packagePath)

  const republish = getRepublisher()

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

  if (opts.legacyMethod) {
    await legacyWatch(signal, packageRoot, republishPackage)
  } else {
    modernWatch(
      signal,
      packageRoot,
      queuedDebounce(republishPackage, 1_000, signal),
    )
  }

  return () => {
    console.info(
      `Stop${opts.legacyMethod ? ' (legacy)' : ''} watching`,
      packageRoot,
    )
    abortController.abort()
  }
}

async function modernWatch(
  signal: AbortSignal,
  dirname: string,
  republish: (filename?: string | undefined) => Promise<void>,
) {
  const ignorer = await getWatchIgnorer(dirname)

  using watcher = Deno.watchFs(
    dirname,
    { recursive: true },
  )

  signal.addEventListener('abort', () => {
    try {
      watcher.close()
    } catch (_) {
      //
    }
  })

  try {
    for await (const event of watcher) {
      let paths = event.paths
        .filter((path) => path.startsWith(dirname))
        .map((path) => pathHelper.relative(dirname, path))
      paths = ignorer.filter(paths)
      if (paths.length) {
        try {
          await republish(paths[0])
        } catch (error: any) {
          if (error.name !== 'AbortError' && error.code !== 'ABORT_ERR') {
            throw error
          }
        }
      }
    }
  } catch (error) {
    if (!(error instanceof Error && error.name === 'AbortError')) {
      throw error
    }
  }
}

async function legacyWatch(
  signal: AbortSignal,
  dirname: string,
  republish: (filename?: string | undefined) => Promise<void>,
) {
  const ignorer = await getWatchIgnorer(dirname)
  const filename = tempfile()
  await hashDirectory(dirname, ignorer, filename, () => {})

  signal.addEventListener('abort', () => {
    console.info('Stop (legacy) watching', dirname)
    clearTimeout(timer)
  })

  let timer: number
  beginTimer()

  function beginTimer() {
    if (signal.aborted) return
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
      const contents = await Deno.readFile(file)
      const hashBuffer = await crypto.subtle.digest('SHA-256', contents)
      return encodeHex(hashBuffer)
    }),
  )

  const newHash = hashes.join('')

  let previousHash = ''

  try {
    previousHash = await Deno.readTextFile(filename)
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error
  }

  if (newHash !== previousHash) {
    await Promise.all([Deno.writeTextFile(filename, newHash), onChange()])
  }
}
