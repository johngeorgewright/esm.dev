import { serve } from '../lib/server.ts'
import { ESMDevCommand } from './ESMDevCommand.ts'
import { StringOptionWithEnv } from '../options/StringOptionWithEnv.ts'
import { watch } from '../lib/watch.ts'
import { Servable } from './mixins/Servable.ts'

export class StartCommand extends Servable(ESMDevCommand) {
  static override paths = [['start']]

  static override usage = ESMDevCommand.Usage({
    description: 'Runs a server and concurrently watches a file system',
  })

  readonly esmOrigin = StringOptionWithEnv('ESM_ORIGIN', '-e,--esm-origin', {
    description: 'The base URL of the ESM Server',
  })

  override async execute() {
    await this.eachPackagePath((packagePath) => watch(packagePath, this))
    serve(this.port, this.esmOrigin)
  }
}
