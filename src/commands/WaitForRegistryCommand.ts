import { Command } from 'clipanion'
import { RegistrySpecific } from './mixins/RegistrySpecific.ts'
import { Retryable } from './mixins/Retryable.ts'

export class WaitForRegistryCommand extends Retryable(
  RegistrySpecific(Command),
) {
  static paths = [['wait-for-registry'], ['wfr']]

  static usage = Command.Usage({
    description: 'wait for the registry to be online',
  })

  override async execute() {
    return this.retry(this.registry)
  }
}
