import * as fs from 'fs';
import type { OrchestrationResult, TaskShard } from '../types.js';

interface PromptOptions {
  shard: string;
  system?: boolean;
}

export function promptCommand(file: string, opts: PromptOptions) {
  if (!fs.existsSync(file)) {
    process.stderr.write(`Error: file not found: ${file}\n`);
    process.exit(1);
  }

  let result: OrchestrationResult;
  try {
    const content = fs.readFileSync(file, 'utf-8');
    result = JSON.parse(content);
  } catch (e) {
    process.stderr.write(`Error: failed to parse orchestration JSON: ${e instanceof Error ? e.message : 'unknown error'}\n`);
    process.exit(1);
  }

  const shard = result.shards.find((s: TaskShard) => s.id === opts.shard);
  if (!shard) {
    const available = result.shards.map((s: TaskShard) => s.id).join(', ');
    process.stderr.write(`Error: shard '${opts.shard}' not found. Available: ${available}\n`);
    process.exit(1);
  }

  if (opts.system) {
    const systemPrompt = `You are an autonomous development agent working on a large codebase.
You have been assigned a specific shard of work.
Follow the assignment carefully. Do not touch files outside your shard boundaries.
When complete, run the verification steps listed in your assignment.

Your assignment follows:`;
    process.stdout.write(systemPrompt + '\n\n---\n\n' + shard.agentPrompt);
  } else {
    process.stdout.write(shard.agentPrompt + '\n');
  }
}
