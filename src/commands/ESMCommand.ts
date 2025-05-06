import { Command, Option } from 'clipanion'
import { glob } from 'glob'

export abstract class ESMCommand extends Command {
  readonly esmStoragePath = Option.String('-s,--esm-storage-path', {
    description: "Path to ESM.sh's storage",
    required: true,
  })

  readonly registry = Option.String('-r,--registry', {
    description: 'The URL of your local registry',
    required: true,
  })

  readonly packagePaths = Option.Rest({
    name: 'packages',
  })

  protected async eachPackagePath(cb: (packagePath: string) => Promise<void>) {
    const packagePaths = (
      await Promise.all(
        this.packagePaths.map((packagePath) => glob(packagePath)),
      )
    ).flat()
    await Promise.all(packagePaths.map(cb))
  }
}
