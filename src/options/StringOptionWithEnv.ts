import { Option } from 'clipanion'

/**
 * @see https://github.com/arcanis/clipanion/issues/174
 */
export function StringOptionWithEnv(
  envName: string,
  descriptor: string,
  opts: { description?: string } = {},
) {
  return process.env[envName]
    ? Option.String(descriptor, process.env[envName], opts)
    : Option.String(descriptor, { ...opts, required: true })
}
