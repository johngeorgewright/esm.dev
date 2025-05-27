import debounce from 'lodash.debounce'
import throat from 'throat'

export async function queue<TResult, TArgs extends any[] = []>(
  fn: (...args: TArgs) => Promise<TResult>,
  signal?: AbortSignal,
): Promise<TResult> {
  return _queue((...args) => {
    signal?.throwIfAborted()
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
  signal?: AbortSignal,
): (...args: Args) => Promise<Awaited<R>> {
  let promiseWithResolvers: PromiseWithResolvers<R> | undefined
  let queuedPromise: Promise<Awaited<R>> | undefined

  signal?.addEventListener('abort', (reason) => {
    debounced.cancel()
    promiseWithResolvers?.reject(reason)
  })

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
    const promise = start()
    debounced(...args)
    return promise as Promise<Awaited<R>>
  }

  function start() {
    if (!queuedPromise) {
      promiseWithResolvers = Promise.withResolvers<R>()
      queuedPromise = queue(
        async () => promiseWithResolvers?.promise,
      ) as Promise<Awaited<R>>
    }
    return queuedPromise
  }
}
