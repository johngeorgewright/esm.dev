import { Option } from 'clipanion'
import type { StrictValidator } from 'typanion'

/**
 * @see https://github.com/arcanis/clipanion/issues/174
 */
// deno-lint-ignore ban-types
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

// deno-lint-ignore ban-types
export function EnvOption<T extends {}>(
  envName: string,
  descriptor: string,
  opts: { description?: string; validator?: StrictValidator<unknown, T> } = {},
) {
  const env = Deno.env.get(envName)
  return env
    ? Option.String(descriptor, env, opts)
    : Option.String(descriptor, { ...opts, required: true })
}
