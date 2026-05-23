# ORCHESTRATION.md - taskshard

## What is Orchestration JSON?

When you run `taskshard plan <tasks.md>`, it parses the Markdown task list and emits an **orchestration JSON** — a structured plan for parallel agent work.

The output captures:
- Shard boundaries (groups of related tasks)
- Dependency graph between shards
- File overlap warnings
- Generated agent prompts
- Merge order

## Schema

```json
{
  "version": "0.1.0",
  "generatedAt": "2026-05-23T08:00:00.000Z",
  "sourceFile": "/abs/path/to/TASKS.md",
  "shards": [
    {
      "id": "shard-1",
      "title": "API Layer",
      "description": "Shard containing 4 tasks (3 remaining)...",
      "tasks": [
        {
          "id": "task-1-set-up-express-server-boilerplate",
          "title": "Set up Express server boilerplate",
          "heading": "API Layer",
          "checked": false,
          "owner": "alice",
          "dependsOn": [],
          "files": ["src/server.ts"],
          "verification": "npm test",
          "priority": null
        }
      ],
      "filesTouched": ["src/server.ts"],
      "dependsOnShards": [],
      "canRunInParallel": true,
      "estimatedOrder": 1,
      "conflicts": [],
      "agentPrompt": "# Assignment: API Layer\n..."
    }
  ],
  "conflicts": [
    {
      "type": "file-overlap",
      "shard1": "shard-1",
      "shard2": "shard-2",
      "details": "Both shards touch files: src/utils.ts",
      "severity": "warning"
    }
  ],
  "mergeOrder": ["shard-1", "shard-2", "shard-3"],
  "summary": {
    "totalTasks": 12,
    "totalShards": 3,
    "parallelizableShards": 2,
    "serialShards": 1,
    "conflictCount": 1
  }
}
```

## Key Fields

### Shards
Each shard groups tasks under a common heading. Shards are the unit of parallel assignment.

### `dependsOnShards`
List of shard IDs that must complete before this one can start. Populated automatically by resolving `depends-on` tags across shards.

### `canRunInParallel`
True when the shard has no cross-shard dependencies.

### `conflicts`
Detected issues:
- **file-overlap** (warning): Two shards touch the same file
- **orphaned-dependency** (error): A task depends on a non-existent task ID
- **dependency-missing** (error): A dependency reference can't be resolved

### `mergeOrder`
Topological sort of shards. Shards with no dependencies come first; dependents follow.

## Usage

```bash
# Generate orchestration
taskshard plan docs/TASKS.md -o docs/orchestration.json

# Validate it
taskshard check docs/orchestration.json

# Get prompt for a specific shard
taskshard prompt docs/orchestration.json --shard shard-2

# Write individual assignment files
taskshard write docs/TASKS.md --out .taskshards/
```
