# Critical bugs

1. **Recovery consumes one of the 14 curriculum sessions.** `completeSession()` increments `sessionsCompleted` for `plan.type === "recovery"`. A missed-day recovery therefore reduces the remaining normal intro/review sessions and can make the pilot reach session 14 before all curriculum days and review sessions have run. The existing test only checks that a recovery plan exists; it does not check counter preservation.

2. **The runtime has no holdout set or holdout assignment.** `SLICE_ITEMS` contains 22 items, `assessmentOrder()` assesses only those 22, and `assessment` has only `pretest`/`day14` phases over that same list. `HoldoutAssignment`, six matched holdout items, and a separate holdout assessment are absent. Therefore retention is measured for the 22 trained items, but the promised structural-generalization evidence is not implemented.

3. **The tracked grammar is not actually validated.** The prompt and content use present perfect continuous (`I've been…`), while the tracked claim is described as present perfect vs past simple. The transform checker accepts only very weak lemma conditions such as `been`, `since`, or `made`; it does not verify the target construction, subject/auxiliary, aspect, or contrast. A text can pass without demonstrating the intended grammar.

4. **The main “spoken” outcome is written production.** Step 4 requires written text; lemma detection, grammar checks, pretest, retention, and new-context evidence all use text. Voice is stored as an optional private artifact and explicitly not analysed. This is internally honest about voice analysis, but the end-to-end spoken task is not evidence of spoken performance.

# High-priority issues

1. **New-context transfer has no defined opportunity/denominator.** `recordNewContext()` stores the written text and detected item IDs, but there is no target set, matched prompt protocol, or per-item opportunity model. It can report which trained forms appeared, but not a robust transfer rate.

2. **The feedback summary is text-only, but the user has just recorded voice.** The UI correctly says “Разбор — по твоему написанному ответу. Голос … не анализируем.” This avoids pretending to analyse voice. However, the flow needs to keep that distinction visually and semantically stable; the preceding step presents the voice repetition as the session’s spoken output, while the summary reports only the written output.

3. **T4 is labelled in the session without T4 evidence.** The code records a faster voice repetition, but no stability, latency, variation, or delayed evidence is used. Resolution correctly keeps would-be gates in shadow, yet the implementation label `T4-зачаток` can be misread as progression evidence.

4. **Recovery can be bypassed.** When `needsRecovery()` is true, the hub renders both the recovery card and the normal session card. A user can start the regular session without taking the recovery route. This is acceptable only if skipping recovery is explicitly intended; it is not enforced as the recovery policy described in the pilot.

5. **Recovery test coverage is insufficient.** The test calls `nextSessionPlan(true)` but never completes it and never verifies that `sessionsCompleted`, `introDone`, `nextSessionPlan()`, and the 14-session cap remain correct after recovery.

6. **`itemEvidence()` means “two attempts”, not mastery or retention.** The UI correctly labels the output as “данных пока мало”, but any later use of `tracked` must not be treated as a capability or learning claim. There is no test that prevents this state from being promoted in future UI.

7. **The existing mobile session and the slice session are separate flows.** The slice is linked from Profile and does not replace the normal session. This limits regression risk, but means the actual end-to-end product flow is not the same as the canonical daily engine in Learning Experience. There is no test that navigating into/out of the slice preserves the existing session, profile, SRS, or output state.

8. **Web flow was not changed, but the available web e2e gate cannot run.** `npm run test:e2e` fails before tests because Next cannot fetch Google Fonts. `npm run web:lint` also fails on pre-existing `Date.now()` purity errors in `apps/web/src/app/evening/page.tsx` and `apps/web/src/app/session/[pack]/page.tsx`; no changed web file is implicated. Existing web non-regression is therefore not fully verified.

9. **The unit test suite does not cover the user flow.** Core tests pass, but they test state helpers rather than the Expo route sequence. There is no mobile integration/e2e test for entry → pretest → 14 sessions → recovery → day-14 assessment → new context → export.

# Acceptable shortcuts for Pilot

- Text input for pretest and retention is acceptable if the claim is explicitly limited to written productive retrieval/task performance.
- Private voice recording without ASR or pronunciation scoring is acceptable, and the UI currently states that voice is not analysed.
- A curated, mobile-only slice with no web implementation, no community, no live practice, no runtime AI generation, no T5, and no affective stakes is consistent with a narrowly scoped Pilot.
- Manual entry review and local storage/export are acceptable for 5–10 pilot participants, provided the export preserves the required event history.
- Curator-led sequencing with shadow adaptation is acceptable for Pilot.
- Existing FSRS can be reused for the slice if its state is isolated and the slice-specific direction/attempt events remain available.

# Release verdict

**Blocked for Pilot release.**

The core unit tests pass (77/77) and the mobile TypeScript check passes. However, the actual Vertical Slice release is not ready because recovery corrupts the 14-session curriculum counter, and the runtime does not implement the required holdout evidence at all. The grammar checker also does not validate the tracked construct.

The voice/written distinction is handled honestly in the current UI, but the product must not describe the written result as spoken evidence. Web e2e could not be executed because the web server build is blocked by Google Fonts network fetch; web lint has unrelated existing errors.

The release can be reconsidered after the recovery counter bug, holdout protocol/runtime, grammar validation, and the end-to-end mobile flow tests are fixed and green.
