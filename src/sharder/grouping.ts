import { TaskItem, TaskShard, Conflict } from '../types.js';

/**
 * Group tasks into shards based on heading hierarchy.
 * Each H2/H3 heading or group of related tasks becomes a shard.
 */
export function groupByHeading(tasks: TaskItem[]): TaskShard[] {
  const headingGroups = new Map<string, TaskItem[]>();
  const headingOrder: string[] = [];

  for (const task of tasks) {
    const key = task.heading;
    if (!headingGroups.has(key)) {
      headingGroups.set(key, []);
      headingOrder.push(key);
    }
    headingGroups.get(key)!.push(task);
  }

  const shards: TaskShard[] = [];
  for (let i = 0; i < headingOrder.length; i++) {
    const heading = headingOrder[i];
    const groupTasks = headingGroups.get(heading)!;
    const shardId = `shard-${i + 1}`;

    shards.push({
      id: shardId,
      title: heading,
      description: generateShardDescription(groupTasks),
      tasks: groupTasks,
      filesTouched: collectFiles(groupTasks),
      dependsOnShards: [],
      canRunInParallel: true,
      estimatedOrder: i + 1,
      conflicts: [],
      agentPrompt: '',
    });
  }

  return shards;
}

/**
 * Resolve cross-shard dependencies and update shard dependency graph.
 */
export function resolveShardDependencies(shards: TaskShard[], allTasks: TaskItem[]): TaskShard[] {
  const taskIdToShard = new Map<string, string>();
  for (const shard of shards) {
    for (const task of shard.tasks) {
      taskIdToShard.set(task.id, shard.id);
    }
  }

  for (const shard of shards) {
    const depShards = new Set<string>();
    for (const task of shard.tasks) {
      for (const dep of task.dependsOn) {
        const depShardId = taskIdToShard.get(dep);
        if (depShardId && depShardId !== shard.id) {
          depShards.add(depShardId);
        }
      }
    }
    shard.dependsOnShards = Array.from(depShards).sort();
    shard.canRunInParallel = depShards.size === 0;
  }

  return shards;
}

/**
 * Collect all file globs touched by a group of tasks.
 */
function collectFiles(tasks: TaskItem[]): string[] {
  const fileSet = new Set<string>();
  for (const task of tasks) {
    for (const f of task.files) {
      fileSet.add(f);
    }
  }
  return Array.from(fileSet).sort();
}

/**
 * Generate a human-readable description for a shard.
 */
function generateShardDescription(tasks: TaskItem[]): string {
  const unchecked = tasks.filter(t => !t.checked).length;
  const total = tasks.length;
  return `Shard containing ${total} task${total !== 1 ? 's' : ''} (${unchecked} remaining) with focus: ${tasks.map(t => t.title).slice(0, 3).join(', ')}${tasks.length > 3 ? '...' : ''}`;
}
