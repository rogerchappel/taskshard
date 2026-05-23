#!/usr/bin/env bash
set -euo pipefail

echo "=== taskshard: validation ==="
cd "$(dirname "$0")/.."

PASS=0
FAIL=0

check() {
  local desc="$1"
  shift
  echo -n "  $desc: "
  if "$@" > /dev/null 2>&1; then
    echo "✅ PASS"
    ((PASS++))
  else
    echo "❌ FAIL"
    ((FAIL++))
  fi
}

echo "-- Type check --"
check "TypeScript compilation" npx tsc --noEmit

echo "-- Tests --"
check "Unit tests" npm test

echo "-- Smoke --"
check "Smoke test" bash scripts/smoke.sh

echo "-- Package --"
check "npm pack dry-run" npm pack --dry-run

echo ""
echo "Validation results: $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
echo "✅ All checks passed"
