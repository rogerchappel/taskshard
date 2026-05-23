import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, parseHeading, parseCheckboxLine } from '../src/parser/markdown.js';
import { version } from '../src/version.js';

describe('parseHeading', () => {
  it('parses H1 headings', () => {
    const result = parseHeading('# Main Title');
    assert.deepStrictEqual(result, { level: 1, text: 'Main Title' });
  });

  it('parses H2 headings', () => {
    const result = parseHeading('## Subsection');
    assert.deepStrictEqual(result, { level: 2, text: 'Subsection' });
  });

  it('parses H3 headings', () => {
    const result = parseHeading('### Deep Section');
    assert.deepStrictEqual(result, { level: 3, text: 'Deep Section' });
  });

  it('returns null for non-heading lines', () => {
    assert.strictEqual(parseHeading('just text'), null);
    assert.strictEqual(parseHeading('- [ ] not a heading'), null);
  });
});

describe('parseCheckboxLine', () => {
  it('parses unchecked tasks', () => {
    const result = parseCheckboxLine('- [ ] Do something', 'Section', 2, 0);
    assert.ok(result !== null);
    assert.strictEqual(result!.checked, false);
    assert.strictEqual(result!.title, 'Do something');
  });

  it('parses checked tasks', () => {
    const result = parseCheckboxLine('- [x] Done already', 'Section', 2, 0);
    assert.ok(result !== null);
    assert.strictEqual(result!.checked, true);
  });

  it('parses X case as checked', () => {
    const result = parseCheckboxLine('- [X] Done too', 'Section', 2, 0);
    assert.ok(result !== null);
    assert.strictEqual(result!.checked, true);
  });

  it('extracts owner from @tag', () => {
    const result = parseCheckboxLine('- [ ] Task @alice', 'Section', 2, 0);
    assert.strictEqual(result!.owner, 'alice');
  });

  it('extracts files from [files: ...]', () => {
    const result = parseCheckboxLine('- [ ] Task [files: src/a.ts, lib/b.ts]', 'Section', 2, 0);
    assert.deepStrictEqual(result!.files, ['src/a.ts', 'lib/b.ts']);
  });

  it('extracts dependencies', () => {
    const result = parseCheckboxLine('- [ ] Task [depends-on: task-1, task-2]', 'Section', 2, 0);
    assert.deepStrictEqual(result!.dependsOn, ['task-1', 'task-2']);
  });

  it('extracts verification', () => {
    const result = parseCheckboxLine('- [ ] Task [verify: npm test]', 'Section', 2, 0);
    assert.strictEqual(result!.verification, 'npm test');
  });

  it('extracts priority', () => {
    const result = parseCheckboxLine('- [ ] Task [priority: high]', 'Section', 2, 0);
    assert.strictEqual(result!.priority, 'high');
  });

  it('returns null for non-checkbox lines', () => {
    assert.strictEqual(parseCheckboxLine('just text', 'Section', 2, 0), null);
    assert.strictEqual(parseCheckboxLine('# heading', 'Section', 2, 0), null);
  });
});

describe('parseMarkdown', () => {
  it('parses a simple task list', () => {
    const md = `# Tasks

## Phase 1
- [ ] First task @alice [files: src/index.ts]
- [x] Second task`;

    const tasks = parseMarkdown(md, 'test.md');
    assert.strictEqual(tasks.length, 2);
    assert.strictEqual(tasks[0].title, 'First task');
    assert.strictEqual(tasks[0].owner, 'alice');
    assert.deepStrictEqual(tasks[0].files, ['src/index.ts']);
    assert.strictEqual(tasks[1].title, 'Second task');
    assert.strictEqual(tasks[1].checked, true);
  });

  it('handles multiple headings', () => {
    const md = `# Tasks

## Phase 1
- [ ] Task A

## Phase 2
- [ ] Task B`;

    const tasks = parseMarkdown(md, 'test.md');
    assert.strictEqual(tasks.length, 2);
    assert.strictEqual(tasks[0].heading, 'Phase 1');
    assert.strictEqual(tasks[1].heading, 'Phase 2');
  });

  it('generates stable IDs', () => {
    const md = `# Tasks
- [ ] Set up the project
- [ ] Add tests`;

    const tasks = parseMarkdown(md, 'test.md');
    assert.ok(tasks[0].id.startsWith('task-1'));
    assert.ok(tasks[1].id.startsWith('task-2'));
  });

  it('handles empty documents', () => {
    const tasks = parseMarkdown('', 'test.md');
    assert.deepStrictEqual(tasks, []);
  });

  it('handles documents with no tasks', () => {
    const md = `# Just prose
This document has no tasks at all.`;
    const tasks = parseMarkdown(md, 'test.md');
    assert.deepStrictEqual(tasks, []);
  });
});

describe('version', () => {
  it('exports a version string', () => {
    assert.strictEqual(typeof version, 'string');
    assert.ok(version.length > 0);
  });
});
