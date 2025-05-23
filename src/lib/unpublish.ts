import { $, ProcessOutput } from 'zx'
import { glob } from 'glob'
import { rm } from 'node:fs/promises'

export async function unpublish({
  registry,
  esmStoragePath,
  name,
}: {
  registry: string
  esmStoragePath: string
  name: string
}) {
  await Promise.all([
    unpublishPackage(registry, name),
    deleteESMCache(esmStoragePath, name),
  ])
}

async function unpublishPackage(registry: string, name: string) {
  try {
    await $`bunx npm unpublish --registry ${registry} --force ${name}`
  } catch (error) {
    if (
      error instanceof ProcessOutput &&
      !error.stderr.includes('npm error code E404')
    )
      throw error
  }
}

async function deleteESMCache(esmStoragePath: string, name: string) {
  await glob(`${esmStoragePath}/**/${name}@*`).then((paths) =>
    Promise.all(
      paths.map((path) => {
        console.info('Deleting', path)
        return rm(path, { recursive: true })
      }),
    ),
  )
}
