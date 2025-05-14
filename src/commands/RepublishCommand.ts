import { ESMDevCommand } from './ESMDevCommand.ts'
import { republish } from '../lib/republish.ts'

export class RepublishCommand extends ESMDevCommand {
  static override paths = [['republish']]

  static override usage = ESMDevCommand.Usage({
    description:
      'Removes the references, of given packages, from the ESM server and registry and republishes.',
  })

  override async execute() {
    await this.eachPackagePath((packagePath) => {
      this.context.stdout.write(`Republishing ${packagePath}\n`)
      return republish(packagePath, this)
    })
  }
}
