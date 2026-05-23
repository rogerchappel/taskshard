# taskshard Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of taskshard CLI
- `plan` command: parse Markdown task lists into orchestration JSON
- `write` command: generate per-shard assignment files
- `check` command: validate orchestration JSON for conflicts and issues
- `prompt` command: generate agent prompts for specific shards
- `smoke` command: run smoke tests against fixture files
- Markdown parser supporting @owner, [files:], [depends-on:], [verify:], [priority:] tags
- Heading-based shard grouping
- Cross-shard dependency resolution
- File overlap conflict detection
- Orphaned dependency detection
- Topological merge-order computation
- Agent prompt generation per shard
- 30 unit tests across parser, sharder, conflict, and reporter modules
- 4 fixture task files for testing edge cases
- smoke.sh and validate.sh scripts
- Full documentation: README, CONTRIBUTING, CODE_OF_CONDUCT, ORCHESTRATION.md
