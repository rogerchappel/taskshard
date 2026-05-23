# Malformed Tasks

This file has various formatting issues that the parser should handle gracefully.

## Regular Tasks

- [ ] Normal task one @alice [files: src/one.ts]
- [x] Completed task two
  This is some description text for task two.
  It spans multiple lines.

## Missing Checkbox

This heading has no tasks at all!
Just some prose here.

## Mixed Format

- [ ] Task with owner tag only @bob
- [ ] Task with files only [files: src/two.ts, src/three.ts]
- [ ] Task with verify only [verify: run the test suite]
- [x] Already done
- Invalid line without checkbox marker
- [ ] Task with missing bracket [files:

## Edge Cases

- [ ] Task with many tags @carol [files: src/a.ts, src/b.ts] [depends-on: task-1-normal-task-one] [verify: check all] [priority: high]
- [ ] Task with duplicate tags @alice [files: src/a.ts] [files: src/c.ts]
- [ ]    Deeply    indented    task    @dave [files: src/d.ts]
