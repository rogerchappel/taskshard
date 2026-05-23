import * as fs from 'fs';
import * as path from 'path';
import { TaskItem } from '../types.js';

// Extract task owner from tags like @alice or [owner: bob]
function extractOwner(text: string): string | null {
  const ownerMatch = text.match(/\[owner:\s*([^\]]+)\]/);
  if (ownerMatch) return ownerMatch[1].trim();
  const atMatch = text.match(/@(\w+)/);
  if (atMatch) return atMatch[1];
  return null;
}

// Extract dependencies from tags like depends-on: task-1, task-2 or [depends-on: a, b]
function extractDependencies(text: string): string[] {
  const deps: string[] = [];
  const bracketMatch = text.match(/\[depends-on:\s*([^\]]+)\]/);
  if (bracketMatch) {
    deps.push(...bracketMatch[1].split(',').map(d => d.trim()).filter(Boolean));
  }
  const inlineMatch = text.match(/depends-on:\s*(.+)/i);
  if (inlineMatch && !bracketMatch) {
    deps.push(...inlineMatch[1].split(',').map(d => d.trim()).filter(Boolean));
  }
  return deps;
}

// Extract file globs from tags like files: src/*.ts or [files: src/index.ts, lib/parser.ts]
function extractFiles(text: string): string[] {
  const files: string[] = [];
  const bracketMatch = text.match(/\[files:\s*([^\]]+)\]/);
  if (bracketMatch) {
    files.push(...bracketMatch[1].split(',').map(f => f.trim()).filter(Boolean));
  }
  const inlineMatch = text.match(/files:\s*(.+)/i);
  if (inlineMatch && !bracketMatch) {
    files.push(...inlineMatch[1].split(',').map(f => f.trim()).filter(Boolean));
  }
  return files;
}

// Extract verification notes from tags like [verify: run tests] or verify: npm test
function extractVerification(text: string): string | null {
  const bracketMatch = text.match(/\[verify:\s*([^\]]+)\]/);
  if (bracketMatch) return bracketMatch[1].trim();
  const inlineMatch = text.match(/verify:\s*(.+)/i);
  if (inlineMatch && !bracketMatch) return inlineMatch[1].trim();
  return null;
}

// Extract priority from tags like [priority: high]
function extractPriority(text: string): 'high' | 'medium' | 'low' | null {
  const match = text.match(/\[priority:\s*(high|medium|low)\]/i);
  if (match) return match[1].toLowerCase() as 'high' | 'medium' | 'low';
  return null;
}

// Generate a stable ID from task title
function generateId(title: string, index: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30);
  return slug ? `task-${index + 1}-${slug}` : `task-${index + 1}`;
}

/**
 * Parse a heading line, returns { level, text } or null
 */
export function parseHeading(line: string): { level: number; text: string } | null {
  const match = line.match(/^(#{1,6})\s+(.+)$/);
  if (!match) return null;
  return { level: match[1].length, text: match[2].trim() };
}

/**
 * Strip metadata tags from title text, leaving only the human-readable portion.
 */
function stripTags(text: string): string {
  return text
    .replace(/@\w+/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse a checkbox task line, returns TaskItem fields or null
 */
export function parseCheckboxLine(line: string, heading: string, headingLevel: number, index: number): TaskItem | null {
  const match = line.match(/^[\s]*[-*]\s+\[([ xX])\]\s+(.+)$/);
  if (!match) return null;

  const raw = line.trim();
  const checked = match[1] !== ' ';
  const title = stripTags(match[2].trim());

  return {
    id: generateId(title, index),
    title,
    heading,
    headingLevel,
    description: '',
    checked,
    owner: extractOwner(raw),
    dependsOn: extractDependencies(raw),
    files: extractFiles(raw),
    verification: extractVerification(raw),
    priority: extractPriority(raw),
    raw,
  };
}

/**
 * Parse a full Markdown document into TaskItems
 */
export function parseMarkdown(content: string, sourceFile: string): TaskItem[] {
  const lines = content.split('\n');
  const tasks: TaskItem[] = [];
  let currentHeading = 'untitled';
  let currentHeadingLevel = 0;
  let taskIndex = 0;

  // Collect multi-line descriptions
  let lastTask: TaskItem | null = null;
  const descriptionLines: string[] = [];

  for (const line of lines) {
    const heading = parseHeading(line);
    if (heading) {
      // Flush any pending description
      if (lastTask && descriptionLines.length > 0) {
        lastTask.description = descriptionLines.join('\n').trim();
        descriptionLines.length = 0;
      }
      currentHeading = heading.text;
      currentHeadingLevel = heading.level;
      lastTask = null;
      continue;
    }

    const task = parseCheckboxLine(line, currentHeading, currentHeadingLevel, taskIndex);
    if (task) {
      // Flush previous task's description
      if (lastTask && descriptionLines.length > 0) {
        lastTask.description = descriptionLines.join('\n').trim();
        descriptionLines.length = 0;
      }
      tasks.push(task);
      lastTask = task;
      taskIndex++;
      continue;
    }

    // If we have a pending task and this is a non-blank, non-heading line,
    // it's part of the description
    if (lastTask && line.trim().length > 0 && !line.startsWith('#')) {
      descriptionLines.push(line.trim());
    }
  }

  // Flush final description
  if (lastTask && descriptionLines.length > 0) {
    lastTask.description = descriptionLines.join('\n').trim();
  }

  return tasks;
}

/**
 * Read a file and parse it
 */
export function parseFile(filePath: string): TaskItem[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const resolvedPath = path.resolve(filePath);
  return parseMarkdown(content, resolvedPath);
}
