import { setTimeout } from 'node:timers/promises'

export async function until({
  interval,
  timeout,
  try: Try,
}: {
  interval: number
  timeout: number
  try(signal: AbortSignal): Promise<boolean>
}) {
  const signal = AbortSignal.timeout(timeout)
  while (!signal.aborted) {
    try {
      if (await Try(signal)) return
    } catch (error) {}
    try {
      await setTimeout(interval, { signal })
    } catch (error) {}
  }
}
