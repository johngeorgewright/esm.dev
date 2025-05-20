import { watch as fsWatch, watchFile, type StatsListener } from 'node:fs'
import { republish } from './republish.js'
import { getPackageMeta } from './getPackageMeta.js'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { glob } from 'glob'
import { queue, queuedDebounce } from './queue.js'

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

  const republishPackage = () =>
    republish(packagePath, opts).catch(console.error)

  const debounceRepublish = queuedDebounce((filename: string = '') => {
    console.info(`Change detected at ${packagePath}/${filename}`)
    return republishPackage()
  }, 1_000)

  await queue(republishPackage)

  if (opts.legacyMethod) {
    return await legacyWatch(packagePath, () => debounceRepublish())
  } else {
    const watcher = fsWatch(packageRoot, { recursive: true }, (_, filename) =>
      debounceRepublish(filename ?? ''),
    )
    return () => watcher.close()
  }
}

async function legacyWatch(dirname: string, cb: StatsListener) {
  const filename = await hashDirectory(dirname)
  const watcher = watchFile(filename, cb)
  let timer: NodeJS.Timeout | undefined
  beginTimer()
  return () => {
    watcher.unref()
    clearTimeout(timer)
  }
  function beginTimer() {
    timer = setTimeout(
      () => hashDirectory(dirname).catch(console.error).finally(beginTimer),
      1_000,
    )
  }
}

async function hashDirectory(dirname: string) {
  const filename = `/tmp/${dirname.replace(/\//g, '-')}.hash.txt`
  const files = await glob(`${dirname}/**/*`, { nodir: true })
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
