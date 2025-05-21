# esm.dev

A set of utils when working with local NPM packages and [esm.sh](https://esm.sh/).

It expects you to have a local version of ESM.sh and verdaccio running. It will monitor changes in a configurable set of directories. When it sees any changes, it will unpublish from verdaccio, remove builds & cache from ESM.sh and then re-publish the package.

## Usage

### Prerequists

- You have [docker](https://www.docker.com/) installed
- You have [docker compose](https://docs.docker.com/compose/) installed
- You have a JavaScript runtime installed ([Node.js](https://nodejs.org/), [Deno](https://deno.com/), [Bun](https://bun.sh/) etc)

### Installation

```bash
# Node.js
npx esm.dev init my-local-package-1 my-local-package-2 ...
```

This will create a docker-compose file in your cwd. Now run it:

```bash
docker compose up
```

Once the above is running point your ESM modules to `localhost:3000`:

```html
<script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react",
      "package-1": "http://localhost:3000/package-1"
    }
  }
</script>
<script type="module">
  import Package1 from 'package1'
  // ...
</script>
```
