import { watch as fsWatch } from 'node:fs'
import debounce from 'lodash.debounce'
import throat from 'throat'
import { republish } from './republish'
import { getPackageMeta } from './package'

export async function watch(
  packagePath: string,
  opts: { registry: string; esmStoragePath: string },
) {
  const { packageRoot } = await getPackageMeta(packagePath)
  const republishOpts = { ...opts, packagePath }
  fsWatch(
    packageRoot,
    { recursive: true },
    debounce(
      throat(1, () => republish(republishOpts)),
      1_000,
    ),
  )
  await republish(republishOpts)
}
