# Current Project Session

Last updated: 2026-08-08

## Phase

Owner-as-first-learner validation gate. No new curriculum UX/UI or learner-facing implementation may proceed until the existing complete learning program is exposed to the owner in one readable package, Galina completes the missing speaking baseline, and the program is run manually with her. Content/mechanics must demonstrate useful learning evidence and receive owner content/UX acceptance before Fable visualization or Codex implementation.

The owner-facing review surface is now Figma file `q1MooGkru7rssI4k72MOwl` (`Intensive English — Owner Review · First Run + Day 1`). Existing Fable boards were partially imported into the single file. Final one-canvas arrangement is blocked by the Figma Starter MCP call limit; missing orientation and completed-day screens remain Fable 5 work, not Codex-created visuals.

## Operational control plane

Codex is the active single orchestrator. The product owner assigns work in this Codex task; Codex manages Git, engineering, QA, acceptance and bounded delegation to Claude. Claude Design / Fable remains the exclusive visual designer and applies every visual correction. ChatGPT is background history only. Memoree supports cited historical recall but never overrides current Git.

The owner-facing delivery control plane is Notion: [Intensive English — Product HQ](https://app.notion.com/p/3b61e441fe4381f495edc1cb96162930?pvs=204), with the `Intensive English — Delivery` database and owner-home linked views for current work, Galina decisions, blockers and completed work, plus database-level Kanban, roadmap, risk and release views. The documented operating model is [How we manage development](https://app.notion.com/p/3b61e441fe438183a45ee7ba13a5197c?pvs=204). Notion is the readable operational surface; Git remains authoritative. Obsidian Markdown is retained as the versioned technical archive and is not the owner's primary Kanban.

Continuity for a new Codex task is provided by `.ai/CODEX_HANDOFF.md` and the project skill `.agents/skills/intensive-english-orchestrator/SKILL.md`; the owner must not be asked to reconstruct the prior conversation.

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

The product owner approved the downloaded Claude Design `ie` brand mark for application use. The complete Fable package is stored at `docs/design/exports/ie-brand-package-v1/`; its supplied main, Android adaptive, monochrome, splash and favicon assets replace the legacy speech-wave icon files in the Expo application.

Stage 0 Day 1 visual design passed owner approval and Codex QA. The accepted default and state artifacts are frozen in `docs/design/exports/stage0-day1-v1/`; QA is recorded in `docs/design/reviews/STAGE0_DAY1_DEFAULT_AND_STATES_V2_QA_CODEX.md`. The governing UX/copy contract is commit `1f647ba`.

Stage 0 Day 1 engineering implementation is complete on `codex/stage0-day1-vertical-slice`. Independent review of exact tip `b7bb786` passed with no remaining actionable findings after corrections. The implementation now includes active-path-scoped full and short paths, exact resume, v2→v3 state migration without progress loss, the non-blocking meaning gate, structured retrieval with failure-safe input retention, free production, optional private recording, three distinct guided variations plus the approved optional second version, two explicitly evidenced spoken versions, honest completion facts and frozen Fable default/state artifacts. Mobile TypeScript is clean and the repository unit suite passes 162/162. Physical-device microphone lifecycle and screen-reader QA remain open.

Training-sufficiency revision v1.2 passed Codex QA. Owner decisions A1–A4 are accepted: run Stage 0; obtain separate research consent for optional speech samples; use a human speaker for decoding/text audio with TTS allowed for isolated cards; maintain Draft ADR-001 until Stage 0 evidence is reviewed.

Engineering PR 3 implemented S2 Recognition, S3 Profile Entry and the complete-profile → Path Hub transition. Owner-ratified S3 copy and translation states are frozen in `docs/design/exports/s3-copy-ratification-v3/`. Commit `09436bf` passed 135/135 core unit tests and mobile TypeScript. GitHub review: PR #4.

Engineering PR 6 implemented S5 Daily Cycle and S14 Summary, including active-path-scoped local draft recovery, safe exit/resume, six-phase progress, accessible touch targets and the approved three-phrase priming screen. Automated browser QA at 390×844 verified the complete S5→S14 flow, exact phase-4 draft recovery after reload, visible actions and no horizontal overflow or React console errors. Core tests passed 144/144; mobile TypeScript, web production build and S14 evaluation (16/16) passed locally and in GitHub Actions. PR #7 merged as `96bfe95`.

## Next task

**Active task: assemble the existing program and its app traceability without redesign, then run Galina's manual self-pilot.** The immediate deliverable is one owner-readable AS-IS package covering audience, goals, scientific/methodological basis, complete curriculum, calendar/hours, skill assessment, exercises, feedback, prior research, implemented coverage and gaps. After owner review, complete the missing speaking baseline from the existing English Tutor vault and begin manual sessions. Fable first-run work and final Android acceptance are downstream, not the immediate gate.

The AS-IS package is now available for owner review in [Notion](https://app.notion.com/p/3b71e441fe4381d89e11ec7bfeb2815e?pvs=204). It includes the English Tutor personal plan, current skill-profile evidence, Stage 0 seven-day schedule, app coverage, completed-work inventory, missing traceability, and an `AS-IS календарь и Gantt` database. The Gantt contains only dates already present in source material; previously unscheduled product work is explicitly shown as unscheduled or blocked.

The short-path routing defect is corrected in Codex: written production now reaches S14 feedback in both short and full modes; full mode retains its optional voice step. Automated verification passes 163/163 tests, mobile TypeScript and S14 baseline 16/16.

The Path Hub header finding is visual and is routed to Fable through `docs/prompts/design/15_path_hub_week_header_device_correction.md`. Required sequence now is:

1. Claude multi-agent UX/UI QA at `7acc9a7` — complete.
2. Owner device findings — captured.
3. Engineering keyboard/input correction `e1f1dbe` — complete; a limited Android verification may run early but is not final acceptance.
4. Fable correction brief `ed6b7cc` — complete.
5. Fable correction artifact — downloaded and stored at `docs/design/exports/stage0-owner-device-correction-v1/`.
6. Codex inspection — PASS for owner visual review at `docs/design/reviews/STAGE0_OWNER_DEVICE_CORRECTION_V1_QA_CODEX.md`.
7. Product owner approved the corrected visuals — complete.
8. Codex implemented the approved artifact: S7 completion transition, keyboard/input references, S14 written-text feedback states and S3 responsive choices. Mobile TypeScript, 162/162 unit tests and Android export pass.
9. Physical Android evidence confirmed current Entry/Path Hub and exposed the short-path S14 routing defect plus a Path Hub week-header visual collision.
10. Codex short-path S14 routing correction — complete and automated checks pass.
11. Fable Path Hub week-header correction — downloaded from `Intensive English дизайн-система_5авг_2.zip`, stored at `docs/design/exports/path-hub-week-header-device-correction-v1/`, passed Codex QA, owner-approved and implemented.
12. Physical Android reset-2 run confirmed the current build but exposed first-run orientation and completed-session defects.
13. Engineering removed the redundant Path Hub start gate after S7: `Начать тренировку` now opens the Day 1 plan directly.
14. Fable first-run orientation, S7 copy, Day 1 plan actions and completed-Day-1 Path Hub correction from `docs/prompts/design/16_first_run_orientation_and_completed_day_correction.md` — active visual/copy gate.
15. After owner approval and Codex implementation, final physical Android UX/UI regression covers the complete corrected build, including completed-day routing, microphone lifecycle, keyboard behavior, S7 transition, S14 feedback and screen-reader labels.

Do not implement Days 2–7 until this full sequence is closed.

## Blockers

The immediate blocker is the Fable artifact and owner visual approval for prompt 16. Final Android acceptance cannot run against the known circular completed-day route. Native APK delivery is not configured on this Mac, so the current delivery remains a cleared-cache Expo LAN build. Do not redesign or visually correct the screens in Codex, implement a runtime day composer, build Stage 1, or copy Daniel materials. Research language must not enter learner-facing copy. Voice samples require separate consent and remain outside product progress.

## Handoff rule

At task completion, update this file with the completed outcome, next task, blockers, and relevant commit or review reference.

## Continuity

If Codex is unavailable, Claude Opus may continue only after explicit owner reactivation of the emergency protocol in `.ai/CLAUDE_INTERIM_ORCHESTRATOR.md`. Fable remains responsible only for visual execution; the product owner retains all approval gates.
