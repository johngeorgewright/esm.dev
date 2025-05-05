import { Command, Option } from 'clipanion'

export abstract class ESMCommand extends Command {
  readonly esmStoragePath = Option.String('-s,--esm-storage-path', {
    description: "Path to ESM.sh's storage",
    required: true,
  })

  readonly registry = Option.String('-r,--registry', {
    description: 'The URL of your local registry',
    required: true,
  })

  readonly packagePaths = Option.Rest({
    name: 'packages',
  })
}
