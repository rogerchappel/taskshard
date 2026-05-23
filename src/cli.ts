import { Command } from 'commander';
import { version } from './version.js';
import { planCommand } from './commands/plan.js';
import { writeCommand } from './commands/write.js';
import { checkCommand } from './commands/check.js';
import { promptCommand } from './commands/prompt.js';
import { smokeCommand } from './commands/smoke.js';

const program = new Command();

program
  .name('taskshard')
  .description('Split Markdown task plans into safe parallel agent work packets')
  .version(version);

program
  .command('plan')
  .description('Parse a Markdown task list and emit orchestration JSON')
  .argument('<file>', 'Path to the Markdown task file')
  .option('-f, --format <format>', 'Output format (json|yaml)', 'json')
  .option('-o, --output <file>', 'Write to file instead of stdout')
  .option('--no-conflicts', 'Skip conflict detection')
  .action(planCommand);

program
  .command('write')
  .description('Write individual shard assignment files')
  .argument('<file>', 'Path to the Markdown task file')
  .requiredOption('--out <dir>', 'Output directory for shard files')
  .option('--prefix <prefix>', 'Filename prefix for shard files', 'shard')
  .option('--format <format>', 'File format (md|json)', 'md')
  .action(writeCommand);

program
  .command('check')
  .description('Validate an orchestration JSON for issues')
  .argument('<file>', 'Path to the orchestration JSON')
  .option('--fail-on <type>', 'Fail on specific issue type (conflicts|missing-deps|orphaned)', 'conflicts')
  .option('--json', 'Output results as JSON')
  .action(checkCommand);

program
  .command('prompt')
  .description('Generate agent prompt for a specific shard')
  .argument('<file>', 'Path to the orchestration JSON')
  .requiredOption('--shard <id>', 'Shard ID to generate prompt for')
  .option('--system', 'Include system prompt template')
  .action(promptCommand);

program
  .command('smoke')
  .description('Run smoke tests against fixture task files')
  .option('--verbose', 'Show detailed output')
  .action(smokeCommand);

export { program };
