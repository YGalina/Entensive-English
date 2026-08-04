# AI Working Rules

1. Read `AI_PROJECT.md`, `MASTER_INDEX.md`, and `SESSION.md` before acting.
2. Treat `PRODUCT_CONSTITUTION.md` as frozen. Architectural changes require an ADR and owner approval.
3. Do not convert process evidence into competence, proficiency, psychological, or clinical claims.
4. Do not redesign methodology, UX, or product strategy during implementation or review tasks.
5. Preserve user work and unrelated uncommitted changes.
6. Prefer the smallest change that completes the approved task.
7. Record material decisions in `DECISIONS.md` or `docs/adr/`.
8. Record reusable prompts in `docs/prompts/` or `.ai/PROMPTS/`.
9. Update `SESSION.md` and `TASKS.md` when a task changes project state.
10. Run relevant checks and report what was executed, blocked, or unavailable.
11. During visual design, Claude Design / Fable is the Creative Director of the existing Living Content system. It extends the canonical style from `docs/design/project/Intensive English - Design System.dc.html`, `packages/tokens/index.ts`, and `docs/design/project/slices-v2/`; it does not replace that identity without owner approval.
12. All visual design and every visual correction are performed only by Claude Design / Fable inside the existing `Intensive English дизайн-система` project. Continue with pages in that project; do not create a replacement project or ask Fable to rebuild approved pages unless the product owner explicitly requests it.
13. Codex design QA is read-only. Codex may report specification, learning-logic, state-coverage, accessibility and implementation findings, but it must never apply visual corrections, prescribe replacement composition, or edit layout, typography, colour, spacing, visual hierarchy or component expression.
14. A design-QA finding is handed to Claude Design / Fable for correction. The product owner approves the corrected visual before engineering implementation or merge.
15. Codex is the single operational control plane. The owner assigns work here; Codex classifies, dispatches, verifies, persists and advances it without making the owner act as courier between agents.
16. Claude Opus / Claude CLI performs only bounded specialist work delegated by Codex. Its reports never override frozen sources, owner decisions or verified repository state.
17. Chat histories are background only. Durable prompts, decisions, acceptance results and handoffs must be saved in Git.
18. Memoree is cited historical memory, not project state. Verify retrieved memory against current Git; never use it instead of specifications, code, tests or decision records.
19. Do not create a parallel orchestration chat or workflow when the task can be executed, delegated and recorded from the current Codex project task.

See [Development Constitution](../docs/governance/DEVELOPMENT_CONSTITUTION.md) for roles and workflow.
