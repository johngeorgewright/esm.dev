import { Option } from 'clipanion'
import type { AbstractConstructor } from './AbstractConstructor.ts'
import { glob } from 'glob'

export function PackagePathSpecific<T extends AbstractConstructor>(Base: T) {
  abstract class PackagePathSpecific extends Base {
    readonly packagePaths = Option.Rest({
      name: 'packages',
    })

    protected async eachPackagePath(
      cb: (packagePath: string) => Promise<void>,
    ) {
      const packagePaths = (
        await Promise.all(
          this.packagePaths.map((packagePath) => glob(packagePath)),
        )
      ).flat()
      for (const packagePath of packagePaths) await cb(packagePath)
    }
  }

  return PackagePathSpecific
}
