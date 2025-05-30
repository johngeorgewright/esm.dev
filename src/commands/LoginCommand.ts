import { Command } from 'clipanion'
import { RegistrySpecific } from './mixins/RegistrySpecific.ts'

export class LoginCommand extends RegistrySpecific(Command) {
  static override paths = [['login']]

  static override usage = Command.Usage({
    description: 'Login in to the NPM registry',
  })

  override async execute() {
    const { login } = await import('../lib/login.ts')
    return login(this.registry)
  }
}
