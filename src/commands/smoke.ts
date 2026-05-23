import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '..', '..', 'test', 'fixtures');

interface SmokeOptions {
  verbose?: boolean;
}

export async function smokeCommand(opts: SmokeOptions) {
  const fixtures = [
    'simple-tasks.md',
    'conflicting-tasks.md',
    'dependency-tasks.md',
    'malformed-tasks.md',
  ];

  let passed = 0;
  let failed = 0;

  for (const fixture of fixtures) {
    const fixturePath = path.join(fixturesDir, fixture);
    if (!fs.existsSync(fixturePath)) {
      if (opts.verbose) {
        process.stdout.write(`SKIP: ${fixture} (not found)\n`);
      }
      continue;
    }

    try {
      // Test: plan command produces valid JSON
      const { execSync } = await import('child_process');
      const output = execSync(
        `node ${path.join(__dirname, '..', 'index.js')} plan ${fixturePath}`,
        { encoding: 'utf-8' }
      );
      const json = JSON.parse(output);
      if (json.shards && Array.isArray(json.shards)) {
        passed++;
        if (opts.verbose) {
          process.stdout.write(`PASS: ${fixture} -> ${json.shards.length} shards, ${json.summary.totalTasks} tasks\n`);
        }
      } else {
        failed++;
        process.stdout.write(`FAIL: ${fixture} -> invalid output structure\n`);
      }
    } catch (e) {
      failed++;
      process.stdout.write(`FAIL: ${fixture} -> ${e instanceof Error ? e.message : 'unknown error'}\n`);
    }
  }

  process.stdout.write(`\nSmoke test results: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) {
    process.exit(1);
  }
}
