import { Option } from 'clipanion'
import type { CommandClass } from './CommandClass'

export function Watchable<T extends CommandClass>(Base: T) {
  abstract class Watchable extends Base {
    readonly legacyMethod = Option.Boolean('-l,--legacy-method', false, {
      description:
        'Use a less performant, legacy, watch method. Sometimes needed in docker or vagrant environments.',
    })
  }

  return Watchable
}
