# Implementation Handoff

## Current approved design sources

- Batch A frozen: `docs/design/exports/batch-a-defaults-final/`.
- Batch B approved: `docs/design/exports/batch-b-correction-v2/`.
- Batch C defaults frozen: `docs/design/exports/batch-c-correction-v1/`.
- Batch C states frozen: `docs/design/exports/batch-c-states-correction-v1/`.
- Batch C reviews: `BATCH_C_CORRECTION_V1_QA_CODEX.md`, `BATCH_C_STATES_CORRECTION_V1_QA_CODEX.md`.

Only these packages may govern implementation. Historical Living Content files remain visual references and do not override frozen screen specifications.

## Active design task

- Objective: close omitted S6 Recovery and S1 data-integrity failure design coverage before Batch D.
- Execution brief: `docs/prompts/design/08_recovery_and_integrity_gap_closure.md`.
- Frozen inputs: approved Batch A and Batch C defaults/states.
- Expected output: `docs/design/exports/recovery-integrity-v1/`.
- Owner: Claude Design / Fable.
- Reviewer: Codex for logic, copy, ergonomics, accessibility and unsupported implementation claims.

## Frozen constraints

- Product and UX architecture remain frozen.
- No navigation redesign.
- No new learning mechanics.
- No speech analysis, pronunciation scoring or human-listening claim.
- No invented sync/background-delivery infrastructure.
- No research or implementation terminology in learner-facing copy.
- No application-code changes during the state pass.

## Required completion report

Report exact created files, covered states, source branch/commit if available, assumptions, unresolved decisions and checks performed. Stop for product-owner visual review and Codex QA.
