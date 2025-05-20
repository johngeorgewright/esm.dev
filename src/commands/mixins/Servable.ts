import { isNumber } from 'typanion'
import { EnvOption } from '../../options/EnvOption.ts'
import type { CommandClass } from './CommandClass.ts'

export function Servable<T extends CommandClass>(Base: T) {
  abstract class Servable extends Base {
    readonly port = EnvOption('PORT', '-p,--port', {
      description: 'The port to run the server on',
      validator: isNumber(),
    })
  }

  return Servable
}
