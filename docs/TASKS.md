# TASKS.md - taskshard

## CLI Core

- [x] Set up project with TypeScript, Commander.js, and Node test runner [owner: forge] [files: package.json, tsconfig.json] [verify: npm install]
- [x] Implement main CLI entry point with Commander [owner: forge] [files: src/index.ts, src/cli.ts] [verify: node dist/index.js --help]
- [x] Add version export and semantic versioning support [owner: forge] [files: src/version.ts]
- [x] Implement `plan` command [files: src/commands/plan.ts] [verify: taskshard plan test/fixtures/simple-tasks.md]
- [x] Implement `write` command [files: src/commands/write.ts] [verify: taskshard write test/fixtures/simple-tasks.md --out .tmp]
- [x] Implement `check` command [files: src/commands/check.ts] [verify: taskshard check docs/orchestration.json]
- [x] Implement `prompt` command [files: src/commands/prompt.ts] [verify: taskshard prompt docs/orchestration.json --shard shard-1]
- [x] Implement `smoke` command [files: src/commands/smoke.ts] [verify: taskshard smoke]

## Parser

- [x] Build Markdown task parser with heading detection [files: src/parser/markdown.ts] [verify: unit tests pass]
- [x] Extract owner tags (@name and [owner: name]) [files: src/parser/markdown.ts]
- [x] Extract dependency tags [depends-on: ...] [files: src/parser/markdown.ts]
- [x] Extract file globs [files: ...] [files: src/parser/markdown.ts]
- [x] Extract verification notes [verify: ...] [files: src/parser/markdown.ts]
- [x] Extract priority tags [priority: high|medium|low] [files: src/parser/markdown.ts]
- [x] Handle malformed input gracefully [files: src/parser/markdown.ts]

## Sharder

- [x] Group tasks by heading into shards [files: src/sharder/grouping.ts] [verify: unit tests pass]
- [x] Resolve cross-shard dependency graph [files: src/sharder/grouping.ts]
- [x] Compute merge order via topological sort [files: src/reporter/orchestration.ts]

## Conflict Detection

- [x] Detect file overlap between shards [files: src/conflict/detection.ts] [verify: fixture conflicting-tasks.md]
- [x] Detect orphaned dependencies [files: src/conflict/detection.ts]
- [x] Detect missing dependency references [files: src/conflict/detection.ts]
- [x] Attach conflicts to shard reports [files: src/conflict/detection.ts]

## Reporter

- [x] Build orchestration JSON output [files: src/reporter/orchestration.ts] [verify: taskshard plan outputs valid JSON]
- [x] Generate agent prompt templates per shard [files: src/reporter/orchestration.ts]
- [x] Compute parallel/serial shard counts [files: src/reporter/orchestration.ts]

## Orchestration JSON Schema

- [x] Define OrchestrationResult type with version, generatedAt, sourceFile [files: src/types.ts]
- [x] Define TaskShard type with tasks, conflicts, agentPrompt [files: src/types.ts]
- [x] Define Conflict type with type, severity, details [files: src/types.ts]
- [x] Define summary statistics in result [files: src/types.ts]

## Tests

- [x] Parser unit tests for heading parsing [files: test/cli.test.ts] [verify: npm test]
- [x] Parser unit tests for checkbox parsing [files: test/cli.test.ts]
- [x] Parser tests for tag extraction [files: test/cli.test.ts]
- [x] Shard grouping tests [files: test/sharding.test.ts] [verify: npm test]
- [x] Dependency resolution tests [files: test/sharding.test.ts]
- [x] Conflict detection tests [files: test/sharding.test.ts]
- [x] Merge order tests [files: test/sharding.test.ts]
- [x] Orchestration output tests [files: test/sharding.test.ts]

## Fixtures

- [x] Create simple-tasks.md fixture [files: test/fixtures/simple-tasks.md]
- [x] Create conflicting-tasks.md fixture [files: test/fixtures/conflicting-tasks.md]
- [x] Create dependency-tasks.md fixture [files: test/fixtures/dependency-tasks.md]
- [x] Create malformed-tasks.md fixture [files: test/fixtures/malformed-tasks.md]

## Documentation

- [x] Write README with personality, examples, and CLI reference [files: README.md]
- [x] Write CONTRIBUTING.md [files: CONTRIBUTING.md]
- [x] Write CODE_OF_CONDUCT.md [files: CODE_OF_CONDUCT.md]
- [x] Write LICENSE (MIT) [files: LICENSE]
- [x] Write SECURITY.md [files: SECURITY.md]
- [x] Write CHANGELOG.md [files: CHANGELOG.md]
- [x] Copy PRD.md to docs/ [files: docs/PRD.md]
- [x] Write TASKS.md in docs/ [files: docs/TASKS.md]
- [x] Write ORCHESTRATION.md explaining the orchestration format [files: docs/ORCHESTRATION.md]
- [x] Create orchestration.json example output [files: docs/orchestration.json]

## Scripts

- [x] Create smoke test script [files: scripts/smoke.sh]
- [x] Create validate.sh script [files: scripts/validate.sh]
- [x] Create .npmignore [files: .npmignore]
- [x] Create .gitignore [files: .gitignore]
