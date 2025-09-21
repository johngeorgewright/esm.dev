import { ESMDevCommand } from './ESMDevCommand.js'
import { Watchable } from './mixins/Watchable.js'

export class WatchCommand extends Watchable(ESMDevCommand) {
  static override paths = [['watch']]

  static override usage = this.Usage({
    description: 'Watches directories and republishes on changes',
  })

  override async execute() {
    const { watch } = await import('../lib/watch.js')
    await this.eachPackagePath((packagePath) => watch(packagePath, this))
  }
}
