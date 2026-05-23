#!/usr/bin/env bash
set -euo pipefail

echo "=== taskshard: smoke test ==="
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FIXTURES="$ROOT_DIR/test/fixtures"
PASS=0
FAIL=0

TSX="$ROOT_DIR/node_modules/.bin/tsx"

for f in "$FIXTURES"/*.md; do
  name=$(basename "$f")
  echo -n "  fixture $name: "
  if $TSX "$ROOT_DIR/src/index.ts" plan "$f" > /dev/null 2>&1; then
    echo "✅ PASS"
    ((PASS++))
  else
    echo "❌ FAIL"
    ((FAIL++))
  fi
done

echo ""
echo "Results: $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
