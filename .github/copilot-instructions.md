# esm.dev Copilot Instructions

## Project Overview

This is a CLI tool for local development with esm.sh and npm packages. It watches local packages, automatically republishing them to a local Verdaccio registry and invalidating esm.sh cache when changes occur. The system uses Docker Compose to orchestrate a local esm.sh instance and Verdaccio registry.

## Architecture

### Core Components

- **CLI Commands** (`src/commands/`): Clipanion-based commands composed using TypeScript mixins
- **Library Functions** (`src/lib/`): Core business logic for watching, publishing, and serving
- **Queue System** (`src/lib/queue.ts`): Mutex-based serialization with debounced queueing
- **Proxy Server** (`src/lib/server.ts`): HTTP proxy between localhost and esm.sh that queues all requests

### Mixin-Based Command Architecture

Commands inherit from `ESMDevCommand` and compose functionality through mixins in `src/commands/mixins/`:

- `PackagePathSpecific`: Glob-based package path handling with `eachPackagePath()` iterator
- `RegistrySpecific`: Registry URL configuration
- `ESMStorageSpecific`: ESM.sh storage path configuration
- `Watchable`: Adds `--legacy-method` flag for fallback file watching
- `Servable`: Adds `--port` option for HTTP server
- `ESMServed`: Adds `--esm-origin` for proxying

Example: `StartCommand extends Servable(Watchable(ESMServed(ESMDevCommand)))`

## Key Development Patterns

### TypeScript Configuration

- **Module system**: Uses ESNext with `moduleResolution: "nodenext"` and `verbatimModuleSyntax: true`
- **Import extensions**: Always include `.ts` extensions in imports (rewritten to `.js` at compile time via `rewriteRelativeImportExtensions`)
- **Strict mode**: All strict TypeScript checks enabled, including `noUncheckedIndexedAccess`

### File Watching Strategy

Two watch implementations in `src/lib/watch.ts`:

1. **Modern** (default): Uses native `fs.watch` with recursive watching
2. **Legacy** (`--legacy-method`): Hash-based polling for Docker/Vagrant environments

Both respect `.npmignore` (minimatch) or `.gitignore` (gitignore library) via `getWatchIgnorer()`.

### Queue & Concurrency

All async operations use `queue()` from `src/lib/queue.ts` to serialize:

- Package republishing (prevents race conditions)
- HTTP proxy requests (ensures cache invalidation before serving)

The `queuedDebounce()` function combines debouncing with queued execution for file system events.

### Environment-Aware Options

`EnvOption` helper (in `src/commands/options/`) creates CLI options that:

- Use environment variable value if present (e.g., `ESM_STORAGE_PATH`)
- Otherwise mark the option as required
- Enables flexible Docker and local execution

## Development Workflow

### Prerequisites for Testing and Development

**CRITICAL**: Docker containers MUST be running before running tests or development commands:

```bash
npm start    # Start Docker services (esm.sh + Verdaccio)
```

Tests and development commands will fail if containers aren't running. The system requires:

- Verdaccio registry at `http://localhost:4873`
- ESM.sh server at `http://localhost:8080`

### Running Locally

```bash
# Start services (Docker Compose with esm.sh + Verdaccio)
npm start

# Run CLI in development
npm run esm.dev -- <command>

# Stop services
npm stop
```

### Testing

- Uses Vitest (`npm test`)
- Integration tests in `test/esm.dev.test.ts` test both watch methods
- Snapshots stored in `test/__snapshots__/`
- Test packages in `test/packages/` simulate real usage
- **Tests require Docker containers running** (see Prerequisites above)

### Building

```bash
npm run build    # Compiles TypeScript to dist/
npm run clean    # Removes dist/
```

## Common Patterns

### Adding a New Command

1. Create class in `src/commands/` extending `ESMDevCommand` or using mixins
2. Define `static paths = [['command-name']]`
3. Implement `execute()` method
4. Register in `src/cli.ts`

### Working with Package Metadata

Use `getPackageMeta(packagePath)` to extract name, root directory, and private flag from any package path (file or directory).

### Ignoring Files

The watch system automatically respects `.npmignore` (minimatch patterns) or `.gitignore` (gitignore patterns). Priority: `.npmignore` > `.gitignore` > watch everything.

### Template Generation

`MustacheGeneratorCommand` base class (used by `InitCommand`) handles Mustache template rendering from `templates/` directory.

The `init` command workflow:

1. Extends `MustacheGeneratorCommand` which uses `clipanion-generator-command`
2. Reads templates from `templates/init/` (e.g., `docker-compose.yml.mustache`)
3. Renders with Mustache using command options as context (port, esmPort, registryPort, packages)
4. Outputs to specified directory (default: current directory)
5. Template variables interpolated with `{{variable}}` syntax, loops with `{{#array}}...{{/array}}`

Example from `docker-compose.yml.mustache`:

```mustache
{{#packages}}
- {{path}}:/watch/{{basename}}:ro
{{/packages}}
```

Key features:

- File extensions `.mustache` are stripped in output
- No HTML escaping (uses identity escape function)
- Context object from command properties (this.packages, this.port, etc.)

## Docker Integration

- Services defined in `docker-compose.yml`: esm.sh (port 8080) and Verdaccio (port 4873)
- Local storage persisted in `docker-storage/esm/`
- ESM.sh configured to use local Verdaccio via `NPM_REGISTRY` env var
- The `init` command generates docker-compose.yml from templates

## Dependencies of Note

- **clipanion**: CLI framework with type-safe option parsing
- **es-toolkit**: Provides `Mutex` for queue implementation and `debounce`
- **ignore**: Gitignore-compatible file filtering
- **minimatch**: NPM-style glob matching for .npmignore
- **http-proxy**: Proxying requests to esm.sh
- **zx**: Shell scripting utilities (used for temp files)
