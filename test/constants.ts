export const esmOrigin = process.env.ESM_ORIGIN ?? 'http://localhost:8080'
export const esmStoragePath =
  process.env.ESM_STORAGE_PATH ?? 'docker-storage/esm'
export const port = Number(process.env.PORT ?? '3000')
export const registry = process.env.REGISTRY ?? 'http://localhost:4873'
