import { isNumber } from 'typanion'
import { StringOptionWithEnv } from '../../options/StringOptionWithEnv.ts'
import type { CommandClass } from './CommandClass.ts'

export function Servable<T extends CommandClass>(Base: T) {
  abstract class Servable extends Base {
    readonly port = StringOptionWithEnv('PORT', '-p,--port', {
      description: 'The port to run the server on',
      validator: isNumber(),
    })
  }

  return Servable
}
