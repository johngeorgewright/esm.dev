import { Option } from 'clipanion'
import { isNumber } from 'typanion'
import type { CommandClass } from './CommandClass.ts'
import { until } from '../../lib/until.ts'

export function Retryable<T extends CommandClass>(Base: T) {
  abstract class Retryable extends Base {
    readonly timeout = Option.String('-t,--timeout', '10000', {
      description: 'The amount of total ms to keep trying for',
      validator: isNumber(),
    })

    readonly interval = Option.String('-i,--interval', '300', {
      description: 'The amount of ms inbetween each attempt',
      validator: isNumber(),
    })

    protected abstract endpoint: string

    override async execute() {
      if (
        !(await until({
          ...this,
          try: async (signal) => {
            const response = await fetch(this.endpoint, { signal })
            return response.ok
          },
        }))
      ) {
        this.context.stderr.write(`${this.endpoint} is not available\n`)
        return 1
      }
    }
  }

  return Retryable
}
