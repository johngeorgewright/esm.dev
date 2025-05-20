import { getPackageMeta } from './getPackageMeta.js'
import { publish } from './publish.js'
import { unpublish } from './unpublish.js'

export async function republish(
  packagePath: string,
  opts: {
    registry: string
    esmStoragePath: string
  },
) {
  console.info(`Republishing ${packagePath}`)
  const { name, packageRoot } = await getPackageMeta(packagePath)
  await unpublish({ ...opts, name })
  await publish({ ...opts, packageRoot })
}
