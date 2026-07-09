import { queue } from './queue.ts'
import { createServer, type IncomingMessage } from 'node:http'
import httpProxy from 'http-proxy'
import { until } from './until.ts'

/**
 * esm.sh (v137+) can respond with a transient 500 "Storage error, please try
 * again" on the first request after a package is republished: its in-memory
 * build-meta cache still points at a build output that was just invalidated.
 * The following request rebuilds the module and succeeds.
 */
const TRANSIENT_ESM_ERROR = 'Storage error, please try again'

export async function serve(
  port: number,
  esmOrigin: string,
): Promise<() => Promise<void>> {
  const proxy = httpProxy.createProxyServer({
    followRedirects: true,
    target: esmOrigin,
  })

  const { promise, resolve } = Promise.withResolvers<void>()

  const server = createServer((req, res) => {
    queue(async () => {
      await waitForESMBuild(esmOrigin, req)
      await new Promise<void>((resolve, reject) => {
        console.info('Proxying', req.url)
        req.on('error', reject)
        res.on('error', reject)
        res.on('close', resolve)
        proxy.web(req, res)
      })
    }).catch((error) => {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.write(JSON.stringify(error))
      res.end()
    })
  }).listen(port, () => {
    console.info('ESM proxy server listining on', server.address())
    resolve()
  })

  await promise

  return () =>
    new Promise<void>((resolve, reject) => {
      console.info('closing the server')
      server.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
}

/**
 * Wait for esm.sh to serve a freshly (re)built module before proxying, so a
 * client never observes the transient {@link TRANSIENT_ESM_ERROR} that esm.sh
 * emits while healing its build cache after a republish.
 */
async function waitForESMBuild(
  esmOrigin: string,
  req: IncomingMessage,
): Promise<void> {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') return

  const url = new URL(req.url ?? '/', esmOrigin)

  await until({
    interval: 100,
    timeout: 10_000,
    async try(signal) {
      const response = await fetch(url, { method: 'GET', signal })
      const body = await response.text()
      return !(response.status === 500 && body.trim() === TRANSIENT_ESM_ERROR)
    },
  })
}
