import { setTimeout } from 'node:timers/promises'

export async function until({
  interval,
  timeout,
  try: Try,
}: {
  interval: number
  timeout: number
  try(signal: AbortSignal): Promise<boolean>
}): Promise<boolean> {
  const signal = AbortSignal.timeout(timeout)
  while (!signal.aborted) {
    try {
      if (await Try(signal)) return true
    } catch (error) {}
    try {
      await setTimeout(interval, null, { signal })
    } catch (error) {}
  }
  return false
}

export async function waitForEndpoint({
  interval = 300,
  timeout = 10_000,
  endpoint,
}: {
  interval?: number
  timeout?: number
  endpoint: string
}): Promise<void> {
  if (
    !(await until({
      interval,
      timeout,
      async try(signal) {
        const response = await fetch(endpoint, { signal })
        return response.ok
      },
    }))
  )
    throw new EndpointUnavailableError()
}

export class EndpointUnavailableError extends Error {
  constructor() {
    super('Endpoint not available')
  }
}
