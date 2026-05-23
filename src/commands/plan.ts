import * as fs from 'fs';
import * as path from 'path';
import { version } from '../version.js';
import { parseFile } from '../parser/index.js';
import { groupByHeading, resolveShardDependencies } from '../sharder/grouping.js';
import { detectConflicts, attachConflictsToShards } from '../conflict/index.js';
import { buildOrchestration } from '../reporter/index.js';
import type { Options } from './types.js';

export function planCommand(file: string, opts: Options) {
  const resolvedPath = path.resolve(file);
  if (!fs.existsSync(resolvedPath)) {
    process.stderr.write(`Error: file not found: ${resolvedPath}\n`);
    process.exit(1);
  }

  const tasks = parseFile(resolvedPath);
  if (tasks.length === 0) {
    process.stderr.write('Warning: no tasks found in file\n');
  }

  const allTaskIds = new Set(tasks.map(t => t.id));
  let shards = groupByHeading(tasks);
  shards = resolveShardDependencies(shards, tasks);

  const conflicts = opts.conflicts ? detectConflicts(shards, allTaskIds) : [];
  attachConflictsToShards(shards, conflicts);

  const result = buildOrchestration(shards, conflicts, resolvedPath, version);

  if (opts.format === 'yaml') {
    // Simple YAML-like output (no yaml dependency to keep it lightweight)
    process.stdout.write(yamlStringify(result));
  } else {
    const output = JSON.stringify(result, null, 2);
    if (opts.output) {
      const outPath = path.resolve(opts.output);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, output + '\n', 'utf-8');
      process.stdout.write(`Written to ${outPath}\n`);
    } else {
      process.stdout.write(output + '\n');
    }
  }
}

function yamlStringify(obj: unknown): string {
  return JSON.stringify(obj, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"([^"]+)"/g, '\'$1\'');
}
