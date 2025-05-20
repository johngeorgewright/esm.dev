import { Option } from 'clipanion'
import type { StrictValidator } from 'typanion'

/**
 * @see https://github.com/arcanis/clipanion/issues/174
 */
export function EnvOption<T extends {}>(
  envName: string,
  descriptor: string,
  opts: { description?: string; validator: StrictValidator<unknown, T> },
): T

export function EnvOption(
  envName: string,
  descriptor: string,
  opts?: { description?: string },
): string

export function EnvOption<T extends {}>(
  envName: string,
  descriptor: string,
  opts: { description?: string; validator?: StrictValidator<unknown, T> } = {},
) {
  return process.env[envName]
    ? Option.String(descriptor, process.env[envName], opts)
    : Option.String(descriptor, { ...opts, required: true })
}
