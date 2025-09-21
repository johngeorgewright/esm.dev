import { Command } from 'clipanion'
import { RegistrySpecific } from './mixins/RegistrySpecific.js'
import { ESMStorageSpecific } from './mixins/ESMStorageSpecific.js'
import { PackagePathSpecific } from './mixins/PackagePathSpecific.js'

export abstract class ESMDevCommand extends ESMStorageSpecific(
  RegistrySpecific(PackagePathSpecific(Command)),
) {}
