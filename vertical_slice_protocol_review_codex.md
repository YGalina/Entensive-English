# Vertical Slice protocol review

## Critical bugs

- `recordAssessmentItem("day14", trainedId, ...)` has no core guard for pretest completion, 14 curriculum sessions, calendar delay, or `assessAt`. A caller can record trained day-14 evidence before the protocol opens. The UI blocks this, but the required core invariant is not enforced.
- `finishHoldout()` only checks `newContextAt` and `holdoutAt`; it does not verify that all six holdout items were assessed. A direct core call can mark holdout complete and unlock final export without holdout evidence.
- `finishPretest()` has no idempotency or completeness guard. It can be called repeatedly and can assign a pretest timestamp without proving all 28 pretest items were recorded.
- Assessment item writes are not duplicate-protected. The same trained or holdout item can be recorded repeatedly; summaries use the last answer, so evidence can be overwritten.

## High-priority issues

- Final export is repeatable: `exportSliceData()` logs a new export each time and has no finalization/idempotency state. This is acceptable for repeated downloads, but not strict duplicate-completion semantics.
- `recordNewContext()` is core-guarded for order and one-time completion, but does not enforce the UI's minimum text length. Short/empty direct calls are represented as insufficient opportunity rather than rejected.
- Emulator-level navigation/audio execution was not available; UI order was inspected statically and core integration flow was executed.
- The web lint failure is unrelated to Vertical Slice: existing `Date.now()` render-purity errors in `apps/web/src/app/evening/page.tsx` and `apps/web/src/app/session/[pack]/page.tsx`.
- Web E2E is blocked by restricted network access to Google Fonts during Next build.

## Tests run and results

- Core unit/integration suite: 89 passed, 0 failed.
- Mobile TypeScript: passed.
- Web lint: failed on pre-existing repository errors.
- Web E2E: blocked before tests ran by Google Fonts fetch failure.
- Runtime validation: core end-to-end flow passed for pretest → 14 sessions → trained assessment → new context → holdout → export.
- Recovery, holdout separation, contamination metadata, opportunity states, grammar checks, voice privacy and process-only `itemEvidence()` passed.

## Release verdict

Blocked for Pilot release.

