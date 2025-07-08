import { queue } from './queue.ts'

export async function serve(
  port: number,
  esmOrigin: string,
): Promise<() => Promise<void>> {
  const { promise, resolve } = Promise.withResolvers<void>()

  const server = Deno.serve({
    port,
    onListen(netAddr) {
      console.info('ESM proxy server listining on', netAddr)
      resolve()
    },
  }, (request) =>
    queue(() => {
      const { pathname, search } = new URL(request.url)
      const url = new URL('.' + pathname, esmOrigin)
      url.search = search

      const headers = new Headers(request.headers)
      headers.set('Host', url.hostname)

      return fetch(url, {
        method: request.method,
        headers,
        body: request.body,
        redirect: 'manual',
      })
    }).catch((error) =>
      new Response(JSON.stringify(error), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        status: 500,
      })
    ))

  await promise

  return async () => {
    console.info('closing the server')
    await server.shutdown()
  }
}
