# Vertical Slice finalization semantics review

## Critical bugs

None found.

## High-priority issues

- Emulator/device and real audio execution were unavailable. Mobile order and state wiring were statically inspected; core transitions were executed by tests.
- Web lint fails on pre-existing `Date.now()` render-purity errors in `apps/web/src/app/evening/page.tsx` and `apps/web/src/app/session/[pack]/page.tsx`.
- Web E2E is blocked before test execution because Next.js cannot fetch Google Fonts in the restricted environment.
- The mobile pre-finalization button intentionally exports a marked partial draft. This is distinct from final Pilot export and does not call `exportSliceData()`.

## Tests run and results

- Full core suite: **88 passed, 0 failed**.
- Protocol, integration and flow tests: passed.
- Mobile TypeScript: passed.
- Web TypeScript: passed.
- Web lint: failed on pre-existing repository errors.
- Web E2E: blocked by environment/network.
- Emulator/device checks: unavailable.

## Protocol invariant verdict

- Explicit Pilot finalization: enforced through `finalizePilot()`.
- Export separated from finalization: enforced; `exportSliceData()` rejects before finalization.
- Finalization occurs once: enforced; repeated finalization rejects.
- Finalized protocol state is immutable: enforced by state guards.
- Repeated exports are read-only: enforced; no state writes and no protocol events.
- Export timestamps/evidence remain unchanged across repeated downloads: enforced by tests.
- Mobile flow is Holdout → Finalize Pilot → Export: statically verified.

## Acceptable Pilot limitations

- Voice remains private and unanalysed.
- Grammar validation remains a shallow construction-pattern checker.
- Partial draft export remains available before finalization and is explicitly marked partial.
- Interactive device/audio verification remains pending.
- Web lint/E2E failures are unrelated repository/environment limitations.

## Release verdict

Ready for Pilot with stated limitations

Vertical Slice may now be frozen for Pilot.
No further feature work should be performed before manual device checks and Pilot data collection.

