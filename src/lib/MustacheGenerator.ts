import Mustache from 'mustache'
import { Generator } from 'clipanion-generator-command/Generator'

export class MustacheGenerator extends Generator {
  override renderTemplate(templateContext: any, template: string) {
    return Mustache.render(template, templateContext, undefined, {
      escape: (x) => x,
    })
  }
}
