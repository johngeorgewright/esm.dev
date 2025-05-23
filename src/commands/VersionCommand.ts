import { Command } from 'clipanion'
import { readFile } from 'node:fs/promises'

export class VersionCommand extends Command {
  static override paths = [['version']]

  static override usage = Command.Usage({
    description: 'Display the version of esm.dev',
  })

  override async execute(): Promise<number | void> {
    const path = await import('node:path')
    const pckg = JSON.parse(
      await readFile(
        path.resolve(import.meta.dirname, '..', '..', 'package.json'),
        'utf-8',
      ),
    )
    this.context.stdout.write(`${pckg.version}\n`)
  }
}
