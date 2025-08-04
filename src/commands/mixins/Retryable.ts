import { Option } from 'clipanion'
import { isNumber } from 'typanion'
import type { CommandClass } from './CommandClass.ts'
import type { AbstractConstructor } from '../../lib/AbstractConstructor.ts'

export function Retryable<T extends CommandClass>(
  Base: T,
): T & AbstractConstructor<RetryableMixin> {
  abstract class Retryable extends Base implements RetryableMixin {
    readonly timeout = Option.String('-t,--timeout', '10000', {
      description: 'The amount of total ms to keep trying for',
      validator: isNumber(),
    })

    readonly interval = Option.String('-i,--interval', '300', {
      description: 'The amount of ms inbetween each attempt',
      validator: isNumber(),
    })

    async retry(endpoint: string) {
      const { EndpointUnavailableError, waitForEndpoint } = await import(
        '../../lib/until.ts'
      )
      try {
        await waitForEndpoint({ ...this, endpoint })
      } catch (error) {
        if (error instanceof EndpointUnavailableError) {
          this.context.stderr.write(`${endpoint} is not available\n`)
          return 1
        } else throw error
      }

      return 0
    }
  }

  return Retryable
}

export interface RetryableMixin {
  readonly timeout: number
  readonly interval: number
  retry(endpoint: string): Promise<number>
}
