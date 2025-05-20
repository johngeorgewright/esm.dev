import { Option } from 'clipanion'
import type { CommandClass } from './CommandClass.js'

export function PackagePathSpecific<T extends CommandClass>(Base: T) {
  abstract class PackagePathSpecific extends Base {
    readonly packagePaths = Option.Rest({
      name: 'packages',
    })

    protected async eachPackagePath(cb: (packagePath: string) => Promise<any>) {
      const { glob } = await import('glob')
      const packagePaths = (
        await Promise.all(
          this.packagePaths.map((packagePath) => glob(packagePath)),
        )
      ).flat()
      await Promise.all(packagePaths.map(cb))
    }
  }

  return PackagePathSpecific
}
