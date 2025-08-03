// @ts-check

const deno = {
  bumpVersion:
    'cat deno.json | jq \'.version |= "${nextRelease.version}"\' > deno.tmp.json && mv deno.tmp.json deno.json',
  isPublicPackage: '[ $(cat deno.json | jq -r .private) != "true" ]',
  publish: 'deno publish --allow-dirty',
}

/**
 * @type {import('npm:semantic-release').Options}
 */
module.exports = {
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        prepareCmd: `${deno.isPublicPackage} && ${deno.bumpVersion}`,
        verifyReleaseCmd:
          `${deno.isPublicPackage} && ${deno.publish} --set-version "\${nextRelease.version}" --dry-run`,
        publishCmd: `${deno.isPublicPackage} && ${deno.publish}`,
      },
    ],
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'npm',
      },
    ],
    [
      '@semantic-release/git',
      {
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
    '@semantic-release/github',
  ],
}
