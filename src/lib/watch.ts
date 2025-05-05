import { watch as fsWatch } from 'node:fs'
import debounce from 'lodash.debounce'
import throat from 'throat'
import { republish } from './republish'
import { getPackageMeta } from './package'

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

  const republishOpts = { ...opts, packagePath }

  await republish(republishOpts)

  fsWatch(
    packageRoot,
    { recursive: true },
    debounce(
      throat(1, () => republish(republishOpts)),
      1_000,
    ),
  )
}
