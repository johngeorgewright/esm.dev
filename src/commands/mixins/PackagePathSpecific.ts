import { Option } from 'clipanion'
import type { CommandClass } from './CommandClass.ts'
import type { AbstractConstructor } from '../../lib/AbstractConstructor.ts'

export function PackagePathSpecific<T extends CommandClass>(
  Base: T,
):
  & T
  & AbstractConstructor<PackagePathSpecificMixin> {
  abstract class PackagePathSpecific extends Base
    implements PackagePathSpecificMixin {
    readonly packagePaths = Option.Rest({
      name: 'packages',
    })

    async eachPackagePath(cb: (packagePath: string) => Promise<any>) {
      const { glob } = await import('glob')
      const packagePaths = await glob(this.packagePaths)
      await Promise.all(packagePaths.map(cb))
    }
  }

  return PackagePathSpecific
}

export interface PackagePathSpecificMixin {
  readonly packagePaths: string[]
  eachPackagePath(cb: (packagePath: string) => Promise<any>): Promise<void>
}
