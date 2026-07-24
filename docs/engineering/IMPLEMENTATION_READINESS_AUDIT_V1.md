# Implementation Readiness Audit v1

Status: **Partially ready — implementation may start only after P0 foundation cleanup**  
Date: 2026-07-24  
Branch: `codex/recovery-integrity-freeze`  
Scope: frozen design packages Batch A–F + Recovery/Integrity mapped to the current codebase.  
Mode: audit only; no application code implemented.

## Executive verdict

The project is **ready to enter engineering planning**, but **not ready for immediate screen-by-screen implementation**.

Why:

- Frozen visual design coverage is now strong across Batch A–F and Recovery/Integrity.
- The repository already contains useful foundations: monorepo structure, Expo mobile app, Next web app, shared `@ie/core`, shared `@ie/tokens`, local storage adapter, event queue, media adapters and several existing routes.
- However, the current app still contains major legacy/pilot concepts that directly conflict with frozen design: learner-facing `Пилот · Vertical Slice`, `Галина`, guardians/stражи, streaks, CEFR/levelcheck, older onboarding/pricing/auth assumptions, and old progress language.
- The current `packages/core/slice.ts` is still a pilot protocol engine, not yet a product learning engine. It has useful mechanics but wrong product language and too many protocol-specific assumptions.

Engineering may begin, but the first implementation PR must be a **foundation/readiness PR**, not a visual screen PR.

## Codebase inventory

### Apps

| Area | Path | Current state | Readiness |
|---|---|---|---|
| Mobile app | `apps/mobile/` | Expo Router app with many existing screens and shared theme usage | Reusable shell, but many routes conflict with frozen design |
| Web app | `apps/web/` | Next app with routes for login, onboarding, pricing, profile, library, reading, video, etc. | Useful but mostly not frozen-design aligned |
| Prototype | `prototype/index.html` | Historical/prototype artifact | Reference only, not implementation source |

### Shared packages

| Package | Path | Current state | Readiness |
|---|---|---|---|
| Core | `packages/core/` | Learning/session/storage/event modules plus old program/guardian/streak/level modules | Reuse selectively; needs product-contract refactor |
| Tokens | `packages/tokens/` | Living Content palette/tokens already close to frozen visual system | High reuse |
| Media | `packages/media/` | Ambient/audio/recorder/speech adapters | Reuse with privacy/state restrictions |

### Existing scripts

Root scripts exist for:

- `web:dev`, `web:build`, `web:lint`, `test:e2e`;
- `test:unit` for `@ie/core`;
- mobile Expo scripts.

No tests were run during this audit because the task is mapping/readiness only.

## Frozen design inventory

Frozen packages currently available for implementation:

| Package | Path | Scope |
|---|---|---|
| Batch A | `docs/design/exports/batch-a-defaults-final/` | Entry, recognition, profile entry, Path Hub, pretest, gate wait |
| Batch B | `docs/design/exports/batch-b-correction-v2/` | S9–S13 assessment/results |
| Batch C defaults | `docs/design/exports/batch-c-correction-v1/` | Daily cycle phases, S14 AI Summary, Focus variant |
| Batch C states | `docs/design/exports/batch-c-states-correction-v1/` | Critical S5/S14 states |
| Recovery/Integrity | `docs/design/exports/recovery-integrity-v1/` | Recovery and local data integrity failure |
| Batch D | `docs/design/exports/batch-d-final/` | Progress, My Words, My Artifacts, review/SRS entry |
| Batch E defaults | `docs/design/exports/batch-e-correction-v1/` | Library, reading/listening, repeat-after-voice defaults |
| Batch E states | `docs/design/exports/batch-e-states-v1/` | Library/reader/shadowing states |
| Batch F defaults | `docs/design/exports/batch-f-auth-monetization-correction-v1/` | Auth, account, paywall, subscription management defaults |
| Batch F states | `docs/design/exports/batch-f-auth-monetization-states-v1/` | Auth/payment failure/loading/restore/cancel/offline states |

## Main implementation risk

The highest risk is not visual complexity. The highest risk is **legacy semantic leakage**.

The current code can technically render screens, but if implementation starts by adapting old routes directly, the released product will reintroduce rejected concepts:

- “pilot / vertical slice” language;
- founder-specific “Galina” language in product UI;
- guardian/stраж mechanics;
- streaks;
- CEFR or B2 inference from app activity;
- levelcheck/word-count-based placement;
- old onboarding and pricing assumptions;
- old “dashboard” progress model.

Therefore P0 is a contract cleanup before UI buildout.

## Slice-by-slice implementation plan

### Slice 0 — Foundation and semantic firewall

Status: **P0 required before all visual implementation**

Purpose:

- establish implementation-safe route names, state names, event semantics and copy firewall;
- prevent rejected legacy concepts from leaking into new screens.

Work:

1. Create an implementation route map from frozen screen IDs to app routes.
2. Create shared UI primitives from Living Content tokens:
   - App screen shell;
   - card;
   - primary/secondary/text actions;
   - pill/chip;
   - progress strip;
   - state notice;
   - bottom action area;
   - phone-safe layout container.
3. Create `copyFirewall`/lint checklist for learner-facing copy.
4. Rename or isolate pilot-specific modules so they cannot drive product screens directly.
5. Establish event taxonomy:
   - curriculum completion event;
   - process-only event;
   - artifact event;
   - local integrity event;
   - auth/payment event.

Ready sources:

- `packages/tokens/index.ts` is strong starting point.
- `apps/mobile/src/theme.ts` already uses shared tokens.
- `apps/mobile/src/components/slice-ui.tsx` provides rough reusable patterns but must be renamed and de-piloted.

Blockers:

- Existing code has `pilot`, `guardian`, `streak`, `levelcheck` and `Galina` references across app/core.

### Slice 1 — Safe entry and first path

Status: **Partially ready after Slice 0**

Frozen designs:

- S1 Entry;
- S2 Recognition;
- S3 Profile Entry;
- S4 Path Hub;
- S7 Pretest;
- S8 Gate Wait;
- S1/S4 Recovery/Integrity variants.

Existing routes/components that can be reused cautiously:

- `apps/mobile/src/app/slice/index.tsx` has a “one next step” hub concept but learner copy is wrong (`Пилот · Vertical Slice`) and must not be reused as-is.
- `apps/mobile/src/app/slice/entry.tsx` has the five profile markers but copy is owner/founder/pilot-specific and button labels are wrong for product mode.
- `apps/mobile/src/app/slice/pretest.tsx` likely contains useful baseline mechanics but must be copy- and protocol-reviewed.

Required new/changed contracts:

- `EntryStateMachine`:
  - first launch;
  - recognition;
  - profile entry incomplete/complete;
  - baseline not started/in progress/submitted;
  - gate wait;
  - data integrity blocked/restart confirmed.
- `PathNextStep` model:
  - exactly one primary step;
  - lateral repositories exist but do not compete;
  - wait states are valid states, not fake tasks.

Implementation notes:

- Replace all learner-facing “pilot” terminology.
- Do not expose JSON export or “send to Galina” in product UI.
- Pretest must keep “not exam / не помню is normal” contract.

### Slice 2 — Daily cycle core

Status: **Partially ready after Slice 0 + Slice 1**

Frozen designs:

- S5 phases 1–6;
- S14 AI Summary;
- Focus variant;
- Batch C critical states.

Existing reusable code:

- `apps/mobile/src/app/slice/session.tsx` has a complete microcycle structure:
  - priming;
  - encounter;
  - scaffolded retrieval;
  - production;
  - voice;
  - summary.
- `packages/core/slice.ts` contains mechanics for session plans, retrieval, production, voice artifacts and session completion.
- `packages/media/recorder.*` and `packages/media/speech.*` can support recording/speech.

Risk:

- Current engine is explicitly `Vertical Slice v1` and pilot/protocol-oriented.
- Current event names include pilot language and experimental holdout logic.
- Current AI summary appears text-based/local; real AI availability/error states need implementation contract.

Required state machine:

```text
DailySession
  idle
  priming
  encounter
  scaffoldedRetrieval
  freeProduction
  voiceRecording
  savingArtifact
  aiSummaryLoading
  aiSummaryReady
  aiSummaryUnavailable
  completed
```

Event semantics:

- `session_started`: process-only;
- `item_encountered`: process-only;
- `retrieval_attempted`: learning evidence but not curriculum completion;
- `production_submitted`: artifact/evidence;
- `voice_recorded`: artifact only, no scoring;
- `summary_shown`: process-only;
- `curriculum_session_completed`: only at approved completion point.

### Slice 3 — Recovery and data integrity

Status: **Partially ready**

Frozen designs:

- Recovery/Integrity package.

Existing reusable code:

- `packages/core/slice.ts` has `needsRecovery()` and recovery sessions.
- `packages/core/storage.ts` has platform storage abstraction.

Needed work:

- Create explicit local authoritative store health check.
- Define recoverable vs non-recoverable local data failure.
- Add explicit restart confirmation path.
- Ensure restart never silently creates a second identity.

Blockers:

- Current storage errors are often swallowed by design in `storage.ts`; product needs visible integrity failure for certain cases.

### Slice 4 — Progress, words and artifacts

Status: **Needs semantic cleanup before implementation**

Frozen designs:

- Batch D.

Existing reusable code:

- `packages/core/srs.ts`, `output.ts`, `goal.ts`, `timelog.ts`, `events.ts` are likely useful.
- `apps/mobile/src/app/(tabs)/vocab.tsx`, `profile.tsx`, `path.tsx` have old UI/data ideas.

Major conflicts:

- `profile.tsx` uses streak-related UI.
- `path.tsx`, `coach.tsx`, `guardian-card.tsx`, `barriers.ts`, `data/guardians.ts` contain guardian mechanics rejected for current frozen implementation.
- `levelcheck.ts`, `outcome.ts`, `Horizon.tsx` contain CEFR/time/word-count framing that must not be used as capability proof.

Required models:

- `LearningObject` separated from `LearnerObjectState`.
- `Artifact` separated from `AssessmentEvidence`.
- Progress metrics separated into:
  - activity/process facts;
  - task performance;
  - learning evidence;
  - capability claims, only if validated.

### Slice 5 — Library and content wing

Status: **Moderately ready after event semantics are defined**

Frozen designs:

- Batch E defaults/states.

Existing reusable code:

- `apps/mobile/src/app/(tabs)/library.tsx`;
- `apps/mobile/src/app/read.tsx`;
- `apps/mobile/src/app/listen.tsx`;
- `apps/mobile/src/app/youtube.tsx`;
- `packages/core/data/library.ts`, `reading.ts`, `shadowing.ts`, `mylibrary.ts`.

Risks:

- YouTube/import is future/disabled in frozen design; must not become active accidentally.
- Library-owned practice must not write curriculum completion.
- S22 repeat-after-voice must not imply scoring, accent judgement or human review.

Required event distinction:

- Path-owned content launch may write curriculum/session events.
- Library-owned content launch writes process/artifact events only.

### Slice 6 — Assessment/results

Status: **Implement later, after Slice 1–3 data exists**

Frozen designs:

- Batch B S9–S13.

Existing reusable code:

- `apps/mobile/src/app/slice/assess.tsx`;
- `packages/core/assess.ts`;
- assessment functions in `packages/core/slice.ts`.

Risks:

- Current assessment is tied to pilot protocol and holdout experiment.
- Implementation must preserve baseline/second-photo logic without exposing research terms.
- Results must not become fake CEFR/progress claims.

## Route map

Recommended mobile route mapping:

| Frozen screen | Proposed mobile route | Existing route candidate | Action |
|---|---|---|---|
| S1 | `/` or `/entry` | `(tabs)/index.tsx`, `slice/index.tsx` | Build new product route; do not reuse old copy |
| S2 | `/recognition` | none/direct | New |
| S3 | `/profile-entry` | `slice/entry.tsx` | Reuse structure, rewrite copy/state |
| S4 | `/path` | `slice/index.tsx`, `path.tsx` | New Path Hub using one-next-step contract |
| S7 | `/baseline` | `slice/pretest.tsx` | Reuse mechanics, rewrite copy/state |
| S8 | `/assessment-wait` | `slice/index.tsx` logic | New state in Path Hub |
| S5 | `/session` | `slice/session.tsx`, `session.tsx` | Refactor into product session engine |
| S14 | `/session/summary` | internal step in `slice/session.tsx` | Separate state/component |
| S6 | `/recovery` | `slice/session?mode=recovery` | Refactor recovery route/state |
| S16 | `/words` | `(tabs)/vocab.tsx` | Align with Batch D |
| S17 | `/artifacts` | output/profile-related code | New or separate tab/sheet |
| S18 | `/progress` | `(tabs)/profile.tsx`, `path.tsx` | New progress surface; remove streak/guardian/CEFR inference |
| S19 | `/library` | `(tabs)/library.tsx` | Align with Batch E |
| S21 | `/material/:id` | `read.tsx`, `listen.tsx` | Align reading/listening screen |
| S22 | `/repeat/:id` | shadowing-related data/media | New repeat-after-voice screen |
| FA1–FA4 | `/auth/*` | `auth.tsx`, web `/login` | New auth state contract |
| S20 | `/profile/account` | `(tabs)/profile.tsx` | New account/payment section |
| S25 | `/subscription` | web `/pricing`, profile | New paywall/manage subscription routes |

Web should not mirror all mobile routes immediately. For v1 implementation, web can focus on account/payment management and later deep work surfaces.

## Component map

P0 shared UI components:

- `IEScreen` / safe area screen;
- `IECard`;
- `IEButton` with primary/secondary/text variants;
- `IEChip`;
- `IEStateNotice` for wash/mint/rose states;
- `IEProgressStrip`;
- `IEBottomActionBar`;
- `IETextInput`;
- `IEPhonePreview` only for docs/prototype, not app runtime.

Reusable candidate:

- `apps/mobile/src/components/slice-ui.tsx` can seed these components, but it must be renamed and de-piloted.

## State/data map

### Required state domains

| Domain | Required data | Existing source | Gap |
|---|---|---|---|
| App entry/profile | profile markers, note, entry status | `SliceState.entry` | Rename product state and remove founder/pilot dependency |
| Baseline/pretest | item order, responses, timestamps, “do not remember” | `packages/core/slice.ts` | Remove holdout/pilot wording from product layer |
| Path | next step, lock/wait/recovery reason, lateral entries | current slice hub logic | Needs formal `PathNextStep` selector |
| Daily session | phase, queue, scaffold depth, attempts, production text, voice artifact | `slice/session.tsx`, `slice.ts` | Needs product state machine |
| Recovery | due items, recovery completion, zero due | `needsRecovery()` | Needs visible data integrity path |
| Learning objects | words/phrases/chunks/constructions | multiple data files | Needs typed object taxonomy |
| Learner object state | receptive/productive/review/error history | SRS/core modules | Needs separation from content object |
| Artifacts | written/voice outputs | `output.ts`, media recorder | Needs privacy/storage semantics |
| Auth/account | local/account-bound status, email/provider state | web auth/mobile auth routes | Needs unified contract |
| Payment | plan, period, status, provider state | pricing/profile routes | Needs provider abstraction |

## Event semantics map

Events must be categorized before implementation:

| Event category | Moves Path? | Examples |
|---|---:|---|
| Curriculum completion | Yes | `curriculum_session_completed`, `baseline_completed`, `assessment_completed` |
| Learning evidence | Sometimes, by selector | successful retrieval, production submitted, transfer task submitted |
| Artifact | No by itself | voice recording saved, written artifact saved |
| Process-only | No | opened library, searched, listened, viewed summary, repeated audio |
| Recovery | No curriculum consumption | recovery session completed, zero due recovery viewed |
| Auth/payment | No learning progress | signed in, checkout opened, payment success, restore purchase |
| Data integrity | Blocks until resolved | local store unreadable, restart confirmed |

Hard rule: Library-owned practice must not accidentally increment one of the 14 curriculum sessions.

## Accessibility checklist

Before implementation PRs:

- Every tappable control has at least 44px touch target.
- Icon-only controls have labels.
- Recording controls expose correct state labels: start/stop/play/delete/save.
- Loading states do not trap users silently unless unavoidable.
- Disabled controls explain why where needed.
- Color is never the only signal for success/error/new/familiar.
- Error states use rose/notice language, not punitive red/error framing.
- Payment and auth states must remain understandable with VoiceOver/TalkBack.

## Legacy conflict list

These are known conflicts and must not be implemented as-is:

| Conflict | Location examples | Action |
|---|---|---|
| Pilot / Vertical Slice learner language | `apps/mobile/src/app/slice/*`, `packages/core/slice.ts` | Rename/isolate; product UI must use frozen copy |
| Founder-specific Galina UI | `slice/entry.tsx`, `slice/index.tsx`, `AppShell.tsx` | Remove from learner-facing product UI unless human recruitment context |
| Guardians/stражи | `guardian-card.tsx`, `barriers.ts`, `data/guardians.ts`, `evening.tsx`, `path.tsx` | Keep out of current implementation; future extension only after owner decision |
| Streaks | `profile.tsx`, `i18n.ts`, `packs.ts` | Remove from current progress/habit UI |
| CEFR/activity inference | `levelcheck.ts`, `outcome.ts`, `Horizon.tsx`, onboarding | Do not use as proof of level/capability |
| Old pricing/auth assumptions | web `/pricing`, mobile `auth.tsx` | Replace with Batch F contracts |
| Active YouTube/import | `youtube.tsx`, library import candidates | Keep disabled/future unless owner explicitly approves |
| Evening Circle | `evening.tsx` | Future extension; not implementation scope |

## Open decisions list

Still relevant before or during implementation:

1. Informed consent: human recruitment only vs. product surface.
2. Gender-neutral Russian default vs. explicit feminine positioning.
3. Evening Circle: future screen or drop.
4. S22 gate rule: exact data source for “Смысл уже разобран”.
5. S22 save lifecycle: explicit save vs. recorded immediately then keep/delete.
6. S19 “Показать весь каталог”: reset query vs. navigate catalog default.
7. S19 disabled future import visibility in v1.
8. Payment provider: exact checkout/restore/payment-method capabilities.
9. Whether Batch F exact dates are absolute dates or relative display pattern.

## P0/P1/P2 engineering tasks

### P0 — must happen before screen implementation

1. Create implementation route map and freeze route names.
2. Create shared Living Content UI primitives from `@ie/tokens`.
3. Add copy/semantic firewall checklist to engineering PR template or test notes.
4. Isolate pilot modules behind explicit experimental namespace, or prevent their UI routes from being product entry points.
5. Define `PathNextStep` contract and event semantics.
6. Define local persistence/integrity contract.
7. Decide payment provider constraints for Batch F states.

### P1 — first implementable product slices

1. Implement Safe Entry + Path shell using Batch A + Recovery/Integrity.
2. Implement Daily Cycle core using Batch C after event semantics are in place.
3. Implement Recovery/data-integrity visible states.
4. Implement Batch F auth/payment UI if provider strategy is known.

### P2 — after core loop is stable

1. Progress/My Words/My Artifacts.
2. Library/reading/listening/repeat-after-voice.
3. Assessment/results.
4. Web deep-work surfaces.

## Recommended first implementation PR

**PR 1: Implementation Foundation / Product Shell Contracts**

Do not implement the full app. This PR should:

- create shared UI primitives aligned with `@ie/tokens`;
- create a route/screen registry for frozen screens;
- add a product-safe copy firewall checklist;
- define event categories and `PathNextStep` types;
- add minimal tests for event category behavior;
- mark legacy pilot/guardian/streak/levelcheck routes as not product-ready;
- produce no large visual screen migration yet.

Acceptance criteria:

- No learner-facing `pilot`, `Vertical Slice`, `Galina`, `guardian/страж`, `streak/стрик`, CEFR-result or fake level claims in new product routes.
- Shared button/card/notice primitives match Living Content tokens.
- Path selector can return exactly one primary step.
- Event taxonomy distinguishes curriculum completion from process-only and artifact events.
- Existing tests still pass or failures are documented as unrelated legacy debt.

## Final recommendation

Move forward to engineering, but do it through a gate:

1. Owner approves this audit.
2. Engineering creates PR 1 foundation/contracts.
3. Codex reviews PR 1 for semantic leakage and event correctness.
4. Only then start implementing Slice 1 screens.

Do not let old working screens define the product. Frozen design and product architecture now define the product; legacy code is raw material.
