import { isNumber } from 'typanion'
import { EnvOption } from '../options/EnvOption.ts'
import type { CommandClass } from './CommandClass.ts'
import type { AbstractConstructor } from '../../lib/AbstractConstructor.ts'

export function Servable<T extends CommandClass>(
  Base: T,
): T & AbstractConstructor<ServableMixin> {
  abstract class Servable extends Base implements ServableMixin {
    readonly port = EnvOption('PORT', '-p,--port', {
      description: 'The port to run the server on',
      validator: isNumber(),
    })
  }

  return Servable
}

export interface ServableMixin {
  readonly port: number
}
