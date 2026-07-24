# Current Project Session

Last updated: 2026-07-23

## Phase

Visual design: Batch A frozen; Batch B correction v2 approved; Batch C defaults and states approved and frozen; Recovery/data-integrity gap closure approved and frozen; Batch D approved and frozen; Batch E defaults and states approved and frozen.

## Architecture status

Frozen. Changes require an ADR, an Architecture Resolution where applicable, and product-owner approval.

## Current focus

Batch A is frozen in `docs/design/exports/batch-a-defaults-final/`. Approved Batch B screens S9–S13 and their states are in `docs/design/exports/batch-b-correction-v2/`. Approved Batch C defaults and states are in `docs/design/exports/batch-c-correction-v1/` and `docs/design/exports/batch-c-states-correction-v1/`. Recovery/data-integrity gap closure is frozen in `docs/design/exports/recovery-integrity-v1/`. Batch D progress/words/artifacts/review is frozen in `docs/design/exports/batch-d-final/`. Batch E library/reader/shadowing defaults are frozen in `docs/design/exports/batch-e-correction-v1/`; Batch E states are frozen in `docs/design/exports/batch-e-states-v1/`. Living Content remains the canonical visual-language source. Approved screens must not be reopened without an owner decision.

## Completed this session

Recovery/data-integrity gap closure v1 passed owner review and Codex QA. The accepted package from `Intensive English дизайн-система_25.zip` was stored as `docs/design/exports/recovery-integrity-v1/`. Verified: S6 Recovery, zero-due Recovery, S1 data-integrity failure, explicit restart confirmation, copy firewall and 390x844 action visibility.

Batch D final passed owner review and Codex QA. The accepted package from `Intensive English дизайн-система_29.zip` was stored as `docs/design/exports/batch-d-final/`. Verified: S18 Progress, S16 My Words, S17 My Artifacts, SRS/review entry and required states; copy firewall; 390x844 action visibility; final owner-approved copy uses “вернём их под руку”.

Batch E correction v1 passed owner review and Codex QA. The accepted package from `Intensive English дизайн-система_31.zip` was stored as `docs/design/exports/batch-e-correction-v1/`. Verified: S19 Library, S21 Reading/Listening and S22 Shadowing defaults; S22 recording is one accessible tappable control; S22 gate copy is non-evaluative (“Смысл уже разобран”); S19 future import card is disabled/FUT; no learner-facing pilot/research terminology.

Batch E states v1 passed owner review and Codex QA. The accepted package from `Intensive English дизайн-система_32.zip` was stored as `docs/design/exports/batch-e-states-v1/`. Verified: S19 empty/search/loading/unavailable states; S21 loading/audio/transcript/no-selection states; S22 locked/permission/recording/recorded/playback/save-failed states; no voice scoring, accent judgement, CEFR inference, streaks, guardians or cloud/sync claims. Codex corrected the S22 recording control accessibility label to “Остановить запись” without changing visual design.

## Next task

Implementation-ready design consolidation is complete. Current step: review `docs/design/IMPLEMENTATION_READY_DESIGN_INDEX.md` and run the engineering readiness audit prompt `docs/prompts/engineering/01_implementation_readiness_audit.md`. Do not implement code before the audit.

## Blockers

Do not redraw Batch A, Batch B, Batch C or Recovery/Integrity. Do not introduce pilot/research terminology into learner-facing copy. Do not invent sync infrastructure, speech analysis, background AI delivery, CEFR inference from activity, streaks or guardian mechanics. Evening Circle remains Future Extension pending owner decision.

## Handoff rule

At task completion, update this file with the completed outcome, next task, blockers, and relevant commit or review reference.

## Continuity

If Codex/ChatGPT is unavailable, Claude Opus 4.8 may continue as temporary orchestrator under `.ai/CLAUDE_INTERIM_ORCHESTRATOR.md`. Fable remains responsible only for visual execution; the product owner retains all approval gates.
