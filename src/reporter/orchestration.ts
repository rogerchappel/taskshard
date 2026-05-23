import { TaskShard, Conflict, OrchestrationResult } from '../types.js';

/**
 * Compute the merge order for shards using topological sort.
 * Shards with no dependencies go first, then dependents.
 */
export function computeMergeOrder(shards: TaskShard[]): string[] {
  const visited = new Set<string>();
  const order: string[] = [];

  function visit(shardId: string) {
    if (visited.has(shardId)) return;
    visited.add(shardId);

    const shard = shards.find(s => s.id === shardId);
    if (!shard) return;

    for (const dep of shard.dependsOnShards) {
      visit(dep);
    }
    order.push(shardId);
  }

  for (const shard of shards) {
    visit(shard.id);
  }

  return order;
}

/**
 * Build the full orchestration result from shards and conflicts.
 */
export function buildOrchestration(
  shards: TaskShard[],
  conflicts: Conflict[],
  sourceFile: string,
  version: string
): OrchestrationResult {
  const mergeOrder = computeMergeOrder(shards);

  const parallelizable = shards.filter(s => s.canRunInParallel).length;
  const serial = shards.filter(s => !s.canRunInParallel).length;
  const totalTasks = shards.reduce((sum, s) => sum + s.tasks.length, 0);

  return {
    version,
    generatedAt: new Date().toISOString(),
    sourceFile,
    shards: shards.map(shard => ({
      ...shard,
      agentPrompt: generateShardPrompt(shard),
    })),
    conflicts,
    mergeOrder,
    summary: {
      totalTasks,
      totalShards: shards.length,
      parallelizableShards: parallelizable,
      serialShards: serial,
      conflictCount: conflicts.length,
    },
  };
}

/**
 * Generate an agent prompt for a specific shard.
 */
function generateShardPrompt(shard: TaskShard): string {
  const taskList = shard.tasks
    .filter(t => !t.checked)
    .map(t => `- [ ] ${t.title}${t.files.length > 0 ? ` [files: ${t.files.join(', ')}]` : ''}${t.verification ? ` [verify: ${t.verification}]` : ''}`)
    .join('\n');

  return `# Assignment: ${shard.title}

## Shard ID
${shard.id}

## Description
${shard.description}

## Tasks
${taskList || 'All tasks in this shard are completed.'}

## Files You May Touch
${shard.filesTouched.length > 0 ? shard.filesTouched.map(f => `- \`${f}\``).join('\n') : '- No specific files assigned'}

## Dependencies
${shard.dependsOnShards.length > 0
  ? `Complete these shards first: ${shard.dependsOnShards.join(', ')}`
  : 'No dependencies. This shard can start immediately.'}

${shard.conflicts.length > 0 ? `\n## Warnings\n${shard.conflicts.map(c => `- **${c.severity.toUpperCase()}**: ${c.details}`).join('\n')}` : ''}

${shard.canRunInParallel
  ? '✅ This shard can run in parallel with other independent shards.'
  : '⏳ This shard must wait for its dependencies to complete.'}
`;
}
