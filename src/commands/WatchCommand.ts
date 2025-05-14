import { ESMDevCommand } from './ESMDevCommand.ts'
import { watch } from '../lib/watch.ts'

export class WatchCommand extends ESMDevCommand {
  static override paths = [['watch']]

  static override usage = ESMDevCommand.Usage({
    description: 'Watches directories and republishes on changes',
  })

  override async execute() {
    await this.eachPackagePath((packagePath) => watch(packagePath, this))
  }
}
