# Task Register

## In progress

- [ ] **Path Hub week-header owner approval — ACTIVE:** Fable artifact is stored and passed Codex QA. Obtain owner visual approval, then implement it before final Android acceptance.
- [ ] **Stage 0 Day 1 final Android regression:** after the Path Hub visual correction is approved and implemented, verify S7 transition, S14 written-text feedback in short and full modes, S3 at 200%, keyboard behavior, microphone lifecycle and screen-reader labels.
- [ ] Product-owner review: approve or adjust `docs/engineering/IMPLEMENTATION_READINESS_AUDIT_V1.md`.

## Next

- [ ] Independent methodology QA of the produced module: coverage, sequence, cognitive load, transfer validity and evidence claims.
- [ ] Fable learner-copy and visual-material pass only after methodology QA; reuse the approved Living Content style.
- [ ] Prepare and run Stage 0 with 5–8 learners individually; collect pre/post/+7, transfer, workload, completion and continuation evidence.
- [ ] Owner gate on Draft ADR-001 after Stage 0: accept, revise or reject.
- [ ] Resume PR 7 engineering only after the Stage 0 preparation gate is closed.
- [ ] Owner decision FD-6: whether informed consent is required and where (human recruitment process vs. approved architecture amendment; no invented screen).
- [ ] Owner decision FD-4: gender-neutral Russian by default vs. explicit positioning (no new entry control).
- [ ] Owner decision: Evening Circle — future screen or drop (source exists, no approved screen; marked Future Extension in Batch 1).
- [ ] Prepare next design brief only after selecting scope; do not reopen frozen Batch A–E packages.
- [ ] Prepare scoped visual-design corrections; implement approved designs and run UX/engineering QA.

## Completed

- [x] Fable Path Hub week-header correction downloaded, rendered and inspected: 360 dp, 390 dp and 360 dp at 200% preserve both labels without clipping. Artifact stored at `docs/design/exports/path-hub-week-header-device-correction-v1/`; Codex QA verdict PASS for owner review.
- [x] Physical Android short-path feedback defect: Day 1 no longer closes immediately after written production; short mode reaches S14 written feedback, while full mode retains the optional voice step. Unit suite 163/163, mobile TypeScript and S14 baseline 16/16 pass.
- [x] Owner approved prompt-14 visuals; Codex implemented S7 completion transition, keyboard/input corrections, S14 written-text feedback states A/B/C/D and S3 responsive choices. Mobile TypeScript, repository unit suite 162/162 and Android export pass.
- [x] Prompt-14 Fable artifact located and inspected: 20-file package, 15 individual screens, review board, inventory and handoff stored at `docs/design/exports/stage0-owner-device-correction-v1/`; Codex verdict is PASS for owner visual review.
- [x] Mobile legacy-route containment: root layout permits only canonical `/entry` product routes, so cached or direct legacy links cannot reopen old onboarding, automatic word flow, music, coach, guardians, streaks or levelcheck. Mobile TypeScript and repository unit suite 162/162 pass.
- [x] **Codex continuity package:** project-specific orchestrator skill and complete operational handoff created so a new Codex task can resume from Git without the owner relaying the prior conversation.
- [x] **Project control moved to Codex:** Codex is the single operational orchestrator; Claude is a delegated specialist; Fable exclusively owns visual design and visual corrections; Git is authoritative; Memoree is cited historical memory; ChatGPT is background only. Governance synchronized on 2026-08-04.

- [x] **Stage 0 Day 1 engineering implementation + independent QA:** exact tip `b7bb786` passed independent review with no actionable findings after correction passes. Full/short paths, exact resume and v2→v3 migration, meaning gate, failure-safe structured retrieval, free production, optional local recording, three distinct guided variations, approved optional second version, two explicit spoken-evidence versions and honest completion facts. Mobile TypeScript clean; core suite 162/162; `git diff --check` clean. Physical-device recording/accessibility QA remains.

- [x] Stage 0 Day 1 Default v2 and States v2 approved and frozen → `docs/design/exports/stage0-day1-v1/`; QA → `docs/design/reviews/STAGE0_DAY1_DEFAULT_AND_STATES_V2_QA_CODEX.md`; governing UX/copy contract `1f647ba`.
- [x] Training-sufficiency revision v1.2 accepted → `docs/methodology/training_revision_v1/`.
- [x] Owner decisions A1–A4 accepted for Stage 0 preparation.
- [x] Draft ADR-001 created; it grants no architecture or implementation authority.
- [x] **PR 6 engineering — S5 Daily Cycle + S14 Summary:** active-path-scoped local draft recovery; six-phase progress; safe exit/resume; accessible 44px/56px controls; approved three-phrase priming; complete 390×844 browser QA with reload/resume and no overflow/console errors. Core 144/144, mobile TypeScript, web build and S14 evaluation 16/16 passed locally and in GitHub Actions. PR #7 merged as `96bfe95`.
- [x] **PR 3 engineering + S3 copy ratification:** S2 Recognition; S3 Profile Entry; profile bound to active local path; complete profile routes to Path Hub; owner-approved S3 copy and hidden translation states frozen in `docs/design/exports/s3-copy-ratification-v3/`. Commit `09436bf`; 135/135 core tests and mobile TypeScript passed; GitHub PR #4.
- [x] **PR 2 + integrity-restart correction ACCEPTED** (independent Codex review of exact commit `cca2dc1`: 115/115 repository tests, no blocking findings). Accepted line on `codex/recovery-integrity-freeze` = `cca2dc1`.
- [x] PR 2 (engineering): S1 Entry/Resume Router + Path routing foundation. `packages/core/entryRouting.ts` (read-only Path projection from storage → `computeNextStep` → product route; `ENTRY_KEYS`, `readPathState`, `routeForStep`, `resolveEntryRoute`, firewall-checked `ENTRY_COPY`); mobile `apps/mobile/src/app/entry/` route group (S1 router + S2/S4/integrity-blocked/restart-confirm/coming-soon stubs) and `apps/mobile/src/components/entry-ui.tsx` using PR 1 primitives; tests `packages/core/tests/entryRouting.test.ts` (11/11). No full session, no legacy deletion, no payment provider.
- [x] PR 1 Foundation / Product Shell Contracts (engineering, on `f4d6009`): shared Living Content UI primitive contract (`packages/tokens/primitives.ts`); frozen screen route registry with legacy pilot/guardian/streak/levelcheck routes marked not product-ready (`packages/core/routes.ts`); event categories + progress-writer invariant (`packages/core/eventCategories.ts`); read-only PathNextStep contract (`packages/core/pathNextStep.ts`); machine-checkable copy/semantic firewall (`packages/core/copyFirewall.ts`, `docs/engineering/COPY_SEMANTIC_FIREWALL_CHECKLIST.md`); foundation tests `packages/core/tests/foundation.test.ts` (13/13). No full screens; no frozen design or legacy code changed.
- [x] Engineering implementation-readiness audit v1 completed → `docs/engineering/IMPLEMENTATION_READINESS_AUDIT_V1.md`; verdict: partially ready, first implementation PR must be foundation/contracts before screen migration.
- [x] Batch F Auth & Monetization states approved and frozen → `docs/design/exports/batch-f-auth-monetization-states-v1/`; accepted from `Intensive English дизайн-система_37.zip` after Codex QA verified 21 auth/payment states, correct output path, button sizes, failure/restore/cancel/expired/offline coverage and copy firewall.
- [x] Batch F Auth & Monetization defaults approved and frozen → `docs/design/exports/batch-f-auth-monetization-correction-v1/`; accepted from `Intensive English дизайн-система_34.zip` after Codex QA verified corrected prices, local-account copy safety, neutral email placeholder, paywall wording and no trial/PRO/guarantee/group-intensive/CEFR-result claims.
- [x] Create implementation-ready design index across frozen Batch A–E, Recovery/Integrity and known gaps → `docs/design/IMPLEMENTATION_READY_DESIGN_INDEX.md`.
- [x] Create first engineering readiness audit prompt → `docs/prompts/engineering/01_implementation_readiness_audit.md`.
- [x] Create Batch F0 Auth & Monetization resolution prompt → `docs/prompts/design/11_batch_f0_auth_monetization_resolution.md`.
- [x] Create Batch F Auth & Monetization visual-design prompt template → `docs/prompts/design/12_batch_f_auth_monetization_visual_design.md`.
- [x] Ratify Batch F0 Auth & Monetization v1 rules → `docs/design/auth_monetization/BATCH_F0_AUTH_MONETIZATION_RESOLUTION.md`.
- [x] Batch E states v1 approved and frozen → `docs/design/exports/batch-e-states-v1/`; accepted from `Intensive English дизайн-система_32.zip` after Codex QA verified S19/S21/S22 state coverage, copy firewall, no unsupported claims and corrected S22 recording accessibility label.
- [x] Batch E correction v1 approved and frozen → `docs/design/exports/batch-e-correction-v1/`; accepted from `Intensive English дизайн-система_31.zip` after Codex QA verified S19/S21/S22 defaults, S22 accessible recording control, non-evaluative gate copy, disabled future import card and copy firewall.
- [x] Prepare Batch E visual-design brief → `docs/prompts/design/10_batch_e_library_reader_shadowing.md`.
- [x] Batch D final approved and frozen → `docs/design/exports/batch-d-final/`; accepted from `Intensive English дизайн-система_29.zip` after Codex QA verified S18/S16/S17/SRS defaults, required states, copy firewall, 390x844 action visibility and the copy correction “вернём их под руку”.
- [x] Recovery/data-integrity gap closure approved and frozen -> `docs/design/exports/recovery-integrity-v1/`; accepted from `Intensive English дизайн-система_25.zip` after Codex QA verified S6/S1 logic, copy firewall and 390x844 action visibility.
- [x] Batch C states correction v1 approved and frozen → `docs/design/exports/batch-c-states-correction-v1/`; QA `BATCH_C_STATES_CORRECTION_V1_QA_CODEX.md`.
- [x] Batch C correction v1 defaults approved and frozen: S5 phases 1–6, S14, visible S27 semantics and Focus 01 → `docs/design/exports/batch-c-correction-v1/`; QA `BATCH_C_CORRECTION_V1_QA_CODEX.md`.
- [x] Batch B correction v2 approved: S9–S13 defaults and required states → `docs/design/exports/batch-b-correction-v2/`.
- [x] Batch A final default screens approved and frozen: S1, S2, S3, S4 Path Hub, S7 and S8 → `docs/design/exports/batch-a-defaults-final/`.
- [x] First Batch 1 artifact reviewed and rejected as final visual direction; retained as historical state-coverage exploration.
- [x] Rejected first Batch 1 artifact removed after Batch A final replaced it; audit history remains in Git.
- [x] Inventory existing design sources and map them to approved screen specifications → `docs/design/DESIGN_SOURCE_INVENTORY.md`.
- [x] Freeze Product Constitution v1.2.
- [x] Complete Experience, UX, Information, Journey, Interaction, and Screen Specification layers.
- [x] Complete pre-visual UX review.
- [x] Freeze the Vertical Slice for pilot/manual device checks.

Tasks should link to a specification, decision, issue, or prompt when one exists.
