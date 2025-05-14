import { afterAll, expect, test } from 'bun:test'
import { rm } from 'node:fs/promises'

const mungFile = './test/packages/mung.txt'

afterAll(async () => {
  await rm(mungFile)
})

test('things', async () => {
  const response = await fetch('http://0.0.0.0:8080')
  const text = await response.text()
  expect(text).toContain('package-1/')
  expect(text).toContain('package-2/')
  expect(text).not.toContain('mung.txt')
})

test('other thing', async () => {
  await Bun.write(mungFile, 'mung')
  const response = await fetch('http://0.0.0.0:8080')
  const text = await response.text()
  expect(text).toContain('package-1/')
  expect(text).toContain('package-2/')
  expect(text).toContain('mung.txt')
})
