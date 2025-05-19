import { Command } from 'clipanion'
import { RegistrySpecific } from './mixins/RegistrySpecific.ts'
import { login } from '../lib/login.ts'

export class LoginCommand extends RegistrySpecific(Command) {
  static override paths = [['login']]

  static override usage = Command.Usage({
    description: 'Login in to the NPM registry',
  })

  override async execute() {
    return login(this.registry)
  }
}
