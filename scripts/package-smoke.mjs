#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});

const [packument] = JSON.parse(output);
const files = new Set(packument.files.map((entry) => entry.path));

const requiredFiles = [
  "package.json",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "docs/ORCHESTRATION.md",
  "dist/src/index.js",
  "dist/src/index.d.ts",
];

const missingFiles = requiredFiles.filter((file) => !files.has(file));

if (missingFiles.length > 0) {
  console.error("Package smoke failed. Missing expected files:");
  for (const file of missingFiles) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log(`Package smoke passed with ${files.size} files.`);
