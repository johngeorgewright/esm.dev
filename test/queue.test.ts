import { describe, expect, vi, test } from 'vitest'
import { setTimeout } from 'node:timers/promises'
import { queue, queuedDebounce } from '../src/lib/queue.js'

describe('queuedDebounce', () => {
  test('debounces calls', async () => {
    const signal = new AbortController().signal
    const fn = vi.fn()
    const debounced = queuedDebounce(fn, 1_000, signal)

    debounced()
    debounced()
    debounced()

    await setTimeout(1_100)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('queues calls', async () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const debounced = queuedDebounce(fn1, 1_000)
    debounced()
    queue(fn2)
    debounced()
    queue(fn2)
    debounced()
    await setTimeout(1_100)
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(2)
  })
})
