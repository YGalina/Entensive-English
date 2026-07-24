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

Constraint for later PRs: only `SCREENS` entries with `productReady:true` may be implemented; every learner-facing string must pass `scanForBannedTerms`; process/navigation events must never move Path. Next gate: Codex review of PR 1, then PR 2 (S1 Entry/Resume + Path routing).

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
