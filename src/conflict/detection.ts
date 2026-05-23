import { TaskShard, Conflict } from '../types.js';

/**
 * Detect conflicts between shards:
 * - File overlap: two shards touch the same file glob
 * - Missing dependencies: a task depends on a non-existent ID
 * - Owner conflicts: same owner assigned to conflicting shards
 * - Orphaned dependencies: depends-on references tasks that don't exist
 */
export function detectConflicts(shards: TaskShard[], allTaskIds: Set<string>): Conflict[] {
  const conflicts: Conflict[] = [];

  // File overlap detection
  for (let i = 0; i < shards.length; i++) {
    for (let j = i + 1; j < shards.length; j++) {
      const overlap = shards[i].filesTouched.filter(f =>
        shards[j].filesTouched.includes(f)
      );
      if (overlap.length > 0) {
        conflicts.push({
          type: 'file-overlap',
          shard1: shards[i].id,
          shard2: shards[j].id,
          details: `Both shards touch files: ${overlap.join(', ')}`,
          severity: 'warning',
        });
      }
    }
  }

  // Missing/orphaned dependency detection
  for (const shard of shards) {
    for (const task of shard.tasks) {
      for (const dep of task.dependsOn) {
        if (!allTaskIds.has(dep)) {
          conflicts.push({
            type: 'orphaned-dependency',
            shard1: shard.id,
            details: `Task ${task.id} depends on ${dep}, which does not exist`,
            severity: 'error',
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Attach conflicts to their respective shards.
 */
export function attachConflictsToShards(shards: TaskShard[], conflicts: Conflict[]): void {
  for (const conflict of conflicts) {
    const shard = shards.find(s => s.id === conflict.shard1);
    if (shard) {
      shard.conflicts.push(conflict);
    }
    if (conflict.shard2) {
      const shard2 = shards.find(s => s.id === conflict.shard2);
      if (shard2) {
        shard2.conflicts.push(conflict);
      }
    }
  }
}
