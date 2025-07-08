import { Container } from 'typedi'
import { getPackageMeta } from './getPackageMeta.ts'
import { publish } from './publish.ts'
import { unpublish } from './unpublish.ts'

export async function republish(
  packagePath: string,
  opts: {
    registry: string
    esmStoragePath: string
  },
): Promise<void> {
  console.info(`Republishing ${packagePath}`)
  const { name, packageRoot } = await getPackageMeta(packagePath)
  await unpublish({ ...opts, name })
  await publish({ ...opts, packageRoot })
}

Container.set('republish', republish)
