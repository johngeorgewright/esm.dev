import { ESMDevCommand } from './ESMDevCommand.ts'
import { watch } from '../lib/watch.ts'
import { Watchable } from './mixins/Watchable.ts'

export class WatchCommand extends Watchable(ESMDevCommand) {
  static override paths = [['watch']]

  static override usage = ESMDevCommand.Usage({
    description: 'Watches directories and republishes on changes',
  })

  override async execute() {
    await this.eachPackagePath((packagePath) => watch(packagePath, this))
  }
}
