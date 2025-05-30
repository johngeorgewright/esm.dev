import { Command } from 'clipanion'
import { RegistrySpecific } from './mixins/RegistrySpecific.ts'
import { readFile } from 'node:fs/promises'

export class TokenCommand extends RegistrySpecific(Command) {
  static override paths = [['token']]

  static override usage = Command.Usage({
    description: 'Get the NPM token',
  })

  override async execute() {
    const { default: escapeStringRegexp } = await import('escape-string-regexp')
    const npmrc = await readFile('~/.npmrc', 'utf-8')
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
