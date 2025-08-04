import type { CommandClass } from './CommandClass.ts'
import { EnvOption } from '../options/EnvOption.ts'
import type { AbstractConstructor } from '../../lib/AbstractConstructor.ts'

export function RegistrySpecific<T extends CommandClass>(
  Base: T,
): T & AbstractConstructor<RegistrySpecificMixin> {
  abstract class RegistrySpecific extends Base
    implements RegistrySpecificMixin {
    readonly registry = EnvOption('NPM_REGISTRY', '-r,--registry', {
      description: 'The URL of your local registry',
    })
  }

  return RegistrySpecific
}

export interface RegistrySpecificMixin {
  readonly registry: string
}
