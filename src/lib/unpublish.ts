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
}): Promise<void> {
  await Promise.all([
    unpublishPackage(registry, name),
    deleteESMCache(esmStoragePath, name),
  ])
}

async function unpublishPackage(registry: string, name: string) {
  try {
    await $`npm unpublish --registry ${registry} --force ${name}`
  } catch (error) {
    if (
      error instanceof ProcessOutput &&
      !error.stderr.includes('npm error code E404')
    )
      throw error
  }
}

async function deleteESMCache(esmStoragePath: string, name: string) {
  const paths = await glob(`${esmStoragePath}/**/${name}@*`)
  await Promise.all(
    paths.map((path) => {
      console.info('Deleting', path)
      return rm(path, { recursive: true })
    }),
  )
}
