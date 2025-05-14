import throat from 'throat'

export const queue = throat(1)

export async function waitForQueue() {
  await queue(() => Promise.resolve())
}
