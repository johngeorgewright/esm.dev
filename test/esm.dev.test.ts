import {
  // afterAll,
  afterEach,
  // beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'bun:test'
import { setTimeout } from 'node:timers/promises'

// beforeAll(() => $`docker compose up --build --detach --remove-orphans`)

// afterAll(() => $`docker compose down`)

test('access to packages', async () => {
  const response1 = await fetch(
    `http://localhost:3000/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
  )
  expect(await response1.text()).toMatchInlineSnapshot(`
    "/* esm.sh - @esm.dev/package-1@0.0.1 */
    function o(){return"foo"}export{o as foo};
    //# sourceMappingURL=package-1.mjs.map"
  `)

  const response2 = await fetch(`http://localhost:3000/@esm.dev/package-2`)
  expect(await response2.text()).toMatchInlineSnapshot(`
    "/* esm.sh - @esm.dev/package-2@0.0.1 */
    export * from "/@esm.dev/package-2@0.0.1/node/package-2.mjs";
    "
  `)
})

describe('changed content', async () => {
  beforeEach(async () => {
    const filename = 'test/packages/package-1/package.json'
    const json = await Bun.file(filename).json()
    json.exports['.'] = './src/foos.ts'
    await Bun.write(filename, JSON.stringify(json))
    await setTimeout(1_500)
  })

  afterEach(async () => {
    const filename = 'test/packages/package-1/package.json'
    const json = await Bun.file(filename).json()
    json.exports['.'] = './src/foo.ts'
    await Bun.write(filename, JSON.stringify(json))
    await setTimeout(1_500)
  })

  test('is updated', async () => {
    const response1 = await fetch(
      `http://localhost:3000/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
    )
    expect(await response1.text()).toMatchInlineSnapshot(`
      "/* esm.sh - @esm.dev/package-1@0.0.1 */
      function o(){return"foos"}export{o as foos};
      //# sourceMappingURL=package-1.mjs.map"
    `)
  })
})
