import { $ } from 'bun'
import * as path from 'node:path'

export async function publish({
  packageRoot,
  registry,
}: {
  packageRoot: string
  registry: string
}) {
  await $`bunx npm publish --registry ${registry}`.cwd(
    path.resolve(packageRoot),
  )
}
