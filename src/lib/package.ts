import { readFile, stat as getStat, constants } from 'node:fs/promises'
import * as path from 'node:path'

export async function getPackageMeta(packagePath: string) {
  const stat = await getStat(packagePath)
  const packageRoot = stat.isDirectory()
    ? packagePath
    : path.dirname(packagePath)
  const { name } = JSON.parse(
    await readFile(path.join(packageRoot, 'package.json'), 'utf-8'),
  )
  return { name, packageRoot }
}
