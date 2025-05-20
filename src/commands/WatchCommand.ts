import { ESMDevCommand } from './ESMDevCommand.ts'
import { Watchable } from './mixins/Watchable.ts'

export class WatchCommand extends Watchable(ESMDevCommand) {
  static override paths = [['watch']]

  static override usage = ESMDevCommand.Usage({
    description: 'Watches directories and republishes on changes',
  })

  override async execute() {
    const { watch } = await import('../lib/watch.ts')
    await this.eachPackagePath((packagePath) => watch(packagePath, this))
  }
}
