# Current Project Session

Last updated: 2026-07-22

## Phase

Visual design: Batch A frozen; Batch B correction v2 approved; Batch C correction v1 defaults approved and frozen; Batch C state pass is next.

## Architecture status

Frozen. Changes require an ADR, an Architecture Resolution where applicable, and product-owner approval.

## Current focus

Batch A is frozen in `docs/design/exports/batch-a-defaults-final/`. Approved Batch B screens S9–S13 and their states are in `docs/design/exports/batch-b-correction-v2/`. Approved Batch C defaults are in `docs/design/exports/batch-c-correction-v1/`. Living Content remains the canonical visual-language source. Approved screens must not be reopened without an owner decision.

## Completed this session

Batch C correction v1 passed Codex QA and was approved by the product owner. All C1–C2 and M1–M5 findings were closed; keyboard-open references for phases 3 and 4 were verified. Commit `b3f6e5f` on `codex/batch-c-review`; review: `docs/design/reviews/BATCH_C_CORRECTION_V1_QA_CODEX.md`.

## Next task

Batch C states v1 was delivered and reviewed. Claude Design/Fable executes only `docs/prompts/design/07_batch_c_state_correction.md`. Preserve frozen defaults and the approved black/ink task controls. Stop after the six bounded patches for owner review and Codex QA.

## Blockers

Do not redraw Batch A, Batch B or Batch C defaults. Do not introduce pilot/research terminology into learner-facing copy. Do not invent sync infrastructure, speech analysis or background AI delivery. Evening Circle remains Future Extension pending owner decision.

## Handoff rule

At task completion, update this file with the completed outcome, next task, blockers, and relevant commit or review reference.

## Continuity

If Codex/ChatGPT is unavailable, Claude Opus 4.8 may continue as temporary orchestrator under `.ai/CLAUDE_INTERIM_ORCHESTRATOR.md`. Fable remains responsible only for visual execution; the product owner retains all approval gates.
