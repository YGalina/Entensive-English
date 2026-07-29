# Current Project Session

Last updated: 2026-07-29

## Phase

Methodology validation and Stage 0 content production. Frozen visual packages remain authoritative and are not reopened.

## Architecture status

Frozen. `docs/adr/ADR-001-composite-learning-day.md` is Draft only and grants no implementation or visual-design authority.

## Current focus

The training-sufficiency revision v1.2 is accepted in `docs/methodology/training_revision_v1/`. Its governing conclusion is that S5 is a valid learning block but an insufficient complete intensive day. The candidate composite-day direction must be tested through one manually produced seven-day individual module before architecture, design or implementation changes.

Batch A is frozen in `docs/design/exports/batch-a-defaults-final/`. Approved Batch B screens S9–S13 and their states are in `docs/design/exports/batch-b-correction-v2/`. Approved Batch C defaults and states are in `docs/design/exports/batch-c-correction-v1/` and `docs/design/exports/batch-c-states-correction-v1/`. Recovery/data-integrity gap closure is frozen in `docs/design/exports/recovery-integrity-v1/`. Batch D progress/words/artifacts/review is frozen in `docs/design/exports/batch-d-final/`. Batch E library/reader/shadowing defaults are frozen in `docs/design/exports/batch-e-correction-v1/`; Batch E states are frozen in `docs/design/exports/batch-e-states-v1/`. Batch F Auth & Monetization defaults are frozen in `docs/design/exports/batch-f-auth-monetization-correction-v1/`; Batch F states are frozen in `docs/design/exports/batch-f-auth-monetization-states-v1/`. Living Content remains the canonical visual-language source. Approved screens must not be reopened without an owner decision.

## Engineering status

Recovery/data-integrity gap closure v1 passed owner review and Codex QA. The accepted package from `Intensive English дизайн-система_25.zip` was stored as `docs/design/exports/recovery-integrity-v1/`. Verified: S6 Recovery, zero-due Recovery, S1 data-integrity failure, explicit restart confirmation, copy firewall and 390x844 action visibility.

Batch D final passed owner review and Codex QA. The accepted package from `Intensive English дизайн-система_29.zip` was stored as `docs/design/exports/batch-d-final/`. Verified: S18 Progress, S16 My Words, S17 My Artifacts, SRS/review entry and required states; copy firewall; 390x844 action visibility; final owner-approved copy uses “вернём их под руку”.

Batch E correction v1 passed owner review and Codex QA. The accepted package from `Intensive English дизайн-система_31.zip` was stored as `docs/design/exports/batch-e-correction-v1/`. Verified: S19 Library, S21 Reading/Listening and S22 Shadowing defaults; S22 recording is one accessible tappable control; S22 gate copy is non-evaluative (“Смысл уже разобран”); S19 future import card is disabled/FUT; no learner-facing pilot/research terminology.

Batch E states v1 passed owner review and Codex QA. The accepted package from `Intensive English дизайн-система_32.zip` was stored as `docs/design/exports/batch-e-states-v1/`. Verified: S19 empty/search/loading/unavailable states; S21 loading/audio/transcript/no-selection states; S22 locked/permission/recording/recorded/playback/save-failed states; no voice scoring, accent judgement, CEFR inference, streaks, guardians or cloud/sync claims. Codex corrected the S22 recording control accessibility label to “Остановить запись” without changing visual design.


Batch F Auth & Monetization correction v1 passed owner review and Codex QA. The accepted package from `Intensive English дизайн-система_34.zip` was stored as `docs/design/exports/batch-f-auth-monetization-correction-v1/`. Verified: prices match `06_monetization.md` placeholders (690 ₽ / 3 990 ₽), anonymous-local copy avoids unsafe cross-device promises, email placeholder is neutral, paywall benefit copy is corrected, no trial/PRO/guarantee/group-intensive/CEFR-result claims are present in learner-facing screens.


Batch F Auth & Monetization states v1 passed Codex QA. The accepted package from `Intensive English дизайн-система_37.zip` was stored as `docs/design/exports/batch-f-auth-monetization-states-v1/`. Verified: 21 auth/payment state screens, correct output path, button heights, payment/auth failure coverage, restore/cancel/expired/offline states, no trial/PRO/guarantee/CEFR-result/streak/guardian/speech-scoring claims. Returning-account default remains covered by frozen FA4; signed-out/local-only clarification is covered by FS09 and FS08.


Engineering implementation-readiness audit v1 completed at `docs/engineering/IMPLEMENTATION_READINESS_AUDIT_V1.md`. Verdict: partially ready. Frozen visual design is strong, but implementation must start with P0 foundation/contracts because legacy code still contains pilot/Vertical Slice, Galina, guardians, streaks, levelcheck/CEFR and old pricing/auth assumptions that must not leak into product UI. Recommended first implementation PR: shared Living Content primitives, route registry, event semantics, PathNextStep contract and copy firewall.

Engineering PR 1 (Foundation / Product Shell Contracts) implemented per the audit's Slice 0 recommendation: shared Living Content UI primitive contract (`packages/tokens/primitives.ts`), frozen screen route registry with legacy pilot/guardian/streak/levelcheck routes marked not product-ready (`packages/core/routes.ts`), event categories with the progress-writer invariant (`packages/core/eventCategories.ts`), the read-only PathNextStep contract (`packages/core/pathNextStep.ts`), and a machine-checkable copy/semantic firewall (`packages/core/copyFirewall.ts` + `docs/engineering/COPY_SEMANTIC_FIREWALL_CHECKLIST.md`). Foundation tests pass (13/13) and the new modules typecheck clean. No full screens implemented; no frozen design or legacy code changed. Rebased onto the current branch tip (`f4d6009`).

## Accepted

PR 2 (S1 Entry/Resume Router + Path routing foundation) and its integrity-restart correction are **accepted**. Independent Codex review passed: exact commit `cca2dc1` verified, 115/115 repository tests passed, no blocking findings. The accepted line on `codex/recovery-integrity-freeze` is `cca2dc1`.

## Completed this session

Training-sufficiency revision v1.2 passed Codex QA. Owner decisions A1–A4 are accepted: run Stage 0; obtain separate research consent for optional speech samples; use a human speaker for decoding/text audio with TTS allowed for isolated cards; maintain Draft ADR-001 until Stage 0 evidence is reviewed.

Engineering PR 3 implemented S2 Recognition, S3 Profile Entry and the complete-profile → Path Hub transition. Owner-ratified S3 copy and translation states are frozen in `docs/design/exports/s3-copy-ratification-v3/`. Commit `09436bf` passed 135/135 core unit tests and mobile TypeScript. GitHub review: PR #4.

Engineering PR 6 implemented S5 Daily Cycle and S14 Summary, including active-path-scoped local draft recovery, safe exit/resume, six-phase progress, accessible touch targets and the approved three-phrase priming screen. Automated browser QA at 390×844 verified the complete S5→S14 flow, exact phase-4 draft recovery after reload, visible actions and no horizontal overflow or React console errors. Core tests passed 144/144; mobile TypeScript, web production build and S14 evaluation (16/16) passed locally and in GitHub Actions. PR #7 merged as `96bfe95`.

## Next task

**Active task: Stage 0 module production.** Opus acts as Learning Content Architect and produces the complete individual seven-day “Work Conversation” module: target-language inventory, final texts, exercise scripts, SRS plan, listening/decoding and pronunciation materials, scenarios, writing task, transfer task, pre/post/+7 instruments and production manifest. No application code or visual design. Stop for independent methodology and Codex QA before Fable receives learner-facing copy.

## Blockers

Do not redesign frozen screens, implement a runtime day composer, build Stage 1, or copy Daniel materials. Research language must not enter learner-facing copy. Voice samples require separate consent and remain outside product progress. PR 7 engineering is paused at this owner gate.

## Handoff rule

At task completion, update this file with the completed outcome, next task, blockers, and relevant commit or review reference.

## Continuity

If Codex/ChatGPT is unavailable, Claude Opus 4.8 may continue as temporary orchestrator under `.ai/CLAUDE_INTERIM_ORCHESTRATOR.md`. Fable remains responsible only for visual execution; the product owner retains all approval gates.
