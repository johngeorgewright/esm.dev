import { queue } from './queue.js'
import { createServer } from 'node:http'
import httpProxy from 'http-proxy'

export function serve(port: number, esmOrigin: string) {
  const proxy = httpProxy.createProxyServer()

  const server = createServer((req, res) => {
    queue(
      () =>
        new Promise<void>((resolve, reject) => {
          console.info('Proxying', req.url)
          req.on('error', reject)
          res.on('error', reject)
          res.on('close', resolve)
          proxy.web(req, res, { target: esmOrigin })
        }),
    ).catch((error) => {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.write(JSON.stringify(error))
      res.end()
    })
  }).listen(port, () => {
    console.info('ESM proxy server listining on', server.address())
  })

  return () => {
    console.info('closing the server')
    server.closeAllConnections()
    server.close()
  }
}
