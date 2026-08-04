# Intensive English — AI Project Context

Intensive English is an English-learning product for adults with uneven language competence. It combines structured language development, productive retrieval, learning support, mobile and web experiences, AI guidance, and planned human/community practice.

## Start here

1. Read [MASTER_INDEX.md](MASTER_INDEX.md).
2. Read [AI_RULES.md](AI_RULES.md).
3. Read [SESSION.md](SESSION.md) for the current phase and next task.
4. Consult [TASKS.md](TASKS.md) and [DECISIONS.md](DECISIONS.md) before changing scope.

## Governing sources

- [Product Constitution](../PRODUCT_CONSTITUTION.md)
- [Integrated Learning Blueprint](../integrated_learning_blueprint.md)
- [Architecture Resolution](../architecture_resolution.md)
- [Development Constitution](../docs/governance/DEVELOPMENT_CONSTITUTION.md)

The repository is the source of truth. Chat histories and Obsidian notes are working context only unless committed here.

## Operating control plane

- The product owner gives project tasks to Codex in this repository workspace.
- Codex is the single operational orchestrator: it reads current Git state, scopes work, dispatches bounded specialist work, implements approved engineering changes, runs QA, maintains project controls and records accepted outcomes in Git.
- Claude Opus / Claude CLI is a specialist that Codex may invoke for UX, copy, methodology or independent review. Its output is evidence or a deliverable, not project authority until reviewed and committed.
- Claude Design / Fable is the exclusive visual-design authority. Codex may audit visual work but never creates or applies visual corrections.
- ChatGPT conversations are historical background, not a second control plane. No routine task requires the owner to move instructions between ChatGPT, Claude and Codex.
- Memoree stores cited durable history and decisions; current repository sources always win when they differ.
