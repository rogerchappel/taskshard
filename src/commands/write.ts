import * as fs from 'fs';
import * as path from 'path';
import { parseFile } from '../parser/index.js';
import { groupByHeading, resolveShardDependencies } from '../sharder/grouping.js';
import { detectConflicts, attachConflictsToShards } from '../conflict/index.js';
import type { WriteCommandOptions } from './types.js';

export function writeCommand(file: string, opts: WriteCommandOptions) {
  const resolvedPath = path.resolve(file);
  if (!fs.existsSync(resolvedPath)) {
    process.stderr.write(`Error: file not found: ${resolvedPath}\n`);
    process.exit(1);
  }

  const tasks = parseFile(resolvedPath);
  const allTaskIds = new Set(tasks.map(t => t.id));
  let shards = groupByHeading(tasks);
  shards = resolveShardDependencies(shards, tasks);
  const conflicts = detectConflicts(shards, allTaskIds);
  attachConflictsToShards(shards, conflicts);

  const outDir = path.resolve(opts.out);
  fs.mkdirSync(outDir, { recursive: true });

  for (const shard of shards) {
    const content = shard.agentPrompt;
    const ext = opts.format === 'json' ? 'json' : 'md';
    const filename = `${opts.prefix}-${shard.id}.${ext}`;
    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, content + '\n', 'utf-8');
  }

  // Also write the orchestration summary
  const summaryPath = path.join(outDir, 'orchestration-summary.json');
  const summary = {
    totalShards: shards.length,
    parallelizable: shards.filter(s => s.canRunInParallel).length,
    conflicts: conflicts.length,
    shards: shards.map(s => ({
      id: s.id,
      title: s.title,
      taskCount: s.tasks.length,
      dependsOn: s.dependsOnShards,
      canRunInParallel: s.canRunInParallel,
    })),
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf-8');

  process.stdout.write(`Wrote ${shards.length} shard files + summary to ${outDir}\n`);
}
