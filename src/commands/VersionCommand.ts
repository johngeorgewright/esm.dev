import { Command } from 'clipanion'

export class VersionCommand extends Command {
  static override paths = [['version']]

  static override usage = Command.Usage({
    description: 'Display the version of esm.dev',
  })

  override async execute(): Promise<number | void> {
    const { default: pckg } = await import('../../package.json')
    this.context.stdout.write(`${pckg.version}\n`)
  }
}
