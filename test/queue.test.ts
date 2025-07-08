import {
  describe,
  test,
} from 'jsr:@std/testing/bdd'
import { assertSpyCalls, spy } from "jsr:@std/testing/mock";
import { setTimeout } from 'node:timers/promises'
import { queue, queuedDebounce } from '../src/lib/queue.ts'

describe('queuedDebounce', () => {
  test('debounces calls', async () => {
    const signal = new AbortController().signal
    const fn = spy()
    const debounced = queuedDebounce(fn, 1_000, signal)

    debounced()
    debounced()
    debounced()

    await setTimeout(1_100)

    assertSpyCalls(fn, 1)
  })

  test('queues calls', async () => {
    const fn1 = spy<unknown, unknown[], Promise<void>>()
    const fn2 = spy<unknown, unknown[], Promise<void>>()
    const debounced = queuedDebounce(fn1, 1_000)
    debounced()
    queue(fn2)
    debounced()
    queue(fn2)
    debounced()
    await setTimeout(1_100)
    assertSpyCalls(fn1, 1)
    assertSpyCalls(fn2, 2)
  })
})
