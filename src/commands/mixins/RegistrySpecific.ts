import type { AbstractConstructor } from './AbstractConstructor.ts'
import { StringOptionWithEnv } from '../../options/StringOptionWithEnv.ts'

export function RegistrySpecific<TBase extends AbstractConstructor>(
  Base: TBase,
) {
  abstract class RegistrySpecific extends Base {
    readonly registry = StringOptionWithEnv('NPM_REGISTRY', '-r,--registry', {
      description: 'The URL of your local registry',
    })
  }

  return RegistrySpecific
}
