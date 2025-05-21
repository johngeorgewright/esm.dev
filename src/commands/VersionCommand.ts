import { Command } from 'clipanion'

export class VersionCommand extends Command {
  static override paths = [['version']]

  static override usage = Command.Usage({
    description: 'Display the version of esm.dev',
  })

  override async execute(): Promise<number | void> {
    const path = await import('node:path')
    const pckg = await Bun.file(
      path.resolve(import.meta.dirname, '..', '..', 'package.json'),
    ).json()
    this.context.stdout.write(`${pckg.version}\n`)
  }
}
