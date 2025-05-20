import { serve } from '../lib/server.ts'
import { ESMDevCommand } from './ESMDevCommand.ts'
import { EnvOption } from '../options/EnvOption.ts'
import { watch } from '../lib/watch.ts'
import { Servable } from './mixins/Servable.ts'
import { Watchable } from './mixins/Watchable.ts'

export class StartCommand extends Servable(Watchable(ESMDevCommand)) {
  static override paths = [['start']]

  static override usage = ESMDevCommand.Usage({
    description: 'Runs a server and concurrently watches a file system',
  })

  readonly esmOrigin = EnvOption('ESM_ORIGIN', '-e,--esm-origin', {
    description: 'The base URL of the ESM Server',
  })

  override async execute() {
    serve(this.port, this.esmOrigin)
    await this.eachPackagePath((packagePath) => watch(packagePath, this))
  }
}
