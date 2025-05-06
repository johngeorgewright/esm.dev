import { ESMCommand } from './ESMCommand'
import { watch } from '../lib/watch'
import { glob } from 'glob'

export class WatchCommand extends ESMCommand {
  static override paths = [['watch']]

  static override usage = ESMCommand.Usage({
    description: 'Watches directories and republishes on changes',
  })

  override async execute() {
    await this.eachPackagePath((packagePath) => {
      this.context.stdout.write(`Watching ${packagePath}\n`)
      return watch(packagePath, this)
    })
  }
}
