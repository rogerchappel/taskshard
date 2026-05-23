import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { groupByHeading, resolveShardDependencies } from '../src/sharder/grouping.js';
import { detectConflicts, attachConflictsToShards } from '../src/conflict/detection.js';
import { computeMergeOrder, buildOrchestration } from '../src/reporter/orchestration.js';
import type { TaskItem, TaskShard, Conflict } from '../src/types.js';

describe('groupByHeading', () => {
  it('groups tasks by their heading', () => {
    const tasks: TaskItem[] = [
      { id: 't1', title: 'A', heading: 'Phase 1', headingLevel: 2, description: '', checked: false, owner: null, dependsOn: [], files: [], verification: null, priority: null, raw: '' },
      { id: 't2', title: 'B', heading: 'Phase 1', headingLevel: 2, description: '', checked: false, owner: null, dependsOn: [], files: [], verification: null, priority: null, raw: '' },
      { id: 't3', title: 'C', heading: 'Phase 2', headingLevel: 2, description: '', checked: false, owner: null, dependsOn: [], files: [], verification: null, priority: null, raw: '' },
    ];

    const shards = groupByHeading(tasks);
    assert.strictEqual(shards.length, 2);
    assert.strictEqual(shards[0].tasks.length, 2);
    assert.strictEqual(shards[1].tasks.length, 1);
    assert.strictEqual(shards[0].title, 'Phase 1');
    assert.strictEqual(shards[1].title, 'Phase 2');
  });

  it('assigns sequential shard IDs', () => {
    const tasks: TaskItem[] = [
      { id: 't1', title: 'A', heading: 'H1', headingLevel: 2, description: '', checked: false, owner: null, dependsOn: [], files: [], verification: null, priority: null, raw: '' },
      { id: 't2', title: 'B', heading: 'H2', headingLevel: 2, description: '', checked: false, owner: null, dependsOn: [], files: [], verification: null, priority: null, raw: '' },
    ];

    const shards = groupByHeading(tasks);
    assert.strictEqual(shards[0].id, 'shard-1');
    assert.strictEqual(shards[1].id, 'shard-2');
  });

  it('marks shards as parallelizable by default', () => {
    const tasks: TaskItem[] = [
      { id: 't1', title: 'A', heading: 'H1', headingLevel: 2, description: '', checked: false, owner: null, dependsOn: [], files: [], verification: null, priority: null, raw: '' },
    ];

    const shards = groupByHeading(tasks);
    assert.strictEqual(shards[0].canRunInParallel, true);
  });
});

describe('resolveShardDependencies', () => {
  it('resolves cross-shard dependencies', () => {
    const tasks: TaskItem[] = [
      { id: 't1', title: 'A', heading: 'H1', headingLevel: 2, description: '', checked: false, owner: null, dependsOn: [], files: [], verification: null, priority: null, raw: '' },
      { id: 't2', title: 'B', heading: 'H2', headingLevel: 2, description: '', checked: false, owner: null, dependsOn: ['t1'], files: [], verification: null, priority: null, raw: '' },
    ];

    let shards = groupByHeading(tasks);
    shards = resolveShardDependencies(shards, tasks);

    assert.deepStrictEqual(shards[1].dependsOnShards, ['shard-1']);
    assert.strictEqual(shards[1].canRunInParallel, false);
    assert.strictEqual(shards[0].canRunInParallel, true);
  });
});

describe('detectConflicts', () => {
  it('detects file overlaps', () => {
    const shards: TaskShard[] = [
      { id: 's1', title: 'A', description: '', tasks: [], filesTouched: ['src/a.ts', 'src/b.ts'], dependsOnShards: [], canRunInParallel: true, estimatedOrder: 1, conflicts: [], agentPrompt: '' },
      { id: 's2', title: 'B', description: '', tasks: [], filesTouched: ['src/b.ts', 'src/c.ts'], dependsOnShards: [], canRunInParallel: true, estimatedOrder: 2, conflicts: [], agentPrompt: '' },
    ];

    const conflicts = detectConflicts(shards, new Set(['t1']));
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].type, 'file-overlap');
    assert.strictEqual(conflicts[0].severity, 'warning');
  });

  it('detects orphaned dependencies', () => {
    const tasks: TaskItem[] = [
      { id: 't1', title: 'A', heading: 'H1', headingLevel: 2, description: '', checked: false, owner: null, dependsOn: ['nonexistent'], files: [], verification: null, priority: null, raw: '' },
    ];

    const shards = groupByHeading(tasks);
    const conflicts = detectConflicts(shards, new Set(['t1']));
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].type, 'orphaned-dependency');
    assert.strictEqual(conflicts[0].severity, 'error');
  });

  it('finds no conflicts when there are none', () => {
    const shards: TaskShard[] = [
      { id: 's1', title: 'A', description: '', tasks: [], filesTouched: ['src/a.ts'], dependsOnShards: [], canRunInParallel: true, estimatedOrder: 1, conflicts: [], agentPrompt: '' },
      { id: 's2', title: 'B', description: '', tasks: [], filesTouched: ['src/b.ts'], dependsOnShards: [], canRunInParallel: true, estimatedOrder: 2, conflicts: [], agentPrompt: '' },
    ];

    const conflicts = detectConflicts(shards, new Set());
    assert.strictEqual(conflicts.length, 0);
  });
});

describe('computeMergeOrder', () => {
  it('returns linear order for no dependencies', () => {
    const shards: TaskShard[] = [
      { id: 's1', title: 'A', description: '', tasks: [], filesTouched: [], dependsOnShards: [], canRunInParallel: true, estimatedOrder: 1, conflicts: [], agentPrompt: '' },
      { id: 's2', title: 'B', description: '', tasks: [], filesTouched: [], dependsOnShards: [], canRunInParallel: true, estimatedOrder: 2, conflicts: [], agentPrompt: '' },
    ];

    const order = computeMergeOrder(shards);
    assert.deepStrictEqual(order, ['s1', 's2']);
  });

  it('respects dependency order', () => {
    const shards: TaskShard[] = [
      { id: 's1', title: 'A', description: '', tasks: [], filesTouched: [], dependsOnShards: [], canRunInParallel: true, estimatedOrder: 1, conflicts: [], agentPrompt: '' },
      { id: 's2', title: 'B', description: '', tasks: [], filesTouched: [], dependsOnShards: ['s1'], canRunInParallel: false, estimatedOrder: 2, conflicts: [], agentPrompt: '' },
      { id: 's3', title: 'C', description: '', tasks: [], filesTouched: [], dependsOnShards: ['s2'], canRunInParallel: false, estimatedOrder: 3, conflicts: [], agentPrompt: '' },
    ];

    const order = computeMergeOrder(shards);
    const s1Idx = order.indexOf('s1');
    const s2Idx = order.indexOf('s2');
    const s3Idx = order.indexOf('s3');
    assert.ok(s1Idx < s2Idx);
    assert.ok(s2Idx < s3Idx);
  });
});

describe('buildOrchestration', () => {
  it('builds a complete orchestration result', () => {
    const shards: TaskShard[] = [
      { id: 's1', title: 'A', description: '', tasks: [{ id: 't1', title: 'Do stuff', heading: 'A', headingLevel: 2, description: '', checked: false, owner: 'alice', dependsOn: [], files: ['src/a.ts'], verification: null, priority: null, raw: '' }], filesTouched: ['src/a.ts'], dependsOnShards: [], canRunInParallel: true, estimatedOrder: 1, conflicts: [], agentPrompt: '' },
    ];

    const result = buildOrchestration(shards, [], 'test.md', '1.0.0');

    assert.strictEqual(result.version, '1.0.0');
    assert.strictEqual(result.sourceFile, 'test.md');
    assert.strictEqual(result.shards.length, 1);
    assert.strictEqual(result.summary.totalTasks, 1);
    assert.strictEqual(result.summary.totalShards, 1);
    assert.ok(result.generatedAt);
    assert.ok(result.shards[0].agentPrompt.length > 0);
  });
});

describe('attachConflictsToShards', () => {
  it('attaches conflicts to relevant shards', () => {
    const shards: TaskShard[] = [
      { id: 's1', title: 'A', description: '', tasks: [], filesTouched: [], dependsOnShards: [], canRunInParallel: true, estimatedOrder: 1, conflicts: [], agentPrompt: '' },
      { id: 's2', title: 'B', description: '', tasks: [], filesTouched: [], dependsOnShards: [], canRunInParallel: true, estimatedOrder: 2, conflicts: [], agentPrompt: '' },
    ];
    const conflicts: Conflict[] = [
      { type: 'file-overlap', shard1: 's1', shard2: 's2', details: 'overlap', severity: 'warning' },
    ];

    attachConflictsToShards(shards, conflicts);
    assert.strictEqual(shards[0].conflicts.length, 1);
    assert.strictEqual(shards[1].conflicts.length, 1);
  });
});
