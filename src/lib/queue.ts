import debounce from 'lodash.debounce'
import throat from 'throat'

export const queue = throat(1)

/**
 * Just like debounce, but the first call will add a promise to the queue
 * and the rest will be queued until the debounced function is called.
 */
export function queuedDebounce<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  delay: number,
): (...args: Args) => Promise<R> {
  let promiseWithResolvers: PromiseWithResolvers<R> | undefined

  const debounced = debounce(async (...args: Args) => {
    try {
      const result = await fn(...args)
      promiseWithResolvers!.resolve(result)
    } catch (error: any) {
      promiseWithResolvers!.reject(error)
    } finally {
      promiseWithResolvers = undefined
    }
  }, delay)

  return (...args: Args) => {
    start()
    debounced(...args)
    return promiseWithResolvers!.promise
  }

  function start() {
    if (!promiseWithResolvers) {
      promiseWithResolvers = Promise.withResolvers<R>()
      queue(() => promiseWithResolvers!.promise)
    }
  }
}
