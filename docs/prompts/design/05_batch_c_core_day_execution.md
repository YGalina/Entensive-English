---
id: D-05
title: Batch C — Core Day visual execution
owner: Claude Design / Fable
status: completed-and-frozen
output: `docs/design/exports/batch-c-correction-v1/`
---

# ROLE

Act as Creative Director and Lead Product Designer for Intensive English. Continue the already approved Living Content visual language. This is bounded visual execution, not product invention and not another audit.

# SOURCE PRIORITY

Read, in order:

1. `PRODUCT_CONSTITUTION.md` and `.ai/AI_RULES.md`.
2. `experience_architecture/06_SCREEN_SPECIFICATIONS.md`: S5, S14 and S27.
3. `experience_architecture/05_INTERACTION_ARCHITECTURE.md` for scaffolded retrieval, free production, voice and feedback timing.
4. `docs/design/audits/OPUS_INDEPENDENT_DESIGN_AND_COPY_AUDIT_V1_1.md`: Batch C findings only.
5. `docs/design/DESIGN_SOURCE_INVENTORY.md` and `docs/design/audits/COMPONENT_REUSE_MAP_V1.md`.
6. Current approved visual sources: `docs/design/exports/batch-a-defaults-final/`, `docs/design/exports/batch-b-correction-v2/`, and reusable Living Content components in `docs/design/project/`.

If sources conflict, frozen architecture and screen specifications win. Existing prototype screens are visual references, not permission to restore obsolete mechanics or copy.

# BATCH C SCOPE

Design the mobile-first default journey for:

- S5 Daily Cycle: all six phases as one coherent session journey;
- S14 AI Summary after completed written production;
- the default visible manifestations of S27 save/offline semantics inside that journey;
- Focus 01 as an alternate presentation of the same approved S5 mechanics, preserving the restrained “lamp light” atmosphere.

Target viewport: 390×844. Preserve adult readability, useful screen density, reachable controls and the approved Living Content palette, typography, materiality and colour roles.

# NON-NEGOTIABLE LEARNING LOGIC

1. Priming: curriculum-selected learning objects; tap to hear; no “Знаю / Не знаю”, no word flood and no scoring.
2. Encounter: coherent context; optional listen and tap-for-translation.
3. Retrieval: meaning → form; English answer initially absent; graduated support is letter → choice of three → reveal and retype, followed by retry.
4. Free production: personal task-essential prompt; no hints or correction during writing; after submission a gentle post-output nudge may offer “оставить как есть”.
5. Voice: optional and private; “continue without recording” remains first-class. Do not imply speech analysis, pronunciation scoring or human listening.
6. Summary: AI appears only after completed written output; acknowledge, offer curated alternatives and grammar-in-context; clearly state that it is based on the learner’s written text. AI failure never invalidates completed work.
7. Safe exit is allowed but is not session completion. Completion requires at least one retrieval and one production.
8. `saved-local`, `pending-sync`, `not-saved`, `storage-unavailable` and future `sync-conflict` are distinct. Never call local saving “accepted” unless the core confirmed acceptance.

# COPY FIREWALL

Learner-facing copy must be plain, adult and immediately understandable. Never expose: pilot, vertical slice, protocol, holdout, artifact, evidence, core, SRS, DLE, shadow metric, research cohort, retrieval depth, state names or implementation terminology.

Reuse strong approved Living Content copy where it fits the exact context. Do not restore guardian/psychological interpretation, streaks, CEFR progress from activity, “Галина inside the app”, or gendered default address. Do not design AI Mini Lessons in this batch.

# ERGONOMICS AND INFORMATION DENSITY

- Use the active screen area for the current learning act; avoid decorative empty three-quarter screens.
- Keep the primary action within comfortable thumb reach when the keyboard is closed and reachable above the keyboard when open.
- Interactive targets: at least 44×44; primary session actions normally 52–56 high.
- Do not place three equal decision buttons in a narrow horizontal row.
- Body text normally at least 16px; secondary text at least 14px; WCAG AA contrast for learner-facing text.
- Colour supports phase orientation and action hierarchy, never correctness, shame or reward.
- One current task and one clear next action per state.

# REQUIRED DEFAULT DELIVERABLE

Produce only the default visual pass first:

1. one journey board showing S5 phases 1–6 and S14 in sequence;
2. individual 390×844 HTML screens for each materially different default phase;
3. one Focus variant using identical learning mechanics;
4. a short copy inventory containing every learner-facing string;
5. a traceability table: screen → governing specification → reused visual source → intentional adaptation;
6. a list of assumptions or unresolved owner decisions.

Save under `docs/design/exports/batch-c-defaults/` and update the handoff files according to the Git Working Protocol.

# STOP GATE

Stop after default screens. Do not generate loading, error, permission, offline, voice-lifecycle or retry state sheets yet. Do not redesign navigation. Do not alter Batch A or Batch B. Do not implement application code.

Wait for the product owner’s visual approval. After approval, Codex will audit learning logic, copy, ergonomics, accessibility and implementation claims; only then will a separate state-pass task be issued.
