import { describe, expect, mock, test } from 'bun:test'
import { setTimeout } from 'node:timers/promises'
import { queue, queuedDebounce } from '../src/lib/queue'

describe('queuedDebounce', () => {
  test('debounces calls', async () => {
    const fn = mock()
    const debounced = queuedDebounce(fn, 1_000)

    debounced()
    debounced()
    debounced()

    await setTimeout(1_100)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('queues calls', async () => {
    const fn1 = mock()
    const fn2 = mock()
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
