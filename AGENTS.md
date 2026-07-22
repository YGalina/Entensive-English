<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Intensive English project workflow

Before material work, read:

- `MASTER_INDEX.md`
- `PRODUCT_CONSTITUTION.md`
- `docs/governance/PROJECT_STATE.md`
- `docs/governance/DEVELOPMENT_CONSTITUTION.md`
- the relevant approved specification

After implementation, update `docs/governance/IMPLEMENTATION_HANDOFF.md`. Independent reviews should record their verdict in `docs/governance/REVIEW_LOG.md` and identify the reviewed commit when possible.

Architecture is frozen. Do not reopen it without an ADR or a confirmed critical defect. Preserve unrelated dirty-worktree changes and do not move or delete existing files merely to reorganize the repository.

## Memory and task contracts

At the start of a material task, run `memoree context show` once when Memoree is
available. Retrieve memory only when historical decisions or prior work matter;
current repository files and Git always override dated memory. Do not broaden
memory scope automatically after an empty result, and never store transcripts,
secrets, chain-of-thought, or routine progress.

Implementation work must use a task contract based on
`.ai/orchestration/templates/task-contract.json`. Planning and review are
read-only. Workers use an isolated branch/worktree and may write only inside the
contract's `allowed_paths`. A worker cannot accept its own work.
