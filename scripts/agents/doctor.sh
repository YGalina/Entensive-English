#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

failed=0
for command_name in git node npm claude codex; do
  if command -v "$command_name" >/dev/null 2>&1; then
    printf 'ok: %s\n' "$command_name"
  else
    printf 'missing: %s\n' "$command_name" >&2
    failed=1
  fi
done

for required_file in AGENTS.md CLAUDE.md .ai/AI_PROJECT.md .ai/AI_RULES.md; do
  if [[ -f "$required_file" ]]; then
    printf 'ok: %s\n' "$required_file"
  else
    printf 'missing: %s\n' "$required_file" >&2
    failed=1
  fi
done

agent_count="$(find .claude/agents -maxdepth 1 -type f -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
if [[ "$agent_count" -ge 3 ]]; then
  printf 'ok: %s Claude project agents\n' "$agent_count"
else
  printf 'missing: expected at least 3 Claude project agents\n' >&2
  failed=1
fi

if [[ "$failed" -ne 0 ]]; then
  exit 1
fi

printf 'doctor: ready\n'
