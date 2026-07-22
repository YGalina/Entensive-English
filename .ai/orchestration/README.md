# Agentic delivery pipeline

This directory defines the executable contract between the project owner,
orchestrator, planner, worker, reviewer, and deterministic acceptor.

Git and approved project documents remain authoritative. Memoree supplies
bounded historical context and deliberate cross-session checkpoints; it does
not replace repository inspection.

## Flow

1. The orchestrator creates a task directory from `templates/task-contract.json`.
2. A read-only planner fills the plan and acceptance criteria before work starts.
3. The owner approves any listed human gates.
4. A worker operates in an isolated branch/worktree and only inside `allowed_paths`.
5. Automated checks produce `evidence.json`.
6. A read-only reviewer inspects the actual diff and evidence.
7. `scripts/agents/accept.mjs` returns PASS or FAIL from the contract and repository state.
8. Only a passing task may be handed off as a draft PR.

Do not create extra agents when a deterministic script can perform the check.
Parallel workers are allowed only for independent path scopes.
