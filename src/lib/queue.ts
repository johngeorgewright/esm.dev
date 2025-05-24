import debounce from 'lodash.debounce'
import throat from 'throat'

export async function queue<TResult, TArgs extends any[] = []>(
  signal: AbortSignal,
  fn: (...args: TArgs) => Promise<TResult>,
): Promise<TResult> {
  signal.throwIfAborted()
  return _queue((...args) => {
    signal.throwIfAborted()
    return fn(...(args as any))
  })
}

const _queue = throat.default(1)

/**
 * Just like debounce, but the first call will add a promise to the queue
 * and that promise won't resolve until the debounced function is finally called.
 */
export function queuedDebounce<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  delay: number,
  signal: AbortSignal,
): (...args: Args) => Promise<Awaited<R>> {
  let promiseWithResolvers: PromiseWithResolvers<R> | undefined

  signal.addEventListener('abort', (reason) =>
    promiseWithResolvers?.reject(reason),
  )

  const debounced = debounce(async (...args: Args) => {
    try {
      const result = await fn(...args)
      promiseWithResolvers?.resolve(result)
    } catch (error: any) {
      promiseWithResolvers?.reject(error)
    } finally {
      promiseWithResolvers = undefined
    }
  }, delay)

  return (...args: Args) => {
    const { promise } = start()
    debounced(...args)
    return promise as Promise<Awaited<R>>
  }

  function start() {
    if (!promiseWithResolvers) {
      promiseWithResolvers = Promise.withResolvers<R>()
      queue(signal, async () => promiseWithResolvers?.promise)
    }
    return promiseWithResolvers
  }
}
