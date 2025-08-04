export const esmOrigin = Deno.env.get('ESM_ORIGIN') ?? 'http://localhost:8080'
export const esmStoragePath =
  Deno.env.get('ESM_STORAGE_PATH') ?? 'docker-storage/esm/esmd'
export const port = Number(Deno.env.get('PORT') ?? '3000')
export const registry = Deno.env.get('REGISTRY') ?? 'http://localhost:4873'
