import { $ } from 'zx'
import * as path from 'node:path'

export async function publish({
  packageRoot,
  registry,
}: {
  packageRoot: string
  registry: string
}) {
  await $({
    cwd: path.resolve(packageRoot),
  })`bunx npm publish --registry ${registry}`
}
