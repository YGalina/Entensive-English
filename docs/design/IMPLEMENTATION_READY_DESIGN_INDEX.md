# Implementation-ready Design Index

Status: v1 · 2026-07-24  
Branch: `codex/recovery-integrity-freeze`  
Purpose: one implementation-facing map of frozen visual-design packages for Intensive English.

This index does not replace the Product Constitution, UX architecture, screen specifications, or batch handoff files. It points engineers and AI agents to the approved design sources and names what may be implemented without reopening product architecture.

## Operating rules

- Frozen design packages may be implemented but not redesigned.
- Historical Living Content files remain visual references only; they do not override frozen batches.
- If a frozen package and an older source disagree, the frozen package wins.
- No product/learning-method changes may start from implementation.
- Do not introduce learner-facing research terms: pilot, vertical slice, artifact, evidence, holdout, SRS, CEFR inference, percent-of-course, streaks, guardians, speech scoring, accent judgement, cloud/sync claims.
- No app code changes should be based on undocumented states. If a state is missing, create a scoped design/state task first.

## Frozen design packages

| Package | Path | Scope | Implementation status |
|---|---|---|---|
| Batch A | `docs/design/exports/batch-a-defaults-final/` | S1 Entry, S2 Recognition, S3 Profile Entry, S4 Path Hub, S7 Pretest, S8 Gate Wait | Ready for implementation, with state gaps noted below |
| Batch B | `docs/design/exports/batch-b-correction-v2/` | S9–S13 second assessment/results flow | Ready for implementation after assessment-protocol review |
| Batch C defaults | `docs/design/exports/batch-c-correction-v1/` | S5 Daily Cycle phases 1–5, S14 AI Summary, Focus retrieval | Ready for implementation |
| Batch C states | `docs/design/exports/batch-c-states-correction-v1/` | Critical S5/S14 states | Ready for implementation; not exhaustive |
| Recovery/Integrity | `docs/design/exports/recovery-integrity-v1/` | S1 integrity block/restart, S4 recovery, S6 recovery | Ready for implementation |
| Batch D | `docs/design/exports/batch-d-final/` | S16 My Words, S17 My Artifacts, S18 Progress, review/SRS entry and states | Ready for implementation |
| Batch E defaults | `docs/design/exports/batch-e-correction-v1/` | S19 Library, S21 Reading/Listening, S22 Repeat After Voice | Ready for implementation |
| Batch E states | `docs/design/exports/batch-e-states-v1/` | S19/S21/S22 state coverage | Ready for implementation; see owner decisions |

## Screen coverage

### Entry, onboarding and baseline

| Screen | Approved source | Notes |
|---|---|---|
| S1 Entry | `batch-a-defaults-final/screens/S1_entry.html` | First launch entry. Integrity failure states live in Recovery/Integrity. |
| S1 Integrity Blocked | `recovery-integrity-v1/screens/S1_integrity_blocked.html` | Authoritative local data issue; do not silently create second pilot identity. |
| S1 Restart Confirm | `recovery-integrity-v1/screens/S1_integrity_restart_confirm.html` | Explicit restart path. |
| S2 Recognition | `batch-a-defaults-final/screens/S2_recognition.html` | First value recognition screen. |
| S3 Profile Entry | `batch-a-defaults-final/screens/S3_profile_entry.html` | Five observable profile signals. |
| S4 Path Hub | `batch-a-defaults-final/screens/S4_path_hub.html` | One next step; orientation, not dashboard. |
| S4 Recovery | `recovery-integrity-v1/screens/S4_path_hub_recovery.html` | Recovery path state. |
| S4 Recovery zero due | `recovery-integrity-v1/screens/S4_path_hub_recovery_zero_due.html` | No due item recovery state. |
| S7 Pretest | `batch-a-defaults-final/screens/S7_pretest.html` | Baseline as non-exam; no hints, no judgement. |
| S8 Gate Wait | `batch-a-defaults-final/screens/S8_gate_wait.html` | Second-photo waiting state. |

### Daily learning and AI summary

| Screen/state | Approved source | Notes |
|---|---|---|
| S5 Phase 1 Priming | `batch-c-correction-v1/screens/S5_phase1_priming.html` | Daily cycle entry. |
| S5 Phase 2 Encounter | `batch-c-correction-v1/screens/S5_phase2_encounter.html` | Language encounter. |
| S5 Phase 3 Retrieval | `batch-c-correction-v1/screens/S5_phase3_retrieval.html` | Scaffolded retrieval is allowed; do not treat it as free production. |
| S5 Phase 4 Production | `batch-c-correction-v1/screens/S5_phase4_production.html` | Free written production; no live hints. |
| S5 Phase 5 Voice | `batch-c-correction-v1/screens/S5_phase5_voice.html` | Voice action; privacy/lifecycle inherited by all recording surfaces. |
| Focus retrieval | `batch-c-correction-v1/screens/FOCUS_01_retrieval.html` | Same learning mechanics, focus variant. |
| S5 choice-of-three state | `batch-c-states-correction-v1/screens/S5_phase3_choice_of_three.html` | Scaffolded retrieval state. |
| S5 post-submit nudge | `batch-c-states-correction-v1/screens/S5_phase4_post_submit_nudge.html` | Post-output feedback/nudge. |
| S14 AI Summary | `batch-c-correction-v1/screens/S14_ai_summary.html` | Feedback summary; no competing Path route. |
| S14 unavailable | `batch-c-states-correction-v1/screens/S14_unavailable.html` | AI summary unavailable state. |

### Assessment and results

| Screen | Approved source | Notes |
|---|---|---|
| S9 Assessment 22 | `batch-b-correction-v2/screens/S9_assessment_22.html` | Second-photo assessment sequence. |
| S10 New Context | `batch-b-correction-v2/screens/S10_new_context.html` | New context transfer. |
| S11 Comparison | `batch-b-correction-v2/screens/S11_comparison_6.html` | Comparison view. |
| S12 Close Check | `batch-b-correction-v2/screens/S12_close_check.html` | Closing check. |
| S13 Results Share | `batch-b-correction-v2/screens/S13_results_share.html` | Result/share surface. |

### Recovery

| Screen | Approved source | Notes |
|---|---|---|
| S6 Recovery Retrieval | `recovery-integrity-v1/screens/S6_recovery_retrieval.html` | Return path after missed/paused practice. |
| S6 Recovery Production zero due | `recovery-integrity-v1/screens/S6_recovery_production_zero_due.html` | Recovery when nothing is due. |

### Progress, words and artifacts

| Screen/package | Approved source | Notes |
|---|---|---|
| S16 My Words | `batch-d-final/` | See `BATCH_D_FINAL_STATE_MATRIX.md` and board files. |
| S17 My Artifacts | `batch-d-final/` | Personal output evidence/artifacts; do not leak internal research terms into UI. |
| S18 Progress | `batch-d-final/` | Progress as capability/process evidence, not fake CEFR/progress %. |
| Review/SRS entry | `batch-d-final/` | Owner-approved copy uses “вернём их под руку”, not “вернём их в речь”. |

### Library, material, reading/listening and repeat-after-voice

| Screen/state | Approved source | Notes |
|---|---|---|
| S19 Library default | `batch-e-correction-v1/screens/S19_library.html` | Lateral repository; opening from Library does not move Path. |
| S19 Empty | `batch-e-states-v1/screens/S19_empty.html` | Empty repository state. |
| S19 Search results | `batch-e-states-v1/screens/S19_search_results.html` | Search is lateral; no curriculum effect. |
| S19 Search empty | `batch-e-states-v1/screens/S19_search_empty.html` | No results + show catalog behavior pending owner confirmation. |
| S19 Search loading | `batch-e-states-v1/screens/S19_search_loading.html` | Non-blocking search. |
| S19 Unavailable | `batch-e-states-v1/screens/S19_unavailable.html` | Network/catalog unavailable state. |
| S21 Reading/Listening default | `batch-e-correction-v1/screens/S21_reading_listening.html` | Material consumption leads to one production CTA. |
| S21 Loading | `batch-e-states-v1/screens/S21_loading.html` | Loading state. |
| S21 Audio unavailable | `batch-e-states-v1/screens/S21_audio_unavailable.html` | Text remains available. |
| S21 Transcript unavailable | `batch-e-states-v1/screens/S21_transcript_unavailable.html` | No phrase-taking until text exists. |
| S21 No selection | `batch-e-states-v1/screens/S21_no_selection.html` | CTA disabled until phrase selection. |
| S22 Repeat After Voice default | `batch-e-correction-v1/screens/S22_shadowing.html` | Learner copy says “Повторение за голосом”; no scoring. |
| S22 Locked meaning | `batch-e-states-v1/screens/S22_locked_meaning.html` | Gate state; rule still needs data-source confirmation. |
| S22 Permission request | `batch-e-states-v1/screens/S22_permission_request.html` | Honest microphone request. |
| S22 Permission denied | `batch-e-states-v1/screens/S22_permission_denied.html` | No guilt; listening still possible. |
| S22 Recording | `batch-e-states-v1/screens/S22_recording.html` | Accessibility label corrected to “Остановить запись”. |
| S22 Recorded | `batch-e-states-v1/screens/S22_recorded.html` | “Оставить себе / Записать ещё раз / Удалить запись”. |
| S22 Playback | `batch-e-states-v1/screens/S22_playback.html` | Comparison is optional, not system judgement. |
| S22 Save failed | `batch-e-states-v1/screens/S22_save_failed.html` | Local storage issue; no cloud/sync claim. |

## Known state gaps before implementation

These are not blockers for implementing already covered slices, but they must not be invented in code.

| Gap | Status | Required action |
|---|---|---|
| Auth / registration / login | Not frozen | Run Batch F0 resolution, then Batch F visual design. |
| Subscription / Paywall S25 | Not ratified | Do not hand to visual design until IA ownership and rules are ratified. |
| S5 full state coverage beyond existing critical states | Partially covered | Implement only covered states or request a scoped state pass. |
| S9–S13 assessment edge states | Partially covered in Batch B | Review assessment protocol before implementation. |
| S19 YouTube/import flow | Future/disabled | Do not implement active import from the disabled card. |
| S21 Path-owned variant | Planned | Needs owner decision if a separate Path-launch material view is required. |
| S22 gate data rule | Open | Confirm what data opens “Смысл уже разобран”. |
| Mini-lessons with infographics | Planned | Has architectural placeholder, but no visual package yet. |
| Teacher/Admin dashboards | Out of current learner visual scope | Do not infer permissions or dashboards from learner screens. |
| Evening Circle | Future Extension pending owner decision | Do not implement until owner decides. |

## Open owner decisions still relevant to implementation

1. Whether informed consent belongs in human recruitment only or requires an in-product surface.
2. Gender-neutral Russian by default vs explicit feminine positioning.
3. Evening Circle: future screen or drop.
4. S22 gate rule: what exact learner data unlocks “Смысл уже разобран”.
5. S22 recording lifecycle: whether “Оставить себе” is explicit save or whether recording is saved immediately with a confirm/keep state.
6. S19 “Показать весь каталог” behavior: reset query or navigate to catalog default.
7. S19 disabled future import visibility in v1: show disabled card or hide until ready.

## Recommended implementation order

### Slice 1 — Safe entry and first path

Goal: user can enter, see the promise, provide profile signals, see Path, and reach baseline safely.

Use:

- Batch A: S1, S2, S3, S4, S7, S8.
- Recovery/Integrity: S1 blocked/restart only if local persistence exists.

Why first:

- Establishes app shell, visual system, route structure, and “one next step”.
- Does not require full learning engine.

### Slice 2 — Daily cycle core

Goal: user can complete one daily learning session.

Use:

- Batch C defaults: S5 phases 1–5, S14.
- Batch C states: critical scaffold/output/unavailable states.
- Focus variant only if already supported by product mode.

Why second:

- This is the learning heart of the product.
- It tests the hardest UX: scaffolded retrieval → production → voice → summary.

### Slice 3 — Recovery and data integrity

Goal: app handles interruption and local data failure honestly.

Use:

- Recovery/Integrity package.

Why third:

- Prevents brittle pilot/demo behavior.
- Required before real users if local persistence is used.

### Slice 4 — Progress, words and artifacts

Goal: user sees what is accumulating without fake level claims.

Use:

- Batch D.

Why fourth:

- Adds retention loop and self-efficacy.
- Depends on data produced by daily cycle.

### Slice 5 — Library and content wing

Goal: user can browse material, listen/read, take a phrase, and repeat after voice without moving Path incorrectly.

Use:

- Batch E defaults and states.

Why fifth:

- Extends the product beyond daily Path.
- Requires content model decisions and careful event semantics.

### Slice 6 — Assessment/results

Goal: second photo and comparison.

Use:

- Batch B.

Why later:

- Needs accumulated baseline/session data and assessment protocol implementation.

## Implementation readiness checklist

Before starting any slice:

- Identify exact frozen package(s).
- Identify exact screen HTML files and state files.
- Check open owner decisions for that slice.
- Define data required by each screen.
- Define events that write learning progress vs process-only events.
- Define which actions do not move Path.
- Confirm accessibility labels for tappable controls.
- Confirm empty/loading/error states are either covered or explicitly out of scope.
- Confirm no forbidden terminology appears in learner-facing copy.
- Confirm no implementation creates claims not supported by design: scoring, CEFR, streaks, cloud sync, speech analysis, or human review.

## Next recommended task

Run `docs/prompts/design/11_batch_f0_auth_monetization_resolution.md` before starting visual design or engineering for auth/payment.

After Batch F0 and Batch F are frozen, rerun this index and then use `docs/prompts/engineering/01_implementation_readiness_audit.md` to map frozen screens to existing app routes/components/state/data and produce a non-coding implementation plan.
