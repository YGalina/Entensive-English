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

## Active design task

- Objective: product-owner review of implementation-readiness audit, then PR 1 foundation/contracts.
- Frozen inputs: approved Batch A, Batch B, Batch C, Recovery/Integrity, Batch D and Batch E default/state packages.
- Owner: product owner approves next scope; Claude Design / Fable executes visuals only after a scoped brief exists.
- Reviewer: Codex for logic, copy, ergonomics, accessibility and unsupported implementation claims.

## Frozen constraints

- Product and UX architecture remain frozen.
- No navigation redesign.
- No new learning mechanics.
- No speech analysis, pronunciation scoring or human-listening claim.
- No invented sync/background-delivery infrastructure.
- No research or implementation terminology in learner-facing copy.
- No CEFR inference from activity, streaks, guardian mechanics or percent-of-course progress.
- No application-code changes until implementation-readiness audit is complete and owner-approved.

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
