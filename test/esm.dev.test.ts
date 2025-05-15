import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { readFile, writeFile } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'

test('access to packages', async () => {
  const response1 = await fetch(
    `http://0.0.0.0:3000/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
  )

  expect(await response1.text()).toMatchInlineSnapshot(`
    "/* esm.sh - @esm.dev/package-1@0.0.1 */
    function o(){return"foo"}export{o as foo};
    //# sourceMappingURL=package-1.mjs.map"
  `)

  const response2 = await fetch(`http://0.0.0.0:3000/@esm.dev/package-2`)

  expect(await response2.text()).toMatchInlineSnapshot(`
    "/* esm.sh - @esm.dev/package-2@0.0.1 */
    export * from "/@esm.dev/package-2@0.0.1/node/package-2.mjs";
    "
  `)
})

describe('changed content', async () => {
  async function changeMainExport(to: string) {
    const filename = 'test/packages/package-1/package.json'
    const json = JSON.parse(await readFile(filename, 'utf-8'))
    json.exports['.'] = to
    await writeFile(filename, JSON.stringify(json, null, 2))
    await setTimeout(15_000)
  }

  beforeEach(() => changeMainExport('./src/foos.ts'))

  afterEach(() => changeMainExport('./src/foo.ts'))

  test('is updated', async () => {
    const response1 = await fetch(
      `http://0.0.0.0:3000/@esm.dev/package-1@0.0.1/es2022/package-1.mjs`,
    )
    expect(await response1.text()).toMatchInlineSnapshot(`
      "/* esm.sh - @esm.dev/package-1@0.0.1 */
      function o(){return"foos"}export{o as foos};
      //# sourceMappingURL=package-1.mjs.map"
    `)
  })
})
