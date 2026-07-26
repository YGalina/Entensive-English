# Vertical Slice protocol review after 97c9b73

## Critical bugs

- Finalization is not distinct from download. `exportSliceData()` automatically calls `finalizePilot()` when `finalizedAt` is absent. The required protocol is explicit finalization followed by export/download; currently a download request itself completes the pilot. Core export should reject before explicit finalization.
- The mobile UI has no explicit finalization action; it only exposes the final export button. Therefore the UI cannot enforce the required separate `holdout → finalization → export` sequence.

## High-priority issues

- Emulator/device execution and real audio capture were not available. Screen order was statically inspected and core state transitions were tested.
- Web lint is blocked by an environment/repository race when `apps/web/test-results` is absent; when run separately, the known pre-existing `Date.now()` purity errors remain.
- Web E2E is blocked before test execution because Next.js cannot fetch Google Fonts in the restricted environment.

## Tests run and results

- Full core unit/integration suite: 88 passed, 0 failed.
- Protocol negative tests: executed and passed for pretest completeness/idempotency, 14-session/calendar gate, trained completeness, new-context validation/order, holdout completeness/order, duplicate submissions, finalization idempotency and repeated download immutability.
- Full core flow: passed.
- Mobile TypeScript: passed.
- Web lint: failed/blocked by repository test-results path issue and known unrelated lint errors.
- Web E2E: blocked by Google Fonts network fetch.
- Emulator/device tests: unavailable.

## Protocol invariant verdict

- Pretest completeness and idempotency: enforced.
- 14 sessions plus 14 calendar days: enforced.
- Trained assessment completeness: enforced.
- New-context order and input validity: enforced.
- Holdout order and completeness: enforced.
- Duplicate protection and immutable evidence: enforced.
- One-time finalization state: implemented.
- Read-only repeated exports: enforced after finalization.
- Explicit finalization before export: **not enforced**; export performs finalization implicitly.

## Acceptable shortcuts for Pilot

- Grammar remains a shallow construction-pattern checker.
- Voice remains private and unanalysed.
- Interactive device/audio verification remains pending.
- Web lint/E2E limitations are unrelated to Vertical Slice core correctness.

## Release verdict

Blocked for Pilot release

