# Current Project Session

Last updated: 2026-07-22

## Phase

Visual design: Batch A frozen; Batch B correction v2 approved; Batch C defaults and states approved and frozen; Batch B recovery/data-integrity gap closure is next.

## Architecture status

Frozen. Changes require an ADR, an Architecture Resolution where applicable, and product-owner approval.

## Current focus

Batch A is frozen in `docs/design/exports/batch-a-defaults-final/`. Approved Batch B screens S9–S13 and their states are in `docs/design/exports/batch-b-correction-v2/`. Approved Batch C defaults and states are in `docs/design/exports/batch-c-correction-v1/` and `docs/design/exports/batch-c-states-correction-v1/`. Living Content remains the canonical visual-language source. Approved screens must not be reopened without an owner decision.

## Completed this session

Batch C state correction v1 passed Codex QA and is frozen. All six bounded corrections were verified; superseded states v1 was removed from the current source of truth. Review: `docs/design/reviews/BATCH_C_STATES_CORRECTION_V1_QA_CODEX.md`.

## Next task

Claude Design/Fable executes only `docs/prompts/design/08_recovery_and_integrity_gap_closure.md`. Complete S6 Recovery plus the S1 data-integrity failure journey by reusing frozen Batch A/C patterns. Stop for owner visual review and Codex QA. After this gap closes, proceed to planned Batch D (S18/S16/S17/SRS).

## Blockers

Do not redraw Batch A, Batch B or Batch C defaults. Do not introduce pilot/research terminology into learner-facing copy. Do not invent sync infrastructure, speech analysis or background AI delivery. Evening Circle remains Future Extension pending owner decision.

## Handoff rule

At task completion, update this file with the completed outcome, next task, blockers, and relevant commit or review reference.

## Continuity

If Codex/ChatGPT is unavailable, Claude Opus 4.8 may continue as temporary orchestrator under `.ai/CLAUDE_INTERIM_ORCHESTRATOR.md`. Fable remains responsible only for visual execution; the product owner retains all approval gates.
