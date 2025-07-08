import { Command } from 'clipanion'

export class VersionCommand extends Command {
  static override paths = [['version']]

  static override usage = this.Usage({
    description: 'Display the version of esm.dev',
  })

  override async execute(): Promise<number | void> {
    const [path, { readFile }] = await Promise.all([
      import('node:path'),
      import('node:fs/promises'),
    ])
    const pckg = JSON.parse(
      await readFile(
        path.resolve(import.meta.dirname ?? '', '..', '..', 'package.json'),
        'utf-8',
      ),
    )
    this.context.stdout.write(`${pckg.version}\n`)
  }
}
