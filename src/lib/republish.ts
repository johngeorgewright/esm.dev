import { getPackageMeta } from './package'
import { publish } from './publish'
import { unpublish } from './unpublish'

export async function republish(opts: {
  registry: string
  esmStoragePath: string
  packagePath: string
}) {
  const { name, packageRoot } = await getPackageMeta(opts.packagePath)
  const _opts = { ...opts, name, packageRoot }
  await unpublish(_opts)
  await publish(_opts)
}
