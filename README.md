# esm.dev

A set of utils when working with local NPM packages and [esm.sh](https://esm.sh/).

It expects you to have a local version of ESM.sh and verdaccio running. It will monitor changes in a configurable set of directories. When it sees any changes, it will unpublish from verdaccio, remove builds & cache from ESM.sh and then re-publish the package.

## Usage

The simplest solution is to use docker-compose. Using the configuration below:

`docker compose up`

```yaml
services:
  esm.dev:
    image: ghcr.io/johngeorgewright/esm.dev:latest
    depends_on:
      - esm.sh
      - npm
    environment:
      - NPM_REGISTRY=http://npm:4873
      - ESM_ORIGIN=http://esm.sh:8080
      - ESM_STORAGE_PATH=/esmd
      - PORT=3000
    command:
      - start
      - /watch/*
    ports:
      - '3000:3000'
    volumes:
      - ./docker-storage/esm/esmd:/esmd
      # The following are paths to all the packages you wish to auto publish
      - ./packages/package-1:/watch/package-1:ro
      - ./packages/package-2:/watch/package-2:ro

  esm.sh:
    image: ghcr.io/esm-dev/esm.sh:latest
    environment:
      - NPM_REGISTRY=http://npm:4873
      - NPM_TOKEN=fake
      - LOG_LEVEL=debug
    ports:
      - '8080:8080'
    volumes:
      - ./docker-storage/esm/esmd:/esmd

  npm:
    image: verdaccio/verdaccio:latest
    ports:
      - '4873:4873'
```

Once the above is running point your ESM modules to `localhost:3000`:

```html
<script type="importmap">
  {
    "react": "https://esm.sh/react",
    "package-1": "http://localhost:3000/package-1"
  }
</script>
<script type="module">
  import Package1 from 'package1'
  // ...
</script>
```
