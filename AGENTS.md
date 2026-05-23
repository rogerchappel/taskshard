# AGENTS.md - taskshard

## Purpose

`taskshard` is a CLI that splits Markdown task plans into safe parallel agent work packets.

## Building

```bash
npm install
npm run build
npm test
bash scripts/validate.sh
```

## Architecture

- Deterministic Markdown parser → shards → orchestration JSON
- No LLM calls, no network, no side effects
- All output is reviewable and deterministic

## Tests

All tests are in `test/`. Use Node's built-in test runner. Fixtures are in `test/fixtures/`.

## Commands

- `plan` — parse Markdown → orchestration JSON
- `write` — generate per-shard assignment files
- `check` — validate orchestration output
- `prompt` — generate agent prompt for a shard
