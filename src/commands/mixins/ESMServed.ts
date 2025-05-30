import { EnvOption } from '../../options/EnvOption.ts'
import type { CommandClass } from './CommandClass.ts'

export function ESMServed<T extends CommandClass>(Base: T) {
  abstract class ESMServed extends Base {
    readonly esmOrigin = EnvOption('ESM_ORIGIN', '-e,--esm-origin', {
      description: 'The base URL of the ESM Server',
    })
  }

  return ESMServed
}
