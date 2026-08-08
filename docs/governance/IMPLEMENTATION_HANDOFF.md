# Implementation Handoff

## Current approved design sources

- Batch A frozen: `docs/design/exports/batch-a-defaults-final/`.
- Batch B approved: `docs/design/exports/batch-b-correction-v2/`.
- Batch C defaults frozen: `docs/design/exports/batch-c-correction-v1/`.
- Batch C states frozen: `docs/design/exports/batch-c-states-correction-v1/`.
- Recovery/data-integrity frozen: `docs/design/exports/recovery-integrity-v1/`.
- Batch D progress/words/artifacts/review frozen: `docs/design/exports/batch-d-final/`.
- Batch E library/reader/shadowing defaults frozen: `docs/design/exports/batch-e-correction-v1/`.
- Batch E library/reader/shadowing states frozen: `docs/design/exports/batch-e-states-v1/`.
- Implementation-ready design index: `docs/design/IMPLEMENTATION_READY_DESIGN_INDEX.md`.
- Engineering readiness audit prompt: `docs/prompts/engineering/01_implementation_readiness_audit.md`.
- Batch F0 Auth & Monetization resolution prompt: `docs/prompts/design/11_batch_f0_auth_monetization_resolution.md`.
- Batch F Auth & Monetization visual-design prompt template: `docs/prompts/design/12_batch_f_auth_monetization_visual_design.md`.
- Batch F0 Auth & Monetization resolution: `docs/design/auth_monetization/BATCH_F0_AUTH_MONETIZATION_RESOLUTION.md`.
- Batch F Auth & Monetization defaults frozen: `docs/design/exports/batch-f-auth-monetization-correction-v1/`.
- Batch F Auth & Monetization states frozen: `docs/design/exports/batch-f-auth-monetization-states-v1/`.
- Batch C reviews: `BATCH_C_CORRECTION_V1_QA_CODEX.md`, `BATCH_C_STATES_CORRECTION_V1_QA_CODEX.md`.

Only these packages may govern implementation. Historical Living Content files remain visual references and do not override frozen screen specifications.

- Engineering implementation-readiness audit: `docs/engineering/IMPLEMENTATION_READINESS_AUDIT_V1.md`.

## Implementation foundation (engineering PR 1)

Product Shell Contracts landed as additive, non-destructive foundation per the audit's Slice 0 / PR 1 recommendation (no full screens, no frozen design or legacy code changed):

- Shared Living Content UI primitive contract: `packages/tokens/primitives.ts` (radii from `marina`; a11y minimums — touch ≥44, body ≥16, secondary ≥14; focus ring; button/surface/pill/text-role specs). Platform-agnostic data both RN and web read.
- Frozen screen route registry: `packages/core/routes.ts` (`SCREENS` S1–S27 with product-ready + frozen-design source; `LEGACY_ROUTES` marks pilot/guardian/streak/levelcheck/removed-concept routes **not product-ready**; helpers `isProductReady`, `productReadyScreens`, `isLegacyRoute`).
- Event categories: `packages/core/eventCategories.ts` (progress/evidence/process/navigation/system; only progress+evidence may write course truth — `mayWriteProgress`, `assertMayWriteProgress`).
- PathNextStep contract: `packages/core/pathNextStep.ts` (read-only `computeNextStep` returns exactly one primary step; Path is a projection, never writes progress).
- Copy/semantic firewall: `packages/core/copyFirewall.ts` (`scanForBannedTerms`, `passesCopyFirewall`, `SEMANTIC_RULES`) + checklist `docs/engineering/COPY_SEMANTIC_FIREWALL_CHECKLIST.md`.
- Tests: `packages/core/tests/foundation.test.ts` — 13/13 pass; new modules typecheck clean.

Constraint for later PRs: only `SCREENS` entries with `productReady:true` may be implemented; every learner-facing string must pass `scanForBannedTerms`; process/navigation events must never move Path.

## Implementation PR 2 (S1 Entry/Resume Router + Path routing)

Additive, non-destructive routing shell (no full session, no legacy route deleted, no frozen design changed, no payment provider):

- `packages/core/entryRouting.ts`: read-only Path projection from local storage (`ENTRY_KEYS`, `readPathState`) wired to `computeNextStep`; `routeForStep` / `resolveEntryRoute` map the one next step to a product route; `ENTRY_COPY` holds frozen learner-facing copy, verified by the copy firewall in tests. Router never writes progress/evidence.
- Mobile `apps/mobile/src/app/entry/`: `_layout.tsx`, S1 router `index.tsx` (replaces into the resolved route over a warm "свет лампы" transition), and minimal product-safe stubs — `recognition.tsx` (S2), `path-hub.tsx` (S4), `integrity-blocked.tsx` + `integrity-restart-confirm.tsx` (Recovery/Integrity; explicit acknowledgement gate; no silent new-user flow), `coming-soon.tsx` (neutral placeholder for resume/protocol/recovery/daily destinations). `apps/mobile/src/components/entry-ui.tsx` consumes PR 1 primitives (button heights, a11y minimums).
- Tests: `packages/core/tests/entryRouting.test.ts` — 11/11 (routing precedence, invalid-id rejection, entitlement-lock projection, firewall over `ENTRY_COPY`). Core suite 24/24; core typechecks clean. Mobile RN typecheck not runnable in this worktree (no `node_modules`).

Next gate: Codex review of PR 1/PR 2, then PR 3 (S2 Recognition + S3 Profile Entry full screens, which write `ie_profile` and unlock the profile→path-hub transition).

## Active project gate

- Objective: final physical Android regression of the owner-approved and implemented `docs/design/exports/stage0-owner-device-correction-v1/` delta.
- Authoritative implementation: branch `codex/stage0-day1-vertical-slice`; current task is recorded in `.ai/SESSION.md`.
- Codex is the operational orchestrator, Git/engineering owner and QA gate. It may dispatch bounded analysis or review to Claude.
- Claude Design / Fable exclusively executes visual design and visual corrections after a scoped brief. The product owner gives final visual approval.

## Device launch and legacy-route containment

- Canonical startup is `/entry`; the root-owning legacy tab group redirects there.
- Root layout now rejects every route outside `/entry` and `/entry/*`. Cached URLs and direct links can no longer expose old onboarding, automatic word cycling, word-flood, music, coach, guardians, streaks, levelcheck or other legacy surfaces.
- The current repository contains no APK/AAB/IPA or EAS build configuration. A custom-icon app already installed on a phone is therefore not evidence of the current branch; current JavaScript is tested through a fresh Expo/Metro bundle until a separately approved native build identity and delivery path exist.
- The legacy app icon from commit `503bfbe` has been replaced by the owner-approved Fable brand package stored at `docs/design/exports/ie-brand-package-v1/`. Expo now uses the supplied `ie` icon, Android adaptive foreground/background/monochrome assets, splash icon and favicon; native and splash backgrounds use paper `#FAF6EE`, and web theme color uses brand terracotta `#E8623D`.

## Stage 0 owner-device correction implementation

- Owner visual approval recorded 2026-08-05.
- S7 now shows the approved neutral `28 из 28` completion transition before the first training handoff.
- Stage 0 text fields disable autocorrect, capitalization and spellcheck, retain local drafts and use the approved keyboard-safe scroll behavior.
- S14 now evaluates only the written production: target frame present, on-topic without frame, up to two deterministic self-correction prompts, and a non-default unavailable state. It preserves the learner's original text and explicitly states that voice was not analysed.
- S3 choices use equal full-width `minHeight: 60` controls with wrapping text and vertical scrolling.
- Verification: mobile TypeScript clean; repository unit suite 162/162; Android Expo export successful.

### Short-path S14 routing correction — 2026-08-05

- Physical Android evidence showed the short Day 1 path closing immediately after written production, so the implemented S14 feedback states were unreachable in that mode.
- `submitStage0Day1Production` now routes short mode directly to written feedback (`summary`); full mode retains the optional private voice step before the same feedback.
- The mobile screen no longer overrides the state-machine result by immediately closing short mode.
- Verification: repository unit suite 163/163; mobile TypeScript clean; S14 deterministic baseline 16/16; `git diff --check` clean.
- The same device evidence exposed a separate Path Hub week-header collision. It is visual work and is routed to Fable in `docs/prompts/design/15_path_hub_week_header_device_correction.md`; no visual correction was made in Codex.

### Path Hub week-header correction — 2026-08-05

- The product owner approved the inspected Fable artifact at `docs/design/exports/path-hub-week-header-device-correction-v1/`.
- The weekly-practice header now uses the approved wrapping row: the month group may shrink and wrap, while `Первая неделя` remains intact and moves to the next line when required.
- Copy is never truncated, shortened or reduced in size. The weekday row and explanatory copy are unchanged.
- Final physical Android regression remains required.

### Android QA delivery identity — 2026-08-08

- Native APK delivery is unavailable on the current Mac: no Android SDK/ADB, Java runtime, native Android project, EAS project credentials or authenticated Expo session is configured.
- The verified fallback is an Expo LAN server from `apps/mobile`, bound to `192.168.0.187:8083` with a cleared Metro cache.
- Development builds show `QA · 1.0.0 · f93645e` at the bottom of Path Hub so the owner can distinguish the corrected bundle from stale Expo Go history. This label is guarded by `__DEV__` and is absent from production builds.
- The visible QA identity maps to the owner-device corrections through `f93645e`; the approved brand icon commit `6ab0e27` is its direct ancestor. The native launcher icon still requires a future native build/install.

### Owner QA reset and yellow launcher tile — 2026-08-08

- The owner confirmed that prior completed progress prevented the corrected flow from being visible. Development startup now performs a one-time, marker-guarded reset of only Entry/Stage 0 QA progress keys; unrelated preferences and owner files are untouched. Production builds never run this reset.
- The owner clarified the approved launcher treatment: the icon is a full amber `#FFD66B` tile with the black `ie` mark. The main 1024 icon is derived mechanically from the approved Fable favicon asset; Android adaptive configuration uses amber as the full background and the supplied black monochrome `ie` foreground.

## Frozen constraints

- Product and UX architecture remain frozen.
- No navigation redesign.
- No new learning mechanics.
- No speech analysis, pronunciation scoring or human-listening claim.
- No invented sync/background-delivery infrastructure.
- No research or implementation terminology in learner-facing copy.
- No CEFR inference from activity, streaks, guardian mechanics or percent-of-course progress.
- Application-code changes must be tied to a verified defect or approved implementation task and pass proportionate automated and device checks.

## Required completion report

Report exact created files, covered states, source branch/commit if available, assumptions, unresolved decisions and checks performed. Stop for product-owner visual review and Codex QA.

## Implementation PR 5 (S7 baseline + S8 assessment wait)

Branch: `codex/pr5-baseline-wait`.

- `packages/core/entryAssessment.ts`: pure 14-session/14-day S8 projection, Protocol stage writer, S7→S5 handoff and firewall-tested learner copy.
- `packages/core/entryRouting.ts`: implemented protocol stages S7/S8 now resolve to `/entry/pretest` and `/entry/assessment-wait`.
- `apps/mobile/src/app/entry/pretest.tsx`: frozen S7 flow for 28 immutable assessment items; autocorrect off; first-class “Не помню”; synchronous double-submit lock; accepted-write-only advance; partial resume; complete-only finalization.
- `apps/mobile/src/app/entry/assessment-wait.tsx`: frozen S8 information state with independent session/day conditions and exact opening date.
- `apps/mobile/src/app/entry/path-hub.tsx`: first Path action opens S7; after completed S7 it exposes the first-practice handoff.
- `apps/mobile/tsconfig.json`: explicit local workspace aliases for core/tokens so mobile typechecking resolves the worktree source rather than another checkout.

Checks: core 139/139; mobile TypeScript clean; copy firewall clean; `git diff --check` clean.

Next gate: independent review of the implementation commit, then PR 6 implements the approved S5 Daily Cycle and S14 Summary. Device keyboard/layout testing remains required before release.

Independent review of `36e108a` found only implementation-level corrections: keyboard avoidance on S7, S8 direct-route guards, Russian remaining-count forms and accessible progress semantics. These are applied in the follow-up correction; no Claude/Fable input or architecture change was required.

## Implementation PR 6 (S5 Daily Cycle + S14 Summary) — accepted and merged

Branch: `codex/pr6-daily-summary`.

- Product Path now resolves S5 to `/entry/daily-session`.
- The validated learning mechanics are shared with the existing Vertical Slice rather than duplicated.
- `completeSessionGuarded` enforces the frozen minimum-completion contract: retrieval when required plus one production; safe exit is not completion; the same started session cannot complete twice.
- S5 completion returns deterministically to the Path Hub.
- S5 persists the exact phase, retrieval position/input and production draft locally, scoped to the active local path. Resume reuses the original start event and does not recreate accepted evidence.
- The S5 shell now exposes frozen six-phase progress, safe exit, saved-local production semantics, owner-approved CTA copy and S14 written-text/voice honesty copy.
- Completion clears the resumable draft only after the core guard accepts the session.

Checks: core 144/144; mobile TypeScript clean; S14 baseline 16/16; web production build passed; `git diff --check` clean.

GitHub Actions passed. Automated device-sized browser QA at 390×844 covered the complete S5→S14 path, phase-4 reload/resume, visible actions, touch-target corrections, horizontal overflow and React console errors. PR #7 merged as `96bfe95`.

Physical-device microphone permission/interruption testing remains a release check because no Android/iOS device was attached to this environment; it does not invalidate the merged storage and UI contracts.

Next implementation task: S6 Recovery product route and states from the frozen Recovery/Integrity package. Recovery must never consume a curriculum session.

## Stage 0 Day 1 vertical slice — independent review passed

Branch: `codex/stage0-day1-vertical-slice`.

- `packages/core/stage0Day1.ts`: active-local-path-scoped state machine for the accepted 30-minute full path and 16-minute short path; exact first-incomplete resume; mode switching without lost drafts; non-blocking meaning gate; 3/1 retrieval counts; guided-variation submission; two explicit spoken-evidence versions; full/short completion facts.
- `packages/core/tests/stage0Day1.test.ts`: 11 contract tests, including stale-path rejection, exact resume, retry/reveal, short-path facts, generic voice-skip exclusion, draft-preserving mode changes and full-day completion guards.
- `apps/mobile/src/app/entry/stage0-day1.tsx`: implementation of accepted Fable Default v2 and States v3. No PhoneFrame or visual redesign; learner copy comes from the ratified inventory; recording is optional and local, auto-stops at 60 seconds, and never implies speech analysis.
- `apps/mobile/src/app/entry/daily-session.tsx`: routes the accepted daily-session destination to the Stage 0 Day 1 slice.
- `docs/design/exports/stage0-day1-v1/`: canonical Default v2, States v3 and Developer Handoff v3 sources used for implementation.

Verification: independent review of exact tip `b7bb786` passed with no remaining actionable findings. Mobile TypeScript is clean; repository unit suite passes 162/162; source semantic-term scan and `git diff --check` are clean; browser QA at 390×844 confirmed readable plan hierarchy, visible actions and no horizontal overflow. Corrections include failure-safe learner-input persistence, exact reveal behavior, editable guided slots, three distinct framed topics, the approved optional second version, detailed recording outcomes and v2→v3 state migration without lost progress.

Remaining gate: owner QA on a physical Android device for microphone permission, interruption, empty audio, 60-second auto-stop, local playback, Back/unmount cleanup and screen-reader labels. Any visual mismatch is reported to Fable; Codex does not redesign or visually correct accepted screens.
