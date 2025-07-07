import gitignore from 'ignore'
import { Minimatch } from 'minimatch'
import { createReadStream } from 'node:fs'
import { access, constants } from 'node:fs/promises'
import * as path from 'node:path'
import { createInterface as createReadlineInterface } from 'node:readline/promises'

export async function getWatchIgnorer(dirname: string): Promise<Ignorer> {
  const ignoreList = await getIgnoreList(dirname)
  return ignoreList?.basename === '.gitignore'
    ? createGitIgnore(ignoreList.ignoreList)
    : ignoreList?.basename === '.npmignore'
      ? createNPMIgnore(ignoreList.ignoreList)
      : createNullIgnore()
}

export interface Ignorer {
  ignores(filename: string): boolean
  filter(filenames: string[]): string[]
}

function createNullIgnore(): Ignorer {
  return { ignores: () => false, filter: (filenames) => filenames }
}

function createNPMIgnore(list: string[]): Ignorer {
  const mms = list.map((pattern) => new Minimatch(pattern))
  const ignores = (filename: string) => mms.some((mm) => mm.match(filename))
  return {
    ignores,
    filter: (filenames) => filenames.filter((filename) => !ignores(filename)),
  }
}

function createGitIgnore(list: string[]): Ignorer {
  return gitignore().add(list)
}

async function getIgnoreList(dirname: string) {
  for (const basename of ['.npmignore', '.gitignore']) {
    const filename = path.join(dirname, basename)

    try {
      await access(filename, constants.F_OK)
    } catch (error) {
      continue
    }

    const rl = createReadlineInterface({
      input: createReadStream(filename),
    })

    const ignoreList: string[] = []
    for await (const line of rl) if (line) ignoreList.push(line.trim())

    return {
      basename,
      ignoreList,
    }
  }
}
