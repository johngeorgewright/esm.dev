import { Command } from 'clipanion'
import { RegistrySpecific } from './mixins/RegistrySpecific'
import { ESMStorageSpecific } from './mixins/ESMStorageSpecific'
import { PackagePathSpecific } from './mixins/PackagePathSpecific'

export abstract class ESMCommand extends ESMStorageSpecific(
  RegistrySpecific(PackagePathSpecific(Command)),
) {}
