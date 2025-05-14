import { isNumber } from 'typanion'
import { StringOptionWithEnv } from '../../options/StringOptionWithEnv.ts'
import type { AbstractConstructor } from './AbstractConstructor.ts'

export function Servable<T extends AbstractConstructor>(Base: T) {
  abstract class Servable extends Base {
    readonly port = StringOptionWithEnv('PORT', '-p,--port', {
      description: 'The port to run the server on',
      validator: isNumber(),
    })
  }

  return Servable
}
