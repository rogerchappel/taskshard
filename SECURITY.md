# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in taskshard:

1. **Do not** open a public issue.
2. Email the maintainer at the address on their GitHub profile.
3. Include a description of the vulnerability and steps to reproduce.
4. Allow time for a fix before public disclosure.

## Security Considerations

taskshard is a local CLI tool that:
- Reads local Markdown files only
- Makes no network requests
- Does not execute arbitrary code from input files
- Outputs deterministic, reviewable JSON

If you find a way to use taskshard input to execute unintended code, please report it immediately.
