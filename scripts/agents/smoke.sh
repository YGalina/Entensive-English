#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"
bash scripts/agents/doctor.sh

prompt='Read AGENTS.md and CLAUDE.md. Do not edit files or run tests. Reply with exactly: ORCHESTRATION_SMOKE_OK'

if [[ "${AGENT_SMOKE_LIVE:-0}" != "1" ]]; then
  printf 'dry-run: claude --agent architect --print <smoke prompt>\n'
  printf 'dry-run: codex exec --ephemeral --sandbox read-only <smoke prompt>\n'
  printf 'smoke: dry-run passed; set AGENT_SMOKE_LIVE=1 for live model calls\n'
  exit 0
fi

if ! claude_result="$(claude --agent architect --print --permission-mode plan --max-budget-usd 0.10 "$prompt")"; then
  printf 'smoke: Claude call failed; run `claude` and /login, then retry\n' >&2
  exit 1
fi
printf '%s\n' "$claude_result" | grep -q 'ORCHESTRATION_SMOKE_OK'

if ! codex_result="$(codex exec --ephemeral --sandbox read-only "$prompt")"; then
  printf 'smoke: Codex call failed; check authentication and local sandbox permissions\n' >&2
  exit 1
fi
printf '%s\n' "$codex_result" | grep -q 'ORCHESTRATION_SMOKE_OK'

printf 'smoke: live Claude and Codex calls passed\n'
