import { Command, Option } from 'clipanion'
import * as t from 'typanion'
import { RegistrySpecific } from './mixins/RegistrySpecific'
import { until } from '../lib/until'

export class WaitForRegistryCommand extends RegistrySpecific(Command) {
  static override paths = [['wait-for-registry'], ['wfr']]

  static override usage = Command.Usage({
    description: 'wait for the registry to be online',
  })

  readonly timeout = Option.String('-t,--timeout', '10000', {
    description: 'The amount of ms to wait',
    validator: t.isNumber(),
  })

  readonly interval = Option.String('-i,--interval', '300', {
    description: 'The amount of ms inbetween each request',
    validator: t.isNumber(),
  })

  override async execute() {
    await until({
      ...this,
      try: async (signal) => {
        const response = await fetch(this.registry, { signal })
        return response.ok
      },
    })
    this.context.stderr.write(`${this.registry} is not available\n`)
    return 1
  }
}
