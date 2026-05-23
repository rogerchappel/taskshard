import * as fs from 'fs';
import type { OrchestrationResult, Conflict } from '../types.js';

interface CheckOptions {
  failOn?: string;
  json?: boolean;
}

export function checkCommand(file: string, opts: CheckOptions) {
  const resolvedPath = file.startsWith('/') ? file : require.resolve(file);
  if (!fs.existsSync(file)) {
    process.stderr.write(`Error: file not found: ${file}\n`);
    process.exit(1);
  }

  let result: OrchestrationResult;
  try {
    const content = fs.readFileSync(file, 'utf-8');
    result = JSON.parse(content) as OrchestrationResult;
  } catch (e) {
    process.stderr.write(`Error: failed to parse orchestration JSON: ${e instanceof Error ? e.message : 'unknown error'}\n`);
    process.exit(1);
  }

  const failOn = opts.failOn || 'conflicts';
  const relevantConflicts = result.conflicts.filter((c: Conflict) => {
    if (failOn === 'conflicts') return true;
    if (failOn === 'missing-deps') return c.type === 'orphaned-dependency' || c.type === 'dependency-missing';
    return true;
  });

  const issues: string[] = [];

  if (relevantConflicts.length > 0) {
    issues.push(`Found ${relevantConflicts.length} conflict(s):`);
    for (const c of relevantConflicts) {
      issues.push(`  [${c.severity.toUpperCase()}] ${c.type}: ${c.details}`);
    }
  }

  // Check for shards with no tasks
  const emptyShards = result.shards.filter(s => s.tasks.length === 0);
  if (emptyShards.length > 0) {
    issues.push(`Found ${emptyShards.length} empty shard(s): ${emptyShards.map(s => s.id).join(', ')}`);
  }

  if (opts.json) {
    const output = {
      file,
      valid: issues.length === 0,
      issues,
      summary: result.summary,
    };
    process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  } else {
    if (issues.length > 0) {
      process.stdout.write(issues.join('\n') + '\n');
    } else {
      process.stdout.write(`✅ ${result.shards.length} shards, ${result.summary.totalTasks} tasks, no conflicts\n`);
    }
  }

  if (relevantConflicts.some(c => c.severity === 'error')) {
    process.exit(2);
  }
}
