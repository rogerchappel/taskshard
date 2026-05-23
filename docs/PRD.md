# PRD: taskshard

Status: in-progress
Decision: selected for factory build on 2026-05-23
Decision: build now
Factory run: 2026-05-17 AM

## Pitch

`taskshard` splits a Markdown task plan into safe parallel agent work packets: ownership, dependencies, files touched, verification gates, and merge order. It is a traffic controller for repo swarms. 🚦

## Why It Matters

Agentic development often fails at the seams: two agents edit the same file, prerequisites are unclear, and final integration has no checklist. Many OSS repos now carry `docs/TASKS.md` and orchestration notes, but humans still manually translate them into sub-agent assignments.

`taskshard` reads a Markdown task list and emits deterministic shard files plus an orchestration JSON that can be reviewed, committed, and handed to agents.

## Qualification

### Pub Test

"Turn TASKS.md into parallel-safe agent assignments with ownership boundaries and verification gates."

### Source / Inspiration

Inspired by StackForge orchestration docs, Roger's twice-daily OSS factory process, and common multi-agent merge-conflict pain. Original implementation and naming.

### V1 Scope

- TypeScript CLI package.
- Parse headings, checkbox tasks, owner tags, dependency tags, file globs, and verification notes from Markdown.
- `taskshard plan docs/TASKS.md` emits `docs/orchestration.json`.
- `taskshard write docs/TASKS.md --out .taskshards/` writes one Markdown assignment per shard.
- Conflict detection for overlapping file globs and missing dependencies.
- Merge-order recommendation.
- Agent prompt generation per shard.
- Fixture-backed tests for simple, conflicting, dependency-heavy, and malformed task files.

## Out of Scope

- Calling LLMs.
- Creating branches, worktrees, or PRs in V1.
- Perfect natural-language task understanding.
- Replacing human review of assignments.

## CLI Sketch

```bash
taskshard plan docs/TASKS.md --format json
taskshard write docs/TASKS.md --out .taskshards
taskshard check docs/orchestration.json --fail-on conflicts
taskshard prompt docs/orchestration.json --shard cli-core
```

## Verification

Run `npm test`, `npm run check`, `npm run build`, `npm run smoke`, `bash scripts/validate.sh`, and a real CLI smoke against fixture `TASKS.md` files.

## Agent Prompt

Build `taskshard` as a deterministic local-first CLI that converts Markdown plans into reviewable multi-agent work packets. Prioritize predictable parsing, useful conflict warnings, and practical generated prompts.
