# Current Project Session

Last updated: 2026-07-23

## Phase

Visual design: Batch A frozen; Batch B correction v2 approved; Batch C defaults and states approved and frozen; Recovery/data-integrity gap closure approved and frozen; Batch D is next.

## Architecture status

Frozen. Changes require an ADR, an Architecture Resolution where applicable, and product-owner approval.

## Current focus

Batch A is frozen in `docs/design/exports/batch-a-defaults-final/`. Approved Batch B screens S9–S13 and their states are in `docs/design/exports/batch-b-correction-v2/`. Approved Batch C defaults and states are in `docs/design/exports/batch-c-correction-v1/` and `docs/design/exports/batch-c-states-correction-v1/`. Recovery/data-integrity gap closure is frozen in `docs/design/exports/recovery-integrity-v1/`. Living Content remains the canonical visual-language source. Approved screens must not be reopened without an owner decision.

## Completed this session

Recovery/data-integrity gap closure v1 passed owner review and Codex QA. The accepted package from `Intensive English дизайн-система_25.zip` was stored as `docs/design/exports/recovery-integrity-v1/`. Verified: S6 Recovery, zero-due Recovery, S1 data-integrity failure, explicit restart confirmation, copy firewall and 390x844 action visibility.

## Next task

Claude Design/Fable executes only `docs/prompts/design/09_batch_d_progress_words_artifacts_srs.md`. Create the Batch D default-screen pass for S18 Progress, S16 My Words, S17 My Artifacts and SRS/review surfaces. Stop after the Batch D default-screen pass for owner visual review and Codex QA.

## Blockers

Do not redraw Batch A, Batch B, Batch C or Recovery/Integrity. Do not introduce pilot/research terminology into learner-facing copy. Do not invent sync infrastructure, speech analysis, background AI delivery, CEFR inference from activity, streaks or guardian mechanics. Evening Circle remains Future Extension pending owner decision.

## Handoff rule

At task completion, update this file with the completed outcome, next task, blockers, and relevant commit or review reference.

## Continuity

If Codex/ChatGPT is unavailable, Claude Opus 4.8 may continue as temporary orchestrator under `.ai/CLAUDE_INTERIM_ORCHESTRATOR.md`. Fable remains responsible only for visual execution; the product owner retains all approval gates.
