import { Option } from 'clipanion'
import type { CommandClass } from './CommandClass.ts'

export function PackagePathSpecific<T extends CommandClass>(Base: T) {
  abstract class PackagePathSpecific extends Base {
    readonly packagePaths = Option.Rest({
      name: 'packages',
    })

    protected async eachPackagePath(cb: (packagePath: string) => Promise<any>) {
      const { glob } = await import('glob')
      const packagePaths = await glob(this.packagePaths)
      await Promise.all(packagePaths.map(cb))
    }
  }

  return PackagePathSpecific
}
