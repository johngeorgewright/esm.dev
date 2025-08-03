import type { CommandClass } from './CommandClass.ts'
import { EnvOption } from '../options/EnvOption.ts'
import type { AbstractConstructor } from '../../lib/AbstractConstructor.ts'

export function ESMStorageSpecific<T extends CommandClass>(
  Base: T,
): T & AbstractConstructor<ESMStorageSpecificMixin> {
  abstract class ESMStorageSpecific extends Base
    implements ESMStorageSpecificMixin {
    readonly esmStoragePath = EnvOption(
      'ESM_STORAGE_PATH',
      '-s,--esm-storage-path',
      {
        description: "Path to ESM.sh's storage",
      },
    )
  }

  return ESMStorageSpecific
}

export interface ESMStorageSpecificMixin {
  readonly esmStoragePath: string
}
