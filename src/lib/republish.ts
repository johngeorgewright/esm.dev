/**
 * @module
 * The `republish` function is used via a dependency injection
 * container so that it can be stubbed during testing.
 */

import { Container } from 'typedi'
import { getPackageMeta } from './getPackageMeta.ts'
import { publish } from './publish.ts'
import { unpublish } from './unpublish.ts'

export type Republish = typeof republish

export const getRepublisher = (): Republish => Container.get('republish')

export const setRepublisher = (republisher: Republish) =>
  Container.set('republish', republisher)

async function republish(
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
