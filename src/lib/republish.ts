import { getPackageMeta } from './getPackageMeta.ts'
import { publish } from './publish.ts'
import { unpublish } from './unpublish.ts'

export async function republish(
  packagePath: string,
  opts: {
    registry: string
    esmStoragePath: string
  },
) {
  const { name, packageRoot } = await getPackageMeta(packagePath)
  const _opts = { ...opts, name, packageRoot }
  await unpublish(_opts)
  await publish(_opts)
}
