import { Command } from 'clipanion'
import { readJSONFile } from '../lib/fs.ts'

export class VersionCommand extends Command {
  static override paths = [['version']]

  static override usage = this.Usage({
    description: 'Display the version of esm.dev',
  })

  override async execute(): Promise<number | void> {
    const path = await import('node:path')
    const pckg = await readJSONFile(
      path.resolve(import.meta.dirname ?? '', '..', '..', 'package.json'),
    )
    this.context.stdout.write(`${pckg.version}\n`)
  }
}
