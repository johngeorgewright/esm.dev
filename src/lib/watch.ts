import { watch as fsWatch, watchFile } from 'node:fs'
import debounce from 'lodash.debounce'
import { republish } from './republish.ts'
import { getPackageMeta } from './getPackageMeta.ts'
import { $ } from 'bun'
import { readFile, writeFile } from 'node:fs/promises'
import { queue } from './queue.ts'

export async function watch(
  packagePath: string,
  opts: { registry: string; esmStoragePath: string; legacyMethod?: boolean },
) {
  const {
    name,
    packageRoot,
    private: prvte,
  } = await getPackageMeta(packagePath)

  if (prvte) {
    console.info(`${name} is a private package... ignoring`)
    return
  }

  console.info('Watching', packagePath)

  const republishPackage = () =>
    republish(packagePath, opts).catch(console.error)
  const debounceRepublish = debounce(republishPackage, 1_000)
  await republishPackage()

  if (opts.legacyMethod) await legacyWatch(packagePath, debounceRepublish)
  else fsWatch(packageRoot, { recursive: true }, debounceRepublish)
}

async function legacyWatch(dirname: string, cb: () => any) {
  const filename = await hashDirectory(dirname)
  watchFile(filename, cb)
  beginTimer()
  function beginTimer() {
    setTimeout(
      () => hashDirectory(dirname).catch(console.error).finally(beginTimer),
      1_000,
    )
  }
}

async function hashDirectory(dirname: string) {
  return queue(async () => {
    const filename = `/tmp/${dirname.replace(/\//g, '-')}.hash.txt`
    const newHash =
      await $`find ${dirname} -type f -exec sha256sum {} + | sort | sha256sum`.text()
    let previousHash = ''

    try {
      previousHash = await readFile(filename, 'utf-8')
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error
    }

    if (newHash !== previousHash) await writeFile(filename, newHash)
    return filename
  })
}
