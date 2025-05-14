import { watch as fsWatch } from 'node:fs'
import debounce from 'lodash.debounce'
import { republish } from './republish.ts'
import { getPackageMeta } from './getPackageMeta.ts'
import { queue } from './queue.ts'

export async function watch(
  packagePath: string,
  opts: { registry: string; esmStoragePath: string },
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

  await republish(packagePath, opts)

  fsWatch(
    packageRoot,
    { recursive: true },
    debounce(() => queue(() => republish(packagePath, opts)), 1_000),
  )
}
