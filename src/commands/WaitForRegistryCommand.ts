import { Command, Option } from 'clipanion'
import { setTimeout } from 'node:timers/promises'
import * as t from 'typanion'
import { RegistrySpecific } from './mixins/RegistrySpecific'

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
    const signal = AbortSignal.timeout(this.timeout)
    while (!signal.aborted) {
      try {
        const response = await fetch(this.registry, { signal })
        if (response.ok) return
      } catch (error) {}
      try {
        await setTimeout(this.interval, { signal })
      } catch (error) {}
    }
    this.context.stderr.write(`${this.registry} is not available\n`)
    return 1
  }
}
