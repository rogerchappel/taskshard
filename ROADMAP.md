# ROADMAP.md - taskshard

## v0.1.0 (Current)

- MVP CLI with plan/write/check/prompt/smoke commands
- Markdown parser with tag extraction
- Heading-based shard grouping
- Cross-shard dependency resolution
- Conflict detection (file overlap, orphaned deps)
- Agent prompt generation
- Topological merge order
- 30 unit tests, 4 fixture files

## v0.2.0 (Planned)

- YAML output format support
- Diff-aware re-planning (only regenerate changed shards)
- Merge-order visualization
- Custom shard grouping strategies beyond headings
- Integration with openclaw for direct agent dispatch

## v1.0.0 (Future)

- Plugin system for custom parsers
- Web UI for visual task orchestration
- GitHub Actions integration
- Slack/Discord notification on shard completion
- Task progress tracking and completion reporting

## Ideas

- Priority-based scheduling within shards
- Skill-based agent routing
- Automatic worktree creation per shard
- Diff patch generation per shard for review
