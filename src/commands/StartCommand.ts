import { ESMDevCommand } from './ESMDevCommand.ts'
import { Servable } from './mixins/Servable.ts'
import { Watchable } from './mixins/Watchable.ts'
import { ESMServed } from './mixins/ESMServed.ts'
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
      import('../lib/watch.ts'),
      import('../lib/server.ts'),
    ])
    serve(this.port, this.esmOrigin)
    await this.eachPackagePath((packagePath) => watch(packagePath, this))
  }
}
