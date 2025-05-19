import { spawn } from 'node:child_process'

export function login(registry: string) {
  return new Promise<number>((resolve) => {
    const child = spawn('bunx', [
      'npm',
      'login',
      '--registry',
      registry,
      '--quiet',
    ])

    child.stderr.on('data', (d) => console.error(d.toString()))

    child.stdout.on('data', (d) => {
      const data = d.toString()
      switch (true) {
        case /username/i.test(data):
          child.stdin.write('esm.dev\n')
          break
        case /password/i.test(data):
          child.stdin.write('esm.dev\n')
          break
        case /email/i.test(data):
          child.stdin.write('esm.dev@esm.dev.com')
          break
        case /logged in as/i.test(data):
          child.stdin.end()
          break
      }
    })

    child.on('exit', resolve)
  })
}
