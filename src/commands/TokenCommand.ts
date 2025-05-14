import { Command } from 'clipanion'
import escapeStringRegexp from 'escape-string-regexp'
import { RegistrySpecific } from './mixins/RegistrySpecific.ts'

export class TokenCommand extends RegistrySpecific(Command) {
  static override paths = [['token']]

  static override usage = Command.Usage({
    description: 'Get the NPM token',
  })

  override async execute() {
    const npmrc = await Bun.file(`~/.npmrc`).text()
    const url = new URL(this.registry)
    const regex = new RegExp(
      `^//${escapeStringRegexp(url.hostname)}/:_authToken=(.*)$`,
      'm',
    )
    const match = regex.exec(npmrc)
    if (!match) {
      this.context.stderr.write(`Token has not been created yet\n`)
      return 1
    }
    this.context.stdout.write(match[1] + '\n')
  }
}
