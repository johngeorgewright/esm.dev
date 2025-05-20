import { serve } from '../lib/server.ts'
import { ESMDevCommand } from './ESMDevCommand.ts'
import { watch } from '../lib/watch.ts'
import { Servable } from './mixins/Servable.ts'
import { Watchable } from './mixins/Watchable.ts'
import { ESMServed } from './mixins/ESMServed.ts'

export class StartCommand extends Servable(
  Watchable(ESMServed(ESMDevCommand)),
) {
  static override paths = [['start']]

  static override usage = ESMDevCommand.Usage({
    description: 'Runs a server and concurrently watches a file system',
  })

  override async execute() {
    serve(this.port, this.esmOrigin)
    await this.eachPackagePath((packagePath) => watch(packagePath, this))
  }
}
