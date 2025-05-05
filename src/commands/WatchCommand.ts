import { ESMCommand } from './ESMCommand'
import { watch } from '../lib/watch'
import { glob } from 'glob'

export class WatchCommand extends ESMCommand {
  static override paths = [['watch']]

  static override usage = ESMCommand.Usage({
    description: 'Watches directories and republishes on changes',
  })

  override async execute() {
    const packagePaths = (
      await Promise.all(
        this.packagePaths.map((packagePath) => glob(packagePath)),
      )
    ).flat()
    for (const packagePath of packagePaths) {
      this.context.stdout.write(`Watching ${packagePath}\n`)
      watch(packagePath, this)
    }
  }
}
