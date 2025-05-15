import { getPackageMeta } from './getPackageMeta.ts'
import { publish } from './publish.ts'
import { queue } from './queue.ts'
import { unpublish } from './unpublish.ts'

export async function republish(
  packagePath: string,
  opts: {
    registry: string
    esmStoragePath: string
  },
) {
  console.info(`Republishing ${packagePath}`)
  const { name, packageRoot } = await getPackageMeta(packagePath)
  await queue(async () => {
    await unpublish({ ...opts, name })
    await publish({ ...opts, packageRoot })
  })
}
