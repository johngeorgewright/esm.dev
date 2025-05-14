import * as t from 'typanion'
import { serve } from '../lib/server'
import { ESMCommand } from './ESMCommand'
import { StringOptionWithEnv } from '../options/StringOptionWithEnv'
import { watch } from '../lib/watch'

export class StartCommand extends ESMCommand {
  static override paths = [['start']]

  static override usage = ESMCommand.Usage({
    description: 'Runs a server and concurrently watches a file system',
  })

  readonly port = StringOptionWithEnv('PORT', '-p,--port', {
    description: 'The port to run the server on',
    validator: t.isNumber(),
  })

  readonly esmOrigin = StringOptionWithEnv('ESM_ORIGIN', '-e,--esm-origin', {
    description: 'The base URL of the ESM Server',
  })

  override async execute() {
    await Promise.all([
      ...this.packagePaths.map((packagePath) => {
        this.context.stdout.write(`Watching ${packagePath}\n`)
        return watch(packagePath, this)
      }),
      serve(this.port, this.esmOrigin),
    ])
  }
}
