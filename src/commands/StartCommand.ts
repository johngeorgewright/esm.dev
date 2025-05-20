import { ESMDevCommand } from './ESMDevCommand.js'
import { Servable } from './mixins/Servable.js'
import { Watchable } from './mixins/Watchable.js'
import { ESMServed } from './mixins/ESMServed.js'

export class StartCommand extends Servable(
  Watchable(ESMServed(ESMDevCommand)),
) {
  static override paths = [['start']]

  static override usage = ESMDevCommand.Usage({
    description: 'Runs a server and concurrently watches a file system',
  })

  override async execute() {
    const { watch } = await import('../lib/watch.js')
    const { serve } = await import('../lib/server.js')
    serve(this.port, this.esmOrigin)
    await this.eachPackagePath((packagePath) => watch(packagePath, this))
  }
}
