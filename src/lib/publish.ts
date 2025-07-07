import { $ } from 'zx'
import * as path from 'node:path'

export async function publish({
  packageRoot,
  registry,
}: {
  packageRoot: string
  registry: string
}): Promise<void> {
  await $({
    cwd: path.resolve(packageRoot),
  })`npm publish --registry ${registry}`
}
