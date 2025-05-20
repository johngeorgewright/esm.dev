import { GeneratorCommand } from 'clipanion-generator-command'
import { MustacheGenerator } from '../lib/MustacheGenerator'

export abstract class MustacheGeneratorCommand extends GeneratorCommand {
  override get generator() {
    return new MustacheGenerator(this.templateDir, this.destinationDir, [
      '.mustache',
    ])
  }
}
