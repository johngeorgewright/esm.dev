import load from 'npm:@commitlint/load'
import configConventional from 'npm:@commitlint/config-conventional'
import parser from 'npm:conventional-changelog-conventionalcommits'
import read from 'npm:@commitlint/read'
import lint from 'npm:@commitlint/lint'
import format from 'npm:@commitlint/format'

const config = await load({
  ...configConventional,
  parserPreset: parser,
})

const messages = await read({ edit: Deno.args[0] })

const results = await Promise.all(
  messages.map((message) => lint(message, config.rules, config)),
)

if (results.some((result) => result.errors.length)) {
  const report = format({ results })
  console.error(report)
  Deno.exit(1)
}
