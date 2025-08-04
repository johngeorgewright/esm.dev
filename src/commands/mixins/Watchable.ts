import { Option } from 'clipanion'
import type { CommandClass } from './CommandClass.ts'
import type { AbstractConstructor } from '../../lib/AbstractConstructor.ts'

export function Watchable<T extends CommandClass>(
  Base: T,
): T & AbstractConstructor<WatchableMixin> {
  abstract class Watchable extends Base implements WatchableMixin {
    readonly legacyMethod = Option.Boolean('-l,--legacy-method', false, {
      description:
        'Use a less performant, legacy, watch method. Sometimes needed in docker or vagrant environments.',
    })
  }

  return Watchable
}

export interface WatchableMixin {
  readonly legacyMethod: boolean
}
