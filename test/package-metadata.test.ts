import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

describe('package metadata', () => {
  it('points package entrypoints at built files', async () => {
    const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
      main: string;
      types: string;
      bin: Record<string, string>;
    };

    await access(packageJson.main);
    await access(packageJson.types);
    await access(packageJson.bin.taskshard);

    assert.equal(packageJson.main, './dist/src/index.js');
    assert.equal(packageJson.bin.taskshard, './dist/src/index.js');
  });
});
