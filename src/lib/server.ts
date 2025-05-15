import { queue } from './queue.ts'
import { createServer } from 'node:http'
import httpProxy from 'http-proxy'

export function serve(port: number, esmOrigin: string) {
  const proxy = httpProxy.createProxyServer()

  const server = createServer((req, res) => {
    queue(async () => proxy.web(req, res, { target: esmOrigin })).catch(
      (error) => {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.write(JSON.stringify(error))
        res.end()
      },
    )
  }).listen(port, () => {
    console.info('ESM proxy server listining on', server.address())
  })
}
