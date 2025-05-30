import { ESMDevCommand } from './ESMDevCommand.ts'
import { PackagePathSpecific } from './mixins/PackagePathSpecific.ts'
import { MustacheGeneratorCommand } from './MustacheGeneratorCommand.ts'
import { Option } from 'clipanion'
import { isNumber } from 'typanion'

export class InitCommand extends PackagePathSpecific(MustacheGeneratorCommand) {
  static override paths = [['init']]

  static override usage = ESMDevCommand.Usage({
    description: 'Initialises your repo ready to work with ESM.sh locally',
    examples: [
      ['Create a minimal template', 'esm.dev init'],
      ["Specify the packages you're developing", 'esm.dev init packages/*'],
      [
        'Specify different ports',
        'esm.dev init --port 3001 --esm-port 8081 --registry-port 4444',
      ],
    ],
  })

  readonly esmPort = Option.String('-e,--esm-port', '8080', {
    description: 'The port of the ESM Server',
    validator: isNumber(),
  })

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

  readonly registryPort = Option.String('-r,--registry-port', '4873', {
    description: 'The port of your local registry',
    validator: isNumber(),
  })

  esmURL!: URL
  npmRegistryURL!: URL
  packages!: { path: string; basename: string }[]

  override async execute() {
    const path = await import('node:path')
    this.templateDir = path.resolve(
      import.meta.dirname,
      '..',
      '..',
      'templates',
      'init',
    )
    this.destinationDir = this.outputDirectory
    this.packages = this.packagePaths.map((packagePath) => ({
      path: packagePath,
      basename: path.basename(packagePath),
    }))
    await this.removeDestinationFile(
      'docker-compose.yaml',
      'docker-compose.yml.mustache',
    )
    await super.execute()
  }
}
