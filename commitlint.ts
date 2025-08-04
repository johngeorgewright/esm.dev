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

const report = format({ results })

if (results.some((result) => result.errors.length)) {
  console.error(report)
  Deno.exit(1)
} else {
  console.info(report)
}
