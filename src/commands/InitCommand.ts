import * as path from 'node:path'
import { ESMDevCommand } from './ESMDevCommand.js'
import { PackagePathSpecific } from './mixins/PackagePathSpecific.js'
import { MustacheGeneratorCommand } from './MustacheGeneratorCommand.js'
import { Option } from 'clipanion'

export class InitCommand extends PackagePathSpecific(MustacheGeneratorCommand) {
  static override paths = [['init']]

  static override usage = ESMDevCommand.Usage({
    description: 'Initialises your repo ready to work with ESM.sh locally',
  })

  readonly esmOrigin = Option.String(
    '-e,--esm-origin',
    'http://localhost:8080',
    {
      description: 'The base URL of the ESM Server',
    },
  )

  readonly esmStoragePath = Option.String(
    '-s,--esm-storage-path',
    './docker-storage/esm/esmd',
    {
      description: "Path to ESM.sh's storage",
    },
  )

  readonly port = Option.String('-p,--port', '3000', {
    description: "The server's port",
  })

  readonly outputDirectory = Option.String('-o,--output-dir', '.', {
    description: 'The output directory',
  })

  readonly registry = Option.String('-r,--registry', 'http://localhost:4873', {
    description: 'The URL of your local registry',
  })

  esmURL!: URL
  npmRegistryURL!: URL
  packages!: { path: string; basename: string }[]

  override async execute() {
    this.templateDir = path.resolve(
      import.meta.dirname,
      '..',
      '..',
      'templates',
      'init',
    )
    this.destinationDir = this.outputDirectory
    this.esmURL = new URL(this.esmOrigin)
    this.npmRegistryURL = new URL(this.registry)
    this.packages = this.packagePaths.map((packagePath) => ({
      path: packagePath,
      basename: path.basename(packagePath),
    }))
    await super.execute()
  }
}
