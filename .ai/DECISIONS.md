# Decision Register

This is a concise index, not a replacement for ADRs.

| Decision | Status | Authoritative source |
|---|---|---|
| Product Constitution v1.2 governs product architecture | Frozen | `PRODUCT_CONSTITUTION.md` |
| Architecture phase is closed | Active | `PRODUCT_CONSTITUTION.md`, owner decision |
| Architectural changes require governance review | Active | `docs/governance/DEVELOPMENT_CONSTITUTION.md` |
| Vertical Slice is frozen for pilot/manual device checks | Active | review records and current project state |
| Codex is the single operational orchestrator; the owner assigns work here, while Claude is a delegated specialist and Fable exclusively owns visual design and corrections | Active | `.ai/AI_PROJECT.md`, `.ai/AI_RULES.md`, `docs/governance/DEVELOPMENT_CONSTITUTION.md`, owner decision 2026-08-04 |
| Git is the authoritative project state; Memoree is cited historical memory; ChatGPT conversations are non-authoritative background | Active | `.ai/AI_PROJECT.md`, `docs/governance/DEVELOPMENT_CONSTITUTION.md`, owner decision 2026-08-04 |
| Current phase is Stage 0 Day 1 physical-device QA and correction | Active | `.ai/SESSION.md` |
| Batch C correction v1 default screens are approved and frozen | Frozen | `docs/design/exports/batch-c-correction-v1/`, `docs/design/reviews/BATCH_C_CORRECTION_V1_QA_CODEX.md`, owner approval 2026-07-22 |
| Claude Opus may act as emergency interim orchestrator only when Codex is unavailable and the owner explicitly reactivates the fallback; Fable remains Creative Director and owner retains approval authority | Inactive fallback | `.ai/CLAUDE_INTERIM_ORCHESTRATOR.md`, superseded by owner decision 2026-08-04 |
| Ink/black controls are approved for task-level actions inside Batch C exercises; terracotta remains the main journey-action colour | Approved | Product-owner decision 2026-07-23; `docs/design/reviews/BATCH_C_STATES_V1_QA_CODEX.md` |
| Batch C states correction v1 is approved and frozen; superseded states v1 is removed from current source of truth | Frozen | `docs/design/exports/batch-c-states-correction-v1/`, `docs/design/reviews/BATCH_C_STATES_CORRECTION_V1_QA_CODEX.md` |
| Offline groups remain in product architecture but are deferred | Planned | `PRODUCT_CONSTITUTION.md` |
| No new learner-facing UI may be implemented from isolated screens; every major flow requires one owner-reviewable end-to-end UX/UI package and an explicit owner approval recorded before implementation | Active | `00_OWNER_CONTROL_CENTER.md`, `docs/owner/UX_UI_APPROVAL_REGISTER.md`, owner correction 2026-08-08 |
| Codex technical/design QA never substitutes for the owner's final product, UX/UI, device-build or release decision | Active | `00_OWNER_CONTROL_CENTER.md`, owner correction 2026-08-08 |
| Galina is the first learner and design partner: the complete learning program must be shown to her and run manually with her before curriculum UX/UI or application implementation continues. A mechanic/content block becomes eligible for product development only after owner acceptance of its content and evidence from the manual self-pilot; unvalidated curriculum must not be encoded in Fable or code. | Active | Owner decision 2026-08-09 |

Add non-trivial decisions to `docs/adr/`; link them here when they affect current work.
