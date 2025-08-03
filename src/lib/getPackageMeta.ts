import * as path from 'node:path'

export async function getPackageMeta(
  packagePath: string,
): Promise<{ name: string; packageRoot: string; private?: boolean }> {
  const stat = await Deno.stat(packagePath)
  const packageRoot = stat.isDirectory ? packagePath : path.dirname(packagePath)
  const pckg = JSON.parse(
    await Deno.readTextFile(path.join(packageRoot, 'package.json')),
  )
  return { name: pckg.name, packageRoot, private: pckg.private }
}
