#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

target="${1:-HEAD}"
prompt="Read AGENTS.md and the governing specifications. Review git diff ${target}^..${target} independently. Do not edit files. Report actionable findings with severity and file/line evidence, then give an acceptance verdict."

printf 'Claude independent review\n'
claude --agent independent-reviewer --print --permission-mode plan "$prompt"

printf '\nCodex independent review\n'
codex exec --ephemeral --sandbox read-only "$prompt"
