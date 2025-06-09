import type { CommandClass } from './CommandClass.ts'
import { EnvOption } from '../options/EnvOption.ts'

export function RegistrySpecific<TBase extends CommandClass>(Base: TBase) {
  abstract class RegistrySpecific extends Base {
    readonly registry = EnvOption('NPM_REGISTRY', '-r,--registry', {
      description: 'The URL of your local registry',
    })
  }

  return RegistrySpecific
}
