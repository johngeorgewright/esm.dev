import { readFile, stat as getStat } from 'node:fs/promises'
import * as path from 'node:path'

export async function getPackageMeta(
  packagePath: string,
): Promise<{ name: string; packageRoot: string; private?: boolean }> {
  const stat = await getStat(packagePath)
  const packageRoot = stat.isDirectory()
    ? packagePath
    : path.dirname(packagePath)
  const pckg = JSON.parse(
    await readFile(path.join(packageRoot, 'package.json'), 'utf-8'),
  )
  return { name: pckg.name, packageRoot, private: pckg.private }
}
