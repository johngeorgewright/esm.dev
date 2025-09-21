import { queue } from './queue.js'
import { createServer } from 'node:http'
import httpProxy from 'http-proxy'

export async function serve(
  port: number,
  esmOrigin: string,
): Promise<() => Promise<void>> {
  const proxy = httpProxy.createProxyServer()
  const { promise, resolve } = Promise.withResolvers<void>()

  const server = createServer((req, res) => {
    queue(
      () =>
        new Promise<void>((resolve, reject) => {
          console.info('Proxying', req.url)
          req.on('error', reject)
          res.on('error', reject)
          res.on('close', resolve)
          proxy.web(req, res, { followRedirects: true, target: esmOrigin })
        }),
    ).catch((error) => {
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
