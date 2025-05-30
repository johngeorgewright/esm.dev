import { Command } from 'clipanion'
import { RegistrySpecific } from './mixins/RegistrySpecific.ts'
import { ESMStorageSpecific } from './mixins/ESMStorageSpecific.ts'
import { PackagePathSpecific } from './mixins/PackagePathSpecific.ts'

export abstract class ESMDevCommand extends ESMStorageSpecific(
  RegistrySpecific(PackagePathSpecific(Command)),
) {}
