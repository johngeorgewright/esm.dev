import type { CommandClass } from './CommandClass'
import { StringOptionWithEnv } from '../../options/StringOptionWithEnv.ts'

export function ESMStorageSpecific<T extends CommandClass>(Base: T) {
  abstract class ESMStorageSpecific extends Base {
    readonly esmStoragePath = StringOptionWithEnv(
      'ESM_STORAGE_PATH',
      '-s,--esm-storage-path',
      {
        description: "Path to ESM.sh's storage",
      },
    )
  }

  return ESMStorageSpecific
}
