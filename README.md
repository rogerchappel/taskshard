# taskshard 🔧

> Split Markdown task plans into safe parallel agent work packets. The traffic controller for repo swarms. 🚦

**taskshard** reads a Markdown task list (`docs/TASKS.md`) and emits deterministic shard files plus an orchestration JSON that can be reviewed, committed, and handed to agents for parallel work.

## Why?

Agentic development often fails at the seams: two agents edit the same file, prerequisites are unclear, and final integration has no checklist. `taskshard` is a deterministic, local-first CLI that converts Markdown plans into reviewable multi-agent work packets — with ownership boundaries, dependency tracking, and conflict detection.

No LLM calls. No network. Just predictable parsing and useful output.

## Install

```bash
npm install -g taskshard
# or
npx taskshard plan docs/TASKS.md
```

## Quick Start

```bash
# Parse a task list and emit orchestration JSON
taskshard plan docs/TASKS.md

# Save orchestration output
taskshard plan docs/TASKS.md -o docs/orchestration.json

# Write individual shard assignment files
taskshard write docs/TASKS.md --out .taskshards/

# Check orchestration for conflicts
taskshard check docs/orchestration.json

# Generate agent prompt for a specific shard
taskshard prompt docs/orchestration.json --shard shard-2 --system
```

## How It Works

### 1. Tag Your Tasks

Write tasks in Markdown with metadata tags:

```markdown
## API Layer

- [ ] Set up Express server @alice [files: src/server.ts] [verify: npm test]
- [ ] Add auth middleware @bob [files: src/middleware/auth.ts] [depends-on: task-1-set-up-express-server]
- [x] Create package.json
```

Supported tags:
- `@username` or `[owner: name]` — task owner
- `[files: glob1, glob2]` — files this task may touch
- `[depends-on: task-id]` — task dependencies
- `[verify: command]` — verification step
- `[priority: high|medium|low]` — priority level

### 2. Plan

```bash
taskshard plan docs/TASKS.md -o orchestration.json
```

Outputs a JSON with:
- Shards grouped by heading
- Dependencies resolved across shards
- File overlap warnings
- Generated agent prompts
- Merge order (topological sort)

### 3. Check

```bash
taskshard check orchestration.json
# Or fail on errors only
taskshard check orchestration.json --fail-on conflicts
```

### 4. Assign

```bash
taskshard write docs/TASKS.md --out .taskshards/
# Generates .taskshards/shard-1.md, shard-2.md, etc.
```

### 5. Generate Prompts

```bash
taskshard prompt orchestration.json --shard shard-2 --system
# Outputs a full agent assignment prompt
```

## CLI Reference

| Command | Description |
|---|---|
| `plan <file>` | Parse Markdown → orchestration JSON |
| `write <file> --out <dir>` | Write shard assignment files |
| `check <file>` | Validate orchestration JSON |
| `prompt <file> --shard <id>` | Generate agent prompt for a shard |
| `smoke` | Run smoke tests against fixtures |

## Orchestration JSON Schema

Full schema documented in [docs/ORCHESTRATION.md](docs/ORCHESTRATION.md).

Key fields:
- `shards[]` — groups of tasks with ownership, files, and dependencies
- `conflicts[]` — detected issues (file overlap, missing deps)
- `mergeOrder` — recommended merge sequence
- `summary` — stats (total tasks, parallel vs serial shards, conflict count)

## Examples

See `test/fixtures/` for example Markdown task files:

- `simple-tasks.md` — basic task list with owners and file tags
- `conflicting-tasks.md` — demonstrates file overlap detection
- `dependency-tasks.md` — heavy cross-shard dependency chains
- `malformed-tasks.md` — edge cases and partial markup

## Safety Boundaries

Task shards are planning artifacts, not permission grants. Review generated file ownership, dependency order, and verification commands before handing shards to agents, and keep destructive operations, credentials, production deploys, and broad refactors behind explicit human approval.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Quick start:

```bash
git clone https://github.com/rogerchappel/taskshard.git
cd taskshard
npm install
npm test
npm run build
```

## License

MIT — see [LICENSE](LICENSE).

## Author

Built by [Roger Chappel](https://github.com/rogerchappel) as part of an OSS factory build. Because agents should have safe boundaries.

## Development

Run the same checks locally before opening a PR:

- `npm run check` - tsc --noEmit
- `npm run lint` - eslint src/ test/ --ext .ts
- `npm run build` - tsc
- `npm test` - node --test dist/test/*.test.js
- `npm run smoke` - bash scripts/smoke.sh
- `npm run package:smoke` - verify the npm tarball file list
- `npm run release:check` - npm run check && npm run build && npm test && npm run smoke && npm run package:smoke
