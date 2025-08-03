import { build, emptyDir } from 'jsr:@deno/dnt'
import { copy } from 'jsr:@std/fs'
import { parseArgs } from 'jsr:@std/cli/parse-args'
import denoJSON from '../deno.json' with { type: 'json' }

const args = parseArgs(Deno.args)

await emptyDir('./npm')

await build({
  entryPoints: [{
    kind: 'bin',
    name: 'esm.dev',
    path: './src/cli.ts',
  }, {
    kind: 'export',
    name: '.',
    path: './src/cli.ts',
  }],
  testPattern: './test/*.test.ts',
  scriptModule: false,
  test: !!args.test,
  outDir: './npm',
  shims: {
    deno: true,
    timers: true,
  },
  compilerOptions: {
    lib: ['ESNext'],
    skipLibCheck: true,
  },
  package: {
    name: 'esm.dev',
    version: denoJSON.version,
    description:
      'A set of utils when working with local NPM packages and https://esm.sh/',
    repository: {
      type: 'git',
      url: 'git+https://github.com/johngeorgewright/esm.dev.git',
    },
    keywords: [
      'esm',
      'ems.sh',
    ],
    author: 'John Wright <johngeorge.wright@gmail.com>',
    license: 'MIT',
    homepage: 'https://github.com/johngeorgewright/esm.dev#readme',
    bugs: {
      url: 'https://github.com/johngeorgewright/esm.dev/issues',
    },
    devDependencies: {
      '@types/http-proxy': '^1.17.16',
      '@types/lodash.debounce': '^4.0.9',
      '@types/node': '^22.13.14',
      'disposablestack': '^1.1.7',
    },
  },
  async postBuild() {
    await copy('LICENSE', 'npm/LICENSE')
    await copy('README.md', 'npm/README.md')
    await copy('test/packages', 'npm/esm/test/packages')
  },
  filterDiagnostic(diagnostic) {
    return !diagnostic.file?.fileName.includes(
      'npm/src/deps/jsr.io/@std',
    )
  },
})
