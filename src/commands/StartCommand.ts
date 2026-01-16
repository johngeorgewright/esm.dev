import { ESMDevCommand } from './ESMDevCommand.js'
import { Servable } from './mixins/Servable.js'
import { Watchable } from './mixins/Watchable.js'
import { ESMServed } from './mixins/ESMServed.js'
import { Command } from 'clipanion'

export class StartCommand extends Servable(
  Watchable(ESMServed(ESMDevCommand)),
) {
  static paths = [['start']]

  static usage = Command.Usage({
    description: 'Runs a server and concurrently watches a file system',
  })

  override async execute() {
    const [{ watch }, { serve }] = await Promise.all([
      import('../lib/watch.js'),
      import('../lib/server.js'),
    ])
    serve(this.port, this.esmOrigin)
    await this.eachPackagePath((packagePath) => watch(packagePath, this))
  }
}
