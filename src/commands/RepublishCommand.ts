import { ESMDevCommand } from './ESMDevCommand.js'

export class RepublishCommand extends ESMDevCommand {
  static override paths = [['republish']]

  static override usage = this.Usage({
    description:
      'Removes the references, of given packages, from the ESM server and registry and republishes.',
  })

  override async execute() {
    const { republish } = await import('../lib/republish.js')
    await this.eachPackagePath((packagePath) => republish(packagePath, this))
  }
}
