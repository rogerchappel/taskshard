#!/usr/bin/env bash
set -euo pipefail

echo "=== taskshard: smoke test ==="
cd "$(dirname "$0")/.."

FIXTURES="test/fixtures"
PASS=0
FAIL=0

for f in "$FIXTURES"/*.md; do
  name=$(basename "$f")
  echo -n "  fixture $name: "
  if node dist/index.js plan "$f" > /dev/null 2>&1; then
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
