---
id: D-08
title: Recovery and data-integrity gap closure
owner: Claude Design / Fable
status: ready
output: `docs/design/exports/recovery-integrity-v1/`
---

# ROLE

Act as Creative Director and Lead Product Designer for Intensive English. Close two omitted approved flows by extending frozen Living Content patterns. This is gap closure, not a new visual batch and not an architecture exercise.

# WHY THIS TASK EXISTS

The approved migration sequence assigned S6 Recovery and the data-integrity failure journey to Batch B, but the current approved Batch B package contains only S9–S13. Close this documented gap before starting Batch D.

# SOURCE PRIORITY

Read, in order:

1. `PRODUCT_CONSTITUTION.md`, `.ai/AI_RULES.md`, `.ai/SESSION.md`.
2. `experience_architecture/06_SCREEN_SPECIFICATIONS.md`: S1, S4, S6.
3. `experience_architecture/04_USER_JOURNEY_ARCHITECTURE.md`: journeys 3 (Recovery) and 17 (data-integrity failure).
4. `experience_architecture/05_INTERACTION_ARCHITECTURE.md`: transitions, safe exit, Recovery and error truthfulness.
5. Frozen Batch A: `docs/design/exports/batch-a-defaults-final/`.
6. Frozen Batch C defaults and states: `docs/design/exports/batch-c-correction-v1/`, `docs/design/exports/batch-c-states-correction-v1/`.
7. Corrected migration plan: `docs/design/audits/VISUAL_MIGRATION_SEQUENCE_V1.md`.

Frozen architecture and specifications win over historical screens.

# SCOPE A · S6 RECOVERY

Design the short return-after-pause journey:

1. **Path Hub Recovery state:** Recovery is the one leading step. A full regular session may be reachable only through a quiet explicit secondary intention, never as an equal CTA.
2. **Recovery retrieval:** up to 8 due items, using the frozen Batch C Phase 3 scaffold. No new material, no priming or encounter phases.
3. **Recovery production:** one main personal question using frozen Phase 4 patterns.
4. **Voice:** optional, private, using frozen Batch C voice states.
5. **Summary:** reuse frozen S14 behaviour.
6. **Zero-due path:** skip retrieval and begin with production; this must never become a dead end.
7. **Completion:** when due items exist, at least one retrieval plus one production; with zero due, one production. Safe exit is not completion. Recovery does not consume or advance the curriculum programme.

Do not redraw every reused Batch C state. Show the Recovery sequence, the materially different Path entry, zero-due branch, continuity/completion map and exact intentional deltas.

# SCOPE B · S1 DATA-INTEGRITY FAILURE

Design the honest blocking journey when authoritative local state is lost/corrupted and no confirmed recovery source exists:

1. detection/blocking state;
2. plain explanation of what is known and unknown;
3. option to wait/try recovery later if a source may appear;
4. explicit start-again option;
5. destructive confirmation that starting again creates a new beginning and cannot silently continue the previous progress;
6. resolved state after the learner's explicit choice.

Rules:

- never route silently into new-user flow;
- never create a second identity, repeat baseline or reset progress without explicit confirmation;
- never promise that missing data can be recovered;
- do not expose `authoritative store`, identity, protocol, pilot, baseline, holdout, core or implementation terminology;
- do not invent cloud backup, account recovery, merge rules or support infrastructure;
- keep tone factual, adult and non-blaming.

# COPY FIREWALL

Plain, gender-neutral Russian. No guilt, shame, therapy, guardian language, streak, CEFR, research or engineering terminology. Describe observable consequences before destructive confirmation.

# VISUAL AND ERGONOMIC CONSTRAINTS

- Preserve Living Content and frozen Batch A/C typography, palette, spacing and controls.
- 390×844 canonical viewport.
- Body text normally ≥16px; secondary ≥14px; touch targets ≥44×44.
- One primary action per state.
- Destructive start-again action must not look like routine forward progress; confirmation cannot be accidental.
- Do not use colour as the only warning or status signal.
- Black/ink remains legal for task-level actions; terracotta remains the primary journey-action colour.

# REQUIRED OUTPUT

Save only under `docs/design/exports/recovery-integrity-v1/`:

1. `RECOVERY_INTEGRITY_BOARD.dc.html`.
2. `RECOVERY_STATE_MATRIX.md`.
3. `DATA_INTEGRITY_STATE_MATRIX.md`.
4. `COPY_INVENTORY.md`.
5. `TRACEABILITY.md`.
6. `OPEN_QUESTIONS.md`.
7. `screens/` with individual HTML for materially different full-screen states only.

Update `.ai/SESSION.md`, `.ai/TASKS.md` and `docs/governance/IMPLEMENTATION_HANDOFF.md` only if the environment has real repository write access.

# ACCEPTANCE GATE

- S6 has no dead end with zero due items.
- Recovery does not advance curriculum progress.
- Safe exit does not count completion.
- Reused Batch C mechanics are unchanged.
- Data loss never silently creates a new start.
- Recovery is not promised without a confirmed source.
- Destructive restart requires explicit informed confirmation.
- Frozen screens and navigation are not redesigned.

# STOP GATE

Stop after this gap-closure package. Do not start Batch D, redesign navigation, modify Batch A/B/C, resolve future-scope decisions or implement application code. Wait for product-owner visual approval and Codex QA.
