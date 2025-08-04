import { EnvOption } from '../options/EnvOption.ts'
import type { CommandClass } from './CommandClass.ts'
import type { AbstractConstructor } from '../../lib/AbstractConstructor.ts'

export function ESMServed<T extends CommandClass>(
  Base: T,
): T & AbstractConstructor<ESMServedMixin> {
  abstract class ESMServed extends Base implements ESMServedMixin {
    readonly esmOrigin = EnvOption('ESM_ORIGIN', '-e,--esm-origin', {
      description: 'The base URL of the ESM Server',
    })
  }

  return ESMServed
}

export interface ESMServedMixin {
  readonly esmOrigin: string
}
