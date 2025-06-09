import type { CommandClass } from './CommandClass.ts'
import { EnvOption } from '../options/EnvOption.ts'

export function ESMStorageSpecific<T extends CommandClass>(Base: T) {
  abstract class ESMStorageSpecific extends Base {
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
