import { ESMDevCommand } from './ESMDevCommand.ts'

export class RepublishCommand extends ESMDevCommand {
  static override paths = [['republish']]

  static override usage = this.Usage({
    description:
      'Removes the references, of given packages, from the ESM server and registry and republishes.',
  })

  override async execute() {
    const { getRepublisher } = await import('../lib/republish.ts')
    const republish = getRepublisher()
    await this.eachPackagePath((packagePath) => republish(packagePath, this))
  }
}
