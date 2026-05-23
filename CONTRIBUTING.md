# Contributing to taskshard

Thanks for wanting to contribute! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/rogerchappel/taskshard.git
cd taskshard
npm install
```

## Running Tests

```bash
npm test          # unit tests
npm run check     # TypeScript type check
npm run build     # compile to dist/
bash scripts/validate.sh  # full validation
```

## Commit Messages

We use descriptive, imperative-style commit messages:

```
feat: add conflict detection for file overlaps
fix: strip tags from task titles correctly
docs: add ORCHESTRATION.md with schema reference
test: add fixture for heavy dependency chains
```

## Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-change`)
3. Make your changes with tests
4. Ensure `npm test` and `npm run check` pass
5. Submit a PR with a clear description

## Code Style

- TypeScript strict mode
- ES modules (Node16)
- No external runtime dependencies beyond `commander`
- Tests use Node's built-in test runner

## Architecture

```
src/
  index.ts          # Entry point
  cli.ts            # Commander setup
  types.ts          # Shared TypeScript types
  parser/           # Markdown parsing
  sharder/          # Task grouping logic
  conflict/         # Conflict detection
  reporter/         # Orchestration output
  commands/         # CLI command handlers
test/
  fixtures/         # Example Markdown task files
  *.test.ts         # Unit tests
```

## Design Principles

1. **Deterministic** — same input always produces same output
2. **Local-first** — no network calls, no LLM dependencies
3. **Transparent** — conflict warnings are clear and actionable
4. **Composable** — each command can pipe into the next
5. **Testable** — fixture-backed tests for every parser case

## Reporting Issues

Open an issue on GitHub with:
- The Markdown file that caused the issue
- Expected vs actual behavior
- taskshard version (`taskshard --version`)

## License

By contributing, you agree your work is shared under the MIT license.
